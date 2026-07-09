import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DotGridBackground } from './components/DotGridBackground';
import { InputCanvas } from './components/InputCanvas';
import { ConfirmScreen } from './components/ConfirmScreen';
import { ExerciseNameInput } from './components/ExerciseNameInput';
import { HistoryScreen } from './components/HistoryScreen';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';
import { saveSession } from '../services/storage';
import type { WorkoutSession, Exercise, WorkoutSet } from '../types/workout';
import { ClockIcon } from 'lucide-react';

type InputMode = 'exercise' | 'weight' | 'reps' | 'confirm' | 'history';

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function App() {
  const [mode, setMode] = useState<InputMode>('exercise');
  const [exerciseName, setExerciseName] = useState('');
  const [weight, setWeight] = useState(0);
  const [reps, setReps] = useState(0);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  // Track sets logged in the current session without re-rendering the flow
  const currentSessionRef = useRef<WorkoutSession>({
    id: generateId(),
    date: new Date().toISOString(),
    exercises: [],
  });

  const handleExerciseComplete = () => {
    if (navigator.vibrate) navigator.vibrate([10, 50, 10]);
    setTimeout(() => setMode('weight'), 200);
  };

  const handleWeightComplete = () => {
    if (navigator.vibrate) navigator.vibrate([10, 50, 10]);
    setTimeout(() => setMode('reps'), 200);
  };

  const handleRepsComplete = () => {
    if (navigator.vibrate) navigator.vibrate([10, 50, 10]);
    setTimeout(() => setMode('confirm'), 200);
  };

  const handleConfirm = async () => {
    if (navigator.vibrate) navigator.vibrate([30, 50, 20]);

    const newSet: WorkoutSet = { id: generateId(), weight, reps };

    // Append set to current session under the active exercise
    const session = currentSessionRef.current;
    const existing = session.exercises.find((e) => e.name === exerciseName.trim());
    if (existing) {
      existing.sets.push(newSet);
    } else {
      const ex: Exercise = { id: generateId(), name: exerciseName.trim(), sets: [newSet] };
      session.exercises.push(ex);
    }

    // Persist the whole session (upsert: delete old version + save updated)
    try {
      await saveSession({ ...session });
      setHistoryRefreshKey((k) => k + 1);
    } catch (err) {
      console.error('Failed to save workout:', err);
    }

    toast.success('Set logged!', {
      description: `${exerciseName} · ${weight}kg × ${reps} reps = ${weight * reps}kg`,
      duration: 3000,
    });

    // Keep same exercise, reset weight/reps for next set
    setTimeout(() => {
      setMode('weight');
      setWeight(0);
      setReps(0);
    }, 1500);
  };

  const handleConcludeExercise = async () => {
    if (navigator.vibrate) navigator.vibrate([30, 50, 20]);

    // Same save logic as handleConfirm — persist the set first
    const newSet = { id: generateId(), weight, reps };
    const session = currentSessionRef.current;
    const existing = session.exercises.find((e) => e.name === exerciseName.trim());
    if (existing) {
      existing.sets.push(newSet);
    } else {
      session.exercises.push({ id: generateId(), name: exerciseName.trim(), sets: [newSet] });
    }
    try {
      await saveSession({ ...session });
      setHistoryRefreshKey((k) => k + 1);
    } catch (err) {
      console.error('Failed to save workout:', err);
    }

    toast.success('Exercise concluded!', {
      description: `${exerciseName} · ${weight}kg × ${reps} reps logged`,
      duration: 2500,
    });

    // Move to next exercise — reset name, weight, reps
    setTimeout(() => {
      setExerciseName('');
      setWeight(0);
      setReps(0);
      setMode('exercise');
    }, 700);
  };

  const handleRedo = () => {
    if (navigator.vibrate) navigator.vibrate(15);
    setMode('weight');
  };

  const handleSwipeLeft = () => {
    if (navigator.vibrate) navigator.vibrate([5, 30, 5]);
    if (mode === 'weight') setWeight(0);
    else if (mode === 'reps') setReps(0);
  };

  const isLogging = mode !== 'history';

  const handleNewSession = () => {
    // Reset session ref so a fresh session starts
    currentSessionRef.current = {
      id: generateId(),
      date: new Date().toISOString(),
      exercises: [],
    };
    setExerciseName('');
    setWeight(0);
    setReps(0);
    setMode('exercise');
  };

  return (
    <div className="relative w-full h-screen bg-[#050A14] overflow-hidden">
      {/* Dot Grid Background */}
      <DotGridBackground />

      {/* History toggle — only show during logging modes */}
      <AnimatePresence>
        {isLogging && (
          <motion.button
            key="history-btn"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onClick={() => setMode('history')}
            className="absolute top-5 right-5 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/40 hover:text-[#00FFA3] hover:border-[#00FFA3]/40 transition-all text-xs tracking-widest uppercase"
          >
            <ClockIcon className="w-3 h-3" />
            History
          </motion.button>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-10 w-full h-full">
        <AnimatePresence mode="wait">

          {/* ── History view ── */}
          {mode === 'history' && (
            <HistoryScreen
              key="history"
              refreshKey={historyRefreshKey}
              onClose={handleNewSession}
            />
          )}

          {/* ── Exercise name ── */}
          {mode === 'exercise' && (
            <ExerciseNameInput
              key="exercise"
              value={exerciseName}
              onChange={setExerciseName}
              onComplete={handleExerciseComplete}
              onBack={() => setMode('history')}
            />
          )}

          {/* ── Weight ── */}
          {mode === 'weight' && (
            <motion.div
              key="weight"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-full h-full"
            >
              <InputCanvas
                value={weight}
                onChange={setWeight}
                label="weight"
                unit="kg"
                max={999}
                onSwipeLeft={handleSwipeLeft}
                onComplete={handleWeightComplete}
                onBack={() => setMode('exercise')}
                canGoBack={true}
                canGoForward={true}
              />
              <motion.div
                className="absolute bottom-8 left-1/2 -translate-x-1/2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <button
                  onClick={handleWeightComplete}
                  className="px-8 py-3 bg-[#00FFA3]/20 border border-[#00FFA3]/50 text-[#00FFA3] rounded-lg uppercase tracking-widest text-sm font-semibold hover:bg-[#00FFA3]/30 transition-all"
                >
                  Continue to Reps →
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* ── Reps ── */}
          {mode === 'reps' && (
            <motion.div
              key="reps"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-full h-full"
            >
              <InputCanvas
                value={reps}
                onChange={setReps}
                label="reps"
                unit="reps"
                max={99}
                onSwipeLeft={handleSwipeLeft}
                onComplete={handleRepsComplete}
                onBack={() => setMode('weight')}
                canGoBack={true}
                canGoForward={true}
              />
              <motion.div
                className="absolute bottom-8 left-1/2 -translate-x-1/2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <button
                  onClick={handleRepsComplete}
                  className="px-8 py-3 bg-[#00FFA3]/20 border border-[#00FFA3]/50 text-[#00FFA3] rounded-lg uppercase tracking-widest text-sm font-semibold hover:bg-[#00FFA3]/30 transition-all"
                >
                  Continue to Summary →
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* ── Confirm ── */}
          {mode === 'confirm' && (
            <ConfirmScreen
              key="confirm"
              weight={weight}
              reps={reps}
              onConfirm={handleConfirm}
              onConcludeExercise={handleConcludeExercise}
              onRedo={handleRedo}
              onBack={() => setMode('reps')}
            />
          )}

        </AnimatePresence>
      </div>

      {/* Toast Notifications */}
      <Toaster
        theme="dark"
        toastOptions={{
          style: {
            background: '#0A1525',
            border: '1px solid rgba(0,255,163,0.3)',
            color: '#00FFA3',
          },
        }}
      />
    </div>
  );
}
