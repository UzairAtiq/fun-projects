import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';

interface ExerciseNameInputProps {
  value: string;
  onChange: (name: string) => void;
  onComplete: () => void;
  onBack: () => void;
}

const SUGGESTIONS = [
  'Bench Press',
  'Squat',
  'Deadlift',
  'Overhead Press',
  'Row',
  'Pull-up',
  'Curl',
  'Tricep Extension',
  'Leg Press',
  'Lunge',
];

export function ExerciseNameInput({ value, onChange, onComplete, onBack }: ExerciseNameInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    // Small delay so the animation plays before keyboard opens
    const t = setTimeout(() => inputRef.current?.focus(), 400);
    return () => clearTimeout(t);
  }, []);

  const filtered = value.trim().length > 0
    ? SUGGESTIONS.filter((s) => s.toLowerCase().includes(value.toLowerCase()))
    : SUGGESTIONS;

  const handleSubmit = () => {
    if (value.trim().length > 0) onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center h-full px-8"
    >
      {/* Navigation Header */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 text-[#00FFA3] hover:text-[#00FFA3]/80 cursor-pointer transition-all"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="flex items-center gap-2 text-xs tracking-widest text-teal-400/60 uppercase">
          <span className="text-[#00FFA3]">Exercise</span>
          <span>·</span>
          <span>Weight</span>
          <span>·</span>
          <span>Reps</span>
          <span>·</span>
          <span>Done</span>
        </div>

        <button
          onClick={handleSubmit}
          disabled={value.trim().length === 0}
          className="p-2 text-[#00FFA3] disabled:text-white/20 disabled:cursor-not-allowed cursor-pointer transition-all"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Label */}
      <motion.div
        className="text-xs tracking-[0.3em] text-[#00FFA3]/60 uppercase mb-6"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        Exercise Name
      </motion.div>

      {/* Text Input */}
      <motion.div
        className="w-full max-w-sm relative"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="e.g. Bench Press"
          maxLength={40}
          className="w-full bg-transparent border-b-2 border-[#00FFA3]/40 text-white text-3xl font-bold text-center tracking-wide pb-3 outline-none placeholder:text-white/20 caret-[#00FFA3] transition-colors focus:border-[#00FFA3]"
          style={{
            WebkitTapHighlightColor: 'transparent',
          }}
        />
        {/* Glow line */}
        <motion.div
          className="absolute bottom-0 left-0 h-[2px] bg-[#00FFA3] rounded-full"
          animate={{ width: focused ? '100%' : '0%' }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>

      {/* Suggestions */}
      {filtered.length > 0 && (
        <motion.div
          className="w-full max-w-sm mt-8 flex flex-wrap gap-2 justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {filtered.slice(0, 6).map((s) => (
            <button
              key={s}
              onMouseDown={(e) => {
                e.preventDefault(); // prevent blur before click
                onChange(s);
              }}
              onClick={() => {
                onChange(s);
                onComplete();
              }}
              className="px-4 py-2 rounded-full border border-[#00FFA3]/30 text-[#00FFA3]/70 text-sm hover:border-[#00FFA3] hover:text-[#00FFA3] hover:bg-[#00FFA3]/10 transition-all"
            >
              {s}
            </button>
          ))}
        </motion.div>
      )}

      {/* Continue Button */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <button
          onClick={handleSubmit}
          disabled={value.trim().length === 0}
          className="px-8 py-3 bg-[#00FFA3]/20 border border-[#00FFA3]/50 text-[#00FFA3] rounded-lg uppercase tracking-widest text-sm font-semibold hover:bg-[#00FFA3]/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          Continue to Weight →
        </button>
      </motion.div>
    </motion.div>
  );
}
