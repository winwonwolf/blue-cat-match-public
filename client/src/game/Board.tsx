import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Tile from './Tile';
import { useCatGame } from '../lib/stores/useCatGame';
import { GRID_SIZE, Position } from '../lib/gameUtils';

interface BoardProps {
  onSwipeStart?: (position: Position) => void;
  onSwipeEnd?: (position: Position) => void;
}

const Board: React.FC<BoardProps> = ({ onSwipeStart, onSwipeEnd }) => {
  const { 
    board, 
    selectedTile, 
    selectTile,
    customImages,
    animating
  } = useCatGame();
  
  const [touchStart, setTouchStart] = useState<Position | null>(null);
  const [boardSize, setBoardSize] = useState<number>(0);
  
  // Calculate the board size based on viewport
  useEffect(() => {
    const calculateSize = () => {
      // Make the board as large as possible - prioritize filling the screen
      // Account for header space (roughly 10% of screen height)
      const size = Math.min(
        window.innerWidth * 0.98,
        window.innerHeight * 0.80
      );
      setBoardSize(size);
    };
    
    calculateSize();
    window.addEventListener('resize', calculateSize);
    
    return () => {
      window.removeEventListener('resize', calculateSize);
    };
  }, []);
  
  // Handle touch start for swipe gestures
  const handleTouchStart = (position: Position) => {
    setTouchStart(position);
    if (onSwipeStart) onSwipeStart(position);
  };
  
  // Handle touch end for swipe gestures
  const handleTouchEnd = (position: Position) => {
    if (touchStart) {
      // Check for adjacent tiles
      const rowDiff = position.row - touchStart.row;
      const colDiff = position.col - touchStart.col;
      
      // Find the most significant direction (horizontal or vertical)
      if (Math.abs(rowDiff) > Math.abs(colDiff)) {
        // Vertical swipe
        const targetRow = touchStart.row + (rowDiff > 0 ? 1 : -1);
        if (targetRow >= 0 && targetRow < GRID_SIZE) {
          selectTile(touchStart);
          selectTile({ row: targetRow, col: touchStart.col });
        }
      } else if (colDiff !== 0) {
        // Horizontal swipe
        const targetCol = touchStart.col + (colDiff > 0 ? 1 : -1);
        if (targetCol >= 0 && targetCol < GRID_SIZE) {
          selectTile(touchStart);
          selectTile({ row: touchStart.row, col: targetCol });
        }
      }
      
      setTouchStart(null);
      if (onSwipeEnd) onSwipeEnd(position);
    }
  };
  
  // Handle regular tile click
  const handleTileClick = (position: Position) => {
    selectTile(position);
  };
  
  // Calculate tile size
  const tileSize = boardSize / GRID_SIZE;
  
  return (
    <motion.div
      className="relative bg-blue-900 rounded-lg overflow-hidden shadow-xl"
      style={{ 
        width: `${boardSize}px`, 
        height: `${boardSize}px`,
        display: 'grid',
        gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
        gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
        gap: '0px',
        padding: '0px'
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Render the grid of tiles */}
      {board.map((row, rowIndex) => 
        row.map((tile, colIndex) => (
          <div
            key={tile.id}
            className="relative"
            onTouchStart={() => !animating && handleTouchStart({ row: rowIndex, col: colIndex })}
            onTouchEnd={() => !animating && handleTouchEnd({ row: rowIndex, col: colIndex })}
          >
            <Tile
              id={tile.id}
              catId={tile.catId}
              type={tile.type}
              position={tile.position}
              isSelected={selectedTile?.row === rowIndex && selectedTile?.col === colIndex}
              isNew={tile.new}
              isFalling={tile.falling}
              isMatched={tile.matched}
              onClick={() => !animating && handleTileClick({ row: rowIndex, col: colIndex })}
              customImages={customImages}
            />
          </div>
        ))
      )}
      
      {/* Optional grid overlay for debugging */}
      {/* {Array.from({ length: GRID_SIZE + 1 }).map((_, i) => (
        <React.Fragment key={`grid-${i}`}>
          <div 
            className="absolute bg-white opacity-10" 
            style={{ 
              left: 0, 
              top: `${(i * tileSize)}px`, 
              width: '100%', 
              height: '1px' 
            }} 
          />
          <div 
            className="absolute bg-white opacity-10" 
            style={{ 
              top: 0, 
              left: `${(i * tileSize)}px`,
              height: '100%', 
              width: '1px' 
            }} 
          />
        </React.Fragment>
      ))} */}
    </motion.div>
  );
};

export default Board;
