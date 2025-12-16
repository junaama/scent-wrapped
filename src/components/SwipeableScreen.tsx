'use client';

import { useRef, useState } from 'react';

interface SwipeableScreenProps {
  children: React.ReactNode;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  currentStep?: number;
  totalSteps?: number;
  className?: string;
}

export function SwipeableScreen({
  children,
  onSwipeUp,
  onSwipeDown,
  currentStep = 1,
  totalSteps = 5,
  className = ''
}: SwipeableScreenProps) {
  const touchStartY = useRef<number | null>(null);
  const [swiping, setSwiping] = useState(false);
  const [swipeProgress, setSwipeProgress] = useState(0); // positive = up, negative = down
  const [touchDetected, setTouchDetected] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchDetected(true);
    touchStartY.current = e.touches[0].clientY;
    setSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;

    const currentY = e.touches[0].clientY;
    const diff = touchStartY.current - currentY;

    // Check if we are trying to scroll a child element
    let el = e.target as HTMLElement | null;
    while (el) {
        // Check if the element is scrollable vertically
        if (el.scrollHeight > el.clientHeight) {
            // Check if we can scroll in the direction of the swipe
            if (diff < 0 && el.scrollTop > 0) {
                // Trying to scroll up an element that isn't at the top
                return;
            }
            if (diff > 0 && el.scrollTop < el.scrollHeight - el.clientHeight) {
                // Trying to scroll down an element that isn't at the bottom
                return;
            }
        }
        // Stop at the boundary of the SwipeableScreen
        if (el === e.currentTarget) break;
        el = el.parentElement;
    }

    // If we get here, we are not scrolling a child element. It's a swipe.
    e.preventDefault();


    // Track both upward and downward swipes
    if (diff > 0 && onSwipeUp) {
      setSwipeProgress(Math.min(diff / 200, 1));
    } else if (diff < 0 && onSwipeDown) {
      setSwipeProgress(Math.max(diff / 200, -1));
    }
  };

  const handleTouchEnd = () => {
    if (swipeProgress > 0.6 && onSwipeUp) {
      onSwipeUp();
    } else if (swipeProgress < -0.6 && onSwipeDown) {
      onSwipeDown();
    }
    touchStartY.current = null;
    setSwiping(false);
    setSwipeProgress(0);
  };

  // Mouse support for desktop
  const mouseStartY = useRef<number | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (touchDetected) return;
    mouseStartY.current = e.clientY;
    setSwiping(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (touchDetected) return;
    if (mouseStartY.current === null || !swiping) return;

    const diff = mouseStartY.current - e.clientY;
    if (diff > 0 && onSwipeUp) {
      setSwipeProgress(Math.min(diff / 200, 1));
    } else if (diff < 0 && onSwipeDown) {
      setSwipeProgress(Math.max(diff / 200, -1));
    }
  };

  const handleMouseUp = () => {
    if (swipeProgress > 0.6 && onSwipeUp) {
      onSwipeUp();
    } else if (swipeProgress < -0.6 && onSwipeDown) {
      onSwipeDown();
    }
    mouseStartY.current = null;
    setSwiping(false);
    setSwipeProgress(0);
  };

  const handleMouseLeave = () => {
    if (swiping) {
      handleMouseUp();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp' && onSwipeUp) {
      e.preventDefault();
      onSwipeUp();
    } else if (e.key === 'ArrowDown' && onSwipeDown) {
      e.preventDefault();
      onSwipeDown();
    } else if ((e.key === 'Enter' || e.key === ' ') && onSwipeUp) {
      e.preventDefault();
      onSwipeUp();
    }
  };

  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div
      className={`min-h-screen bg-white flex flex-col select-none ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="button"
      aria-label="Swipe to navigate"
    >
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
        <div className="w-full max-w-md mx-auto">
          <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-black rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6 pt-12">
        <div
          className="w-full max-w-md mx-auto transition-transform duration-100"
          style={{
            transform: `translateY(${-swipeProgress * 30}px)`,
            opacity: 1 - Math.abs(swipeProgress) * 0.3,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
