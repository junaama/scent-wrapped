'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button, ScreenWrapper } from '@/components';
import { type WrappedResult } from '@/lib/compute-wrapped';
import Image from 'next/image';

export default function GenresPage() {
  const router = useRouter();
  const [data, setData] = useState<WrappedResult | null>(null);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Load wrapped data from localStorage (set by loading page)
    const savedData = localStorage.getItem('wrappedData');
    if (savedData) {
      try {
        setData(JSON.parse(savedData));
      } catch (e) {
        console.error('Failed to parse wrapped data:', e);
        router.push('/loading');
      }
    } else {
      // No data, redirect back to loading
      router.push('/loading');
    }
  }, [router]);

  const handleVote = (vote: boolean) => {
    localStorage.setItem('dressLikeMusic', String(vote));
    setExiting(true);

    // Navigate after animation completes
    setTimeout(() => {
      router.push('/wrapped/artist');
    }, 400);
  };

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }
 
  return (
    <ScreenWrapper currentStep={1} totalSteps={5}>
      <div
        className={`flex flex-col  gap-10 transition-all duration-400 ease-out ${exiting ? 'opacity-0 -translate-y-20' : 'opacity-100 translate-y-0'
          }`}
        style={{ transitionDuration: '400ms' }}
      >
        <div className="flex flex-col gap-6">
          <h1 className="text-2xl font-serif text-left">
            here's what we know about what you listened to
          </h1>
          <div className="grid grid-cols-2 gap-4">

            <div className=" border rounded-lg text-center ">
              <p className="text-sm font-bold py-2">number of genres</p>
              <p className="text-4xl py-4">{data.genreCount}</p>
              <p className=" pt-6">
                That&apos;s{' '}
                <span className="">{data.styleCount}</span>{' '}
               
                styles
              </p>
            </div>

            <div className="text-center border rounded-lg pb-2">
              <p className="font-bold text-sm py-2">your top genres</p>
              <ol>
                {data.genres.slice(0, 5).map((genre) => (
                  <li key={genre}>
                    {genre}
                  </li>
                ))}
              </ol>
            </div>
          </div>



        </div>

        <div>
          <p className="text-lg py-2">your top artist</p>
          <div className="flex items-center gap-2">
            <Image src={data.topArtist.imageUrl} width={40} height={40} alt={data.topArtist.name} className="rounded-full" />
            <p>{data.topArtist.name}</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 w-full">
          <p className="text-slate-500">
            Do you think you&apos;ll dress like your music taste?
          </p>
          <div className="flex gap-3 justify-center font-xs underline-offset-2 underline" >
            <Button variant="ghost" onClick={() => handleVote(true)}>
              get your fashion taste
            </Button>

          </div>
        </div>
      </div>
    </ScreenWrapper>
  );
}
