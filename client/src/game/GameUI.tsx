import React from 'react';
import { motion } from 'framer-motion';
import { useCatGame } from '../lib/stores/useCatGame';
import { FaStar, FaRegStar } from 'react-icons/fa';
import { gameEmojis } from '../assets/cats';

interface GameUIProps {
  currentLevel: number;
  score: number;
  movesLeft: number;
  objectives: { description: string, progress: number, target: number }[];
}

const GameUI: React.FC<GameUIProps> = ({ 
  currentLevel,
  score,
  movesLeft,
  objectives
}) => {
  const { goToMenu, restartLevel } = useCatGame();
  
  return (
    <motion.div
      className="w-full max-w-md mx-auto px-2 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Compact top bar with level info and score */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center">
          <div className="text-sm font-bold">Lvl {currentLevel}</div>
          <div className="mx-2 text-sm">|</div>
          <div className="text-sm">Moves: <span className="font-bold">{movesLeft}</span></div>
        </div>
        
        <div className="text-sm font-bold">
          Score: {score}
        </div>
      </div>
      
      {/* Simplified objectives */}
      <div className="bg-blue-800 bg-opacity-70 rounded px-2 py-1 mb-1 text-xs">
        {objectives.map((objective, index) => (
          <div key={index} className="flex justify-between items-center">
            <div>{objective.description}</div>
            <div>{objective.progress}/{objective.target}</div>
          </div>
        ))}
      </div>
      
      {/* Action buttons - smaller & more compact */}
      <div className="flex justify-end space-x-2">
        <button 
          className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1 px-2 rounded transition-colors"
          onClick={goToMenu}
        >
          Exit
        </button>
        
        <button 
          className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-bold py-1 px-2 rounded transition-colors"
          onClick={restartLevel}
        >
          Restart
        </button>
      </div>
    </motion.div>
  );
};

export const LevelCompleteUI: React.FC<{
  level: number;
  score: number;
  stars: number;
}> = ({ level, score, stars }) => {
  const { goToMenu, goToLevelSelect, restartLevel } = useCatGame();
  
  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-blue-900 rounded-xl p-6 w-full max-w-md text-white text-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
      >
        <div className="mb-2 text-yellow-400 text-5xl">
          {gameEmojis.levelComplete}
        </div>
        
        <h2 className="text-2xl font-bold mb-1">Level Complete!</h2>
        <p className="text-blue-200 mb-4">You completed level {level}</p>
        
        <div className="flex justify-center mb-6 space-x-2">
          {[1, 2, 3].map((i) => (
            <motion.div 
              key={i}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 + (i * 0.2) }}
            >
              {i <= stars ? (
                <FaStar className="text-4xl text-yellow-400" />
              ) : (
                <FaRegStar className="text-4xl text-yellow-200 opacity-50" />
              )}
            </motion.div>
          ))}
        </div>
        
        <div className="mb-6">
          <div className="text-sm text-blue-200">Score</div>
          <div className="text-3xl font-bold">{score}</div>
        </div>
        
        <div className="flex flex-col space-y-2">
          <button 
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            onClick={goToLevelSelect}
          >
            Continue
          </button>
          
          <button 
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            onClick={restartLevel}
          >
            Play Again
          </button>
          
          <button 
            className="bg-transparent hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            onClick={goToMenu}
          >
            Main Menu
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const GameOverUI: React.FC<{
  level: number;
  score: number;
}> = ({ level, score }) => {
  const { goToMenu, restartLevel } = useCatGame();
  
  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-blue-900 rounded-xl p-6 w-full max-w-md text-white text-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
      >
        <h2 className="text-2xl font-bold mb-1">Game Over</h2>
        <p className="text-blue-200 mb-4">Try again to beat level {level}</p>
        
        <div className="mb-6">
          <div className="text-sm text-blue-200">Score</div>
          <div className="text-3xl font-bold">{score}</div>
        </div>
        
        <div className="flex flex-col space-y-2">
          <button 
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            onClick={restartLevel}
          >
            Try Again
          </button>
          
          <button 
            className="bg-transparent hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            onClick={goToMenu}
          >
            Main Menu
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GameUI;
