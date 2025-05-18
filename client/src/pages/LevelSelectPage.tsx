import React from 'react';
import LevelManager from '../game/LevelManager';

const LevelSelectPage: React.FC = () => {
  return (
    <div className="w-full h-full bg-gradient-to-b from-blue-900 to-blue-700">
      <LevelManager />
    </div>
  );
};

export default LevelSelectPage;
