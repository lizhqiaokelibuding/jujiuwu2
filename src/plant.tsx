import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardType, CardData, MapCard, CARD_DICT } from './types';
import { PlayingCard } from './card';
import { HarvestResult } from './result';
import { Sidebar } from './ui';
import { Shop } from './shop';
import { FishingGame } from './fish';

interface AlertInfo {
  id: string;
  message: string;
  type: 'success' | 'error';
}

interface FarmProps {
  day: number;
  setDay: React.Dispatch<React.SetStateAction<number>>;
  hasDrawnToday: boolean;
  setHasDrawnToday: React.Dispatch<React.SetStateAction<boolean>>;
  hand: CardData[];
  setHand: React.Dispatch<React.SetStateAction<CardData[]>>;
  equippedTool: CardData | null;
  setEquippedTool: React.Dispatch<React.SetStateAction<CardData | null>>;
  money: number;
  setMoney: React.Dispatch<React.SetStateAction<number>>;
  mapCards: MapCard[];
  setMapCards: React.Dispatch<React.SetStateAction<MapCard[]>>;
  onGoToIzakaya: () => void;
}

export default function Farm({ day, setDay, hasDrawnToday, setHasDrawnToday, hand, setHand, equippedTool, setEquippedTool, money, setMoney, mapCards, setMapCards, onGoToIzakaya }: FarmProps) {
  const [namingSheep, setNamingSheep] = useState(false);

  const [sheepToKill, setSheepToKill] = useState<MapCard | null>(null);
  const [feedConfirm, setFeedConfirm] = useState<{ isOpen: boolean; targetSheep: MapCard | null; weedCardId: string | null }>({ isOpen: false, targetSheep: null, weedCardId: null });
  const [alerts, setAlerts] = useState<AlertInfo[]>([]);
  const [harvestData, setHarvestData] = useState<{ isOpen: boolean; items: { card: Omit<CardData, 'id' | 'quantity'>; quantity: number }[]; title?: string }>({ isOpen: false, items: [] });
  const [showShop, setShowShop] = useState(false);
  const [isFishing, setIsFishing] = useState(false);

  const showAlert = (message: string, type: 'success' | 'error' = 'success') => {
    setAlerts(prev => [...prev, { id: Math.random().toString(), message, type }]);
  };

  const drawCards = () => {
    if (hasDrawnToday) return;
    const count = Math.floor(Math.random() * 3) + 3; // 3 to 5
    const possibleCards: CardType[] = ['weed', 'seed', 'breed', 'cabbage_seed', 'seaweed_seed', 'chicken', 'potato_seed', 'radish_seed'];
    
    let newCards: CardType[] = [];
    for(let i=0; i<count; i++) {
      newCards.push(possibleCards[Math.floor(Math.random() * possibleCards.length)]);
    }
    
    newCards.forEach(type => addCardToHand(type, 1));
    setHasDrawnToday(true);
    showAlert(`抽取了 ${count} 张卡牌！`, 'success');
  };

  const addCardToHand = (type: CardType, count: number, customName?: string) => {
    setHand(prev => {
      if (customName) {
        return [...prev, { id: Math.random().toString(), ...CARD_DICT[type], quantity: count, customName }];
      }
      const existing = prev.find(c => c.type === type && !c.customName);
      if (existing) {
        return prev.map(c => c.id === existing.id ? { ...c, quantity: c.quantity + count } : c);
      }
      return [...prev, { id: Math.random().toString(), ...CARD_DICT[type], quantity: count }];
    });
  };

  const removeCardFromHand = (id: string, count: number = 1) => {
    setHand(prev => {
      const card = prev.find(c => c.id === id);
      if (!card) return prev;
      if (card.quantity <= count) {
        return prev.filter(c => c.id !== id);
      }
      return prev.map(c => c.id === id ? { ...c, quantity: c.quantity - count } : c);
    });
  };

  const handleDragStart = (e: React.DragEvent, card: CardData) => {
    e.dataTransfer.setData('cardId', card.id);
    e.dataTransfer.setData('cardType', card.type);
  };

  const handleMapDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('cardId');
    const card = hand.find(c => c.id === cardId);
    if (!card) return;

    if (card.type === 'sheep' || card.type === 'chicken' || card.type === 'seed' || card.type === 'cabbage_seed' || card.type === 'seaweed_seed' || card.type === 'potato_seed' || card.type === 'radish_seed') {
      const mapRect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - mapRect.left) / mapRect.width) * 100;
      const y = ((e.clientY - mapRect.top) / mapRect.height) * 100;
      
      setMapCards(prev => [...prev, {
        ...card,
        quantity: 1,
        mapId: Math.random().toString(),
        x, y,
        age: 0,
        daysSinceFed: (card.type === 'sheep' || card.type === 'chicken') ? 0 : undefined,
        daysSinceWatered: (card.type === 'seed' || card.type === 'cabbage_seed' || card.type === 'seaweed_seed' || card.type === 'potato_seed' || card.type === 'radish_seed') ? 0 : undefined
      }]);
      removeCardFromHand(card.id);
    } else {
      showAlert('这个卡牌不能直接放置在地图上！', 'error');
    }
  };

  const handleCardDrop = (e: React.DragEvent, targetCard: MapCard) => {
    e.preventDefault();
    e.stopPropagation();
    const cardId = e.dataTransfer.getData('cardId');
    const card = hand.find(c => c.id === cardId);
    if (!card) return;

    if (card.type === 'weed' && (targetCard.type === 'sheep' || targetCard.type === 'chicken')) {
      if (!targetCard.daysSinceFed || targetCard.daysSinceFed <= 0) {
        showAlert(`这只${targetCard.name}现在不饿！`, 'error');
        return;
      }
      setFeedConfirm({ isOpen: true, targetSheep: targetCard, weedCardId: card.id });
    } else if (card.type === 'breed' && targetCard.type === 'sheep') {
      const sheepCount = mapCards.filter(m => m.type === 'sheep').length;
      if (sheepCount < 2) {
        showAlert('只有一只绵羊，无法繁殖！', 'error');
      } else {
        setNamingSheep(true);
        removeCardFromHand(card.id);
      }
    } else {
      showAlert('无效的使用！', 'error');
    }
  };

  const handleEquipDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('cardId');
    const card = hand.find(c => c.id === cardId);
    if (!card) return;

    if (card.category === 'tool') {
      if (equippedTool) {
        addCardToHand(equippedTool.type as CardType, 1);
      }
      setEquippedTool(card);
      removeCardFromHand(card.id);
      showAlert(`装备了${card.name}！`, 'success');
    } else {
      showAlert('只能装备工具！', 'error');
    }
  };

  const handleMapCardClick = (mc: MapCard) => {
    if (mc.type === 'sheep' && mc.age !== undefined && mc.age >= 4) {
      setHarvestData({
        isOpen: true,
        items: [{ card: CARD_DICT.mutton, quantity: 1 }],
        title: "收获羊肉！"
      });
      addCardToHand('mutton', 1);
      setMapCards(prev => prev.map(m => m.mapId === mc.mapId ? { ...m, age: 0 } : m));
      return true;
    } else if (mc.type === 'chicken' && mc.age !== undefined && mc.age >= 2 && mc.age % 2 === 0) {
      setHarvestData({
        isOpen: true,
        items: [{ card: CARD_DICT.egg, quantity: 1 }],
        title: "收获鸡蛋！"
      });
      addCardToHand('egg', 1);
      setMapCards(prev => prev.map(m => m.mapId === mc.mapId ? { ...m, age: 0 } : m));
      return true;
    } else if (mc.type === 'seed' && mc.age !== undefined && mc.age >= 3) {
      setHarvestData({
        isOpen: true,
        items: [{ card: CARD_DICT.wheat, quantity: 3 }],
        title: "收获小麦！"
      });
      addCardToHand('wheat', 3);
      setMapCards(prev => prev.filter(m => m.mapId !== mc.mapId));
      return true;
    } else if (mc.type === 'cabbage_seed' && mc.age !== undefined && mc.age >= 3) {
      setHarvestData({
        isOpen: true,
        items: [{ card: CARD_DICT.cabbage, quantity: 3 }],
        title: "收获白菜！"
      });
      addCardToHand('cabbage', 3);
      setMapCards(prev => prev.filter(m => m.mapId !== mc.mapId));
      return true;
    } else if (mc.type === 'seaweed_seed' && mc.age !== undefined && mc.age >= 2) {
      setHarvestData({
        isOpen: true,
        items: [{ card: CARD_DICT.seaweed, quantity: 3 }],
        title: "收获紫菜！"
      });
      addCardToHand('seaweed', 3);
      setMapCards(prev => prev.filter(m => m.mapId !== mc.mapId));
      return true;
    } else if (mc.type === 'potato_seed' && mc.age !== undefined && mc.age >= 3) {
      setHarvestData({
        isOpen: true,
        items: [{ card: CARD_DICT.potato, quantity: 3 }],
        title: "收获土豆！"
      });
      addCardToHand('potato', 3);
      setMapCards(prev => prev.filter(m => m.mapId !== mc.mapId));
      return true;
    } else if (mc.type === 'radish_seed' && mc.age !== undefined && mc.age >= 2) {
      setHarvestData({
        isOpen: true,
        items: [{ card: CARD_DICT.radish, quantity: 3 }],
        title: "收获萝卜！"
      });
      addCardToHand('radish', 3);
      setMapCards(prev => prev.filter(m => m.mapId !== mc.mapId));
      return true;
    } else if (mc.type === 'pond' && equippedTool?.type === 'fishing_rod') {
      setIsFishing(true);
      return true;
    } else if (mc.type === 'shop') {
      setShowShop(true);
      return true;
    } else if ((mc.type === 'seed' || mc.type === 'cabbage_seed' || mc.type === 'seaweed_seed' || mc.type === 'potato_seed' || mc.type === 'radish_seed') && equippedTool?.type === 'watering_can') {
      setMapCards(prev => prev.map(m => m.mapId === mc.mapId ? { ...m, daysSinceWatered: 0 } : m));
      showAlert('浇水成功！', 'success');
      return true;
    }
    return false;
  };

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-[#f4e4bc] p-4" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }}>
      <div className="relative w-full h-full rounded-2xl overflow-hidden border-8 border-[#d4b483] shadow-inner bg-green-200">
      
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: 'url("/backgrounds/farm.png")',
          imageRendering: 'pixelated'
        }}
      />

      {/* Map Area */}
      <div 
        className="absolute top-32 bottom-56 left-0 right-0 z-10"
        onDragOver={e => e.preventDefault()}
        onDrop={handleMapDrop}
      >
        {mapCards.map(mc => (
          <div
            key={mc.mapId}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${mc.x}%`, top: `${mc.y}%` }}
            onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
            onDrop={e => handleCardDrop(e, mc)}
          >
            <PlayingCard 
              card={mc} 
              onClick={() => handleMapCardClick(mc)}
            >
              {/* Status Indicators */}
              {mc.type === 'sheep' && (
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white border-2 border-green-400 px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap shadow-sm z-10">
                  {mc.age !== undefined && mc.age >= 4 ? '✨成熟' : `成长:${mc.age}/4`}
                </div>
              )}
              {(mc.type === 'sheep' || mc.type === 'chicken') && mc.daysSinceFed! > 0 && (
                <div className="absolute -top-3 -right-3 text-xl animate-bounce bg-white rounded-full p-1 shadow-md z-10" title="需要杂草！">🌿</div>
              )}
              
              {mc.type === 'seed' && (
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white border-2 border-green-400 px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap shadow-sm z-10">
                  {mc.age !== undefined && mc.age >= 3 ? '✨成熟' : `成长:${mc.age}/3`}
                </div>
              )}
              {mc.type === 'seed' && mc.daysSinceWatered! > 0 && mc.age !== undefined && mc.age < 3 && (
                <div className="absolute -top-3 -right-3 text-xl animate-bounce bg-white rounded-full p-1 shadow-md z-10" title="需要浇水！">💧</div>
              )}
              
              {mc.type === 'cabbage_seed' && (
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white border-2 border-green-400 px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap shadow-sm z-10">
                  {mc.age !== undefined && mc.age >= 3 ? '✨成熟' : `成长:${mc.age}/3`}
                </div>
              )}
              {mc.type === 'cabbage_seed' && mc.daysSinceWatered! > 0 && mc.age !== undefined && mc.age < 3 && (
                <div className="absolute -top-3 -right-3 text-xl animate-bounce bg-white rounded-full p-1 shadow-md z-10" title="需要浇水！">💧</div>
              )}

              {mc.type === 'seaweed_seed' && (
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white border-2 border-green-400 px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap shadow-sm z-10">
                  {mc.age !== undefined && mc.age >= 2 ? '✨成熟' : `成长:${mc.age}/2`}
                </div>
              )}
              {mc.type === 'seaweed_seed' && mc.daysSinceWatered! > 0 && mc.age !== undefined && mc.age < 2 && (
                <div className="absolute -top-3 -right-3 text-xl animate-bounce bg-white rounded-full p-1 shadow-md z-10" title="需要浇水！">💧</div>
              )}

              {mc.type === 'potato_seed' && (
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white border-2 border-green-400 px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap shadow-sm z-10">
                  {mc.age !== undefined && mc.age >= 3 ? '✨成熟' : `成长:${mc.age}/3`}
                </div>
              )}
              {mc.type === 'potato_seed' && mc.daysSinceWatered! > 0 && mc.age !== undefined && mc.age < 3 && (
                <div className="absolute -top-3 -right-3 text-xl animate-bounce bg-white rounded-full p-1 shadow-md z-10" title="需要浇水！">💧</div>
              )}

              {mc.type === 'radish_seed' && (
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white border-2 border-green-400 px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap shadow-sm z-10">
                  {mc.age !== undefined && mc.age >= 2 ? '✨成熟' : `成长:${mc.age}/2`}
                </div>
              )}
              {mc.type === 'radish_seed' && mc.daysSinceWatered! > 0 && mc.age !== undefined && mc.age < 2 && (
                <div className="absolute -top-3 -right-3 text-xl animate-bounce bg-white rounded-full p-1 shadow-md z-10" title="需要浇水！">💧</div>
              )}
            </PlayingCard>
          </div>
        ))}
      </div>

      {/* Left Sidebar - 木屋/农田/牧场 */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2 p-2 bg-[#f4e4bc]/95 border-4 border-r-0 border-[#d4b483] rounded-r-2xl shadow-lg">
        <button className="p-3 rounded-xl bg-orange-100 border-2 border-orange-300 hover:bg-orange-200 transition-colors" title="木屋">
          <span className="text-2xl">🏠</span>
          <div className="text-xs font-bold text-orange-800">木屋</div>
        </button>
        <button className="p-3 rounded-xl bg-green-200 border-2 border-green-400 hover:bg-green-300 transition-colors" title="农田">
          <span className="text-2xl">🌾</span>
          <div className="text-xs font-bold text-green-800">农田</div>
        </button>
        <button className="p-3 rounded-xl bg-orange-100 border-2 border-orange-300 hover:bg-orange-200 transition-colors" title="牧场">
          <span className="text-2xl">🐑</span>
          <div className="text-xs font-bold text-orange-800">牧场</div>
        </button>
      </div>

      {/* Header overlay */}
      <header className="absolute top-4 left-4 right-4 flex justify-between items-start z-20 pointer-events-none">
        <div className="flex flex-col gap-4 pointer-events-auto">
          <div className="bg-white/90 backdrop-blur border-4 border-green-400 px-6 py-2 rounded-2xl shadow-[4px_4px_0px_0px_#4ade80]">
            <span className="text-3xl text-green-700 font-bold">牧场 · 第 {day} 天</span>
          </div>
        </div>
        
        <div className="flex gap-4 items-center pointer-events-auto">
          <div className="bg-white/90 backdrop-blur border-4 border-yellow-400 px-4 py-2 rounded-2xl">
            <span className="text-xl font-bold text-yellow-700">💰 {money}</span>
          </div>
          <div className="bg-white/90 backdrop-blur border-4 border-amber-400 px-4 py-2 rounded-2xl">
            <span className="text-xl font-bold text-amber-700">⚡ 8/10</span>
          </div>
          <button className="p-2 rounded-xl bg-white/90 border-2 border-gray-300 hover:bg-gray-100" title="设置">⚙️</button>
          {/* Equipment Slot */}
          <div 
            className="bg-blue-200/90 backdrop-blur border-4 border-blue-400 rounded-2xl p-2 shadow-[4px_4px_0px_0px_#60a5fa] flex gap-2 h-20 items-center min-w-[100px] justify-center"
            onDragOver={e => e.preventDefault()}
            onDrop={handleEquipDrop}
          >
            {equippedTool ? (
              <div 
                className="w-14 h-14 bg-white border-2 border-blue-300 rounded-xl flex items-center justify-center text-4xl cursor-pointer hover:bg-blue-50 transition-colors relative group" 
                onClick={() => {
                  addCardToHand(equippedTool.type as CardType, 1);
                  setEquippedTool(null);
                }}
                title="点击卸下"
              >
                {equippedTool.emoji}
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">✕</div>
              </div>
            ) : (
              <div className="text-blue-600 px-2 font-bold text-sm text-center">装备栏<br/>(拖拽工具至此)</div>
            )}
          </div>
        </div>
      </header>

      {/* Hand of Cards - 底部卡牌栏 */}
      <div className="absolute bottom-0 left-0 right-0 h-48 flex justify-center items-end pb-4 z-40 pointer-events-none">
        <button className="absolute left-4 bottom-24 z-50 w-10 h-10 rounded-full bg-green-500 text-white font-bold text-xl flex items-center justify-center hover:bg-green-600 shadow-lg pointer-events-auto">‹</button>
        <div className="flex justify-center items-end pointer-events-auto px-4 w-auto py-2">
          <AnimatePresence>
            {hand.map((card, index) => (
              <PlayingCard
                key={card.id}
                card={card}
                isHand={true}
                index={index}
                totalCards={hand.length}
                onDragStart={handleDragStart}
              />
            ))}
          </AnimatePresence>
        </div>
        <button className="absolute right-4 bottom-24 z-50 w-10 h-10 rounded-full bg-green-500 text-white font-bold text-xl flex items-center justify-center hover:bg-green-600 shadow-lg pointer-events-auto">+</button>
      </div>

      {/* Naming Sheep Modal */}
      {namingSheep && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center pointer-events-auto">
          <div className="bg-white p-6 rounded-2xl border-4 border-orange-400 shadow-xl flex flex-col items-center gap-4">
            <div className="text-2xl font-bold text-orange-800">新生命诞生！</div>
            <div className="text-lg text-gray-600">给新出生的小羊取个名字吧：</div>
            <input 
              type="text" 
              id="sheepNameInput"
              defaultValue="小羊"
              className="border-2 border-orange-300 rounded-xl px-4 py-2 text-lg text-center focus:outline-none focus:border-orange-500"
              autoFocus
            />
            <button 
              className="px-6 py-2 bg-green-500 rounded-xl font-bold text-white hover:bg-green-600 shadow-[2px_2px_0px_0px_#16a34a]"
              onClick={() => {
                const input = document.getElementById('sheepNameInput') as HTMLInputElement;
                const name = input.value.trim() || '小羊';
                addCardToHand('sheep', 1, name);
                showAlert(`繁殖成功！获得小羊「${name}」。`, 'success');
                setNamingSheep(false);
              }}
            >
              确认
            </button>
          </div>
        </div>
      )}

      {/* Harvest Result Modal */}
      <HarvestResult 
        isOpen={harvestData.isOpen} 
        onClose={() => setHarvestData(prev => ({ ...prev, isOpen: false }))} 
        items={harvestData.items}
        title={harvestData.title}
      />

      {/* Kill Sheep Modal */}
      {sheepToKill && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center pointer-events-auto">
          <div className="bg-white p-6 rounded-2xl border-4 border-orange-400 shadow-xl flex flex-col items-center gap-4">
            <div className="text-2xl font-bold text-orange-800">宰杀绵羊？</div>
            <div className="text-lg text-gray-600">绵羊已经成熟，宰杀可获得4块羊肉。</div>
            <div className="flex gap-4 mt-2">
              <button 
                className="px-6 py-2 bg-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-300"
                onClick={() => setSheepToKill(null)}
              >
                取消
              </button>
              <button 
                className="px-6 py-2 bg-red-500 rounded-xl font-bold text-white hover:bg-red-600 shadow-[2px_2px_0px_0px_#991b1b]"
                onClick={() => {
                  setMapCards(prev => prev.filter(m => m.mapId !== sheepToKill.mapId));
                  addCardToHand('mutton', 4);
                  showAlert('获得了4块羊肉！', 'success');
                  setSheepToKill(null);
                }}
              >
                确认宰杀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feed Confirm Modal */}
      <AnimatePresence>
        {feedConfirm.isOpen && feedConfirm.targetSheep && (
          <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center pointer-events-auto">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl text-center border-4 border-orange-400"
            >
              <h3 className="text-2xl font-bold text-orange-800 mb-4">喂食确认</h3>
              <p className="text-lg text-gray-600 mb-6">
                确认要把杂草喂给 <span className="font-bold text-orange-600">{feedConfirm.targetSheep.customName || feedConfirm.targetSheep.name}</span> 吗？
              </p>
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={() => setFeedConfirm({ isOpen: false, targetSheep: null, weedCardId: null })}
                  className="px-6 py-2 rounded-xl font-bold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={() => {
                    setMapCards(prev => prev.map(m => 
                      m.mapId === feedConfirm.targetSheep?.mapId 
                        ? { ...m, daysSinceFed: 0 } 
                        : m
                    ));
                    if (feedConfirm.weedCardId) {
                      removeCardFromHand(feedConfirm.weedCardId);
                    }
                    showAlert(`成功喂食了 ${feedConfirm.targetSheep?.customName || feedConfirm.targetSheep?.name}！`, 'success');
                    setFeedConfirm({ isOpen: false, targetSheep: null, weedCardId: null });
                  }}
                  className="px-6 py-2 rounded-xl font-bold bg-green-500 text-white hover:bg-green-600 transition-colors shadow-[2px_2px_0px_0px_#16a34a]"
                >
                  确认喂食
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Shop Modal */}
      <AnimatePresence>
        {showShop && (
          <Shop 
            money={money} 
            setMoney={setMoney} 
            hand={hand} 
            setHand={setHand} 
            onClose={() => setShowShop(false)} 
            showAlert={showAlert} 
          />
        )}
      </AnimatePresence>

      {/* Fishing Game Modal */}
      {isFishing && (
        <FishingGame 
          onSuccess={(fishType) => {
            setIsFishing(false);
            setHarvestData({
              isOpen: true,
              items: [{ card: CARD_DICT[fishType], quantity: 1 }],
              title: "钓到鱼了！"
            });
            addCardToHand(fishType, 1);
          }}
          onFail={() => {
            setIsFishing(false);
            showAlert('鱼跑掉了...', 'error');
          }}
        />
      )}

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

      <Sidebar hasDrawnToday={hasDrawnToday} onDrawCards={drawCards} onNextDay={onGoToIzakaya} onOpenShop={() => setShowShop(true)} />
    </div>
  );
}
