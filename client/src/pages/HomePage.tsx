import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCat, FaCog, FaPlay, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { useCatGame } from '../lib/stores/useCatGame';
import { useAudio } from '../lib/stores/useAudio';
import { getLocalStorage } from '../lib/utils';

const HomePage: React.FC = () => {
  const { goToLevelSelect, goToSettings, initializeGame } = useCatGame();
  const { isMuted, toggleMute, setBackgroundMusic } = useAudio();
  
  // Load and setup background music
  useEffect(() => {
    const bgMusic = new Audio('/sounds/background.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.4;
    
    setBackgroundMusic(bgMusic);
    
    // Don't autoplay on first visit
    const hasVisitedBefore = getLocalStorage('cat_game_visited');
    if (hasVisitedBefore) {
      bgMusic.play().catch(() => {
        console.log('Autoplay prevented. User must interact first.');
      });
    }
    
    // Mark as visited
    localStorage.setItem('cat_game_visited', 'true');
    
    return () => {
      bgMusic.pause();
    };
  }, [setBackgroundMusic]);
  
  const startGame = () => {
    // Start with level 1
    initializeGame(1);
    
    // Try to play background music on user interaction
    if (useAudio.getState().backgroundMusic && !isMuted) {
      useAudio.getState().backgroundMusic.play().catch(err => {
        console.log('Unable to play background music:', err);
      });
    }
  };
  
  return (
    <motion.div
      className="w-full h-full flex flex-col items-center justify-between p-6 bg-gradient-to-b from-blue-900 to-blue-700"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Top sound toggle */}
      <div className="self-end">
        <button
          className="bg-blue-800 hover:bg-blue-700 text-white p-3 rounded-full"
          onClick={toggleMute}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <FaVolumeMute size={20} /> : <FaVolumeUp size={20} />}
        </button>
      </div>
      
      {/* Title and logo */}
      <div className="text-center mb-8">
        <motion.div
          className="text-blue-200 text-9xl mb-2 flex justify-center"
          animate={{ 
            rotate: [0, 5, -5, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 4,
            ease: "easeInOut"
          }}
        >
          <FaCat />
        </motion.div>
        
        <motion.h1
          className="text-4xl font-bold text-white mb-2"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Blue Cat Match
        </motion.h1>
        
        <motion.p
          className="text-blue-100"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Match cats, earn points, have fun!
        </motion.p>
      </div>
      
      {/* Menu buttons */}
      <div className="w-full max-w-xs space-y-4">
        <motion.button
          className="w-full bg-blue-500 hover:bg-blue-400 text-white font-bold py-4 px-6 rounded-lg shadow-lg flex items-center justify-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startGame}
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <FaPlay className="mr-2" />
          Play Now
        </motion.button>
        
        <motion.button
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={goToLevelSelect}
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          Level Select
        </motion.button>
        
        <motion.button
          className="w-full bg-blue-700 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={goToSettings}
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <FaCog className="inline mr-2" />
          Settings
        </motion.button>
      </div>
      
      {/* Floating cats background decoration */}
      <FloatingCats />
      
      {/* Footer */}
      <div className="text-blue-200 text-xs mt-6">
        A cute match-three game with blue cat theme
      </div>
    </motion.div>
  );
};

// Decorative floating cats for the background
const FloatingCats: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 8 }).map((_, i) => {
        // Random positions and timing
        const size = 20 + Math.random() * 30;
        const left = Math.random() * 90;
        const delay = Math.random() * 10;
        const duration = 15 + Math.random() * 20;
        
        return (
          <motion.div
            key={i}
            className="absolute text-blue-300 opacity-20"
            style={{ 
              left: `${left}%`,
              fontSize: size,
            }}
            initial={{ y: '110vh' }}
            animate={{ y: '-20vh' }}
            transition={{ 
              repeat: Infinity, 
              duration, 
              delay,
              ease: "linear"
            }}
          >
            <FaCat />
          </motion.div>
        );
      })}
    </div>
  );
};

export default HomePage;
