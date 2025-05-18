import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaRegStar, FaLock, FaCheck } from 'react-icons/fa';
import { useCatGame } from '../lib/stores/useCatGame';
import { Level } from '../lib/gameUtils';

const LevelManager: React.FC = () => {
  const { levels, initializeGame, goToMenu } = useCatGame();
  const [currentPage, setCurrentPage] = useState(0);
  const levelsPerPage = 9;
  
  const totalPages = Math.ceil(levels.length / levelsPerPage);
  
  // Get levels for current page
  const getCurrentPageLevels = () => {
    const startIndex = currentPage * levelsPerPage;
    return levels.slice(startIndex, startIndex + levelsPerPage);
  };
  
  // Go to next page
  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  // Go to previous page
  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  return (
    <motion.div
      className="w-full max-w-md mx-auto px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-6">
        <button 
          className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg"
          onClick={goToMenu}
        >
          Back
        </button>
        <h1 className="text-2xl font-bold text-white">Select Level</h1>
        <div className="w-16"></div> {/* Empty div for flex spacing */}
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        {getCurrentPageLevels().map((level) => (
          <LevelCard 
            key={level.id} 
            level={level} 
            onSelect={() => level.unlocked && initializeGame(level.id)} 
          />
        ))}
      </div>
      
      <div className="flex justify-between items-center">
        <button 
          className={`px-4 py-2 rounded-lg ${
            currentPage > 0 
              ? 'bg-blue-700 hover:bg-blue-800 text-white' 
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
          onClick={prevPage}
          disabled={currentPage === 0}
        >
          Previous
        </button>
        
        <span className="text-white">
          Page {currentPage + 1} of {totalPages}
        </span>
        
        <button 
          className={`px-4 py-2 rounded-lg ${
            currentPage < totalPages - 1 
              ? 'bg-blue-700 hover:bg-blue-800 text-white' 
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
          onClick={nextPage}
          disabled={currentPage === totalPages - 1}
        >
          Next
        </button>
      </div>
    </motion.div>
  );
};

interface LevelCardProps {
  level: Level;
  onSelect: () => void;
}

const LevelCard: React.FC<LevelCardProps> = ({ level, onSelect }) => {
  return (
    <motion.div
      className={`
        relative aspect-square rounded-lg overflow-hidden 
        flex flex-col items-center justify-center
        ${level.unlocked 
          ? 'bg-blue-700 hover:bg-blue-600 cursor-pointer' 
          : 'bg-gray-700 cursor-not-allowed'}
        transition-colors duration-200
      `}
      whileHover={level.unlocked ? { scale: 1.05 } : {}}
      whileTap={level.unlocked ? { scale: 0.95 } : {}}
      onClick={onSelect}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: level.id * 0.03 }}
    >
      <div className="text-xl font-bold text-white">{level.id}</div>
      
      {/* Lock icon for locked levels */}
      {!level.unlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <FaLock className="text-3xl text-white opacity-70" />
        </div>
      )}
      
      {/* Checkmark for completed levels */}
      {level.completed && (
        <div className="absolute top-1 right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
          <FaCheck className="text-white text-xs" />
        </div>
      )}
      
      {/* Star rating for completed levels */}
      {level.completed && (
        <div className="flex justify-center mt-1">
          {[1, 2, 3].map((star) => (
            <div key={star} className="mx-0.5">
              {star <= level.stars ? (
                <FaStar className="text-yellow-400 text-xs" />
              ) : (
                <FaRegStar className="text-yellow-200 text-xs opacity-50" />
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default LevelManager;
