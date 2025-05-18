import { FaCat } from "react-icons/fa";
import { FaPaw } from "react-icons/fa";
import { 
  BsEmojiSmile, 
  BsEmojiSunglasses, 
  BsEmojiHeartEyes, 
  BsEmojiLaughing, 
  BsEmojiWink, 
  BsEmojiDizzy
} from "react-icons/bs";

// Default cat icons (will be used if no custom images are provided)
export type CatType = {
  id: number;
  name: string;
  icon: React.ReactNode;
  color: string;
};

export const TILE_TYPES = {
  REGULAR: 'regular',
  BOMB: 'bomb',
  RAINBOW: 'rainbow',
} as const;

export type TileType = typeof TILE_TYPES[keyof typeof TILE_TYPES];

// Default cats
export const defaultCats: CatType[] = [
  { 
    id: 1, 
    name: "Blue Cat", 
    icon: <FaCat />, 
    color: "#4dabf7" 
  },
  { 
    id: 2, 
    name: "Red Cat", 
    icon: <FaCat />, 
    color: "#fa5252" 
  },
  { 
    id: 3, 
    name: "Green Cat", 
    icon: <FaCat />, 
    color: "#40c057" 
  },
  { 
    id: 4, 
    name: "Yellow Cat", 
    icon: <FaCat />, 
    color: "#ffd43b" 
  },
  { 
    id: 5, 
    name: "Purple Cat", 
    icon: <FaPaw />, 
    color: "#ae3ec9" 
  },
  { 
    id: 6, 
    name: "Orange Cat", 
    icon: <FaPaw />, 
    color: "#ff922b" 
  },
  { 
    id: 7, 
    name: "Pink Cat", 
    icon: <BsEmojiHeartEyes />, 
    color: "#f06595" 
  },
  { 
    id: 8, 
    name: "Cyan Cat", 
    icon: <BsEmojiSunglasses />, 
    color: "#15aabf" 
  }
];

// Power-up cats
export const rainbowCat = {
  id: 9,
  name: "Rainbow Cat",
  icon: <BsEmojiDizzy />,
  color: "linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #8b00ff)",
  type: TILE_TYPES.RAINBOW
};

export const bombCat = {
  id: 10,
  name: "Bomb Cat",
  icon: <BsEmojiWink />,
  color: "#000000",
  type: TILE_TYPES.BOMB
};

// Emojis for different game events
export const gameEmojis = {
  success: <BsEmojiSmile className="text-2xl text-yellow-500" />,
  awesome: <BsEmojiSunglasses className="text-2xl text-blue-500" />,
  excellent: <BsEmojiLaughing className="text-2xl text-green-500" />,
  levelComplete: <BsEmojiHeartEyes className="text-2xl text-pink-500" />
};
