export type CardType = 'sheep' | 'weed' | 'mutton' | 'breed' | 'fishing_rod' | 'watering_can' | 'seed' | 'wheat' | 'house' | 'shop' | 'pond' | 'cabbage_seed' | 'cabbage' | 'seaweed_seed' | 'seaweed' | 'table' | 'customer' | 'food_sushi' | 'food_salad' | 'food_kebab' | 'food_bread' | 'chicken' | 'egg' | 'potato_seed' | 'potato' | 'radish_seed' | 'radish' | 'salmon' | 'tuna' | 'sweet_shrimp' | 'scallop' | 'filefish' | 'food_grilled_fish' | 'food_sashimi';

export interface CardData {
  id: string;
  type: CardType;
  name: string;
  emoji: string;
  image?: string;
  category: 'tool' | 'material' | 'action' | 'building' | 'crop';
  quantity: number;
  description?: string;
  customName?: string;
  age?: number;
  price?: number;
}

export interface MapCard extends CardData {
  mapId: string;
  x: number;
  y: number;
  daysSinceFed?: number;
  daysSinceWatered?: number;
}

export const CARD_DICT: Record<CardType, Omit<CardData, 'id' | 'quantity'>> = {
  sheep: { type: 'sheep', name: '绵羊', emoji: '🐑', category: 'crop' },
  weed: { type: 'weed', name: '杂草', emoji: '🌿', category: 'material' },
  mutton: { type: 'mutton', name: '羊肉', emoji: '🥩', category: 'crop' },
  breed: { type: 'breed', name: '繁殖', emoji: '💕', category: 'action' },
  fishing_rod: { type: 'fishing_rod', name: '鱼竿', emoji: '🎣', category: 'tool' },
  watering_can: { type: 'watering_can', name: '水壶', emoji: '💦', category: 'tool' },
  seed: { type: 'seed', name: '种子', emoji: '🌱', category: 'material' },
  wheat: { type: 'wheat', name: '小麦', emoji: '🌾', image: '/cards/vegetables/小麦.png', category: 'crop' },
  house: { type: 'house', name: '家宅', emoji: '🏠', category: 'building' },
  shop: { type: 'shop', name: '商店', emoji: '🏪', category: 'building' },
  pond: { type: 'pond', name: '池塘', emoji: '💧', category: 'building' },
  cabbage_seed: { type: 'cabbage_seed', name: '白菜种子', emoji: '🌱', category: 'material' },
  cabbage: { type: 'cabbage', name: '白菜', emoji: '🥬', image: '/cards/vegetables/甜菜.png', category: 'crop' },
  seaweed_seed: { type: 'seaweed_seed', name: '紫菜种子', emoji: '🌱', category: 'material' },
  seaweed: { type: 'seaweed', name: '紫菜', emoji: '🪸', category: 'crop' },
  table: { type: 'table', name: '普通桌子', emoji: '🪑', category: 'building' },
  customer: { type: 'customer', name: '客人', emoji: '👤', category: 'action' },
  food_sushi: { type: 'food_sushi', name: '寿司', emoji: '🍣', category: 'crop', price: 50 },
  food_salad: { type: 'food_salad', name: '凉拌白菜', emoji: '🥗', category: 'crop', price: 30 },
  food_kebab: { type: 'food_kebab', name: '烤羊肉串', emoji: '🍢', category: 'crop', price: 40 },
  food_bread: { type: 'food_bread', name: '面包', emoji: '🍞', category: 'crop', price: 20 },
  chicken: { type: 'chicken', name: '小鸡', emoji: '🐔', image: '/cards/animals/小鸡.png', category: 'crop' },
  egg: { type: 'egg', name: '鸡蛋', emoji: '🥚', category: 'material' },
  potato_seed: { type: 'potato_seed', name: '土豆种子', emoji: '🥔', category: 'material' },
  potato: { type: 'potato', name: '土豆', emoji: '🥔', category: 'crop' },
  radish_seed: { type: 'radish_seed', name: '萝卜种子', emoji: '🥕', category: 'material' },
  radish: { type: 'radish', name: '萝卜', emoji: '🥕', category: 'crop' },
  salmon: { type: 'salmon', name: '三文鱼', emoji: '🍣', image: '/cards/animals/三文鱼.png', category: 'crop' },
  tuna: { type: 'tuna', name: '金枪鱼', emoji: '🐟', category: 'crop' },
  sweet_shrimp: { type: 'sweet_shrimp', name: '甜虾', emoji: '🦐', image: '/cards/animals/甜虾.png', category: 'crop' },
  scallop: { type: 'scallop', name: '扇贝', emoji: '🦪', category: 'crop' },
  filefish: { type: 'filefish', name: '开片鱼', emoji: '🐠', image: '/cards/animals/秋刀鱼.png', category: 'crop' },
  food_grilled_fish: { type: 'food_grilled_fish', name: '烤鱼', emoji: '🐟', category: 'crop', price: 60 },
  food_sashimi: { type: 'food_sashimi', name: '刺身拼盘', emoji: '🍱', image: '/cards/dishes/刺身拼盘.png', category: 'crop', price: 120 },
};
