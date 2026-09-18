#!/usr/bin/env python3
"""
Bahria LMS Assignment Scraper — Widget Edition
-----------------------------------------------
Logs into Bahria University LMS via Playwright, scrapes all
unsubmitted assignments, and outputs them as JSON to stdout.

Exit codes:
  0 = success
  1 = authentication error
  2 = network / timeout error
  3 = scraping error (unexpected page structure)
"""

from __future__ import annotations

import argparse
import asyncio
import json
import sys
from datetime import datetime
from typing import Optional

from playwright.async_api import TimeoutError as PlaywrightTimeout
from playwright.async_api import async_playwright


LMS_URL = "https://lms.bahria.edu.pk"
CAMPUS_VALUE = "1"  # Islamabad E-8 Campus


# ---------------------------------------------------------------------------
# Browser automation helpers
# ---------------------------------------------------------------------------

async def _click_first_visible(page, selectors: list[str],
                                timeout: int = 4_000) -> Optional[str]:
    for sel in selectors:
        try:
            loc = page.locator(sel).first
            if await loc.is_visible(timeout=timeout):
                await loc.click()
                return sel
        except Exception:
            continue
    return None


async def _fill_first_visible(page, selectors: list[str],
                               value: str, timeout: int = 3_000) -> bool:
    for sel in selectors:
        try:
            field = page.locator(sel).first
            if await field.is_visible(timeout=timeout):
                await field.fill(value)
                return True
        except Exception:
            continue
    return False


async def _scrape_unsubmitted(page) -> list[dict]:
    """
    Parse the assignment table, return rows where student has NOT submitted.

    Table columns (0-indexed):
      0  No.  |  1  Title  |  2  Assignment file  |  3  Student submission
      4  Marks  |  5  Returned comments  |  6  Action  |  7  Deadline
    """
    await page.wait_for_load_state("networkidle", timeout=15_000)
    await page.wait_for_timeout(1_500)

    rows = await page.evaluate("""
        () => {
            const out = [];
            document.querySelectorAll('table tbody tr').forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length < 7) return;

                const action = cells[6];
                const actionText = action.innerText.trim().toLowerCase();
                const hasSubmit =
                    action.querySelector('a, button, input[type="submit"]') &&
                    (actionText.includes('submit') || actionText.includes('upload'));
                if (!hasSubmit) return;

                // Get submit/action link
                const actionLink = action.querySelector('a[href]');
                const submitHref = actionLink ? actionLink.href : '';

                // Get assignment file download link
                const fileLink =
                    cells[2].querySelector('a[href*="Download.php"]') ||
                    cells[2].querySelector('a[href]');

                out.push({
                    title:    cells[1]?.innerText.trim() ?? '',
                    deadline: cells[7]?.innerText.trim() ?? '',
                    link:     submitHref,
                    fileLink: fileLink ? fileLink.href : '',
                });
            });
            return out;
        }
    """)
    return rows


# ---------------------------------------------------------------------------
# Main scraper
# ---------------------------------------------------------------------------

async def scrape(enrollment: str, password: str) -> dict:
    """
    Returns: { "status": "success"|"error", "assignments": [...], "message": "..." }
    """
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-dev-shm-usage"],
        )
        context = await browser.new_context(
            viewport={"width": 1280, "height": 800},
            user_agent=(
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            ),
        )
        page = await context.new_page()

        try:
            # -- Navigate to LMS landing page
            await page.goto(LMS_URL, wait_until="networkidle", timeout=60_000)

            # -- Click Student Sign In
            await _click_first_visible(page, [
                "#BodyPH_hlStudent",
                "a:has-text('Student Sign In')",
                "a:has-text('Student')",
            ], timeout=5_000)
            await page.wait_for_load_state("networkidle", timeout=30_000)

            # -- Select campus
            for sel in ["#BodyPH_ddlInstituteID",
                        "select[id*='Institute']",
                        "select[id*='Campus']"]:
                try:
                    dd = page.locator(sel).first
                    if await dd.is_visible(timeout=4_000):
                        try:
                            await dd.select_option(value=CAMPUS_VALUE)
                        except Exception:
                            options = await dd.evaluate(
                                "el => Array.from(el.options).map(o => o.text)"
                            )
                            match = next(
                                (o for o in options
                                 if "islamabad" in o.lower() and "e-8" in o.lower()),
                                None
                            )
                            if match:
                                await dd.select_option(label=match)
                        break
                except Exception:
                    continue

            # -- Fill credentials
            filled = await _fill_first_visible(
                page,
                ["#BodyPH_tbEnrollment", "input[id*='Enrollment']",
                 "input[name='username']", "input[type='text']:visible"],
                enrollment,
            )
            if not filled:
                return {"status": "error", "code": 1,
                        "message": "Could not locate enrollment input field.",
                        "assignments": []}

            await _fill_first_visible(
                page,
                ["#BodyPH_tbPassword", "input[id*='Password']",
                 "input[type='password']"],
                password,
            )

            # -- Submit login
            login_url = page.url
            await _click_first_visible(page, [
                "#BodyPH_btnLogin", "input[id*='btnLogin']",
                "button[type='submit']", "input[type='submit']",
            ])

            try:
                await page.wait_for_url(
                    lambda u: u != login_url, timeout=15_000
                )
            except PlaywrightTimeout:
                body = await page.inner_text("body")
                if any(kw in body.lower()
                       for kw in ["invalid", "incorrect", "wrong", "error"]):
                    return {"status": "error", "code": 1,
                            "message": "Invalid enrollment number or password.",
                            "assignments": []}
                await page.wait_for_load_state("networkidle", timeout=20_000)

            # -- Open LMS from CMS dashboard
            for sel in ["a:has-text('LMS')", "a:has-text('Go to LMS')",
                        "a[href*='lms.bahria']", "a[href*='/LMS']"]:
                try:
                    btn = page.locator(sel).first
                    if not await btn.is_visible(timeout=4_000):
                        continue
                    async with context.expect_page(timeout=10_000) as evt:
                        await btn.click()
                    page = await evt.value
                    await page.wait_for_load_state("networkidle", timeout=30_000)
                    break
                except PlaywrightTimeout:
                    await page.wait_for_load_state("networkidle", timeout=10_000)
                    if "login" not in page.url.lower():
                        break
                except Exception:
                    continue

            all_pages = context.pages
            if len(all_pages) > 1:
                page = all_pages[-1]
                await page.wait_for_load_state("networkidle", timeout=20_000)

            # -- Click Assignments
            await _click_first_visible(page, [
                "a:has-text('Assignments')",
                "li:has-text('Assignments') a",
                "a[href*='ssignment']",
            ], timeout=5_000)
            await page.wait_for_load_state("networkidle", timeout=30_000)

            # -- Read courses
            courses = await page.evaluate("""
                () => {
                    const sel = document.querySelector('#courseId');
                    if (!sel) return [];
                    return Array.from(sel.options)
                        .filter(o => o.value.trim())
                        .map(o => ({ value: o.value, text: o.text.trim() }));
                }
            """)

            all_assignments: list[dict] = []

            if courses:
                for course in courses:
                    try:
                        await page.select_option("#courseId", value=course["value"])
                        rows = await _scrape_unsubmitted(page)
                        for r in rows:
                            r["course"] = course["text"]
                        all_assignments.extend(rows)
                    except Exception:
                        continue
            else:
                for r in await _scrape_unsubmitted(page):
                    r["course"] = "General"
                    all_assignments.append(r)

            return {
                "status": "success",
                "code": 0,
                "message": f"Found {len(all_assignments)} pending assignment(s).",
                "timestamp": datetime.utcnow().isoformat(),
                "assignments": all_assignments,
            }

        except PlaywrightTimeout as exc:
            return {"status": "error", "code": 2,
                    "message": f"Timeout: {exc}", "assignments": []}
        except Exception as exc:
            return {"status": "error", "code": 3,
                    "message": f"Scraping error: {exc}", "assignments": []}
        finally:
            await browser.close()


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Bahria LMS Scraper")
    parser.add_argument("--enrollment", required=True, help="Enrollment number")
    parser.add_argument("--password", required=True, help="LMS password")
    args = parser.parse_args()

    result = asyncio.run(scrape(args.enrollment, args.password))
    json.dump(result, sys.stdout, indent=2)
    sys.exit(result.get("code", 0))


if __name__ == "__main__":
    main()
