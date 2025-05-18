import React from 'react';
import GameManager from '../game/GameManager';

const GamePage: React.FC = () => {
  return (
    <div className="w-full h-full bg-gradient-to-b from-blue-900 to-blue-700">
      <GameManager />
    </div>
  );
};

export default GamePage;
