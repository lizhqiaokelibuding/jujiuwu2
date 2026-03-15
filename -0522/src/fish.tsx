import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardType, CARD_DICT } from './types';

interface FishingGameProps {
  onSuccess: (fishType: CardType) => void;
  onFail: () => void;
}

type FishDifficulty = 1 | 2 | 3;

interface FishInfo {
  type: CardType;
  difficulty: FishDifficulty;
}

const FISH_TYPES: FishInfo[] = [
  { type: 'filefish', difficulty: 1 },
  { type: 'sweet_shrimp', difficulty: 2 },
  { type: 'scallop', difficulty: 2 },
  { type: 'salmon', difficulty: 3 },
  { type: 'tuna', difficulty: 3 },
];

export function FishingGame({ onSuccess, onFail }: FishingGameProps) {
  const [phase, setPhase] = useState<'waiting' | 'bite' | 'reeling' | 'result'>('waiting');
  const [targetFish, setTargetFish] = useState<FishInfo | null>(null);
  
  // Bite phase state
  const [biteCircleSize, setBiteCircleSize] = useState(50);
  const [outerCircleSize, setOuterCircleSize] = useState(150);
  
  // Reeling phase state
  const [requiredSuccesses, setRequiredSuccesses] = useState(1);
  const [currentSuccesses, setCurrentSuccesses] = useState(0);
  const [cursorPos, setCursorPos] = useState(0);
  const [cursorDirection, setCursorDirection] = useState(1);
  const [targetZoneStart, setTargetZoneStart] = useState(40);
  const [targetZoneWidth, setTargetZoneWidth] = useState(20);
  
  const requestRef = useRef<number>();
  const speedRef = useRef<number>(2);

  // Phase 1: Waiting
  useEffect(() => {
    if (phase === 'waiting') {
      const waitTime = Math.random() * 2000 + 3000; // 3-5 seconds
      const timer = setTimeout(() => {
        const randomFish = FISH_TYPES[Math.floor(Math.random() * FISH_TYPES.length)];
        setTargetFish(randomFish);
        setBiteCircleSize(Math.random() * 30 + 30); // 30-60px
        setOuterCircleSize(150);
        setPhase('bite');
      }, waitTime);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // Phase 2: Bite (shrinking circle)
  useEffect(() => {
    if (phase === 'bite') {
      const shrinkInterval = setInterval(() => {
        setOuterCircleSize(prev => {
          if (prev <= biteCircleSize - 10) {
            // Missed
            setPhase('waiting');
            return 150;
          }
          return prev - 2.5;
        });
      }, 20);
      return () => clearInterval(shrinkInterval);
    }
  }, [phase, biteCircleSize]);

  const handleBiteClick = () => {
    if (phase !== 'bite') return;
    
    const diff = Math.abs(outerCircleSize - biteCircleSize);
    if (diff < 15) {
      // Hooked!
      setRequiredSuccesses(targetFish!.difficulty);
      setCurrentSuccesses(0);
      setupReelingPhase();
      setPhase('reeling');
    } else {
      // Missed
      setPhase('waiting');
    }
  };

  const setupReelingPhase = () => {
    setCursorPos(0);
    setTargetZoneStart(Math.random() * 60 + 10); // 10-70%
    setTargetZoneWidth(Math.max(10, 30 - targetFish!.difficulty * 5)); // Harder = smaller zone
    speedRef.current = 1 + targetFish!.difficulty * 0.5; // Harder = faster
  };

  // Phase 3: Reeling (moving bar)
  useEffect(() => {
    if (phase === 'reeling') {
      const animate = () => {
        setCursorPos(prev => {
          let next = prev + speedRef.current * cursorDirection;
          if (next >= 100) {
            next = 100;
            setCursorDirection(-1);
          } else if (next <= 0) {
            next = 0;
            setCursorDirection(1);
          }
          return next;
        });
        requestRef.current = requestAnimationFrame(animate);
      };
      requestRef.current = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(requestRef.current!);
    }
  }, [phase, cursorDirection]);

  const handleReelClick = () => {
    if (phase !== 'reeling') return;
    
    if (cursorPos >= targetZoneStart && cursorPos <= targetZoneStart + targetZoneWidth) {
      // Success hit
      const newSuccesses = currentSuccesses + 1;
      if (newSuccesses >= requiredSuccesses) {
        setPhase('result');
        setTimeout(() => {
          onSuccess(targetFish!.type);
        }, 1500);
      } else {
        setCurrentSuccesses(newSuccesses);
        setupReelingPhase();
      }
    } else {
      // Fail hit
      onFail();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center backdrop-blur-sm">
      <div className="bg-blue-900/80 border-4 border-blue-400 p-8 rounded-3xl shadow-2xl flex flex-col items-center relative overflow-hidden w-96 h-96">
        
        {/* Water background effect */}
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-400 via-blue-800 to-blue-900"></div>

        <h2 className="text-2xl font-bold text-white mb-4 z-10 drop-shadow-md">
          {phase === 'waiting' && '等待鱼儿上钩...'}
          {phase === 'bite' && '点击收杆！'}
          {phase === 'reeling' && `溜鱼中！ (${currentSuccesses}/${requiredSuccesses})`}
          {phase === 'result' && '钓到了！'}
        </h2>

        <div className="flex-1 w-full flex items-center justify-center relative z-10">
          
          {phase === 'waiting' && (
            <div className="flex gap-2">
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="w-3 h-3 bg-white rounded-full"></motion.div>
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-3 h-3 bg-white rounded-full"></motion.div>
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-3 h-3 bg-white rounded-full"></motion.div>
            </div>
          )}

          {phase === 'bite' && (
            <div 
              className="relative w-full h-full flex items-center justify-center cursor-pointer"
              onClick={handleBiteClick}
            >
              <div 
                className="absolute border-4 border-white rounded-full bg-white/20"
                style={{ width: biteCircleSize, height: biteCircleSize }}
              ></div>
              <div 
                className="absolute border-4 border-yellow-400 rounded-full"
                style={{ width: outerCircleSize, height: outerCircleSize }}
              ></div>
            </div>
          )}

          {phase === 'reeling' && (
            <div 
              className="w-full h-12 bg-gray-800 rounded-full relative overflow-hidden border-2 border-gray-600 cursor-pointer"
              onClick={handleReelClick}
            >
              {/* Target Zone */}
              <div 
                className="absolute top-0 bottom-0 bg-red-500/80"
                style={{ left: `${targetZoneStart}%`, width: `${targetZoneWidth}%` }}
              ></div>
              
              {/* Moving Cursor */}
              <div 
                className="absolute top-0 bottom-0 w-2 bg-white shadow-[0_0_10px_white]"
                style={{ left: `${cursorPos}%`, transform: 'translateX(-50%)' }}
              ></div>
            </div>
          )}

          {phase === 'result' && targetFish && (
            <motion.div 
              initial={{ scale: 0, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="flex flex-col items-center"
            >
              <div className="text-6xl mb-2 drop-shadow-lg">{CARD_DICT[targetFish.type].emoji}</div>
              <div className="text-xl font-bold text-yellow-300">{CARD_DICT[targetFish.type].name}</div>
            </motion.div>
          )}

        </div>

        {phase !== 'result' && (
          <button 
            onClick={onFail}
            className="mt-4 px-6 py-2 bg-red-500/80 text-white rounded-xl font-bold hover:bg-red-500 z-10 transition-colors"
          >
            放弃钓鱼
          </button>
        )}
      </div>
    </div>
  );
}
