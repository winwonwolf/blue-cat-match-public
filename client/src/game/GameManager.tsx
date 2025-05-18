import React, { useEffect, useCallback } from 'react';
import { useCatGame } from '../lib/stores/useCatGame';
import Board from './Board';
import GameUI, { LevelCompleteUI, GameOverUI } from './GameUI';
import { isLevelCompleted } from '../lib/gameUtils';
import { useAudio } from '../lib/stores/useAudio';

const GameManager: React.FC = () => {
  const { 
    phase,
    board, 
    score, 
    movesLeft, 
    currentLevel,
    catsCaptured,
    initializeGame,
    selectTile
  } = useCatGame();
  
  // Setup audio
  const { setHitSound, setSuccessSound } = useAudio();
  
  useEffect(() => {
    // Initialize sounds
    const hitSound = new Audio('/sounds/hit.mp3');
    const successSound = new Audio('/sounds/success.mp3');
    
    setHitSound(hitSound);
    setSuccessSound(successSound);
    
    // Cleanup on unmount
    return () => {
      hitSound.pause();
      successSound.pause();
    };
  }, [setHitSound, setSuccessSound]);
  
  // Handle keyboard navigation for accessibility
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Only process keyboard when in game phase
    if (phase !== 'game') return;
    
    if (!board.length) return;
    
    const currentSelection = useCatGame.getState().selectedTile;
    
    if (!currentSelection) {
      // If nothing is selected, select the middle of the board
      if (e.key === 'Enter' || e.key === ' ') {
        const middleRow = Math.floor(board.length / 2);
        const middleCol = Math.floor(board[0].length / 2);
        selectTile({ row: middleRow, col: middleCol });
      }
      return;
    }
    
    // Handle arrow keys for navigation
    switch (e.key) {
      case 'ArrowUp':
        if (currentSelection.row > 0) {
          selectTile({ row: currentSelection.row - 1, col: currentSelection.col });
        }
        break;
      case 'ArrowDown':
        if (currentSelection.row < board.length - 1) {
          selectTile({ row: currentSelection.row + 1, col: currentSelection.col });
        }
        break;
      case 'ArrowLeft':
        if (currentSelection.col > 0) {
          selectTile({ row: currentSelection.row, col: currentSelection.col - 1 });
        }
        break;
      case 'ArrowRight':
        if (currentSelection.col < board[0].length - 1) {
          selectTile({ row: currentSelection.row, col: currentSelection.col + 1 });
        }
        break;
      case 'Escape':
        // Deselect
        selectTile(currentSelection);
        break;
    }
  }, [board, phase, selectTile]);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  
  // Format objectives for UI
  const getObjectives = () => {
    if (!currentLevel) return [];
    
    return currentLevel.objectives.map(objective => {
      if (objective.type === 'score') {
        return {
          description: objective.description,
          progress: score,
          target: objective.target
        };
      } else if (objective.type === 'cat' && objective.catId) {
        return {
          description: objective.description,
          progress: catsCaptured[objective.catId] || 0,
          target: objective.target
        };
      }
      return {
        description: 'Unknown objective',
        progress: 0,
        target: 1
      };
    });
  };
  
  // Check if the level completed
  useEffect(() => {
    if (phase === 'game' && currentLevel && movesLeft > 0) {
      if (isLevelCompleted(currentLevel, score, catsCaptured)) {
        // Small delay to show matches before showing level complete
        const timer = setTimeout(() => {
          useCatGame.getState().completeLevel();
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [phase, currentLevel, score, movesLeft, catsCaptured]);
  
  if (!currentLevel) {
    return null;
  }
  
  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-0">
      {/* Top section with compact game UI */}
      <div className="w-full bg-blue-900 bg-opacity-75 px-1 pt-1">
        <GameUI 
          currentLevel={currentLevel.id}
          score={score}
          movesLeft={movesLeft}
          objectives={getObjectives()}
        />
      </div>
      
      {/* Middle section with game board - maximum space */}
      <div className="flex-grow flex items-center justify-center w-full">
        <Board />
      </div>
      
      {/* No bottom padding for maximum board size */}
      
      {/* Overlays for game states */}
      {phase === 'level_complete' && (
        <LevelCompleteUI 
          level={currentLevel.id}
          score={score} 
          stars={currentLevel.stars}
        />
      )}
      
      {phase === 'game_over' && (
        <GameOverUI
          level={currentLevel.id}
          score={score}
        />
      )}
    </div>
  );
};

export default GameManager;
