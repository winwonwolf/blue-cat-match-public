import { defaultCats, TILE_TYPES } from "../assets/cats";
import { getLocalStorage, setLocalStorage } from "./utils";

export type Position = {
  row: number;
  col: number;
};

export type Tile = {
  id: string;
  catId: number;
  type: string;
  matched?: boolean;
  falling?: boolean;
  new?: boolean;
  position: Position;
};

// Constants for the game
export const GRID_SIZE = 8;
export const ANIMATION_DURATION = 300; // milliseconds
export const MIN_MATCH_SIZE = 3;

// Point values for different match sizes
export const MATCH_POINTS = {
  3: 50,
  4: 100,
  5: 200,
  6: 300,
  7: 500,
  8: 1000,
};

// Level definitions
export type LevelObjective = {
  type: "score" | "cat";
  target: number;
  catId?: number;
  description: string;
};

export type Level = {
  id: number;
  name: string;
  moves: number;
  objectives: LevelObjective[];
  unlocked: boolean;
  completed: boolean;
  stars: number;
};

export const generateInitialLevels = (): Level[] => {
  const levels: Level[] = [];
  
  for (let i = 1; i <= 50; i++) {
    const baseMovesAllowed = 20;
    const movesIncreaseRate = 1.05; // Increase move limit by 5% each level
    const moves = Math.round(baseMovesAllowed + (i * movesIncreaseRate));
    
    const scoreTarget = 1000 + (i * 500); // Increase score target with each level
    
    // Create different objectives based on level number
    const objectives: LevelObjective[] = [
      {
        type: "score",
        target: scoreTarget,
        description: `Score ${scoreTarget} points`
      }
    ];
    
    // Every 3rd level, add an objective to collect a specific cat
    if (i % 3 === 0) {
      const randomCatId = defaultCats[Math.floor(Math.random() * defaultCats.length)].id;
      const targetCount = 10 + (Math.floor(i / 3) * 5); // More cats needed in higher levels
      
      objectives.push({
        type: "cat",
        target: targetCount,
        catId: randomCatId,
        description: `Collect ${targetCount} ${defaultCats.find(cat => cat.id === randomCatId)?.name || 'cats'}`
      });
    }
    
    levels.push({
      id: i,
      name: `Level ${i}`,
      moves,
      objectives,
      unlocked: i === 1, // Only first level is unlocked initially
      completed: false,
      stars: 0
    });
  }
  
  return levels;
};

// Get levels from localStorage or generate initial ones
export const getLevels = (): Level[] => {
  const savedLevels = getLocalStorage("cat_game_levels");
  if (savedLevels) {
    return savedLevels;
  }
  
  const initialLevels = generateInitialLevels();
  setLocalStorage("cat_game_levels", initialLevels);
  return initialLevels;
};

// Save levels to localStorage
export const saveLevels = (levels: Level[]): void => {
  setLocalStorage("cat_game_levels", levels);
};

// Create a new game board
export const createBoard = (): Tile[][] => {
  const board: Tile[][] = [];
  
  for (let row = 0; row < GRID_SIZE; row++) {
    board[row] = [];
    
    for (let col = 0; col < GRID_SIZE; col++) {
      // Select random cat for initial board (excluding power-ups)
      const randomCat = defaultCats[Math.floor(Math.random() * defaultCats.length)];
      
      board[row][col] = {
        id: `tile-${row}-${col}`,
        catId: randomCat.id,
        type: TILE_TYPES.REGULAR,
        position: { row, col }
      };
    }
  }
  
  // Remove any initial matches
  return resolveInitialMatches(board);
};

// Ensure no matches exist when the board is created
const resolveInitialMatches = (board: Tile[][]): Tile[][] => {
  let boardCopy = JSON.parse(JSON.stringify(board)) as Tile[][];
  let matchesExist = true;
  
  // Keep replacing tiles until there are no initial matches
  while (matchesExist) {
    const matches = findAllMatches(boardCopy);
    
    if (matches.length === 0) {
      matchesExist = false;
    } else {
      // Replace matched tiles with new random ones
      for (const match of matches) {
        for (const pos of match) {
          const usedCatIds = [
            pos.row > 0 ? boardCopy[pos.row - 1][pos.col].catId : -1,
            pos.row < GRID_SIZE - 1 ? boardCopy[pos.row + 1][pos.col].catId : -1,
            pos.col > 0 ? boardCopy[pos.row][pos.col - 1].catId : -1,
            pos.col < GRID_SIZE - 1 ? boardCopy[pos.row][pos.col + 1].catId : -1,
          ];
          
          let availableCats = defaultCats.filter(cat => 
            !usedCatIds.includes(cat.id) && 
            cat.id !== boardCopy[pos.row][pos.col].catId
          );
          
          // If we've boxed ourselves in, just use any cat that's different from current
          if (availableCats.length === 0) {
            availableCats = defaultCats.filter(cat => 
              cat.id !== boardCopy[pos.row][pos.col].catId
            );
          }
          
          const newCatId = availableCats[Math.floor(Math.random() * availableCats.length)].id;
          
          boardCopy[pos.row][pos.col] = {
            ...boardCopy[pos.row][pos.col],
            catId: newCatId
          };
        }
      }
    }
  }
  
  return boardCopy;
};

// Find all matches on the board
export const findAllMatches = (board: Tile[][]): Position[][] => {
  const matches: Position[][] = [];
  
  // Check horizontal matches
  for (let row = 0; row < GRID_SIZE; row++) {
    let currentMatch: Position[] = [];
    let currentCatId = -1;
    
    for (let col = 0; col < GRID_SIZE; col++) {
      const currentCat = board[row][col];
      
      // Only consider regular tiles for matches
      if (currentCat.type === TILE_TYPES.REGULAR) {
        if (currentCatId === currentCat.catId) {
          // Continue current match
          currentMatch.push({ row, col });
        } else {
          // Check if previous match is valid
          if (currentMatch.length >= MIN_MATCH_SIZE) {
            matches.push([...currentMatch]);
          }
          
          // Start new match
          currentMatch = [{ row, col }];
          currentCatId = currentCat.catId;
        }
      } else {
        // Power-up tile breaks the match
        if (currentMatch.length >= MIN_MATCH_SIZE) {
          matches.push([...currentMatch]);
        }
        currentMatch = [];
        currentCatId = -1;
      }
    }
    
    // Check if we ended with a match
    if (currentMatch.length >= MIN_MATCH_SIZE) {
      matches.push([...currentMatch]);
    }
  }
  
  // Check vertical matches
  for (let col = 0; col < GRID_SIZE; col++) {
    let currentMatch: Position[] = [];
    let currentCatId = -1;
    
    for (let row = 0; row < GRID_SIZE; row++) {
      const currentCat = board[row][col];
      
      // Only consider regular tiles for matches
      if (currentCat.type === TILE_TYPES.REGULAR) {
        if (currentCatId === currentCat.catId) {
          // Continue current match
          currentMatch.push({ row, col });
        } else {
          // Check if previous match is valid
          if (currentMatch.length >= MIN_MATCH_SIZE) {
            matches.push([...currentMatch]);
          }
          
          // Start new match
          currentMatch = [{ row, col }];
          currentCatId = currentCat.catId;
        }
      } else {
        // Power-up tile breaks the match
        if (currentMatch.length >= MIN_MATCH_SIZE) {
          matches.push([...currentMatch]);
        }
        currentMatch = [];
        currentCatId = -1;
      }
    }
    
    // Check if we ended with a match
    if (currentMatch.length >= MIN_MATCH_SIZE) {
      matches.push([...currentMatch]);
    }
  }
  
  return matches;
};

// Check if a match forms a special pattern for power-ups
export const checkForSpecialPatterns = (match: Position[]): { type: string | null, position: Position | null } => {
  // Match of 4 in a row - creates a Bomb Cat
  if (match.length === 4) {
    return { type: TILE_TYPES.BOMB, position: match[Math.floor(match.length / 2)] };
  }
  
  // Match of 5 in L or T shape - creates a Rainbow Cat
  if (match.length >= 5) {
    // Check for L or T shape (we would need to analyze the positions)
    // For simplicity, we'll assume any 5+ match creates a Rainbow Cat
    return { type: TILE_TYPES.RAINBOW, position: match[Math.floor(match.length / 2)] };
  }
  
  return { type: null, position: null };
};

// Get custom images if available
export const getCustomImages = () => {
  return {
    cats: getLocalStorage("cat_game_custom_cats") || null,
    rainbow: getLocalStorage("cat_game_custom_rainbow") || null,
    bomb: getLocalStorage("cat_game_custom_bomb") || null
  };
};

// Save custom image
export const saveCustomImage = (type: 'cats' | 'rainbow' | 'bomb', images: string[]) => {
  if (type === 'cats') {
    setLocalStorage("cat_game_custom_cats", images);
  } else if (type === 'rainbow') {
    setLocalStorage("cat_game_custom_rainbow", images[0]);
  } else if (type === 'bomb') {
    setLocalStorage("cat_game_custom_bomb", images[0]);
  }
};

// Check if movement is valid (adjacent tiles only)
export const isValidMove = (from: Position, to: Position): boolean => {
  const rowDiff = Math.abs(from.row - to.row);
  const colDiff = Math.abs(from.col - to.col);
  
  // Valid move: adjacent horizontally or vertically (not diagonally)
  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
};

// Check if a move would result in a match
export const wouldCreateMatch = (board: Tile[][], from: Position, to: Position): boolean => {
  // Create a copy of the board with the swap applied
  const boardCopy = JSON.parse(JSON.stringify(board)) as Tile[][];
  const temp = { ...boardCopy[from.row][from.col] };
  
  boardCopy[from.row][from.col] = { 
    ...boardCopy[to.row][to.col],
    position: from
  };
  boardCopy[to.row][to.col] = { 
    ...temp,
    position: to
  };
  
  // Find matches in the new board
  const matches = findAllMatches(boardCopy);
  
  return matches.length > 0;
};

// Calculate points based on match size
export const calculatePoints = (matchSize: number): number => {
  // Use predefined point values or calculate for large matches
  return MATCH_POINTS[matchSize as keyof typeof MATCH_POINTS] || (matchSize * 150);
};

// Check if level is completed
export const isLevelCompleted = (level: Level, score: number, catsCaptured: Record<number, number>): boolean => {
  for (const objective of level.objectives) {
    if (objective.type === "score" && score < objective.target) {
      return false;
    }
    
    if (objective.type === "cat" && objective.catId) {
      const captured = catsCaptured[objective.catId] || 0;
      if (captured < objective.target) {
        return false;
      }
    }
  }
  
  return true;
};

// Calculate stars based on performance
export const calculateStars = (level: Level, score: number, movesLeft: number): number => {
  // Base star calculation on score and moves left
  const scoreObjective = level.objectives.find(obj => obj.type === "score");
  if (!scoreObjective) return 1;
  
  const targetScore = scoreObjective.target;
  
  if (score >= targetScore * 1.5 && movesLeft > 0) {
    return 3; // Excellent performance
  } else if (score >= targetScore * 1.2) {
    return 2; // Good performance
  } else {
    return 1; // Completed but not exceptional
  }
};
