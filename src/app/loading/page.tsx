'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button, ScreenWrapper } from '@/components';

const genderOptions = [
  { value: 'feminine', label: 'Feminine' },
  { value: 'masculine', label: 'Masculine' },
  { value: 'neutral', label: 'Gender-Neutral' },
];

export default function LoadingPage() {
  const router = useRouter();
  const [selectedGender, setSelectedGender] = useState<string | null>(null);

  const handleSelect = (value: string) => {
    setSelectedGender(value);
    // Store gender preference for the quiz to use
    localStorage.setItem('genderPreference', value);
    // Navigate to quiz
    router.push('/quiz');
  };

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
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
    </ScreenWrapper>
  );
}
