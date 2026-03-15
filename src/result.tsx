import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardData } from './types';

interface HarvestResultProps {
  isOpen: boolean;
  onClose: () => void;
  items: { card: Omit<CardData, 'id' | 'quantity'>; quantity: number }[];
  title?: string;
}

export function HarvestResult({ isOpen, onClose, items, title = "收获成功！" }: HarvestResultProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            className="relative bg-white border-8 border-yellow-400 rounded-3xl p-8 max-w-lg w-full shadow-2xl flex flex-col items-center"
          >
            <h2 className="text-4xl font-bold text-orange-600 mb-8 drop-shadow-sm">{title}</h2>
            
            <div className="flex gap-6 justify-center flex-wrap mb-8">
              {items.map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: i * 0.2, type: "spring" }}
                  className="relative bg-orange-50 border-4 border-orange-300 rounded-2xl p-4 flex flex-col items-center w-32 shadow-lg"
                >
                  <div className="text-6xl drop-shadow-md mb-2">{item.card.emoji}</div>
                  <div className="text-lg font-bold text-orange-800 text-center">{item.card.name}</div>
                  <div className="absolute -top-4 -right-4 bg-red-500 text-white text-xl font-bold rounded-full w-10 h-10 flex items-center justify-center border-4 border-white shadow-md">
                    x{item.quantity}
                  </div>
                </motion.div>
              ))}
            </div>

            <button 
              onClick={onClose}
              className="bg-green-500 text-white text-2xl font-bold px-12 py-3 rounded-2xl border-4 border-green-600 hover:bg-green-400 active:translate-y-1 shadow-[0_6px_0_0_#16a34a] transition-all"
            >
              收下
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
