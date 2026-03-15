import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CardData, CardType } from './types';

interface PlayingCardProps {
  key?: React.Key;
  card: CardData;
  isHand?: boolean;
  index?: number;
  totalCards?: number;
  onDragStart?: (e: React.DragEvent, card: CardData) => void;
  onClick?: () => void | boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export function PlayingCard({ card, isHand, index = 0, totalCards = 1, onDragStart, onClick, className = '', style = {}, children }: PlayingCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [spinCount, setSpinCount] = useState(0);

  let transformStyle = {};
  if (isHand) {
    const middle = (totalCards - 1) / 2;
    const offset = index - middle;
    const rotation = offset * 5; 
    const yOffset = Math.abs(offset) * 5;
    transformStyle = {
      rotate: rotation,
      y: yOffset,
      marginLeft: index === 0 ? 0 : '-35px',
      zIndex: isFlipped ? 100 : index,
    };
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    let actionHandled = false;
    if (onClick) {
      actionHandled = onClick() === true;
    }
    
    if (actionHandled) {
      setSpinCount(prev => prev + 1);
      setIsFlipped(false);
    } else {
      setIsFlipped(!isFlipped);
    }
  };

  return (
    <motion.div
      layout
      initial={isHand ? { opacity: 0, y: 50 } : false}
      animate={isHand ? { opacity: 1, ...transformStyle } : { opacity: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      whileHover={isHand ? { y: (transformStyle as any).y - 20, scale: 1.05, zIndex: 50 } : { scale: 1.05, zIndex: 50 }}
      style={{ ...style, perspective: 1000 }}
      draggable={!!onDragStart}
      onDragStart={(e) => {
        if (isFlipped) setIsFlipped(false);
        if (onDragStart) onDragStart(e as any, card);
      }}
      onClick={handleClick}
      className={`relative cursor-pointer ${isHand ? 'w-24 h-32 flex-shrink-0' : 'w-20 h-28'} ${className}`}
    >
      <motion.div
        className="w-full h-full relative"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: (isFlipped ? 180 : 0) + (spinCount * 360) }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        {/* Front */}
        <div 
          className={`absolute inset-0 bg-white/95 backdrop-blur-sm border-[3px] border-yellow-400 rounded-xl p-1.5 flex flex-col items-center justify-between shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)]`}
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          {card.quantity > 1 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white font-bold rounded-full w-6 h-6 text-xs flex items-center justify-center border-2 border-white z-10 shadow-sm">
              x{card.quantity}
            </div>
          )}
          <div className="text-xs font-bold text-orange-800 w-full text-center border-b-2 border-yellow-200 pb-0.5 truncate">
            {card.customName || card.name}
          </div>
          <div className={`${isHand ? 'text-4xl' : 'text-3xl'} drop-shadow-md`}>{card.emoji}</div>
          <div className={`text-[9px] text-center font-bold px-1 py-0.5 rounded-md w-full ${card.category === 'building' ? 'bg-orange-200 text-orange-800' : card.category === 'tool' ? 'bg-blue-200 text-blue-800' : card.category === 'crop' ? 'bg-yellow-200 text-yellow-800' : card.category === 'material' ? 'bg-green-200 text-green-800' : 'bg-purple-200 text-purple-800'}`}>
            {card.category === 'building' ? '🏠 建筑' : card.category === 'tool' ? '🔧 工具' : card.category === 'crop' ? '🌾 作物' : card.category === 'material' ? '📦 物资' : '⚡ 行为'}
          </div>
          {children}
        </div>

        {/* Back */}
        <div 
          className="absolute inset-0 bg-orange-50 border-[3px] border-orange-400 rounded-xl p-2 flex flex-col items-center shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)] overflow-hidden"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="text-xs font-bold text-orange-900 border-b-2 border-orange-200 pb-0.5 w-full text-center mb-1 truncate">
            {card.customName || card.name}
          </div>
          <div className="text-[9px] text-orange-800 flex-1 overflow-y-auto w-full text-left space-y-0.5 scrollbar-hide">
            {card.type === 'sheep' ? (
              <>
                <p><strong>种类:</strong> 绵羊</p>
                <p><strong>年龄:</strong> {card.age !== undefined ? card.age : 0} 岁</p>
                <p><strong>产出:</strong> 羊肉 🥩</p>
                <p><strong>状态:</strong> {card.age !== undefined && card.age >= 4 ? '可宰杀' : '成长中'}</p>
                <p><strong>用途:</strong> 喂食杂草成长，两只可繁殖。</p>
              </>
            ) : card.type === 'chicken' ? (
              <>
                <p><strong>种类:</strong> 小鸡</p>
                <p><strong>年龄:</strong> {card.age !== undefined ? card.age : 0} 天</p>
                <p><strong>产出:</strong> 鸡蛋 🥚</p>
                <p><strong>状态:</strong> 每2天产1个蛋</p>
                <p><strong>用途:</strong> 每天需要喂食杂草。</p>
              </>
            ) : (
              <p>{card.description || getCardDescription(card.type)}</p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function getCardDescription(type: CardType) {
  switch(type) {
    case 'weed': return '杂草。可以用来喂食动物。';
    case 'mutton': return '羊肉。美味的食材。';
    case 'breed': return '繁殖。对两只绵羊使用，可以生出小羊。';
    case 'fishing_rod': return '鱼竿。装备后可以在池塘钓鱼。';
    case 'watering_can': return '水壶。装备后可以给种子浇水。';
    case 'seed': return '种子。种在地上，浇水后可长成小麦。';
    case 'wheat': return '小麦。成熟的农作物。';
    case 'fish': return '鱼。从池塘里钓上来的新鲜鱼。';
    case 'house': return '家宅。你休息的地方。';
    case 'shop': return '商店。买卖物品的地方。';
    case 'pond': return '池塘。装备鱼竿可以在这里钓鱼。';
    case 'chicken': return '小鸡。每天喂食杂草，每2天产一个鸡蛋。';
    case 'egg': return '鸡蛋。新鲜的鸡蛋。';
    case 'potato_seed': return '土豆种子。种在地上，浇水3天后可长成土豆。';
    case 'potato': return '土豆。成熟的农作物。';
    case 'radish_seed': return '萝卜种子。种在地上，浇水2天后可长成萝卜。';
    case 'radish': return '萝卜。成熟的农作物。';
    case 'salmon': return '三文鱼。高级食材，可做刺身。';
    case 'tuna': return '金枪鱼。高级食材，可做刺身。';
    case 'sweet_shrimp': return '甜虾。高级食材，可做刺身。';
    case 'scallop': return '扇贝。海鲜食材。';
    case 'filefish': return '开片鱼。适合用来做烤鱼。';
    default: return '未知物品。';
  }
}
