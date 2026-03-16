import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardData, CardType, CARD_DICT } from './types';

interface ShopProps {
  money: number;
  setMoney: React.Dispatch<React.SetStateAction<number>>;
  hand: CardData[];
  setHand: React.Dispatch<React.SetStateAction<CardData[]>>;
  onClose: () => void;
  showAlert: (message: string, type?: 'success' | 'error') => void;
}

interface ShopItem {
  type: CardType;
  price: number;
}

const SHOP_ITEMS: ShopItem[] = [
  { type: 'watering_can', price: 15 },
  { type: 'fishing_rod', price: 20 },
  { type: 'weed', price: 5 },
  { type: 'seed', price: 10 },
  { type: 'wheat', price: 15 },
  { type: 'cabbage_seed', price: 8 },
  { type: 'cabbage', price: 12 },
  { type: 'seaweed_seed', price: 8 },
  { type: 'seaweed', price: 12 },
  { type: 'sheep', price: 15 },
  { type: 'mutton', price: 20 },
  { type: 'filefish', price: 12 },
  { type: 'sweet_shrimp', price: 18 },
  { type: 'scallop', price: 22 },
  { type: 'salmon', price: 26 },
  { type: 'tuna', price: 30 },
];

export function Shop({ money, setMoney, hand, setHand, onClose, showAlert }: ShopProps) {
  const handleBuy = (item: ShopItem) => {
    if (money < item.price) {
      showAlert('金钱不足！', 'error');
      return;
    }

    setMoney(prev => prev - item.price);
    
    setHand(prev => {
      const existing = prev.find(c => c.type === item.type && !c.customName);
      if (existing) {
        return prev.map(c => c.id === existing.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { id: Math.random().toString(), ...CARD_DICT[item.type], quantity: 1 }];
    });
    
    showAlert(`购买了 ${CARD_DICT[item.type].name}！`, 'success');
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center pointer-events-auto">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white p-8 rounded-3xl border-8 border-orange-400 shadow-2xl flex flex-col items-center gap-6 max-w-lg w-full max-h-[90vh]"
      >
        <div className="flex justify-between items-center w-full border-b-4 border-orange-200 pb-4 shrink-0">
          <h2 className="text-4xl font-bold text-orange-800">🏪 商店</h2>
          <div className="text-2xl font-bold text-yellow-600 bg-yellow-100 px-4 py-2 rounded-xl">
            💰 {money}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full overflow-y-auto pr-2">
          {SHOP_ITEMS.map((item, idx) => (
            <div key={idx} className="bg-orange-50 border-4 border-orange-200 rounded-2xl p-4 flex flex-col items-center gap-3 hover:bg-orange-100 transition-colors">
              <div className="w-16 h-16 flex items-center justify-center mx-auto">
                {CARD_DICT[item.type].image ? (
                  <img src={CARD_DICT[item.type].image} alt={CARD_DICT[item.type].name} className="max-w-full max-h-full object-contain" />
                ) : (
                  <span className="text-5xl">{CARD_DICT[item.type].emoji}</span>
                )}
              </div>
              <div className="text-xl font-bold text-orange-900">{CARD_DICT[item.type].name}</div>
              <button 
                className="w-full py-2 bg-yellow-400 rounded-xl font-bold text-yellow-900 hover:bg-yellow-500 shadow-[2px_2px_0px_0px_#ca8a04] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-1"
                onClick={() => handleBuy(item)}
              >
                <span>💰</span> {item.price}
              </button>
            </div>
          ))}
        </div>

        <button 
          className="mt-2 shrink-0 px-12 py-3 bg-gray-200 rounded-2xl font-bold text-gray-700 text-2xl hover:bg-gray-300 shadow-[4px_4px_0px_0px_#9ca3af] active:translate-y-1 active:shadow-none transition-all"
          onClick={onClose}
        >
          离开
        </button>
      </motion.div>
    </div>
  );
}
