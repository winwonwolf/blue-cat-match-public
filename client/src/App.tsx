import { useEffect } from 'react';
import { useCatGame } from './lib/stores/useCatGame';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';
import SettingsPage from './pages/SettingsPage';
import LevelSelectPage from './pages/LevelSelectPage';
import { getLocalStorage } from './lib/utils';

// Load custom images from localStorage on startup
const loadSavedImages = () => {
  const cats = getLocalStorage('cat_game_custom_cats');
  const rainbow = getLocalStorage('cat_game_custom_rainbow');
  const bomb = getLocalStorage('cat_game_custom_bomb');
  
  return {
    cats: cats || null,
    rainbow: rainbow || null,
    bomb: bomb || null
  };
};

function App() {
  const { phase, setCustomImage } = useCatGame();
  
  // Load custom images on app start
  useEffect(() => {
    const images = loadSavedImages();
    
    if (images.cats) {
      setCustomImage('cats', images.cats);
    }
    
    if (images.rainbow) {
      setCustomImage('rainbow', [images.rainbow]);
    }
    
    if (images.bomb) {
      setCustomImage('bomb', [images.bomb]);
    }
  }, [setCustomImage]);
  
  // Render the appropriate page based on game phase
  return (
    <div className="w-full h-full overflow-hidden bg-blue-800 text-white">
      {phase === 'menu' && <HomePage />}
      {(phase === 'game' || phase === 'level_complete' || phase === 'game_over') && <GamePage />}
      {phase === 'settings' && <SettingsPage />}
      {phase === 'level_select' && <LevelSelectPage />}
    </div>
  );
}

export default App;
