import { useState, useRef, useEffect, useCallback } from 'react';

// Lightweight haptic feedback (optimized for performance)
const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if (navigator.vibrate) {
    const patterns = { light: 10, medium: 20, heavy: 30 };
    navigator.vibrate(patterns[type]);
  }
};

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
  const [digits, setDigits] = useState<(number | null)[]>(Array(maxDigits).fill(null));
  const [hasInputStarted, setHasInputStarted] = useState(false);
  
  const [isDragging, setIsDragging] = useState(false);
  const [showSlider, setShowSlider] = useState(false);
  const [currentDigit, setCurrentDigit] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const startDigitRef = useRef(0);
  const startXRef = useRef(0);
  const touchIdRef = useRef<number | null>(null);
  const digitWasModifiedRef = useRef(false);
  const isHorizontalSwipeRef = useRef(false);
  const initializedRef = useRef<string | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef(0);

  // Initialize digits from value prop only once when component mounts or label changes
  useEffect(() => {
    if (!initializedRef.current || label !== initializedRef.current) {
      initializedRef.current = label;
      
      if (value === 0) {
        setDigits(Array(maxDigits).fill(null));
        setCurrentDigitIndex(0);
        setHasInputStarted(false);
      } else if (value > 0) {
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

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  const handleStart = useCallback((clientY: number, clientX: number, touchId?: number) => {
    setIsDragging(true);
    startYRef.current = clientY;
    startXRef.current = clientX;
    startDigitRef.current = digits[currentDigitIndex] ?? 0;
    setCurrentDigit(digits[currentDigitIndex] ?? 0);
    digitWasModifiedRef.current = false;
    isHorizontalSwipeRef.current = false;
    if (touchId !== undefined) {
      touchIdRef.current = touchId;
    }
  }, [digits, currentDigitIndex]);

  const handleMove = useCallback((clientY: number, clientX: number, touchId?: number) => {
    if (!isDragging) return;
    if (touchId !== undefined && touchIdRef.current !== touchId) return;

    // Throttle with RAF for smooth 60fps performance
    if (rafIdRef.current) return;
    
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      
      const deltaY = startYRef.current - clientY;
      const deltaX = clientX - startXRef.current;

      // Detect horizontal swipe early
      if (!isHorizontalSwipeRef.current && (Math.abs(deltaX) > 30 || Math.abs(deltaY) > 30)) {
        isHorizontalSwipeRef.current = Math.abs(deltaX) > Math.abs(deltaY);
      }

      // Show slider on vertical movement
      if (!showSlider && Math.abs(deltaY) > 20 && !isHorizontalSwipeRef.current) {
        setShowSlider(true);
        
        // Calculate initial digit from finger position
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const relativeY = startYRef.current - rect.top;
          const containerHeight = rect.height;
          const normalizedPosition = Math.max(0, Math.min(1, relativeY / containerHeight));
          const calculatedDigit = Math.round(normalizedPosition * 9);
          
          const newDigits = [...digits];
          newDigits[currentDigitIndex] = calculatedDigit;
          setDigits(newDigits);
          setCurrentDigit(calculatedDigit);
          setHasInputStarted(true);
          digitWasModifiedRef.current = true;
          startDigitRef.current = calculatedDigit;
          
          const enteredDigits = newDigits.filter(d => d !== null);
          const newValue = enteredDigits.length > 0 ? parseInt(enteredDigits.join('')) : 0;
          onChange(newValue);
          triggerHaptic('light');
        }
      }

      // Handle horizontal swipes
      if (isHorizontalSwipeRef.current) {
        // Swipe left - remove last digit
        if (deltaX < -100) {
          setIsDragging(false);
          setShowSlider(false);
          touchIdRef.current = null;
          
          let lastDigitIndex = -1;
          for (let i = digits.length - 1; i >= 0; i--) {
            if (digits[i] !== null) {
              lastDigitIndex = i;
              break;
            }
          }
          
          if (lastDigitIndex >= 0) {
            const newDigits = [...digits];
            newDigits[lastDigitIndex] = null;
            setDigits(newDigits);
            setCurrentDigitIndex(lastDigitIndex);
            
            const enteredDigits = newDigits.filter(d => d !== null);
            const newValue = enteredDigits.length > 0 ? parseInt(enteredDigits.join('')) : 0;
            onChange(newValue);
            
            if (enteredDigits.length === 0) {
              setHasInputStarted(false);
              setCurrentDigitIndex(0);
            }
            triggerHaptic('medium');
          }
          return;
        }
        
        // Swipe right - complete
        if (deltaX > 100) {
          const hasAtLeastOneDigit = digits.some(d => d !== null);
          if (hasAtLeastOneDigit && onComplete) {
            const enteredDigits = digits.filter(d => d !== null);
            const finalValue = enteredDigits.length > 0 ? parseInt(enteredDigits.join('')) : 0;
            onChange(finalValue);
            setIsDragging(false);
            setShowSlider(false);
            touchIdRef.current = null;
            triggerHaptic('heavy');
            setTimeout(() => onComplete(), 100);
          }
          return;
        }
      }

      // Process vertical movement for digit selection
      if (!isHorizontalSwipeRef.current && showSlider) {
        const sensitivity = 0.03;
        const newDigit = Math.round(startDigitRef.current + deltaY * sensitivity);
        const clampedDigit = Math.max(0, Math.min(9, newDigit));
        
        if (clampedDigit !== currentDigit) {
          setCurrentDigit(clampedDigit);
          setHasInputStarted(true);
          digitWasModifiedRef.current = true;
          
          const newDigits = [...digits];
          newDigits[currentDigitIndex] = clampedDigit;
          setDigits(newDigits);
          
          const enteredDigits = newDigits.filter(d => d !== null);
          const newValue = enteredDigits.length > 0 ? parseInt(enteredDigits.join('')) : 0;
          onChange(newValue);
          
          // Throttle haptic feedback
          const now = Date.now();
          if (now - lastUpdateTimeRef.current > 50) {
            triggerHaptic('light');
            lastUpdateTimeRef.current = now;
          }
        }
      }
    });
  }, [isDragging, showSlider, digits, currentDigitIndex, currentDigit, onChange, onComplete]);

  const handleEnd = useCallback((touchId?: number) => {
    if (touchId !== undefined && touchIdRef.current !== touchId) return;
    setIsDragging(false);
    setShowSlider(false);
    touchIdRef.current = null;
    
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    
    // Auto-advance to next digit
    if (currentDigitIndex < maxDigits - 1 && digitWasModifiedRef.current) {
      setTimeout(() => setCurrentDigitIndex(prev => prev + 1), 200);
    }
  }, [currentDigitIndex, maxDigits]);

  // Mouse events
  useEffect(() => {
    if (!isDragging) return;
    
    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientY, e.clientX);
    const handleMouseUp = () => handleEnd();

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMove, handleEnd]);

  // Prevent body scroll on mobile
  useEffect(() => {
    const preventScroll = (e: TouchEvent) => {
      if (containerRef.current?.contains(e.target as Node)) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchmove', preventScroll, { passive: false });
    return () => document.removeEventListener('touchmove', preventScroll);
  }, []);

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
          handleStart(e.clientY, e.clientX);
        }}
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
        {/* Counter at Top of Box */}
        {hasInputStarted && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-xs text-[#00FFA3]/70 uppercase tracking-widest">{unit}</span>
          <div className="flex items-center gap-1">
            {digits.map((digit, index) => (
              digit !== null ? (
                <span
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentDigitIndex(index);
                  }}
                  className={`text-6xl font-bold leading-none cursor-pointer transition-all duration-200 ${
                    index === currentDigitIndex
                      ? 'text-[#00FFA3] scale-110'
                      : 'text-white/50 hover:text-white/70'
                  }`}
                  style={{
                    textShadow: index === currentDigitIndex && isDragging 
                      ? '0 0 20px rgba(0,255,163,0.6)' 
                      : 'none',
                    transform: index === currentDigitIndex ? 'scale(1.1)' : 'scale(1)',
                    willChange: 'transform'
                  }}
                >
                  {digit}
                </span>
              ) : null
            ))}
          </div>
          <div className="flex gap-1 mt-1">
            {digits.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-200 ${
                  index === currentDigitIndex
                    ? 'bg-[#00FFA3] w-6'
                    : 'bg-white/20 w-2'
                }`}
              />
            ))}
          </div>
        </div>
        )}

        {/* Optimized Number Slider with CSS transforms */}
        {showSlider && (
          <div
            ref={sliderRef}
            className="absolute top-1/2 left-1/2 overflow-hidden"
            style={{
              width: '100px',
              height: '250px',
              transform: 'translate(-50%, -50%)',
              willChange: 'contents'
            }}
          >
            <div
              className="relative flex flex-col items-center"
              style={{
                transform: `translate3d(0, calc(125px - ${currentDigit * 50}px), 0)`,
                transition: 'transform 0.15s ease-out',
                gap: '16px',
                willChange: 'transform'
              }}
            >
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                const distance = Math.abs(num - currentDigit);
                const isSelected = num === currentDigit;
                
                return (
                  <span
                    key={num}
                    className="font-bold"
                    style={{
                      fontSize: isSelected ? '40px' : distance === 1 ? '28px' : distance === 2 ? '20px' : '16px',
                      opacity: distance === 0 ? 1 : distance === 1 ? 0.6 : distance === 2 ? 0.3 : 0.15,
                      transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                      transition: 'all 0.15s ease-out',
                      fontFamily: '"SF Mono", "Menlo", monospace',
                      color: isSelected ? '#00FFA3' : distance <= 2 ? '#ffffff' : '#ffffff50',
                      textShadow: isSelected ? '0 0 20px rgba(0,255,163,0.8)' : 'none',
                      lineHeight: 1,
                      fontWeight: isSelected ? 900 : 700,
                      willChange: 'transform, opacity'
                    }}
                  >
                    {num}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
