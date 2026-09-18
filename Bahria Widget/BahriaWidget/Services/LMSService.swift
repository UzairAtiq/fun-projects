import Foundation

// MARK: - LMS Service
// Bridges the Swift app with the Python/Playwright scraper

enum LMSError: LocalizedError {
    case authenticationFailed(String)
    case networkError(String)
    case scrapingError(String)
    case pythonNotFound
    case scraperNotFound
    case timeout
    case unknownError(String)
    
    var errorDescription: String? {
        switch self {
        case .authenticationFailed(let msg): return "Login failed: \(msg)"
        case .networkError(let msg):         return "Network error: \(msg)"
        case .scrapingError(let msg):        return "Scraping error: \(msg)"
        case .pythonNotFound:                return "Python 3 not found. Install Python via Homebrew."
        case .scraperNotFound:               return "Scraper script not found in app bundle."
        case .timeout:                       return "Request timed out. The LMS may be down."
        case .unknownError(let msg):         return msg
        }
    }
}

final class LMSService: Sendable {
    
    /// Fetch pending assignments by running the bundled Python scraper
    func fetchAssignments(enrollment: String, password: String, pythonPath: String = "") async throws -> [Assignment] {
        
        // Locate scraper script
        let scraperPath = locateScraperScript()
        guard let scraperPath else {
            throw LMSError.scraperNotFound
        }
        
        // Find Python executable
        let python = findPython(preferred: pythonPath)
        guard let python else {
            throw LMSError.pythonNotFound
        }
        
        // Run scraper as subprocess
        return try await withCheckedThrowingContinuation { continuation in
            DispatchQueue.global(qos: .userInitiated).async {
                do {
                    let result = try self.runScraper(
                        python: python,
                        script: scraperPath,
                        enrollment: enrollment,
                        password: password
                    )
                    continuation.resume(returning: result)
                } catch {
                    continuation.resume(throwing: error)
                }
            }
        }
    }
    
    // MARK: - Private
    
    private func runScraper(python: String, script: String,
                            enrollment: String, password: String) throws -> [Assignment] {
        let process = Process()
        let stdoutPipe = Pipe()
        let stderrPipe = Pipe()
        
        process.executableURL = URL(fileURLWithPath: python)
        
        // Build arguments
        var args: [String] = []
        if python.hasSuffix("/env") {
            args.append("python3")
        }
        args.append(contentsOf: [
            script,
            "--enrollment", enrollment,
            "--password", password
        ])
        process.arguments = args
        
        process.standardOutput = stdoutPipe
        process.standardError = stderrPipe
        
        // Set environment to include common paths
        var env = ProcessInfo.processInfo.environment
        let extraPaths = "/opt/homebrew/bin:/usr/local/bin:/usr/bin"
        env["PATH"] = extraPaths + ":" + (env["PATH"] ?? "")
        process.environment = env
        
        // Run with timeout
        try process.run()
        
        let timeoutWorkItem = DispatchWorkItem {
            if process.isRunning {
                process.terminate()
            }
        }
        DispatchQueue.global().asyncAfter(
            deadline: .now() + AppConstants.scraperTimeout,
            execute: timeoutWorkItem
        )
        
        process.waitUntilExit()
        timeoutWorkItem.cancel()
        
        let stdoutData = stdoutPipe.fileHandleForReading.readDataToEndOfFile()
        let stderrData = stderrPipe.fileHandleForReading.readDataToEndOfFile()
        let stderrText = String(data: stderrData, encoding: .utf8) ?? ""
        
        // Check exit code
        let exitCode = process.terminationStatus
        
        guard !stdoutData.isEmpty else {
            if exitCode == 15 || exitCode == 143 { // SIGTERM
                throw LMSError.timeout
            }
            throw LMSError.unknownError("Scraper produced no output. stderr: \(stderrText)")
        }
        
        // Parse JSON output
        let output: ScraperOutput
        do {
            output = try JSONDecoder().decode(ScraperOutput.self, from: stdoutData)
        } catch {
            let raw = String(data: stdoutData, encoding: .utf8) ?? "<binary>"
            throw LMSError.scrapingError("Failed to parse scraper output: \(raw.prefix(200))")
        }
        
        // Map exit codes to errors
        if output.status == "error" {
            let msg = output.message ?? "Unknown error"
            switch output.code {
            case 1: throw LMSError.authenticationFailed(msg)
            case 2: throw LMSError.networkError(msg)
            case 3: throw LMSError.scrapingError(msg)
            default: throw LMSError.unknownError(msg)
            }
        }
        
        // Convert scraped assignments to model objects
        return output.assignments.map { $0.toAssignment() }
    }
    
    private func locateScraperScript() -> String? {
        // Check app bundle first
        if let bundlePath = Bundle.main.path(forResource: "scraper", ofType: "py") {
            return bundlePath
        }
        
        // Check next to the executable
        let execDir = Bundle.main.bundleURL
            .deletingLastPathComponent()
        let adjacentPath = execDir.appendingPathComponent("scraper.py").path
        if FileManager.default.fileExists(atPath: adjacentPath) {
            return adjacentPath
        }
        
        // Check in Resources directory within the bundle
        let resourcesPath = Bundle.main.bundleURL
            .appendingPathComponent("Contents/Resources/scraper.py").path
        if FileManager.default.fileExists(atPath: resourcesPath) {
            return resourcesPath
        }
        
        return nil
    }
    
    private func findPython(preferred: String) -> String? {
        if !preferred.isEmpty && FileManager.default.fileExists(atPath: preferred) {
            return preferred
        }
        
        for path in AppConstants.pythonPaths {
            if FileManager.default.fileExists(atPath: path) {
                return path
            }
        }
        
        return nil
    }
}
