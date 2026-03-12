import { Preferences } from '@capacitor/preferences';
import type { WorkoutSession } from '../types/workout';

const SESSIONS_KEY = 'workout_sessions';

async function loadSessions(): Promise<WorkoutSession[]> {
  const { value } = await Preferences.get({ key: SESSIONS_KEY });
  if (!value) return [];
  try {
    return JSON.parse(value) as WorkoutSession[];
  } catch {
    return [];
  }
}

async function persistSessions(sessions: WorkoutSession[]): Promise<void> {
  await Preferences.set({ key: SESSIONS_KEY, value: JSON.stringify(sessions) });
}

export async function getSessions(): Promise<WorkoutSession[]> {
  const sessions = await loadSessions();
  // Return newest first
  return sessions.slice().sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

/** Insert or replace a session by id */
export async function saveSession(session: WorkoutSession): Promise<void> {
  const sessions = await loadSessions();
  const idx = sessions.findIndex((s) => s.id === session.id);
  if (idx >= 0) {
    sessions[idx] = session;
  } else {
    sessions.push(session);
  }
  await persistSessions(sessions);
}

export async function deleteSession(id: string): Promise<void> {
  const sessions = await loadSessions();
  await persistSessions(sessions.filter((s) => s.id !== id));
}
