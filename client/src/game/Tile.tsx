import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { defaultCats, rainbowCat, bombCat, TILE_TYPES } from '../assets/cats';
import { Position } from '../lib/gameUtils';

interface TileProps {
  id: string;
  catId: number;
  type: string;
  position: Position;
  isSelected: boolean;
  isNew?: boolean;
  isFalling?: boolean;
  isMatched?: boolean;
  onClick: () => void;
  customImages: {
    cats: string[] | null;
    rainbow: string | null;
    bomb: string | null;
  };
}

const Tile: React.FC<TileProps> = ({
  id,
  catId,
  type,
  position,
  isSelected,
  isNew = false,
  isFalling = false,
  isMatched = false,
  onClick,
  customImages
}) => {
  const [cat, setCat] = useState<any>(null);
  
  useEffect(() => {
    if (type === TILE_TYPES.RAINBOW) {
      setCat(rainbowCat);
    } else if (type === TILE_TYPES.BOMB) {
      setCat(bombCat);
    } else {
      const foundCat = defaultCats.find(c => c.id === catId);
      setCat(foundCat || defaultCats[0]);
    }
  }, [catId, type]);
  
  if (!cat) return null;
  
  // Determine if we should use a custom image
  let customImage = null;
  if (type === TILE_TYPES.RAINBOW && customImages.rainbow) {
    customImage = customImages.rainbow;
  } else if (type === TILE_TYPES.BOMB && customImages.bomb) {
    customImage = customImages.bomb;
  } else if (customImages.cats && customImages.cats.length > 0) {
    // Map catId to an index in the custom images array
    const index = (catId - 1) % customImages.cats.length;
    if (index >= 0 && index < customImages.cats.length) {
      customImage = customImages.cats[index];
    }
  }
  
  const variants = {
    normal: { 
      scale: 1,
      opacity: 1,
      rotate: 0
    },
    selected: { 
      scale: 1.1,
      opacity: 1,
      rotate: [0, 5, -5, 0]
    },
    matched: { 
      scale: 0.6,
      opacity: 0,
      rotate: 180
    },
    new: { 
      scale: [0.5, 1.1, 1],
      opacity: 1
    },
    falling: {
      y: ['0%', '10%', '0%']
    }
  };
  
  const getVariant = () => {
    if (isMatched) return "matched";
    if (isNew) return "new";
    if (isFalling) return "falling";
    if (isSelected) return "selected";
    return "normal";
  };
  
  return (
    <motion.div
      className={`
        relative w-full h-full rounded-sm flex items-center justify-center 
        cursor-pointer border border-blue-800
        ${isSelected ? 'border-white border-2' : ''}
      `}
      style={{
        background: typeof cat.color === 'string' ? cat.color : 'linear-gradient(45deg, #4dabf7, #1971c2)',
        boxShadow: isSelected ? '0 0 5px rgba(255,255,255,0.8)' : 'none'
      }}
      variants={variants}
      initial={isNew ? "new" : "normal"}
      animate={getVariant()}
      transition={{ duration: 0.3 }}
      onClick={onClick}
    >
      {customImage ? (
        <div className="absolute inset-0 flex items-center justify-center p-1">
          <img
            src={customImage}
            alt={cat.name}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      ) : (
        <div className="text-white text-5xl">
          {cat.icon}
        </div>
      )}
      
      {/* Special effects for power-ups */}
      {type === TILE_TYPES.RAINBOW && !customImage && (
        <motion.div 
          className="absolute inset-0 opacity-40 rounded-lg"
          style={{ 
            background: 'linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #8b00ff)'
          }}
          animate={{ 
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 3, 
            ease: 'linear'
          }}
        />
      )}
      
      {type === TILE_TYPES.BOMB && !customImage && (
        <motion.div 
          className="absolute inset-0 flex items-center justify-center"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.7, 0.9, 0.7]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 1.5,
            ease: 'easeInOut'
          }}
        >
          <div className="w-full h-full rounded-full bg-red-500 opacity-30" />
        </motion.div>
      )}
    </motion.div>
  );
};

export default React.memo(Tile);
