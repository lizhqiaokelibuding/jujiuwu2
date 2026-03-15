import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  hasDrawnToday: boolean;
  onDrawCards: () => void;
  onNextDay: () => void;
  mode?: 'farm' | 'izakaya';
}

export function Sidebar({ hasDrawnToday, onDrawCards, onNextDay, mode = 'farm' }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#f4e4bc] border-4 border-r-0 border-[#d4b483] rounded-l-2xl p-3 z-50 shadow-[-4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:bg-[#faeac2] transition-colors"
        style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }}
      >
        <span className="text-2xl font-bold text-yellow-900">
          {isOpen ? '▶' : '◀'}
        </span>
      </button>

      {/* Sidebar Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="absolute right-0 top-0 bottom-0 w-72 bg-[#f4e4bc] border-l-8 border-[#d4b483] z-40 shadow-[-8px_0px_0px_0px_rgba(0,0,0,0.15)] flex flex-col p-6 pointer-events-auto"
            style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }}
          >
            <h2 className="text-3xl font-bold text-yellow-900 mb-8 border-b-4 border-[#d4b483] pb-4 text-center">菜单</h2>
            
            <div className="flex flex-col gap-6">
              {/* Draw Card Button */}
              <button 
                onClick={onDrawCards}
                disabled={hasDrawnToday}
                className={`border-4 px-6 py-4 rounded-2xl text-white text-xl font-bold transition-all flex items-center justify-center shadow-sm ${
                  hasDrawnToday 
                    ? 'bg-gray-400 border-gray-500 shadow-[4px_4px_0px_0px_#6b7280] cursor-not-allowed' 
                    : 'bg-purple-500 border-purple-700 hover:bg-purple-400 active:translate-y-1 shadow-[4px_4px_0px_0px_#7e22ce]'
                }`}
              >
                {hasDrawnToday ? '今日已抽' : '抽卡 🎴'}
              </button>

              {/* Next Day Button */}
              <button 
                onClick={onNextDay}
                className="bg-green-400 border-4 border-green-600 px-6 py-4 rounded-2xl text-white text-2xl font-bold hover:bg-green-300 active:translate-y-1 shadow-[4px_4px_0px_0px_#16a34a] transition-all flex items-center justify-center"
              >
                {mode === 'farm' ? '前往居酒屋 🏮' : '结束营业 🌙'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
