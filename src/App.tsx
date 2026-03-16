import React, { useState } from 'react';
import Izakaya from './Izakaya';
import Farm from './plant';
import { CardData, CARD_DICT, MapCard, CardType } from './types';

const SEED_AND_ANIMAL_TYPES: CardType[] = [
  'seed', 'cabbage_seed', 'seaweed_seed', 'potato_seed', 'radish_seed',
  'sheep', 'chicken'
];

function getRandomStartHand(): CardData[] {
  const hand: CardData[] = [];
  for (let i = 0; i < 5; i++) {
    const type = SEED_AND_ANIMAL_TYPES[Math.floor(Math.random() * SEED_AND_ANIMAL_TYPES.length)];
    hand.push({ id: `c${i}_${Date.now()}_${Math.random()}`, ...CARD_DICT[type], quantity: 1 });
  }
  return hand;
}

export default function App() {
  const [view, setView] = useState<'farm' | 'izakaya'>('farm');
  const [day, setDay] = useState(1);
  const [hasDrawnToday, setHasDrawnToday] = useState(false);
  const [money, setMoney] = useState(100);
  const [alerts, setAlerts] = useState<{ id: string; message: string; type: 'success' | 'error' }[]>([]);
  const [hand, setHand] = useState<CardData[]>(() => getRandomStartHand());
  const [equippedTool, setEquippedTool] = useState<CardData | null>(null);
  const [mapCards, setMapCards] = useState<MapCard[]>([
    { mapId: 'm1', id: 'house', ...CARD_DICT.house, quantity: 1, x: 15, y: 25, age: 0 },
    { mapId: 'm2', id: 'shop', ...CARD_DICT.shop, quantity: 1, x: 85, y: 25, age: 0 },
    { mapId: 'm3', id: 'pond', ...CARD_DICT.pond, quantity: 1, x: 85, y: 50, age: 0 },
  ]);

  const handleNextDay = () => {
    setDay(d => d + 1);
    setHasDrawnToday(false);
    
    let newAlerts: { id: string; message: string; type: 'success' | 'error' }[] = [];
    
    setMapCards(prev => {
      let newMap = [...prev];
      
      newMap = newMap.map(mc => {
        if (mc.type === 'sheep' || mc.type === 'chicken') {
          return { ...mc, age: mc.age + 1, daysSinceFed: (mc.daysSinceFed || 0) + 1 };
        }
        if (mc.type === 'seed' || mc.type === 'cabbage_seed' || mc.type === 'seaweed_seed' || mc.type === 'potato_seed' || mc.type === 'radish_seed') {
          return { ...mc, age: mc.age + 1, daysSinceWatered: (mc.daysSinceWatered || 0) + 1 };
        }
        return mc;
      });

      newMap = newMap.filter(mc => {
        if (mc.type === 'sheep' && mc.daysSinceFed! >= 2) {
          newAlerts.push({ id: Math.random().toString(), message: '一只绵羊饿死了！', type: 'error' });
          return false;
        }
        if (mc.type === 'chicken' && mc.daysSinceFed! >= 2) {
          newAlerts.push({ id: Math.random().toString(), message: '一只小鸡饿死了！', type: 'error' });
          return false;
        }
        if (mc.type === 'seed' && mc.daysSinceWatered! >= 2 && mc.age < 3) {
          newAlerts.push({ id: Math.random().toString(), message: '一颗种子枯死了！', type: 'error' });
          return false;
        }
        if (mc.type === 'cabbage_seed' && mc.daysSinceWatered! >= 2 && mc.age < 3) {
          newAlerts.push({ id: Math.random().toString(), message: '一颗白菜种子枯死了！', type: 'error' });
          return false;
        }
        if (mc.type === 'seaweed_seed' && mc.daysSinceWatered! >= 2 && mc.age < 2) {
          newAlerts.push({ id: Math.random().toString(), message: '一颗紫菜种子枯死了！', type: 'error' });
          return false;
        }
        if (mc.type === 'potato_seed' && mc.daysSinceWatered! >= 2 && mc.age < 3) {
          newAlerts.push({ id: Math.random().toString(), message: '一颗土豆种子枯死了！', type: 'error' });
          return false;
        }
        if (mc.type === 'radish_seed' && mc.daysSinceWatered! >= 2 && mc.age < 2) {
          newAlerts.push({ id: Math.random().toString(), message: '一颗萝卜种子枯死了！', type: 'error' });
          return false;
        }
        return true;
      });

      return newMap;
    });
    
    if (newAlerts.length > 0) {
      setAlerts(prev => [...prev, ...newAlerts]);
    }
    setView('farm');
  };

  return (
    <div className="min-h-screen bg-orange-50 font-cute">
      <div className="w-full h-screen relative">
        {alerts.length > 0 && (
          <div className="fixed inset-0 bg-black/50 z-[99999] flex items-center justify-center pointer-events-auto">
            <div className="bg-white p-6 rounded-3xl border-4 border-orange-400 shadow-2xl flex flex-col items-center gap-4 max-w-sm text-center transform transition-all scale-100">
              <div className={`text-4xl font-bold ${alerts[0].type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                {alerts[0].type === 'success' ? '✨ 提示' : '⚠️ 警告'}
              </div>
              <div className="text-2xl text-gray-700 font-bold my-2">{alerts[0].message}</div>
              <button 
                className="mt-2 px-8 py-3 bg-orange-400 rounded-2xl font-bold text-white text-2xl hover:bg-orange-500 shadow-[4px_4px_0px_0px_#c2410c] active:translate-y-1 active:shadow-none transition-all"
                onClick={() => setAlerts(prev => prev.slice(1))}
              >
                知道了
              </button>
            </div>
          </div>
        )}
        
        {view === 'farm' ? (
          <Farm 
            day={day} setDay={setDay}
            hasDrawnToday={hasDrawnToday} setHasDrawnToday={setHasDrawnToday}
            hand={hand} setHand={setHand}
            equippedTool={equippedTool} setEquippedTool={setEquippedTool}
            money={money} setMoney={setMoney}
            mapCards={mapCards} setMapCards={setMapCards}
            onGoToIzakaya={() => setView('izakaya')}
          />
        ) : (
          <Izakaya 
            day={day} setDay={setDay}
            hand={hand} setHand={setHand}
            money={money} setMoney={setMoney}
            onReturnToFarm={handleNextDay}
          />
        )}
      </div>
    </div>
  );
}
