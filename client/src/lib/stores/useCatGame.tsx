import { create } from "zustand";
import { 
  Tile, 
  Position, 
  GRID_SIZE,
  createBoard,
  findAllMatches,
  checkForSpecialPatterns,
  calculatePoints,
  isLevelCompleted,
  calculateStars,
  Level,
  getLevels,
  saveLevels
} from "../gameUtils";
import { defaultCats, TILE_TYPES } from "../../assets/cats";
import { useAudio } from "./useAudio";

export type GamePhase = 
  | "menu"
  | "level_select"
  | "game"
  | "settings"
  | "level_complete"
  | "game_over";

interface GameState {
  // Game state
  phase: GamePhase;
  board: Tile[][];
  selectedTile: Position | null;
  score: number;
  movesLeft: number;
  currentLevel: Level | null;
  levels: Level[];
  catsCaptured: Record<number, number>;
  animating: boolean;
  customImages: {
    cats: string[] | null;
    rainbow: string | null;
    bomb: string | null;
  };
  
  // Methods
  initializeGame: (levelId: number) => void;
  selectTile: (position: Position) => void;
  swapTiles: (from: Position, to: Position) => Promise<void>;
  processMatches: () => Promise<boolean>;
  applyGravity: () => Promise<void>;
  fillEmptyTiles: () => Promise<void>;
  activatePowerUp: (position: Position, powerUpType: string) => Promise<void>;
  setCustomImage: (type: 'cats' | 'rainbow' | 'bomb', images: string[]) => void;
  completeLevel: () => void;
  restartLevel: () => void;
  goToMenu: () => void;
  goToLevelSelect: () => void;
  goToSettings: () => void;
}

export const useCatGame = create<GameState>((set, get) => ({
  // Initial state
  phase: "menu",
  board: [],
  selectedTile: null,
  score: 0,
  movesLeft: 0,
  currentLevel: null,
  levels: getLevels(),
  catsCaptured: {},
  animating: false,
  customImages: {
    cats: null,
    rainbow: null,
    bomb: null
  },
  
  // Initialize game with a specific level
  initializeGame: (levelId) => {
    const levels = get().levels;
    const level = levels.find(l => l.id === levelId);
    
    if (!level || !level.unlocked) {
      console.error("Level not available");
      return;
    }
    
    set({
      phase: "game",
      board: createBoard(),
      selectedTile: null,
      score: 0,
      movesLeft: level.moves,
      currentLevel: level,
      catsCaptured: {},
      animating: false
    });
  },
  
  // Select a tile for swapping
  selectTile: (position) => {
    const { selectedTile, board, movesLeft, animating } = get();
    
    // Don't allow moves during animations or if out of moves
    if (animating || movesLeft <= 0) return;
    
    // If no tile is selected, select this one
    if (!selectedTile) {
      set({ selectedTile: position });
      return;
    }
    
    // Check if the two tiles are adjacent
    const rowDiff = Math.abs(selectedTile.row - position.row);
    const colDiff = Math.abs(selectedTile.col - position.col);
    
    if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
      // If they're adjacent, swap them
      get().swapTiles(selectedTile, position);
    } else {
      // If not adjacent, select the new tile instead
      set({ selectedTile: position });
    }
  },
  
  // Swap two tiles
  swapTiles: async (from, to) => {
    const state = get();
    const { board, movesLeft, currentLevel } = state;
    
    if (movesLeft <= 0) return;
    
    // Mark as animating
    set({ animating: true, selectedTile: null });
    
    // Create a deep copy of the board
    const newBoard = JSON.parse(JSON.stringify(board)) as Tile[][];
    
    // Swap the tiles
    const temp = { ...newBoard[from.row][from.col] };
    
    newBoard[from.row][from.col] = { 
      ...newBoard[to.row][to.col],
      position: from 
    };
    
    newBoard[to.row][to.col] = { 
      ...temp,
      position: to 
    };
    
    // Check if this is a power-up activation
    const fromTile = board[from.row][from.col];
    const toTile = board[to.row][to.col];
    
    if (fromTile.type === TILE_TYPES.RAINBOW || fromTile.type === TILE_TYPES.BOMB) {
      // Activate the power-up
      set({ board: newBoard });
      await get().activatePowerUp(to, fromTile.type);
      set({ animating: false, movesLeft: movesLeft - 1 });
      return;
    }
    
    if (toTile.type === TILE_TYPES.RAINBOW || toTile.type === TILE_TYPES.BOMB) {
      // Activate the power-up
      set({ board: newBoard });
      await get().activatePowerUp(from, toTile.type);
      set({ animating: false, movesLeft: movesLeft - 1 });
      return;
    }
    
    // Update the board with the swapped tiles
    set({ board: newBoard });
    
    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Check for matches
    const matches = findAllMatches(newBoard);
    
    if (matches.length > 0) {
      // Decrement moves left since this was a valid move
      const newMovesLeft = movesLeft - 1;
      set({ movesLeft: newMovesLeft });
      
      // Process matches
      await get().processMatches();
      
      // Check for game over
      const updatedState = get();
      const updatedMovesLeft = updatedState.movesLeft;
      const updatedCurrentLevel = updatedState.currentLevel;
      const updatedScore = updatedState.score;
      const updatedCatsCaptured = updatedState.catsCaptured;
      
      if (updatedMovesLeft <= 0) {
        if (updatedCurrentLevel && isLevelCompleted(updatedCurrentLevel, updatedScore, updatedCatsCaptured)) {
          // Level completed
          get().completeLevel();
        } else {
          // Game over
          set({ phase: "game_over" });
        }
      }
    } else {
      // Swap back if no matches were created
      set({ 
        board: board,
        animating: false 
      });
      
      // Play error sound
      try {
        useAudio.getState().playHit();
      } catch (err) {
        console.log('Error playing sound:', err);
      }
    }
  },
  
  // Process matches on the board
  processMatches: async () => {
    const { board, score, catsCaptured } = get();
    const matches = findAllMatches(board);
    
    if (matches.length === 0) {
      set({ animating: false });
      return false;
    }
    
    // Calculate score from matches
    let pointsEarned = 0;
    let newCatsCaptured = { ...catsCaptured };
    let specialTilesToCreate: { type: string, position: Position }[] = [];
    
    // Mark matched tiles
    const newBoard = JSON.parse(JSON.stringify(board)) as Tile[][];
    
    for (const match of matches) {
      // Check for special patterns
      const special = checkForSpecialPatterns(match);
      
      if (special.type && special.position) {
        specialTilesToCreate.push({
          type: special.type,
          position: special.position
        });
      }
      
      // Mark tiles as matched and count captured cats
      for (const pos of match) {
        if (pos.row >= 0 && pos.row < GRID_SIZE && pos.col >= 0 && pos.col < GRID_SIZE) {
          newBoard[pos.row][pos.col].matched = true;
          
          // Count captured cats
          const catId = newBoard[pos.row][pos.col].catId;
          newCatsCaptured[catId] = (newCatsCaptured[catId] || 0) + 1;
        }
      }
      
      // Add points for this match
      pointsEarned += calculatePoints(match.length);
    }
    
    // Play success sound
    try {
      useAudio.getState().playSuccess();
    } catch (err) {
      console.log('Error playing sound:', err);
    }
    
    // Update board and score
    set({ 
      board: newBoard, 
      score: score + pointsEarned,
      catsCaptured: newCatsCaptured
    });
    
    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Apply gravity to make tiles fall
    await get().applyGravity();
    
    // Create special tiles
    const boardAfterGravity = get().board;
    const boardWithSpecials = JSON.parse(JSON.stringify(boardAfterGravity)) as Tile[][];
    
    for (const special of specialTilesToCreate) {
      if (special.position &&
          special.position.row >= 0 && 
          special.position.row < GRID_SIZE && 
          special.position.col >= 0 && 
          special.position.col < GRID_SIZE) {
        boardWithSpecials[special.position.row][special.position.col].type = special.type;
      }
    }
    
    set({ board: boardWithSpecials });
    
    // Fill empty spaces
    await get().fillEmptyTiles();
    
    // Check for new matches
    return await get().processMatches();
  },
  
  // Apply gravity to make tiles fall into empty spaces
  applyGravity: async () => {
    const { board } = get();
    const newBoard = JSON.parse(JSON.stringify(board)) as Tile[][];
    
    // Mark tiles as falling where needed
    for (let col = 0; col < GRID_SIZE; col++) {
      let emptySpaces = 0;
      
      // Start from the bottom, work up
      for (let row = GRID_SIZE - 1; row >= 0; row--) {
        const tile = newBoard[row][col];
        
        if (tile.matched) {
          // Count empty spaces
          emptySpaces++;
          newBoard[row][col] = { ...tile, falling: false, matched: true };
        } else if (emptySpaces > 0) {
          // Move this tile down by the number of empty spaces
          const newRow = row + emptySpaces;
          
          if (newRow < GRID_SIZE) {
            newBoard[newRow][col] = { 
              ...tile, 
              position: { row: newRow, col },
              falling: true 
            };
            
            // Mark original position as matched (empty)
            newBoard[row][col] = { 
              ...tile, 
              matched: true,
              falling: false 
            };
          }
        }
      }
    }
    
    // Update board to show falling animation
    set({ board: newBoard });
    
    // Wait for animation
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Clear matched tiles
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (newBoard[row][col].matched) {
          newBoard[row][col] = {
            id: `tile-${row}-${col}-new`,
            catId: -1, // Will be filled later
            type: TILE_TYPES.REGULAR,
            position: { row, col },
            new: true
          };
        } else if (newBoard[row][col].falling) {
          // Remove falling flag
          newBoard[row][col].falling = false;
        }
      }
    }
    
    set({ board: newBoard });
  },
  
  // Fill empty spaces with new tiles
  fillEmptyTiles: async () => {
    const { board } = get();
    const newBoard = JSON.parse(JSON.stringify(board)) as Tile[][];
    
    // Fill empty spaces with new random cats
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (newBoard[row][col].catId === -1) {
          // Select random cat (excluding power-ups)
          const randomCat = defaultCats[Math.floor(Math.random() * defaultCats.length)];
          
          newBoard[row][col] = {
            id: `tile-${row}-${col}-${Date.now()}`,
            catId: randomCat.id,
            type: TILE_TYPES.REGULAR,
            position: { row, col },
            new: true
          };
        }
      }
    }
    
    set({ board: newBoard });
    
    // Wait for new tiles animation
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Clear 'new' flags
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (newBoard[row][col].new) {
          newBoard[row][col].new = false;
        }
      }
    }
    
    set({ board: newBoard });
  },
  
  // Activate a power-up
  activatePowerUp: async (position, powerUpType) => {
    const { board, score } = get();
    const newBoard = JSON.parse(JSON.stringify(board)) as Tile[][];
    
    if (powerUpType === TILE_TYPES.BOMB) {
      // Bomb cat clears surrounding tiles (3x3 area)
      const { row, col } = position;
      let pointsEarned = 0;
      
      for (let r = Math.max(0, row - 1); r <= Math.min(GRID_SIZE - 1, row + 1); r++) {
        for (let c = Math.max(0, col - 1); c <= Math.min(GRID_SIZE - 1, col + 1); c++) {
          newBoard[r][c].matched = true;
          pointsEarned += 20; // Points per cleared tile
        }
      }
      
      set({ board: newBoard, score: score + pointsEarned });
      useAudio.getState().playSuccess();
      
      await new Promise(resolve => setTimeout(resolve, 300));
      await get().applyGravity();
      await get().fillEmptyTiles();
      await get().processMatches();
      
    } else if (powerUpType === TILE_TYPES.RAINBOW) {
      // Rainbow cat clears all tiles of one type
      const targetTile = newBoard[position.row][position.col];
      const targetCatId = targetTile.catId;
      let pointsEarned = 0;
      
      // Make sure we have a valid cat ID target
      if (targetCatId > 0 && targetCatId <= defaultCats.length) {
        for (let r = 0; r < GRID_SIZE; r++) {
          for (let c = 0; c < GRID_SIZE; c++) {
            // Only match regular tiles with the same catId
            if (newBoard[r][c].type === TILE_TYPES.REGULAR && 
                newBoard[r][c].catId === targetCatId) {
              newBoard[r][c].matched = true;
              pointsEarned += 50; // Increased points per cleared tile for rainbow power
            }
          }
        }
        
        // Add visual effect for the rainbow power
        newBoard[position.row][position.col].matched = true;
        
        set({ board: newBoard, score: score + pointsEarned });
        
        try {
          useAudio.getState().playSuccess();
        } catch (err) {
          console.log('Error playing sound:', err);
        }
        
        await new Promise(resolve => setTimeout(resolve, 300));
        await get().applyGravity();
        await get().fillEmptyTiles();
        await get().processMatches();
      } else {
        // If the cat ID is invalid, just process as a normal match
        await get().processMatches();
      }
    }
  },
  
  // Set custom images
  setCustomImage: (type, images) => {
    const { customImages } = get();
    
    if (type === 'cats') {
      set({ customImages: { ...customImages, cats: images } });
    } else if (type === 'rainbow') {
      set({ customImages: { ...customImages, rainbow: images[0] } });
    } else if (type === 'bomb') {
      set({ customImages: { ...customImages, bomb: images[0] } });
    }
    
    // Save to localStorage
    if (type === 'cats') {
      localStorage.setItem('cat_game_custom_cats', JSON.stringify(images));
    } else if (type === 'rainbow') {
      localStorage.setItem('cat_game_custom_rainbow', JSON.stringify(images[0]));
    } else if (type === 'bomb') {
      localStorage.setItem('cat_game_custom_bomb', JSON.stringify(images[0]));
    }
  },
  
  // Complete current level
  completeLevel: () => {
    const { currentLevel, levels, score, movesLeft } = get();
    
    if (!currentLevel) return;
    
    // Calculate stars earned
    const stars = calculateStars(currentLevel, score, movesLeft);
    
    // Update level status
    const updatedLevels = levels.map(level => {
      if (level.id === currentLevel.id) {
        return { 
          ...level, 
          completed: true,
          stars: Math.max(level.stars, stars)
        };
      } else if (level.id === currentLevel.id + 1) {
        // Unlock next level
        return { ...level, unlocked: true };
      }
      return level;
    });
    
    // Save levels
    saveLevels(updatedLevels);
    
    // Update state
    set({ 
      phase: "level_complete",
      levels: updatedLevels
    });
    
    useAudio.getState().playSuccess();
  },
  
  // Restart current level
  restartLevel: () => {
    const { currentLevel } = get();
    
    if (currentLevel) {
      get().initializeGame(currentLevel.id);
    } else {
      get().goToMenu();
    }
  },
  
  // Go to menu
  goToMenu: () => {
    set({ phase: "menu" });
  },
  
  // Go to level select screen
  goToLevelSelect: () => {
    set({ phase: "level_select" });
  },
  
  // Go to settings
  goToSettings: () => {
    set({ phase: "settings" });
  }
}));
