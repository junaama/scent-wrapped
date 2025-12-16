'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ScreenWrapper } from '@/components';

interface OutfitData {
  id: string;
  brand: string;
  season: string;
  imageUrl: string;
  description: string;
  tags: string[];
}

interface QuizState {
  choices: Array<{
    round: number;
    chosen: { outfit: OutfitData; tagVector: number[] };
    rejected: { outfit: OutfitData; tagVector: number[] };
  }>;
  candidatePool: Array<{ outfit: OutfitData; tagVector: number[] }>;
  runningTasteVector: number[] | null;
}

export default function QuizPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(5);
  const [pair, setPair] = useState<[OutfitData, OutfitData] | null>(null);
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<0 | 1 | null>(null);

  // Start the quiz on mount
  useEffect(() => {
    startQuiz();
  }, []);

  const startQuiz = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch('/api/quiz/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poolSize: 50, totalRounds: 5 }),
      });

      if (!res.ok) throw new Error('Failed to start quiz');

      const data = await res.json();
      setPair([data.pair[0], data.pair[1]]);
      setCurrentRound(data.currentRound);
      setTotalRounds(data.totalRounds);
      setQuizState(data._state);
    } catch (err) {
      setError('Failed to load quiz. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChoice = async (chosenIndex: 0 | 1) => {
    if (!pair || !quizState || isTransitioning) return;

    setSelectedIndex(chosenIndex);
    setIsTransitioning(true);

    // Brief delay for visual feedback
    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      const res = await fetch('/api/quiz/choose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chosenIndex,
          currentRound,
          totalRounds,
          pair,
          _state: quizState,
        }),
      });

      if (!res.ok) throw new Error('Failed to submit choice');

      const data = await res.json();

      if (data.isComplete) {
        // Quiz complete - store choices and navigate to results
        localStorage.setItem('quizChoices', JSON.stringify(data._state.choices));
        router.push('/quiz/results');
      } else {
        // Next round
        setPair([data.pair[0], data.pair[1]]);
        setCurrentRound(data.currentRound);
        setQuizState(data._state);
        setSelectedIndex(null);
      }
    } catch (err) {
      setError('Failed to submit choice. Please try again.');
      console.error(err);
    } finally {
      setIsTransitioning(false);
    }
  };

  if (isLoading) {
    return (
      <ScreenWrapper className="flex flex-col items-center justify-center text-center">
        <p className="text-sm text-slate-500">Loading outfits...</p>
      </ScreenWrapper>
    );
  }

  if (error) {
    return (
      <ScreenWrapper className="flex flex-col items-center justify-center text-center gap-4">
        <p className="text-sm text-red-500">{error}</p>
        <button
          onClick={startQuiz}
          className="text-sm underline hover:no-underline"
        >
          Try again
        </button>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper
      currentStep={currentRound}
      totalSteps={totalRounds}
      className="flex flex-col items-center justify-center"
    >
      {/* Top instruction text */}
      <p className="text-sm text-center mb-8 text-slate-600">
        now we&apos;re going to
        <br />
        narrow down on your fashion style
      </p>

      {/* Main heading */}
      <h1 className="font-serif text-2xl md:text-3xl text-center mb-8">
        choose the runway fit
        <br />
        you like more
      </h1>

      {/* This or That labels */}
      <div className="flex items-center justify-center gap-8 mb-4 w-full">
        <span className="text-sm flex-1 text-center">this</span>
        <span className="text-sm text-slate-400">or</span>
        <span className="text-sm flex-1 text-center">that</span>
      </div>

      {/* Outfit images */}
      {pair && (
        <div className="flex gap-3 w-full">
          {/* Left outfit */}
          <button
            onClick={() => handleChoice(0)}
            disabled={isTransitioning}
            className={`flex-1 aspect-[3/4] relative rounded-2xl overflow-hidden transition-all duration-200 ${
              selectedIndex === 0
                ? 'ring-4 ring-black scale-[1.02]'
                : selectedIndex === 1
                ? 'opacity-50 scale-95'
                : 'hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            <Image
              src={pair[0].imageUrl}
              alt={`${pair[0].brand} - ${pair[0].season}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 45vw, 200px"
              priority
            />
          </button>

          {/* Right outfit */}
          <button
            onClick={() => handleChoice(1)}
            disabled={isTransitioning}
            className={`flex-1 aspect-[3/4] relative rounded-2xl overflow-hidden transition-all duration-200 ${
              selectedIndex === 1
                ? 'ring-4 ring-black scale-[1.02]'
                : selectedIndex === 0
                ? 'opacity-50 scale-95'
                : 'hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            <Image
              src={pair[1].imageUrl}
              alt={`${pair[1].brand} - ${pair[1].season}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 45vw, 200px"
              priority
            />
          </button>
        </div>
      )}

      {/* Round indicator */}
      <p className="text-xs text-slate-400 mt-6">
        {currentRound} of {totalRounds}
      </p>
    </ScreenWrapper>
  );
}
