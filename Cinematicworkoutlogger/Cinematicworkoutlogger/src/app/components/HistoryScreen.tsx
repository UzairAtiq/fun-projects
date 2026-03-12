import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Dumbbell } from 'lucide-react';
import { getSessions, deleteSession } from '../../services/storage';
import type { WorkoutSession, Exercise } from '../../types/workout';

interface HistoryScreenProps {
  onClose: () => void;
  refreshKey?: number;
}

interface DayGroup {
  dayKey: string;
  dateLabel: string;
  timeLabel: string;
  sessionIds: string[];
  exercises: Exercise[];
  totalVolume: number;
}

function groupByDay(sessions: WorkoutSession[]): DayGroup[] {
  const map = new Map<string, DayGroup>();

  for (const session of sessions) {
    const d = new Date(session.date);
    const dayKey = d.toISOString().slice(0, 10); // YYYY-MM-DD
    const dateLabel = d.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const timeLabel = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    if (!map.has(dayKey)) {
      map.set(dayKey, { dayKey, dateLabel, timeLabel, sessionIds: [], exercises: [], totalVolume: 0 });
    }

    const group = map.get(dayKey)!;
    group.sessionIds.push(session.id);

    for (const ex of session.exercises) {
      // Merge into same-named exercise if already present for this day
      const existing = group.exercises.find((e) => e.name === ex.name);
      if (existing) {
        existing.sets.push(...ex.sets);
      } else {
        group.exercises.push({ ...ex, sets: [...ex.sets] });
      }
      const vol = ex.sets.reduce((s, set) => s + set.weight * set.reps, 0);
      group.totalVolume += vol;
    }
  }

  // Newest day first
  return Array.from(map.values()).sort((a, b) => b.dayKey.localeCompare(a.dayKey));
}

export function HistoryScreen({ onClose, refreshKey }: HistoryScreenProps) {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getSessions();
    setSessions(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load, refreshKey]);

  const handleDeleteDay = async (sessionIds: string[]) => {
    for (const id of sessionIds) await deleteSession(id);
    setSessions((prev) => prev.filter((s) => !sessionIds.includes(s.id)));
  };

  const days = groupByDay(sessions);

  return (
    <motion.div
      key="history"
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 60 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex flex-col h-full text-white"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-12 pb-4 border-b border-white/10">
        <button
          onClick={onClose}
          className="p-2 text-[#00FFA3] hover:text-[#00FFA3]/80 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="text-xs tracking-[0.3em] uppercase text-[#00FFA3]/70">Workout History</h1>
        <div className="w-9" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">

        {/* Loading spinner */}
        {loading && (
          <div className="flex items-center justify-center h-40">
            <motion.div
              className="w-6 h-6 border-2 border-[#00FFA3]/30 border-t-[#00FFA3] rounded-full"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
            />
          </div>
        )}

        {/* Empty state */}
        {!loading && days.length === 0 && (
          <motion.div
            className="flex flex-col items-center justify-center h-64 gap-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Dumbbell className="w-14 h-14 text-white/15" />
            <p className="text-white/40 text-sm tracking-widest uppercase">No workouts yet</p>
            <p className="text-white/25 text-xs">Log your first set to see it here</p>
          </motion.div>
        )}

        {/* Day cards */}
        <AnimatePresence initial={false}>
          {days.map((day, di) => (
            <motion.div
              key={day.dayKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ delay: di * 0.05 }}
              className="rounded-2xl border border-[#00FFA3]/20 bg-[#0A1525] overflow-hidden"
            >
              {/* Day heading */}
              <div className="flex items-start justify-between px-5 pt-5 pb-3">
                <div>
                  <div className="text-white text-xl font-bold tracking-tight leading-snug">
                    {day.dateLabel}
                  </div>
                  <div className="text-[#00FFA3]/60 text-sm mt-0.5">{day.timeLabel}</div>
                </div>
                <button
                  onClick={() => handleDeleteDay(day.sessionIds)}
                  className="mt-1 p-1.5 text-white/20 hover:text-red-400 transition-colors rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-[#00FFA3]/20 via-[#00FFA3]/10 to-transparent mx-5" />

              {/* Exercise cards */}
              <div className="px-4 py-4 space-y-4">
                {day.exercises.map((ex) => {
                  const exVol = ex.sets.reduce((s, set) => s + set.weight * set.reps, 0);
                  return (
                    <div
                      key={ex.id}
                      className="rounded-xl border border-white/8 bg-white/[0.03] px-4 pt-4 pb-3"
                    >
                      {/* Exercise name — big heading */}
                      <div className="text-white text-2xl font-bold tracking-tight mb-4">
                        {ex.name}
                      </div>

                      {/* Sets list */}
                      <div className="space-y-2.5">
                        {ex.sets.map((set, si) => (
                          <div
                            key={set.id}
                            className="flex items-baseline gap-3"
                          >
                            {/* Set number */}
                            <span className="text-white/30 text-sm w-8 shrink-0">Set {si + 1}</span>

                            {/* Weight */}
                            <span className="text-white text-lg font-semibold">
                              {set.weight}
                              <span className="text-white/40 text-sm font-normal ml-1">kg</span>
                            </span>

                            <span className="text-white/30 text-base">×</span>

                            {/* Reps */}
                            <span className="text-white text-lg font-semibold">
                              {set.reps}
                              <span className="text-white/40 text-sm font-normal ml-1">reps</span>
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Total volume — small at bottom */}
                      <div className="mt-4 pt-3 border-t border-white/8 text-xs text-white/35 tracking-wide">
                        Total volume
                        <span className="text-[#00FFA3]/60 font-semibold ml-1.5">
                          {exVol.toLocaleString()} kg
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Day total */}
              <div className="px-5 pb-4 text-xs text-white/25 tracking-wide">
                Day total
                <span className="text-[#00FFA3]/50 font-semibold ml-1.5">
                  {day.totalVolume.toLocaleString()} kg
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
