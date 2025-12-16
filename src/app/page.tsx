'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Button, ScreenWrapper } from '@/components';
import {useRouter} from 'next/navigation'
// Dynamically import Lottie to avoid SSR issues
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

export default function Home() {
  const router = useRouter()
  const [showLogin, setShowLogin] = useState(false);
  const [showExperience, setShowExperience] = useState(false);

  const [animationData, setAnimationData] = useState<object | null>(null);
  const [experienceData, setExperienceData] = useState<object | null>(null);

  // Load animation data on client side
  if (!animationData && typeof window !== 'undefined') {
    fetch('/Open.json')
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch(console.error);
  }

  const handleAnimationComplete = () => {
    setShowLogin(true);
  };
  // Load animation data on client side
  if (!experienceData && typeof window !== 'undefined') {
    fetch('/Text.json')
      .then((res) => res.json())
      .then((data) => setExperienceData(data))
      .catch(console.error);
  }

  const handleExperienceComplete = () => {
    router.push('/loading')
  };

  // Show entry animation first
  if (!showLogin) {
    return (
      <ScreenWrapper className="flex flex-col items-center justify-center" outerClassName="bg-black">
        <div
          className="w-screen max-w-none cursor-pointer"
          onClick={handleAnimationComplete}
        >
          {animationData ? (
            <Lottie
              animationData={animationData}
              loop={false}
              onComplete={handleAnimationComplete}
              style={{ width: '100%', height: 'auto' }}
            />
          ) : (
            <div className="flex items-center justify-center h-64">
             
            </div>
          )}
        </div>
      </ScreenWrapper>
    );
  }
  if (showExperience){
    return (
      <ScreenWrapper className="flex flex-col items-center justify-center" outerClassName="bg-white">
        <div
          className=" max-w-none w-screen cursor-pointer"
          onClick={handleExperienceComplete}
        >
          {experienceData ? (
            <Lottie
              animationData={experienceData}
              loop={false}
              onComplete={handleExperienceComplete}
              style={{ width: '100%', height: 'auto' }}
            />
          ) : (
            <div className="flex items-center justify-center h-64">
             
            </div>
          )}
        </div>
      </ScreenWrapper>
    );
  }
  // Show login screen after animation
  return (
    <ScreenWrapper className="flex flex-col items-center justify-center text-center gap-8">
      <div
        className="flex flex-col gap-4 animate-fade-in"
        style={{ animation: 'fadeIn 0.5s ease-out' }}
      >
        <h1 className="text-4xl font-serif tracking-tight">
          let me scent you
        </h1>
        <p className="text-xs max-w-xs">
        discover your new signature scent based on your style 
        </p>
      </div>

      <div className="flex flex-col gap-3">
       

        {/* <a href="/loading"> */}
          <Button variant="outline" className="text-sm border-black" onClick={()=> setShowExperience(true)}>
            enter the experience
          </Button>
        {/* </a> */}
      </div>
    </ScreenWrapper>
  );
}

