import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardType, CardData, MapCard, CARD_DICT } from './types';
import { PlayingCard } from './card';
import { Sidebar } from './ui';
import { CookArea } from './cook';

interface IzakayaProps {
  day: number;
  setDay: React.Dispatch<React.SetStateAction<number>>;
  hand: CardData[];
  setHand: React.Dispatch<React.SetStateAction<CardData[]>>;
  money: number;
  setMoney: React.Dispatch<React.SetStateAction<number>>;
  onReturnToFarm: () => void;
}

interface Recipe {
  result: CardType;
  ingredients: CardType[];
}

const RECIPES: Recipe[] = [
  { result: 'food_sushi', ingredients: ['fish', 'seaweed'] },
  { result: 'food_salad', ingredients: ['cabbage'] },
  { result: 'food_kebab', ingredients: ['mutton'] },
  { result: 'food_bread', ingredients: ['wheat'] },
  { result: 'food_grilled_fish', ingredients: ['filefish'] },
  { result: 'food_sashimi', ingredients: ['salmon', 'tuna', 'sweet_shrimp'] },
];

interface IzakayaCustomer extends MapCard {
  order: CardType;
  state: 'waiting' | 'eating' | 'leaving' | 'no_seat';
  tableId?: string;
  seatIndex?: number;
}

interface AlertInfo {
  id: string;
  message: string;
  type: 'success' | 'error';
}

export default function Izakaya({ day, setDay, hand, setHand, money, setMoney, onReturnToFarm }: IzakayaProps) {
  const [tables, setTables] = useState<MapCard[]>([
    { mapId: 't1', id: 't1', ...CARD_DICT.table, quantity: 1, x: 30, y: 55 },
    { mapId: 't2', id: 't2', ...CARD_DICT.table, quantity: 1, x: 70, y: 55 },
  ]);
  const [customers, setCustomers] = useState<IzakayaCustomer[]>([]);
  const [alerts, setAlerts] = useState<AlertInfo[]>([]);
  const [showRecipes, setShowRecipes] = useState(false);

  const showAlert = (message: string, type: 'success' | 'error' = 'success') => {
    setAlerts(prev => [...prev, { id: Math.random().toString(), message, type }]);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCustomers(prev => {
        if (prev.length >= 6) return prev; // Max customers
        
        const takenSeats = new Set(prev.filter(c => c.tableId).map(c => `${c.tableId}-${c.seatIndex}`));
        let foundTableId: string | undefined;
        let foundSeatIndex: number | undefined;
        
        for (const table of tables) {
          if (!takenSeats.has(`${table.mapId}-0`)) {
            foundTableId = table.mapId;
            foundSeatIndex = 0;
            break;
          }
          if (!takenSeats.has(`${table.mapId}-1`)) {
            foundTableId = table.mapId;
            foundSeatIndex = 1;
            break;
          }
        }
        
        const possibleOrders: CardType[] = ['food_sushi', 'food_salad', 'food_kebab', 'food_bread', 'food_grilled_fish', 'food_sashimi'];
        const order = possibleOrders[Math.floor(Math.random() * possibleOrders.length)];
        
        const newCustomer: IzakayaCustomer = {
          mapId: Math.random().toString(),
          id: Math.random().toString(),
          ...CARD_DICT.customer,
          quantity: 1,
          x: 50, y: 80, // Spawn at bottom center
          order,
          state: foundTableId ? 'waiting' : 'no_seat',
          tableId: foundTableId,
          seatIndex: foundSeatIndex,
        };
        
        if (foundTableId) {
          const table = tables.find(t => t.mapId === foundTableId)!;
          newCustomer.x = table.x + (foundSeatIndex === 0 ? -15 : 15);
          newCustomer.y = table.y;
        } else {
          // Leave after 3 seconds if no seat
          setTimeout(() => {
            setCustomers(curr => curr.filter(c => c.mapId !== newCustomer.mapId));
          }, 3000);
        }
        
        return [...prev, newCustomer];
      });
    }, 6000); // Spawn every 6 seconds
    return () => clearInterval(interval);
  }, [tables]);

  const handleDragStart = (e: React.DragEvent, card: CardData) => {
    e.dataTransfer.setData('cardId', card.id);
    e.dataTransfer.setData('cardType', card.type);
  };

  const handleCustomerDrop = (e: React.DragEvent, customer: IzakayaCustomer) => {
    e.preventDefault();
    e.stopPropagation();
    const cardId = e.dataTransfer.getData('cardId');
    const card = hand.find(c => c.id === cardId);
    if (!card) return;
    
    if (card.type === customer.order) {
      setHand(prev => {
        const existing = prev.find(c => c.id === cardId);
        if (!existing) return prev;
        if (existing.quantity <= 1) return prev.filter(c => c.id !== cardId);
        return prev.map(c => c.id === cardId ? { ...c, quantity: c.quantity - 1 } : c);
      });
      
      setCustomers(prev => prev.filter(c => c.mapId !== customer.mapId));
      const price = CARD_DICT[customer.order].price || 0;
      setMoney(prev => prev + price);
      showAlert(`订单完成！获得 ${price} 金钱。`, 'success');
    } else {
      showAlert('这不是客人点的食物哦！', 'error');
    }
  };

  const handleNextDay = () => {
    onReturnToFarm();
  };

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-[#f4e4bc] p-4" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }}>
      <div className="relative w-full h-full rounded-2xl overflow-hidden border-8 border-[#d4b483] shadow-inner bg-orange-100">
        
        {/* Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-50"
          style={{ 
            backgroundImage: 'url("https://image.pollinations.ai/prompt/cute%20pixel%20art%20japanese%20izakaya%20interior,%20warm%20lighting,%20wooden%20floor,%20top%20down%20view?width=1920&height=1080&nologo=true")',
            imageRendering: 'pixelated'
          }}
        />

        {/* Map Area */}
        <div className="absolute top-20 bottom-64 left-0 right-0 z-10">
          {tables.map(table => (
            <div
              key={table.mapId}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${table.x}%`, top: `${table.y}%` }}
            >
              <PlayingCard card={table} />
            </div>
          ))}

          <AnimatePresence>
            {customers.map(customer => (
              <motion.div
                key={customer.mapId}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${customer.x}%`, top: `${customer.y}%` }}
                onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={e => handleCustomerDrop(e, customer)}
              >
                <PlayingCard card={customer}>
                  {/* Speech Bubble */}
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white border-2 border-orange-400 px-3 py-1 rounded-2xl text-sm font-bold whitespace-nowrap shadow-md z-20 flex items-center gap-1">
                    {customer.state === 'no_seat' ? (
                      '又没座了...'
                    ) : (
                      <>
                        点单: {CARD_DICT[customer.order].emoji}
                      </>
                    )}
                    {/* Bubble tail */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-orange-400"></div>
                  </div>
                </PlayingCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Header */}
        <header className="absolute top-4 left-4 right-4 flex justify-between items-start z-20 pointer-events-none">
          <div className="flex flex-col gap-2">
            <div className="bg-white/90 backdrop-blur border-4 border-orange-400 px-6 py-2 rounded-2xl shadow-[4px_4px_0px_0px_#fb923c] pointer-events-auto">
              <span className="text-3xl text-orange-700 font-bold">居酒屋 - 第 {day} 天晚上</span>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-white/90 backdrop-blur border-4 border-yellow-400 px-6 py-2 rounded-2xl shadow-[4px_4px_0px_0px_#eab308] pointer-events-auto flex items-center">
              <span className="text-2xl text-yellow-700 font-bold">💰 金钱: {money}</span>
            </div>
            <button 
              onClick={() => setShowRecipes(!showRecipes)}
              className="bg-white/90 backdrop-blur border-4 border-orange-400 px-6 py-2 rounded-2xl shadow-[4px_4px_0px_0px_#fb923c] pointer-events-auto text-xl font-bold text-orange-700 hover:bg-orange-50 transition-colors"
            >
              📖 菜谱
            </button>
          </div>
        </header>

        {/* Recipe Book Modal */}
        <AnimatePresence>
          {showRecipes && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-24 right-4 bg-white border-4 border-orange-400 rounded-2xl p-4 shadow-xl z-50 pointer-events-auto w-64"
            >
              <h3 className="text-xl font-bold text-orange-800 mb-4 border-b-2 border-orange-200 pb-2">居酒屋菜谱</h3>
              <div className="flex flex-col gap-3">
                {RECIPES.map((recipe, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-orange-50 p-2 rounded-xl border-2 border-orange-200">
                    <div className="flex gap-1">
                      {recipe.ingredients.map((ing, i) => (
                        <span key={i} className="text-xl" title={CARD_DICT[ing].name}>{CARD_DICT[ing].emoji}</span>
                      ))}
                    </div>
                    <span className="text-gray-400 font-bold">➔</span>
                    <div className="flex items-center gap-1">
                      <span className="text-2xl" title={CARD_DICT[recipe.result].name}>{CARD_DICT[recipe.result].emoji}</span>
                      <span className="text-sm font-bold text-orange-800">{CARD_DICT[recipe.result].name}</span>
                      <span className="text-sm font-bold text-yellow-600">({CARD_DICT[recipe.result].price}💰)</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <CookArea hand={hand} setHand={setHand} showAlert={showAlert} />

        {/* Hand of Cards */}
        <div className="absolute bottom-0 left-0 right-0 h-48 flex justify-center items-end pb-4 z-40 pointer-events-none">
          <div className="flex justify-center items-end pointer-events-auto px-4 w-auto py-2">
            <AnimatePresence>
              {hand.filter(c => c.category === 'crop').map((card, index, arr) => (
                <PlayingCard
                  key={card.id}
                  card={card}
                  isHand={true}
                  index={index}
                  totalCards={arr.length}
                  onDragStart={handleDragStart}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Alert Modal */}
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
      </div>

      <Sidebar hasDrawnToday={true} onDrawCards={() => {}} onNextDay={handleNextDay} mode="izakaya" />
    </div>
  );
}
