import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';

interface InputCanvasProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  unit: string;
  max: number;
  onSwipeLeft?: () => void;
  onComplete?: () => void;
  onBack?: () => void;
  canGoBack?: boolean;
  canGoForward?: boolean;
}

export function InputCanvas({ value, onChange, label, unit, max, onSwipeLeft, onComplete, onBack, canGoBack, canGoForward }: InputCanvasProps) {
  const maxDigits = label === 'weight' ? 3 : 2;
  const [currentDigitIndex, setCurrentDigitIndex] = useState(0);
  const [digits, setDigits] = useState<number[]>(Array(maxDigits).fill(null));
  const [hasInputStarted, setHasInputStarted] = useState(false);
  
  const [isDragging, setIsDragging] = useState(false);
  const [showSlider, setShowSlider] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const startDigitRef = useRef(0);
  const startXRef = useRef(0);
  const touchIdRef = useRef<number | null>(null);
  const digitWasModifiedRef = useRef(false);
  const isHorizontalSwipeRef = useRef(false);
  const initializedRef = useRef(false);

  const y = useMotionValue(0);
  const opacity = useTransform(y, [-100, 0, 100], [0.5, 1, 0.5]);

  // Initialize digits from value prop only once when component mounts or label changes
  useEffect(() => {
    if (!initializedRef.current || label !== initializedRef.current) {
      initializedRef.current = label;
      
      if (value === 0) {
        setDigits(Array(maxDigits).fill(null));
        setCurrentDigitIndex(0);
        setHasInputStarted(false);
      } else if (value > 0) {
        // Populate digits from existing value (for when navigating between screens)
        const valueStr = value.toString();
        const newDigits = Array(maxDigits).fill(null);
        for (let i = 0; i < valueStr.length && i < maxDigits; i++) {
          newDigits[i] = parseInt(valueStr[i]);
        }
        setDigits(newDigits);
        setHasInputStarted(true);
        setCurrentDigitIndex(Math.min(valueStr.length, maxDigits - 1));
      }
    }
  }, [label, value, maxDigits]);

  const handleStart = (clientY: number, clientX: number, touchId?: number) => {
    setIsDragging(true);
    startYRef.current = clientY;
    startXRef.current = clientX;
    startDigitRef.current = digits[currentDigitIndex] ?? 0;
    digitWasModifiedRef.current = false;
    isHorizontalSwipeRef.current = false;
    if (touchId !== undefined) {
      touchIdRef.current = touchId;
    }
  };

  const handleMove = (clientY: number, clientX: number, touchId?: number) => {
    if (!isDragging) return;
    if (touchId !== undefined && touchIdRef.current !== touchId) return;

    const deltaY = startYRef.current - clientY;
    const deltaX = clientX - startXRef.current;

    // Detect if this is a horizontal swipe early on
    if (!isHorizontalSwipeRef.current && (Math.abs(deltaX) > 30 || Math.abs(deltaY) > 30)) {
      isHorizontalSwipeRef.current = Math.abs(deltaX) > Math.abs(deltaY);
    }

    // Show slider only when vertical movement is detected
    if (!showSlider && Math.abs(deltaY) > 20 && !isHorizontalSwipeRef.current) {
      setShowSlider(true);
      
      // Calculate initial digit based on finger position in the container
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const relativeY = startYRef.current - rect.top;
        const containerHeight = rect.height;
        
        // Map Y position (0 to containerHeight) to digit (0 to 9)
        // Top = 0, Bottom = 9, middle = 5, etc.
        const normalizedPosition = Math.max(0, Math.min(1, relativeY / containerHeight));
        const calculatedDigit = Math.round(normalizedPosition * 9);
        
        // Set this as the starting digit
        const newDigits = [...digits];
        newDigits[currentDigitIndex] = calculatedDigit;
        setDigits(newDigits);
        setHasInputStarted(true);
        digitWasModifiedRef.current = true;
        startDigitRef.current = calculatedDigit;
        
        // Update value
        const enteredDigits = newDigits.filter(d => d !== null);
        const newValue = enteredDigits.length > 0 ? parseInt(enteredDigits.join('')) : 0;
        onChange(newValue);
      }
    }

    // If horizontal swipe detected, ignore vertical movement
    if (isHorizontalSwipeRef.current) {
      // Check for swipe left gesture (remove last digit)
      if (deltaX < -100) {
        setIsDragging(false);
        touchIdRef.current = null;
        
        // Find the last non-null digit index
        let lastDigitIndex = -1;
        for (let i = digits.length - 1; i >= 0; i--) {
          if (digits[i] !== null) {
            lastDigitIndex = i;
            break;
          }
        }
        
        // If there's a digit to remove
        if (lastDigitIndex >= 0) {
          const newDigits = [...digits];
          newDigits[lastDigitIndex] = null;
          setDigits(newDigits);
          
          // Move to the previous digit position
          setCurrentDigitIndex(lastDigitIndex);
          
          // Update value with remaining digits
          const enteredDigits = newDigits.filter(d => d !== null);
          const newValue = enteredDigits.length > 0 ? parseInt(enteredDigits.join('')) : 0;
          onChange(newValue);
          
          // Check if all digits are cleared
          if (enteredDigits.length === 0) {
            setHasInputStarted(false);
            setCurrentDigitIndex(0);
          }
          
          // Vibration feedback
          if (navigator.vibrate) {
            navigator.vibrate([5, 30, 5]);
          }
        }
        
        return;
      }
      
      // Check for swipe right gesture (advance to next screen if at least 1 digit)
      if (deltaX > 100) {
        const hasAtLeastOneDigit = digits.some(d => d !== null);
        if (hasAtLeastOneDigit && onComplete) {
          // Calculate final value from entered digits only
          const enteredDigits = digits.filter(d => d !== null);
          const finalValue = enteredDigits.length > 0 ? parseInt(enteredDigits.join('')) : 0;
          onChange(finalValue);
          setIsDragging(false);
          touchIdRef.current = null;
          
          // Trigger completion
          if (navigator.vibrate) {
            navigator.vibrate([10, 50, 10]);
          }
          
          setTimeout(() => {
            onComplete();
          }, 100);
        }
        return;
      }
    }

    // Only process vertical movement if not in horizontal swipe mode
    if (isHorizontalSwipeRef.current) return;

    const sensitivity = 0.03; // Reduced by 40% from 0.05
    const newDigit = Math.round(startDigitRef.current + deltaY * sensitivity);
    const clampedDigit = Math.max(0, Math.min(9, newDigit));
    
    const currentDigit = digits[currentDigitIndex] ?? 0;
    if (clampedDigit !== currentDigit) {
      setHasInputStarted(true);
      digitWasModifiedRef.current = true;
      const newDigits = [...digits];
      newDigits[currentDigitIndex] = clampedDigit;
      setDigits(newDigits);
      
      // Convert only entered digits to number (no padding with zeros)
      const enteredDigits = newDigits.filter(d => d !== null);
      const newValue = enteredDigits.length > 0 ? parseInt(enteredDigits.join('')) : 0;
      onChange(newValue);
      
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
    setShowSlider(false);
    y.set(0);
    touchIdRef.current = null;
    
    // Auto-advance to next digit if current digit was modified and not at the end
    if (currentDigitIndex < maxDigits - 1 && digitWasModifiedRef.current) {
      setTimeout(() => {
        setCurrentDigitIndex(prev => prev + 1);
      }, 200);
    }
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
  }, [isDragging, digits, currentDigitIndex]);

  // Prevent body scroll on mobile
  useEffect(() => {
    const preventScroll = (e: TouchEvent) => {
      if (containerRef.current && containerRef.current.contains(e.target as Node)) {
        e.preventDefault();
      }
    };

    document.body.addEventListener('touchmove', preventScroll, { passive: false });
    document.addEventListener('touchmove', preventScroll, { passive: false });

    return () => {
      document.body.removeEventListener('touchmove', preventScroll);
      document.removeEventListener('touchmove', preventScroll);
    };
  }, []);

  // Get current digit value
  const currentDigit = digits[currentDigitIndex] ?? 0;

  return (
    <div className="flex flex-col items-center justify-center h-full">
      {/* Input Progress Indicator with Navigation */}
      <div className="absolute top-4 sm:top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-4">
        {/* Back Button */}
        <button
          onClick={onBack}
          disabled={!canGoBack}
          className={`p-2 sm:p-2.5 transition-all ${
            canGoBack
              ? 'text-[#00FFA3] hover:text-[#00FFA3]/80 cursor-pointer'
              : 'text-white/20 cursor-not-allowed'
          }`}
        >
          <svg width="28" height="28" className="sm:w-8 sm:h-8" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Progress Indicator */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs tracking-widest text-teal-400/60 uppercase">
          <span className={label === 'weight' ? 'text-[#00FFA3]' : ''}>Weight</span>
          <span>·</span>
          <span className={label === 'reps' ? 'text-[#00FFA3]' : ''}>Reps</span>
          <span>·</span>
          <span>Done</span>
        </div>

        {/* Forward Button */}
        <button
          onClick={() => {
            const hasAtLeastOneDigit = digits.some(d => d !== null);
            if (hasAtLeastOneDigit && canGoForward && onComplete) {
              onComplete();
            }
          }}
          disabled={!canGoForward || !digits.some(d => d !== null)}
          className={`p-2 sm:p-2.5 transition-all ${
            canGoForward && digits.some(d => d !== null)
              ? 'text-[#00FFA3] hover:text-[#00FFA3]/80 cursor-pointer'
              : 'text-white/20 cursor-not-allowed'
          }`}
        >
          <svg width="28" height="28" className="sm:w-8 sm:h-8" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Main Drag Zone */}
      <div
        ref={containerRef}
        className={`relative w-[95%] sm:w-[90%] lg:w-[126%] max-w-2xl h-[60vh] sm:h-[70vh] lg:h-[784px] rounded-lg transition-all duration-300 ${
          isDragging
            ? 'shadow-[0_0_40px_rgba(0,255,163,0.3),inset_0_0_30px_rgba(0,255,163,0.1)] border-2 border-[#00FFA3]'
            : 'shadow-[0_0_20px_rgba(0,255,163,0.15)] border border-[#00FFA3]/30'
        }`}
        style={{
          touchAction: 'none',
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none',
          overscrollBehavior: 'none'
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          handleStart(e.clientY, e.clientX);
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const touch = e.touches[0];
          handleStart(touch.clientY, touch.clientX, touch.identifier);
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const touch = Array.from(e.touches).find(t => t.identifier === touchIdRef.current);
          if (touch) {
            handleMove(touch.clientY, touch.clientX, touch.identifier);
          }
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const touch = Array.from(e.changedTouches).find(t => t.identifier === touchIdRef.current);
          if (touch) {
            handleEnd(touch.identifier);
          }
        }}
      >
        {/* Counter at Top of Box */}
        {hasInputStarted && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-xs text-[#00FFA3]/70 uppercase tracking-widest">{unit}</span>
          <div className="flex items-center gap-1">
            {digits.map((digit, index) => (
              digit !== null ? (
                <motion.span
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentDigitIndex(index);
                  }}
                  className={`text-6xl font-bold leading-none transition-all duration-200 cursor-pointer ${
                    index === currentDigitIndex
                      ? 'text-[#00FFA3] scale-110'
                      : 'text-white/50 hover:text-white/70'
                  }`}
                  style={{
                    textShadow: index === currentDigitIndex && isDragging 
                      ? '0 0 30px rgba(0,255,163,0.5)' 
                      : 'none'
                  }}
                >
                  {digit}
                </motion.span>
              ) : null
            ))}
          </div>
          <div className="flex gap-1 mt-1">
            {digits.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentDigitIndex
                    ? 'bg-[#00FFA3] w-6'
                    : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>
        )}

        {/* Number Slider (0-9 for current digit) */}
        {isDragging && showSlider && (
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            style={{ height: '200px', width: '80px' }}
          >
            {/* Container for all numbers 0-9 with vertical scroll effect */}
            <motion.div
              className="relative flex flex-col items-center"
              animate={{
                y: `calc(50% - ${currentDigit * 40}px)`,
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
              }}
              style={{
                gap: '12px',
              }}
            >
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                const distance = Math.abs(num - currentDigit);
                const isSelected = num === currentDigit;
                
                return (
                  <motion.span
                    key={num}
                    className="font-bold"
                    animate={{
                      fontSize: isSelected ? '28px' : distance === 1 ? '20px' : distance === 2 ? '14px' : '11px',
                      opacity: distance === 0 ? 1 : distance === 1 ? 0.6 : distance === 2 ? 0.3 : 0.15,
                      scale: isSelected ? 1.15 : 1,
                    }}
                    transition={{
                      duration: 0.15,
                      ease: 'easeOut',
                    }}
                    style={{
                      fontFamily: '"SF Mono", "Menlo", monospace',
                      color: isSelected ? '#00FFA3' : distance <= 2 ? '#ffffff' : '#ffffff50',
                      textShadow: isSelected 
                        ? '0 0 40px rgba(0,255,163,0.9), 0 0 80px rgba(0,255,163,0.5), 0 4px 20px rgba(0,0,0,0.5)' 
                        : distance === 1 
                          ? '0 2px 10px rgba(0,0,0,0.3)' 
                          : 'none',
                      lineHeight: 1,
                      fontWeight: isSelected ? 900 : 700,
                    }}
                  >
                    {num}
                  </motion.span>
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
