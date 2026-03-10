import { motion } from 'motion/react';
import { Check, RotateCcw } from 'lucide-react';

interface ConfirmScreenProps {
  weight: number;
  reps: number;
  onConfirm: () => void;
  onRedo: () => void;
  onBack?: () => void;
}

export function ConfirmScreen({ weight, reps, onConfirm, onRedo, onBack }: ConfirmScreenProps) {
  const totalVolume = weight * reps;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center h-full px-8"
    >
      {/* Navigation Header */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="p-2 text-[#00FFA3] hover:text-[#00FFA3]/80 cursor-pointer transition-all"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2 text-xs tracking-widest text-teal-400/60 uppercase">
          <span>Weight</span>
          <span>·</span>
          <span>Reps</span>
          <span>·</span>
          <span className="text-[#00FFA3]">Done</span>
        </div>

        {/* Forward Button (disabled) */}
        <button
          disabled
          className="p-2 text-white/20 cursor-not-allowed"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#00FFA3]/30 rounded-full"
            initial={{
              x: '50%',
              y: '50%',
              scale: 0,
            }}
            animate={{
              x: `${Math.random() * 100}%`,
              y: `${Math.random() * 100}%`,
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              delay: i * 0.1,
              repeat: Infinity,
              repeatDelay: 1,
            }}
          />
        ))}
      </div>

      {/* Summary Card */}
      <motion.div
        className="relative z-10 text-center mb-16"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        {/* Main Summary */}
        <motion.div
          className="text-7xl font-bold text-white mb-4 tracking-tight"
          animate={{
            textShadow: [
              '0 0 20px rgba(0,255,163,0.3)',
              '0 0 40px rgba(0,255,163,0.5)',
              '0 0 20px rgba(0,255,163,0.3)',
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {weight}
          <span className="text-4xl text-white/60 ml-2">kg</span>
          <span className="text-5xl text-[#00FFA3] mx-4">×</span>
          {reps}
          <span className="text-4xl text-white/60 ml-2">reps</span>
        </motion.div>

        {/* Divider */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#00FFA3]/50 to-transparent my-8" />

        {/* Total Volume */}
        <div className="space-y-2">
          <div className="text-xs tracking-[0.3em] text-[#00FFA3]/60 uppercase">
            Total Volume
          </div>
          <motion.div
            className="text-6xl font-bold text-[#00FFA3]"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.4,
              type: 'spring',
              stiffness: 200,
              damping: 15,
            }}
          >
            {totalVolume}
            <span className="text-2xl ml-2 text-[#00FFA3]/60">kg</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="w-full max-w-md space-y-4 relative z-10">
        {/* Log Set Button */}
        <motion.button
          onClick={onConfirm}
          className="w-full bg-[#00FFA3] text-[#050A14] font-bold text-lg py-6 rounded-lg uppercase tracking-widest relative overflow-hidden group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            className="absolute inset-0 bg-white/20"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.5 }}
          />
          <span className="relative z-10 flex items-center justify-center gap-3">
            <Check className="w-6 h-6" />
            Log Set
          </span>
        </motion.button>

        {/* Redo Button */}
        <motion.button
          onClick={onRedo}
          className="w-full border-2 border-[#00FFA3]/30 text-[#00FFA3] font-semibold text-sm py-4 rounded-lg uppercase tracking-widest hover:bg-[#00FFA3]/10 transition-colors"
          whileHover={{ scale: 1.02, borderColor: 'rgba(0,255,163,0.6)' }}
          whileTap={{ scale: 0.98 }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <span className="flex items-center justify-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Redo
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
}
