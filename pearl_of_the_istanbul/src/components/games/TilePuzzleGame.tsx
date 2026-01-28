import React, { useState, useEffect, useCallback, useRef } from 'react';
import './Games.css';

// 4x4 puzzle (15-puzzle)
const GRID_SIZE = 4;
const TOTAL_TILES = GRID_SIZE * GRID_SIZE;

interface TilePuzzleGameProps {
  language?: 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it';
}

interface TouchRef {
  x: number;
  y: number;
}

const translations = {
  tr: {
    title: 'Karo Bulmaca',
    moves: 'Hamle',
    time: 'Süre',
    shuffle: 'Karıştır',
    solved: 'Tebrikler! 🎉',
    solvedSub: 'Bulmacayı çözdün!',
    playAgain: 'Tekrar Oyna',
    hint: 'Karoları kaydırarak 1-15 sırasına diz'
  },
  en: {
    title: 'Tile Puzzle',
    moves: 'Moves',
    time: 'Time',
    shuffle: 'Shuffle',
    solved: 'Congratulations! 🎉',
    solvedSub: 'You solved the puzzle!',
    playAgain: 'Play Again',
    hint: 'Slide tiles to arrange 1-15 in order'
  },
  de: {
    title: 'Kachel-Puzzle',
    moves: 'Züge',
    time: 'Zeit',
    shuffle: 'Mischen',
    solved: 'Glückwunsch! 🎉',
    solvedSub: 'Du hast das Puzzle gelöst!',
    playAgain: 'Nochmal spielen',
    hint: 'Verschiebe die Kacheln in die richtige Reihenfolge'
  },
  fr: {
    title: 'Puzzle Tuiles',
    moves: 'Coups',
    time: 'Temps',
    shuffle: 'Mélanger',
    solved: 'Félicitations! 🎉',
    solvedSub: 'Tu as résolu le puzzle!',
    playAgain: 'Rejouer',
    hint: 'Glisse les tuiles pour les remettre en ordre'
  },
  es: {
    title: 'Rompecabezas',
    moves: 'Movimientos',
    time: 'Tiempo',
    shuffle: 'Mezclar',
    solved: '¡Felicidades! 🎉',
    solvedSub: '¡Resolviste el rompecabezas!',
    playAgain: 'Jugar de nuevo',
    hint: 'Desliza las fichas para ordenarlas del 1 al 15'
  },
  it: {
    title: 'Puzzle Tessere',
    moves: 'Mosse',
    time: 'Tempo',
    shuffle: 'Mescola',
    solved: 'Congratulazioni! 🎉',
    solvedSub: 'Hai risolto il puzzle!',
    playAgain: 'Gioca ancora',
    hint: 'Scorri le tessere per ordinarle da 1 a 15'
  }
};

// Check if puzzle is solvable
const isSolvable = (tiles: number[]): boolean => {
  let inversions = 0;
  const tilesWithoutEmpty = tiles.filter(t => t !== 0);
  
  for (let i = 0; i < tilesWithoutEmpty.length; i++) {
    for (let j = i + 1; j < tilesWithoutEmpty.length; j++) {
      if (tilesWithoutEmpty[i] > tilesWithoutEmpty[j]) {
        inversions++;
      }
    }
  }
  
  const emptyRowFromBottom = GRID_SIZE - Math.floor(tiles.indexOf(0) / GRID_SIZE);
  
  // For 4x4 grid: solvable if (inversions + empty row from bottom) is odd
  return (inversions + emptyRowFromBottom) % 2 === 1;
};

// Generate shuffled tiles
const generateTiles = (): number[] => {
  let tiles: number[];
  
  do {
    tiles = Array.from({ length: TOTAL_TILES - 1 }, (_, i) => i + 1);
    tiles.push(0); // Empty tile
    
    // Fisher-Yates shuffle
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
  } while (!isSolvable(tiles));
  
  return tiles;
};

// Check if solved
const isSolved = (tiles: number[]): boolean => {
  for (let i = 0; i < TOTAL_TILES - 1; i++) {
    if (tiles[i] !== i + 1) return false;
  }
  return tiles[TOTAL_TILES - 1] === 0;
};

// Get adjacent positions to empty tile
const getMovableTiles = (tiles: number[]): number[] => {
  const emptyIndex = tiles.indexOf(0);
  const row = Math.floor(emptyIndex / GRID_SIZE);
  const col = emptyIndex % GRID_SIZE;
  const movable: number[] = [];
  
  // Up
  if (row > 0) movable.push(emptyIndex - GRID_SIZE);
  // Down
  if (row < GRID_SIZE - 1) movable.push(emptyIndex + GRID_SIZE);
  // Left
  if (col > 0) movable.push(emptyIndex - 1);
  // Right
  if (col < GRID_SIZE - 1) movable.push(emptyIndex + 1);
  
  return movable;
};

const TilePuzzleGame: React.FC<TilePuzzleGameProps> = ({ language = 'tr' }) => {
  const [tiles, setTiles] = useState<number[]>(() => generateTiles());
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [solved, setSolved] = useState(false);
  const [movingTile, setMovingTile] = useState<number | null>(null);
  const touchStartRef = useRef<TouchRef | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  
  const t = translations[language];

  // Timer
  useEffect(() => {
    if (!isPlaying || solved) return;
    
    const interval = setInterval(() => {
      setTime(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isPlaying, solved]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTileClick = useCallback((index: number) => {
    if (solved) return;
    
    const movableTiles = getMovableTiles(tiles);
    
    if (!movableTiles.includes(index)) return;
    
    // Start game on first move
    if (!isPlaying) setIsPlaying(true);
    
    // Animate the tile
    setMovingTile(index);
    
    setTimeout(() => {
      setTiles(prev => {
        const newTiles = [...prev];
        const emptyIndex = newTiles.indexOf(0);
        [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
        
        // Check if solved
        if (isSolved(newTiles)) {
          setSolved(true);
          setIsPlaying(false);
        }
        
        return newTiles;
      });
      
      setMoves(prev => prev + 1);
      setMovingTile(null);
    }, 100);
  }, [tiles, solved, isPlaying]);

  const shufflePuzzle = () => {
    setTiles(generateTiles());
    setMoves(0);
    setTime(0);
    setIsPlaying(false);
    setSolved(false);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (solved) return;
      
      const emptyIndex = tiles.indexOf(0);
      const row = Math.floor(emptyIndex / GRID_SIZE);
      const col = emptyIndex % GRID_SIZE;
      let targetIndex = -1;
      
      // Arrow keys move the empty space, so we move the opposite tile
      switch (e.key) {
        case 'ArrowUp':
          if (row < GRID_SIZE - 1) targetIndex = emptyIndex + GRID_SIZE;
          break;
        case 'ArrowDown':
          if (row > 0) targetIndex = emptyIndex - GRID_SIZE;
          break;
        case 'ArrowLeft':
          if (col < GRID_SIZE - 1) targetIndex = emptyIndex + 1;
          break;
        case 'ArrowRight':
          if (col > 0) targetIndex = emptyIndex - 1;
          break;
      }
      
      if (targetIndex !== -1) {
        e.preventDefault();
        handleTileClick(targetIndex);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tiles, solved, handleTileClick]);

  // Touch/Swipe controls
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    // Prevent page scroll while swiping
    if (touchStartRef.current) {
      e.preventDefault();
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current || solved) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    
    const minSwipe = 30;
    const emptyIndex = tiles.indexOf(0);
    const row = Math.floor(emptyIndex / GRID_SIZE);
    const col = emptyIndex % GRID_SIZE;
    let targetIndex = -1;
    
    // Swipe moves the tile INTO the empty space
    // So swipe right means move the tile on the left of empty space
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > minSwipe) {
        if (deltaX > 0 && col > 0) {
          // Swipe right - move tile from left
          targetIndex = emptyIndex - 1;
        } else if (deltaX < 0 && col < GRID_SIZE - 1) {
          // Swipe left - move tile from right
          targetIndex = emptyIndex + 1;
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > minSwipe) {
        if (deltaY > 0 && row > 0) {
          // Swipe down - move tile from above
          targetIndex = emptyIndex - GRID_SIZE;
        } else if (deltaY < 0 && row < GRID_SIZE - 1) {
          // Swipe up - move tile from below
          targetIndex = emptyIndex + GRID_SIZE;
        }
      }
    }
    
    if (targetIndex !== -1) {
      handleTileClick(targetIndex);
    }
    
    touchStartRef.current = null;
  }, [tiles, solved, handleTileClick]);

  const getTileColor = (value: number): string => {
    if (value === 0) return 'transparent';
    
    // Gradient colors based on value
    const hue = ((value - 1) / (TOTAL_TILES - 1)) * 200 + 180; // Blue to purple range
    return `hsl(${hue}, 70%, 55%)`;
  };

  const isMovable = (index: number): boolean => {
    return getMovableTiles(tiles).includes(index);
  };

  return (
    <div className="game-container puzzle-game">
      <div className="game-score-board">
        <span>{t.moves}: {moves}</span>
        <span>{t.time}: {formatTime(time)}</span>
      </div>

      <div 
        ref={gridRef}
        className="puzzle-grid"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {tiles.map((value, index) => {
          const movable = isMovable(index);
          return (
            <button
              key={index}
              className={`puzzle-tile ${value === 0 ? 'empty' : ''} ${movable ? 'movable' : ''} ${movingTile === index ? 'moving' : ''}`}
              style={{
                backgroundColor: getTileColor(value),
                cursor: value !== 0 && movable ? 'pointer' : 'default'
              }}
              onClick={() => handleTileClick(index)}
              disabled={value === 0 || !movable}
              aria-label={value === 0 ? 'Empty' : `Tile ${value}`}
            >
              {value !== 0 && value}
            </button>
          );
        })}
      </div>

      <p className="puzzle-hint">{t.hint}</p>

      <div className="game-controls">
        <button className="game-btn game-btn-primary" onClick={shufflePuzzle}>
          🔀 {t.shuffle}
        </button>
      </div>

      {/* Solved Overlay */}
      {solved && (
        <div className="game-over-overlay puzzle-solved">
          <h2>{t.solved}</h2>
          <p>{t.solvedSub}</p>
          <p>{t.moves}: {moves} | {t.time}: {formatTime(time)}</p>
          <button className="game-btn game-btn-primary" onClick={shufflePuzzle}>
            {t.playAgain}
          </button>
        </div>
      )}
    </div>
  );
};

export default TilePuzzleGame;
