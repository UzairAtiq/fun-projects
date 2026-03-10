import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DotGridBackground } from './components/DotGridBackground';
import { InputCanvas } from './components/InputCanvas';
import { ConfirmScreen } from './components/ConfirmScreen';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';

type InputMode = 'weight' | 'reps' | 'confirm';

export default function App() {
  const [mode, setMode] = useState<InputMode>('weight');
  const [weight, setWeight] = useState(20);
  const [reps, setReps] = useState(8);

  const handleWeightComplete = () => {
    // Simulate a satisfying click sound with vibration
    if (navigator.vibrate) {
      navigator.vibrate([10, 50, 10]);
    }
    
    setTimeout(() => {
      setMode('reps');
    }, 200);
  };

  const handleRepsComplete = () => {
    // Simulate a satisfying click sound with vibration
    if (navigator.vibrate) {
      navigator.vibrate([10, 50, 10]);
    }
    
    setTimeout(() => {
      setMode('confirm');
    }, 200);
  };

  const handleConfirm = () => {
    // Deep thud + success chime simulation
    if (navigator.vibrate) {
      navigator.vibrate([30, 50, 20]);
    }
    
    toast.success('Set logged successfully!', {
      description: `${weight}kg × ${reps} reps = ${weight * reps}kg total volume`,
      duration: 3000,
    });

    // Reset for next set
    setTimeout(() => {
      setMode('weight');
      setWeight(20);
      setReps(8);
    }, 1500);
  };

  const handleRedo = () => {
    // Soft whoosh sound simulation
    if (navigator.vibrate) {
      navigator.vibrate(15);
    }
    
    setMode('weight');
  };

  const handleSwipeLeft = () => {
    // Soft whoosh + reverse tick simulation
    if (navigator.vibrate) {
      navigator.vibrate([5, 30, 5]);
    }
    
    if (mode === 'weight') {
      setWeight(0);
    } else if (mode === 'reps') {
      setReps(0);
    }
  };

  return (
    <div className="relative w-full h-screen bg-[#050A14] overflow-hidden">
      {/* Dot Grid Background */}
      <DotGridBackground />

      {/* Main Content */}
      <div className="relative z-10 w-full h-full">
        <AnimatePresence mode="wait">
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
                max={300}
                onSwipeLeft={handleSwipeLeft}
              />
              
              {/* Continue Button */}
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
                max={50}
                onSwipeLeft={handleSwipeLeft}
              />
              
              {/* Continue Button */}
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

          {mode === 'confirm' && (
            <ConfirmScreen
              key="confirm"
              weight={weight}
              reps={reps}
              onConfirm={handleConfirm}
              onRedo={handleRedo}
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
