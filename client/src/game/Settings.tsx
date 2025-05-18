import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useCatGame } from '../lib/stores/useCatGame';
import { useAudio } from '../lib/stores/useAudio';
import { defaultCats, rainbowCat, bombCat } from '../assets/cats';

interface SettingsProps {
  onBack: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const { customImages, setCustomImage } = useCatGame();
  const { isMuted, toggleMute } = useAudio();
  
  const [activeTab, setActiveTab] = useState<'cats' | 'powerups' | 'sound'>('cats');
  
  const catFileInputRef = useRef<HTMLInputElement>(null);
  const rainbowFileInputRef = useRef<HTMLInputElement>(null);
  const bombFileInputRef = useRef<HTMLInputElement>(null);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleCatImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Check if we have at least 1 file, up to 8 files
    if (files.length > 8) {
      setErrors({ cats: 'You can only upload up to 8 cat images' });
      return;
    }
    
    // Process each file
    const imagePromises = Array.from(files).map((file) => {
      // Check file size
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        throw new Error('Image file size should be less than 2MB');
      }
      
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (event) => {
          if (event.target?.result) {
            resolve(event.target.result as string);
          } else {
            reject(new Error('Failed to read file'));
          }
        };
        
        reader.onerror = () => {
          reject(new Error('Failed to read file'));
        };
        
        reader.readAsDataURL(file);
      });
    });
    
    // Process all images
    Promise.all(imagePromises)
      .then((images) => {
        setCustomImage('cats', images);
        setErrors({});
      })
      .catch((error) => {
        setErrors({ cats: error.message });
      });
  };
  
  const handlePowerupImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'rainbow' | 'bomb') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // We only need the first file
    const file = files[0];
    
    // Check file size
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      setErrors({ [type]: 'Image file size should be less than 2MB' });
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target?.result) {
        setCustomImage(type, [event.target.result as string]);
        setErrors({});
      }
    };
    
    reader.onerror = () => {
      setErrors({ [type]: 'Failed to read file' });
    };
    
    reader.readAsDataURL(file);
  };
  
  const resetCatImages = () => {
    setCustomImage('cats', []);
  };
  
  const resetRainbowImage = () => {
    setCustomImage('rainbow', []);
  };
  
  const resetBombImage = () => {
    setCustomImage('bomb', []);
  };
  
  return (
    <motion.div
      className="w-full max-w-md mx-auto px-4 py-8 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-6">
        <button 
          className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg"
          onClick={onBack}
        >
          Back
        </button>
        <h1 className="text-2xl font-bold">Settings</h1>
        <div className="w-16"></div> {/* Empty div for flex spacing */}
      </div>
      
      {/* Tabs */}
      <div className="flex mb-6 bg-blue-800 rounded-lg overflow-hidden">
        <button 
          className={`flex-1 py-2 text-center ${activeTab === 'cats' ? 'bg-blue-600' : 'hover:bg-blue-700'}`}
          onClick={() => setActiveTab('cats')}
        >
          Cats
        </button>
        <button 
          className={`flex-1 py-2 text-center ${activeTab === 'powerups' ? 'bg-blue-600' : 'hover:bg-blue-700'}`}
          onClick={() => setActiveTab('powerups')}
        >
          Power-ups
        </button>
        <button 
          className={`flex-1 py-2 text-center ${activeTab === 'sound' ? 'bg-blue-600' : 'hover:bg-blue-700'}`}
          onClick={() => setActiveTab('sound')}
        >
          Sound
        </button>
      </div>
      
      {/* Cats Tab */}
      {activeTab === 'cats' && (
        <div>
          <p className="mb-4">
            Upload your own cat images! You can upload up to 8 images that will replace the default cat icons.
          </p>
          
          <div className="mb-4">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full mb-2"
              onClick={() => catFileInputRef.current?.click()}
            >
              Upload Cat Images
            </button>
            <input
              ref={catFileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleCatImageUpload}
            />
            <p className="text-xs text-blue-300">
              Recommended: square images, less than 2MB each
            </p>
            {errors.cats && <p className="text-red-400 text-sm mt-1">{errors.cats}</p>}
          </div>
          
          {customImages.cats && customImages.cats.length > 0 && (
            <div>
              <div className="mb-2 font-semibold">Your custom cats:</div>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {customImages.cats.map((image, index) => (
                  <div
                    key={index}
                    className="aspect-square bg-blue-800 rounded-lg overflow-hidden flex items-center justify-center"
                  >
                    <img
                      src={image}
                      alt={`Custom cat ${index + 1}`}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ))}
              </div>
              <button
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                onClick={resetCatImages}
              >
                Reset to Default Cats
              </button>
            </div>
          )}
          
          {(!customImages.cats || customImages.cats.length === 0) && (
            <div>
              <div className="mb-2 font-semibold">Default cats:</div>
              <div className="grid grid-cols-4 gap-2">
                {defaultCats.map((cat) => (
                  <div
                    key={cat.id}
                    className="aspect-square rounded-lg overflow-hidden flex items-center justify-center"
                    style={{ background: cat.color }}
                  >
                    <span className="text-white text-2xl">
                      {cat.icon}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Power-ups Tab */}
      {activeTab === 'powerups' && (
        <div>
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-2">Rainbow Cat</h3>
            <p className="mb-3">
              The Rainbow Cat clears all tiles of one type when swapped with any tile.
            </p>
            
            <div className="flex items-center space-x-4 mb-2">
              <div 
                className="w-16 h-16 rounded-lg overflow-hidden flex items-center justify-center"
                style={{ background: rainbowCat.color }}
              >
                {customImages.rainbow ? (
                  <img
                    src={customImages.rainbow}
                    alt="Custom Rainbow Cat"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <span className="text-white text-2xl">
                    {rainbowCat.icon}
                  </span>
                )}
              </div>
              
              <div className="flex-1">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg w-full mb-1"
                  onClick={() => rainbowFileInputRef.current?.click()}
                >
                  Upload Custom Image
                </button>
                <input
                  ref={rainbowFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handlePowerupImageUpload(e, 'rainbow')}
                />
                {customImages.rainbow && (
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg w-full mt-1"
                    onClick={resetRainbowImage}
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
            {errors.rainbow && <p className="text-red-400 text-sm">{errors.rainbow}</p>}
          </div>
          
          <div className="mb-4">
            <h3 className="font-semibold text-lg mb-2">Bomb Cat</h3>
            <p className="mb-3">
              The Bomb Cat clears all surrounding tiles in a 3x3 area when swapped with any tile.
            </p>
            
            <div className="flex items-center space-x-4 mb-2">
              <div 
                className="w-16 h-16 rounded-lg overflow-hidden flex items-center justify-center"
                style={{ background: bombCat.color }}
              >
                {customImages.bomb ? (
                  <img
                    src={customImages.bomb}
                    alt="Custom Bomb Cat"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <span className="text-white text-2xl">
                    {bombCat.icon}
                  </span>
                )}
              </div>
              
              <div className="flex-1">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg w-full mb-1"
                  onClick={() => bombFileInputRef.current?.click()}
                >
                  Upload Custom Image
                </button>
                <input
                  ref={bombFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handlePowerupImageUpload(e, 'bomb')}
                />
                {customImages.bomb && (
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg w-full mt-1"
                    onClick={resetBombImage}
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
            {errors.bomb && <p className="text-red-400 text-sm">{errors.bomb}</p>}
          </div>
        </div>
      )}
      
      {/* Sound Tab */}
      {activeTab === 'sound' && (
        <div>
          <p className="mb-6">
            Control the game's sound settings.
          </p>
          
          <div className="bg-blue-800 rounded-lg p-4 flex items-center justify-between">
            <div className="font-medium">Game Sound</div>
            <button 
              className={`px-4 py-2 rounded-lg ${
                isMuted 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-green-500 hover:bg-green-600'
              }`}
              onClick={toggleMute}
            >
              {isMuted ? 'Unmute' : 'Mute'}
            </button>
          </div>
          
          <p className="mt-4 text-sm text-blue-300">
            Note: Some browsers may require user interaction before sounds can play.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default Settings;
