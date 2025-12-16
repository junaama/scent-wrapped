'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button, LoadingBar, ScreenWrapper } from '@/components';

const genderOptions = [
  { value: 'feminine', label: 'Feminine' },
  { value: 'masculine', label: 'Masculine' },
  { value: 'neutral', label: 'Gender-Neutral' },
];

export default function LoadingPage() {
  const router = useRouter();
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = async (value: string) => {
    if (isLoading) return; // Prevent multiple clicks

    setSelectedGender(value);
    setIsLoading(true);

    try {
      localStorage.setItem('genderPreference', value);

      // Fetch wrapped data with the selected gender
      const response = await fetch(`/api/wrapped?gender=${value}`);

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/');
          return;
        }
        throw new Error('Failed to fetch wrapped data');
      }

      const data = await response.json();
      localStorage.setItem('wrappedData', JSON.stringify(data));

      // Only route after data is ready
      router.push('/quiz');
    } catch (err) {
      console.error('Error fetching wrapped data:', err);
      setError('Failed to load your music data. Please try again.');
      setIsLoading(false);
    }
  };


  if (error) {
    return (
      <ScreenWrapper className="flex flex-col items-center justify-center gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-red-500">Oops!</h1>
          <p className="text-slate-500 mt-2">{error}</p>
        </div>
        <Button variant="primary" onClick={() => router.push('/')}>
          Try Again
        </Button>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper className="flex flex-col items-center justify-center gap-10">
      <div className="text-center">
        <p className="text-2xl mb-2 font-serif">one quick question </p>
      </div>


      <div className="flex flex-col items-center gap-6 w-full">
        <div className="flex flex-col gap-2 text-center">
          <h2 className=" font-serif">Do you dress more...</h2>
        </div>

        <div className="flex flex-col gap-3 w-full">
          {genderOptions.map((option) => (
            <Button
              key={option.value}
              variant={selectedGender === option.value ? 'primary' : 'outline'}
              onClick={() => handleSelect(option.value)}
              className="w-full py-4"
              disabled={isLoading}
            >
              {option.label}
            </Button>
          ))}
        </div>

        {isLoading && (
          <div className="flex flex-col items-center gap-3 pt-4 w-full">
            <LoadingBar duration={3000} />
          </div>
        )}
      </div>
    </ScreenWrapper>
  );
}
