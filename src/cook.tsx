import React, { useState, useEffect } from 'react';
import { CardData, CardType, CARD_DICT } from './types';
import { PlayingCard } from './card';

interface CookAreaProps {
  hand: CardData[];
  setHand: React.Dispatch<React.SetStateAction<CardData[]>>;
  showAlert: (message: string, type?: 'success' | 'error') => void;
}

interface Recipe {
  result: CardType;
  ingredients: CardType[];
}

const RECIPES: Recipe[] = [
  { result: 'food_sushi', ingredients: ['salmon', 'seaweed'] },
  { result: 'food_salad', ingredients: ['cabbage'] },
  { result: 'food_sashimi', ingredients: ['salmon', 'tuna', 'sweet_shrimp'] },
];

export function CookArea({ hand, setHand, showAlert }: CookAreaProps) {
  const [ovenCards, setOvenCards] = useState<CardData[]>([]);
  const [ovenTimer, setOvenTimer] = useState<number | null>(null);

  const [grillCards, setGrillCards] = useState<CardData[]>([]);
  const [grillTimer, setGrillTimer] = useState<number | null>(null);

  const [craftingCards, setCraftingCards] = useState<CardData[]>([]);
  const [craftingTimer, setCraftingTimer] = useState<number | null>(null);

  // Oven logic
  const handleOvenDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (ovenCards.length > 0) return;
    const cardId = e.dataTransfer.getData('cardId');
    const card = hand.find(c => c.id === cardId);
    if (!card) return;
    
    if (card.type !== 'wheat') {
      showAlert('烤箱只能烤小麦！', 'error');
      return;
    }
    
    setOvenCards([card]);
    setHand(prev => {
      const existing = prev.find(c => c.id === cardId);
      if (!existing) return prev;
      if (existing.quantity <= 1) return prev.filter(c => c.id !== cardId);
      return prev.map(c => c.id === cardId ? { ...c, quantity: c.quantity - 1 } : c);
    });
    
    setOvenTimer(20);
  };

  useEffect(() => {
    if (ovenTimer === null) return;
    if (ovenTimer <= 0) {
      setOvenCards([]);
      setHand(prev => [...prev, { id: Math.random().toString(), ...CARD_DICT.food_bread, quantity: 1 }]);
      showAlert('面包烤好了！', 'success');
      setOvenTimer(null);
      return;
    }
    const interval = setInterval(() => {
      setOvenTimer(prev => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(interval);
  }, [ovenTimer, setHand, showAlert]);

  // Grill logic
  const handleGrillDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (grillCards.length > 0) return;
    const cardId = e.dataTransfer.getData('cardId');
    const card = hand.find(c => c.id === cardId);
    if (!card) return;
    
    if (card.type !== 'mutton' && card.type !== 'filefish') {
      showAlert('烤架只能烤羊肉或开片鱼！', 'error');
      return;
    }
    
    setGrillCards([card]);
    setHand(prev => {
      const existing = prev.find(c => c.id === cardId);
      if (!existing) return prev;
      if (existing.quantity <= 1) return prev.filter(c => c.id !== cardId);
      return prev.map(c => c.id === cardId ? { ...c, quantity: c.quantity - 1 } : c);
    });
    
    setGrillTimer(10);
  };

  useEffect(() => {
    if (grillTimer === null) return;
    if (grillTimer <= 0) {
      const resultType = grillCards[0].type === 'mutton' ? 'food_kebab' : 'food_grilled_fish';
      setGrillCards([]);
      setHand(prev => [...prev, { id: Math.random().toString(), ...CARD_DICT[resultType], quantity: 1 }]);
      showAlert(`${CARD_DICT[resultType].name}烤好了！`, 'success');
      setGrillTimer(null);
      return;
    }
    const interval = setInterval(() => {
      setGrillTimer(prev => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(interval);
  }, [grillTimer, setHand, showAlert]);

  // Crafting logic
  const handleCraftingDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (craftingTimer !== null) return; // Already crafting
    const cardId = e.dataTransfer.getData('cardId');
    const card = hand.find(c => c.id === cardId);
    if (!card) return;

    const newCraftingCards = [...craftingCards, card];
    
    // Check if current combination matches any recipe or partial recipe
    const currentTypes = newCraftingCards.map(c => c.type);
    
    const possibleRecipe = RECIPES.find(r => {
      const remaining = [...r.ingredients];
      let possible = true;
      for (const type of currentTypes) {
        const idx = remaining.indexOf(type);
        if (idx >= 0) {
          remaining.splice(idx, 1);
        } else {
          possible = false;
          break;
        }
      }
      return possible;
    });

    if (!possibleRecipe) {
      showAlert('这些食材不能组合成菜品！', 'error');
      return;
    }

    setCraftingCards(newCraftingCards);
    setHand(prev => {
      const existing = prev.find(c => c.id === cardId);
      if (!existing) return prev;
      if (existing.quantity <= 1) return prev.filter(c => c.id !== cardId);
      return prev.map(c => c.id === cardId ? { ...c, quantity: c.quantity - 1 } : c);
    });

    // Check if recipe is complete
    const exactRecipe = RECIPES.find(r => {
      if (r.ingredients.length !== currentTypes.length) return false;
      const remaining = [...r.ingredients];
      for (const type of currentTypes) {
        const idx = remaining.indexOf(type);
        if (idx >= 0) {
          remaining.splice(idx, 1);
        } else {
          return false;
        }
      }
      return true;
    });

    if (exactRecipe) {
      setCraftingTimer(5); // 5 seconds to craft
    }
  };

  useEffect(() => {
    if (craftingTimer === null) return;
    if (craftingTimer <= 0) {
      const currentTypes = craftingCards.map(c => c.type);
      const exactRecipe = RECIPES.find(r => {
        if (r.ingredients.length !== currentTypes.length) return false;
        const remaining = [...r.ingredients];
        for (const type of currentTypes) {
          const idx = remaining.indexOf(type);
          if (idx >= 0) remaining.splice(idx, 1);
          else return false;
        }
        return true;
      });

      if (exactRecipe) {
        setHand(prev => [...prev, { id: Math.random().toString(), ...CARD_DICT[exactRecipe.result], quantity: 1 }]);
        showAlert(`${CARD_DICT[exactRecipe.result].name} 制作完成！`, 'success');
      }
      setCraftingCards([]);
      setCraftingTimer(null);
      return;
    }
    const interval = setInterval(() => {
      setCraftingTimer(prev => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(interval);
  }, [craftingTimer, craftingCards, setHand, showAlert]);

  return (
    <>
      {/* Kitchen Area - Oven (Left) */}
      <div className="absolute bottom-40 left-12 z-30">
        <div className="bg-white/90 backdrop-blur border-[3px] border-orange-400 rounded-xl p-3 shadow-[2px_2px_0px_0px_#fb923c] flex flex-col items-center gap-1">
          <div className="text-orange-800 font-bold text-lg">烤箱 (小麦)</div>
          <div 
            className="w-20 h-20 bg-orange-50 border-[3px] border-dashed border-orange-300 rounded-lg p-1 flex items-center justify-center relative"
            onDragOver={e => e.preventDefault()}
            onDrop={handleOvenDrop}
          >
            {ovenCards.length === 0 ? (
              <span className="text-orange-300 text-center text-sm">放入小麦...</span>
            ) : (
              <div className="transform scale-50 origin-[50%_20%]">
                <PlayingCard card={ovenCards[0]} />
              </div>
            )}
            {ovenTimer !== null && (
              <div className="absolute bg-black/50 text-white font-bold text-xl px-2 py-1 rounded-lg z-10">{ovenTimer}s</div>
            )}
          </div>
        </div>
      </div>

      {/* Kitchen Area - Crafting Table (Middle Left) */}
      <div className="absolute bottom-40 left-52 z-30">
        <div className="bg-white/90 backdrop-blur border-[3px] border-blue-400 rounded-xl p-3 shadow-[2px_2px_0px_0px_#60a5fa] flex flex-col items-center gap-1">
          <div className="text-blue-800 font-bold text-lg">合成台 (菜品)</div>
          <div 
            className="w-36 h-20 bg-blue-50 border-[3px] border-dashed border-blue-300 rounded-lg p-1 flex items-center justify-center gap-1 relative"
            onDragOver={e => e.preventDefault()}
            onDrop={handleCraftingDrop}
          >
            {craftingCards.length === 0 ? (
              <span className="text-blue-300 text-center text-sm">放入食材...</span>
            ) : (
              craftingCards.map((card, i) => (
                <div key={i} className="transform scale-50 origin-[50%_20%] -mx-6">
                  <PlayingCard card={card} />
                </div>
              ))
            )}
            {craftingTimer !== null && (
              <div className="absolute bg-black/50 text-white font-bold text-xl px-2 py-1 rounded-lg z-10">{craftingTimer}s</div>
            )}
          </div>
        </div>
      </div>

      {/* Kitchen Area - Grill (Right) */}
      <div className="absolute bottom-40 right-20 z-30">
        <div className="bg-white/90 backdrop-blur border-[3px] border-red-400 rounded-xl p-3 shadow-[2px_2px_0px_0px_#f87171] flex flex-col items-center gap-1">
          <div className="text-red-800 font-bold text-lg">烤架 (羊肉/开片鱼)</div>
          <div 
            className="w-20 h-20 bg-red-50 border-[3px] border-dashed border-red-300 rounded-lg p-1 flex items-center justify-center relative"
            onDragOver={e => e.preventDefault()}
            onDrop={handleGrillDrop}
          >
            {grillCards.length === 0 ? (
              <span className="text-red-300 text-center text-sm">放入食材...</span>
            ) : (
              <div className="transform scale-50 origin-[50%_20%]">
                <PlayingCard card={grillCards[0]} />
              </div>
            )}
            {grillTimer !== null && (
              <div className="absolute bg-black/50 text-white font-bold text-xl px-2 py-1 rounded-lg z-10">{grillTimer}s</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
