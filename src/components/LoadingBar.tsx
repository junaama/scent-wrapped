'use client';

import { useState, useEffect , useRef} from 'react';

const loadingMessages = [
  'getting your top songs',
  'grooving to your best playlists',
  'consulting anna wintour',
  'searching the world of fashion',
  'curating your runway looks',
];

interface LoadingBarProps {
  onComplete?: () => void;
  duration?: number;
}

export function LoadingBar({ onComplete, duration = 5000 }: LoadingBarProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
    const onCompleteRef = useRef(onComplete);
  
    useEffect(() => {
      onCompleteRef.current = onComplete;
    }, [onComplete]);
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, duration / loadingMessages.length);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          clearInterval(messageInterval);
          onComplete?.();
          return 100;
          onCompleteRef.current?.()
        }
        return prev + 1;
      });
    }, duration / 100);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, [duration,]);

  return (
    <div className="w-full flex flex-col items-center gap-6">
      {/* Progress bar */}
      <div className="w-full h-px bg-slate-200 overflow-hidden">
        <div
          className="h-full bg-black transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Rotating message */}
      <p className="font-(--font-playfair) italic text-slate-600 text-center min-h-6">
        {loadingMessages[messageIndex]}...
      </p>
    </div>
  );
}
