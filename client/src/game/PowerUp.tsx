import React from 'react';
import { motion } from 'framer-motion';

interface PowerUpEffectProps {
  type: 'bomb' | 'rainbow';
  position: { x: number, y: number };
  size: number;
  onComplete: () => void;
}

const PowerUpEffect: React.FC<PowerUpEffectProps> = ({ 
  type, 
  position, 
  size,
  onComplete 
}) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 1000); // Animation lasts 1 second
    
    return () => clearTimeout(timer);
  }, [onComplete]);
  
  if (type === 'bomb') {
    return (
      <motion.div
        className="absolute pointer-events-none"
        style={{
          left: position.x - size / 2,
          top: position.y - size / 2,
          width: size,
          height: size,
          zIndex: 100
        }}
        initial={{ scale: 0.2, opacity: 0 }}
        animate={{ 
          scale: [0.2, 1.5, 0],
          opacity: [0, 0.8, 0]
        }}
        transition={{ 
          duration: 1,
          ease: "easeOut"
        }}
      >
        <div 
          className="w-full h-full rounded-full bg-orange-500"
          style={{
            boxShadow: '0 0 20px 10px rgba(255, 165, 0, 0.5), 0 0 60px 30px rgba(255, 69, 0, 0.5)'
          }}
        />
        {/* Particles for explosion effect */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          return (
            <motion.div
              key={i}
              className="absolute w-3 h-3 bg-yellow-400 rounded-full"
              style={{
                left: '50%',
                top: '50%',
                x: '-50%',
                y: '-50%'
              }}
              animate={{
                x: Math.cos(angle) * size,
                y: Math.sin(angle) * size,
                opacity: [1, 0],
                scale: [1, 0.5]
              }}
              transition={{
                duration: 0.8,
                ease: "easeOut"
              }}
            />
          );
        })}
      </motion.div>
    );
  }
  
  if (type === 'rainbow') {
    return (
      <motion.div
        className="absolute pointer-events-none"
        style={{
          left: position.x - size / 2,
          top: position.y - size / 2,
          width: size,
          height: size,
          zIndex: 100
        }}
        initial={{ scale: 0.2, opacity: 0 }}
        animate={{ 
          scale: [0.2, 1.5, 0],
          opacity: [0, 0.8, 0]
        }}
        transition={{ 
          duration: 1,
          ease: "easeOut"
        }}
      >
        <div 
          className="w-full h-full rounded-full overflow-hidden"
          style={{
            background: 'linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #8b00ff)',
            boxShadow: '0 0 20px 10px rgba(255, 255, 255, 0.5), 0 0 60px 30px rgba(138, 43, 226, 0.5)'
          }}
        />
        {/* Particles for rainbow wave effect */}
        {Array.from({ length: 20 }).map((_, i) => {
          const colors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#8b00ff'];
          const angle = (i / 20) * Math.PI * 2;
          return (
            <motion.div
              key={i}
              className="absolute w-4 h-4 rounded-full"
              style={{
                left: '50%',
                top: '50%',
                x: '-50%',
                y: '-50%',
                background: colors[i % colors.length]
              }}
              animate={{
                x: Math.cos(angle) * size * 1.2,
                y: Math.sin(angle) * size * 1.2,
                opacity: [1, 0],
                scale: [1, 0.5]
              }}
              transition={{
                duration: 0.8,
                ease: "easeOut",
                delay: i * 0.02
              }}
            />
          );
        })}
      </motion.div>
    );
  }
  
  return null;
};

export default PowerUpEffect;
