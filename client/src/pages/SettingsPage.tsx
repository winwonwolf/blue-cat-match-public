import React from 'react';
import Settings from '../game/Settings';
import { useCatGame } from '../lib/stores/useCatGame';

const SettingsPage: React.FC = () => {
  const { goToMenu } = useCatGame();
  
  return (
    <div className="w-full h-full bg-gradient-to-b from-blue-900 to-blue-700">
      <Settings onBack={goToMenu} />
    </div>
  );
};

export default SettingsPage;
