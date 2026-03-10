import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';

interface InputCanvasProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  unit: string;
  max: number;
  onSwipeLeft?: () => void;
}

export function InputCanvas({ value, onChange, label, unit, max, onSwipeLeft }: InputCanvasProps) {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const startValueRef = useRef(0);
  const startXRef = useRef(0);
  const touchIdRef = useRef<number | null>(null);

  const y = useMotionValue(0);
  const opacity = useTransform(y, [-100, 0, 100], [0.5, 1, 0.5]);

  const handleStart = (clientY: number, clientX: number, touchId?: number) => {
    setIsDragging(true);
    startYRef.current = clientY;
    startXRef.current = clientX;
    startValueRef.current = value;
    if (touchId !== undefined) {
      touchIdRef.current = touchId;
    }
  };

  const handleMove = (clientY: number, clientX: number, touchId?: number) => {
    if (!isDragging) return;
    if (touchId !== undefined && touchIdRef.current !== touchId) return;

    const deltaY = startYRef.current - clientY;
    const deltaX = clientX - startXRef.current;

    // Check for swipe left gesture
    if (Math.abs(deltaX) > 100 && Math.abs(deltaX) > Math.abs(deltaY) && deltaX < 0) {
      if (onSwipeLeft) {
        onSwipeLeft();
        setIsDragging(false);
        touchIdRef.current = null;
      }
      return;
    }

    const sensitivity = 0.03;
    const newValue = Math.round(startValueRef.current + deltaY * sensitivity);
    const clampedValue = Math.max(0, Math.min(max, newValue));
    
    if (clampedValue !== value) {
      onChange(clampedValue);
      // Play tick sound effect (simulated with vibration on mobile)
      if (navigator.vibrate) {
        navigator.vibrate(5);
      }
    }

    y.set(deltaY);
  };

  const handleEnd = (touchId?: number) => {
    if (touchId !== undefined && touchIdRef.current !== touchId) return;
    setIsDragging(false);
    y.set(0);
    touchIdRef.current = null;
  };

  // Mouse events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientY, e.clientX);
    };

    const handleMouseUp = () => {
      handleEnd();
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, value]);

  // Generate adjacent numbers
  const adjacentNumbers = [];
  for (let i = -3; i <= 3; i++) {
    const num = value + i;
    if (num >= 0 && num <= max) {
      adjacentNumbers.push(num);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full">
      {/* Input Progress Indicator */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-xs tracking-widest text-teal-400/60 uppercase">
        <span className={label === 'weight' ? 'text-[#00FFA3]' : ''}>Weight</span>
        <span>·</span>
        <span className={label === 'reps' ? 'text-[#00FFA3]' : ''}>Reps</span>
        <span>·</span>
        <span>Done</span>
      </div>

      {/* Main Drag Zone */}
      <div
        ref={containerRef}
        className={`relative w-[90%] max-w-md h-[400px] rounded-lg transition-all duration-300 ${
          isDragging
            ? 'shadow-[0_0_40px_rgba(0,255,163,0.3),inset_0_0_30px_rgba(0,255,163,0.1)] border-2 border-[#00FFA3]'
            : 'shadow-[0_0_20px_rgba(0,255,163,0.15)] border border-[#00FFA3]/30'
        }`}
        onMouseDown={(e) => handleStart(e.clientY, e.clientX)}
        onTouchStart={(e) => {
          const touch = e.touches[0];
          handleStart(touch.clientY, touch.clientX, touch.identifier);
        }}
        onTouchMove={(e) => {
          const touch = Array.from(e.touches).find(t => t.identifier === touchIdRef.current);
          if (touch) {
            handleMove(touch.clientY, touch.clientX, touch.identifier);
          }
        }}
        onTouchEnd={(e) => {
          const touch = Array.from(e.changedTouches).find(t => t.identifier === touchIdRef.current);
          if (touch) {
            handleEnd(touch.identifier);
          }
        }}
      >
        {/* Large Rotated Digit Display */}
        <motion.div
          className="absolute left-8 top-1/2 -translate-y-1/2 flex items-center gap-4"
          style={{ opacity }}
        >
          <div className="text-[120px] font-bold text-white leading-none tracking-tighter"
               style={{ 
                 writingMode: 'vertical-rl',
                 textOrientation: 'mixed',
                 transform: 'rotate(180deg)',
                 textShadow: isDragging ? '0 0 30px rgba(0,255,163,0.5)' : 'none'
               }}>
            {value}
          </div>
          <span className="text-sm text-[#00FFA3]/70 uppercase tracking-widest">
            {unit}
          </span>
        </motion.div>

        {/* Horizontal Cursor Line */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-[#00FFA3] shadow-[0_0_10px_rgba(0,255,163,0.8)]" />

        {/* Adjacent Numbers Strip */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4">
          {adjacentNumbers.map((num, idx) => (
            <motion.span
              key={num}
              className={`text-xl transition-all duration-200 ${
                num === value
                  ? 'text-[#00FFA3] text-3xl font-bold scale-110'
                  : 'text-white/30'
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
            >
              {num}
            </motion.span>
          ))}
        </div>

        {/* Instruction Text */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/40 uppercase tracking-wider">
          {isDragging ? 'Release to confirm' : 'Drag to select · Swipe left to delete'}
        </div>
      </div>
    </div>
  );
}
