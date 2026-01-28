import React, { useState, useEffect, useCallback, useRef } from 'react';
import './Games.css';

interface Game2048Props {
  language?: 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it';
}

interface Tile {
  id: number;
  value: number;
  row: number;
  col: number;
  isNew?: boolean;
  isMerged?: boolean;
}

const translations = {
  tr: {
    title: '2048',
    score: 'Skor',
    best: 'En İyi',
    newGame: 'Yeni Oyun',
    gameOver: 'Oyun Bitti!',
    youWin: 'Kazandın! 🎉',
    continue: 'Devam Et',
    tryAgain: 'Tekrar Dene',
    hint: 'Kaydırarak sayıları birleştir!',
    swipe: '← ↑ ↓ → veya kaydır'
  },
  en: {
    title: '2048',
    score: 'Score',
    best: 'Best',
    newGame: 'New Game',
    gameOver: 'Game Over!',
    youWin: 'You Win! 🎉',
    continue: 'Continue',
    tryAgain: 'Try Again',
    hint: 'Swipe to merge numbers!',
    swipe: '← ↑ ↓ → or swipe'
  },
  de: {
    title: '2048',
    score: 'Punkte',
    best: 'Beste',
    newGame: 'Neues Spiel',
    gameOver: 'Spiel vorbei!',
    youWin: 'Gewonnen! 🎉',
    continue: 'Weiter',
    tryAgain: 'Nochmal',
    hint: 'Wische um Zahlen zu verbinden!',
    swipe: '← ↑ ↓ → oder wischen'
  },
  fr: {
    title: '2048',
    score: 'Score',
    best: 'Meilleur',
    newGame: 'Nouveau',
    gameOver: 'Fin du jeu!',
    youWin: 'Gagné! 🎉',
    continue: 'Continuer',
    tryAgain: 'Réessayer',
    hint: 'Glissez pour fusionner!',
    swipe: '← ↑ ↓ → ou glisser'
  },
  es: {
    title: '2048',
    score: 'Puntos',
    best: 'Mejor',
    newGame: 'Nuevo',
    gameOver: '¡Fin del juego!',
    youWin: '¡Ganaste! 🎉',
    continue: 'Continuar',
    tryAgain: 'Reintentar',
    hint: '¡Desliza para fusionar!',
    swipe: '← ↑ ↓ → o deslizar'
  },
  it: {
    title: '2048',
    score: 'Punti',
    best: 'Migliore',
    newGame: 'Nuovo',
    gameOver: 'Fine del gioco!',
    youWin: 'Hai vinto! 🎉',
    continue: 'Continua',
    tryAgain: 'Riprova',
    hint: 'Scorri per unire i numeri!',
    swipe: '← ↑ ↓ → o scorri'
  }
};

type Grid = number[][];

const GRID_SIZE = 4;
let tileIdCounter = 0;

const Game2048: React.FC<Game2048Props> = ({ language = 'tr' }) => {
  const [tiles, setTiles] = useState<Tile[]>(() => initializeTiles());
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem('2048-best');
    return saved ? parseInt(saved) : 0;
  });
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [keepPlaying, setKeepPlaying] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const t = translations[language];

  function initializeTiles(): Tile[] {
    const tiles: Tile[] = [];
    const positions = getEmptyCells([]);
    
    // Add 2 random tiles
    for (let i = 0; i < 2; i++) {
      if (positions.length > 0) {
        const randomIndex = Math.floor(Math.random() * positions.length);
        const [row, col] = positions.splice(randomIndex, 1)[0];
        tiles.push({
          id: tileIdCounter++,
          value: Math.random() < 0.9 ? 2 : 4,
          row,
          col,
          isNew: true
        });
      }
    }
    return tiles;
  }

  function getEmptyCells(currentTiles: Tile[]): [number, number][] {
    const occupied = new Set(currentTiles.map(t => `${t.row},${t.col}`));
    const empty: [number, number][] = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (!occupied.has(`${i},${j}`)) empty.push([i, j]);
      }
    }
    return empty;
  }

  function addRandomTile(currentTiles: Tile[]): Tile | null {
    const emptyCells = getEmptyCells(currentTiles);
    if (emptyCells.length === 0) return null;
    
    const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    return {
      id: tileIdCounter++,
      value: Math.random() < 0.9 ? 2 : 4,
      row,
      col,
      isNew: true
    };
  }

  // Convert tiles array to grid for game logic
  function tilesToGrid(currentTiles: Tile[]): Grid {
    const grid: Grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
    currentTiles.forEach(tile => {
      grid[tile.row][tile.col] = tile.value;
    });
    return grid;
  }

  function moveTiles(direction: 'up' | 'down' | 'left' | 'right', currentTiles: Tile[]): { newTiles: Tile[]; addedScore: number; moved: boolean } {
    // Create a working copy
    let workingTiles = currentTiles.map(t => ({ ...t, isNew: false, isMerged: false }));
    let addedScore = 0;
    let moved = false;

    // Determine iteration order based on direction
    const getOrder = () => {
      switch (direction) {
        case 'left': return { primary: 'row', secondary: 'col', reverse: false };
        case 'right': return { primary: 'row', secondary: 'col', reverse: true };
        case 'up': return { primary: 'col', secondary: 'row', reverse: false };
        case 'down': return { primary: 'col', secondary: 'row', reverse: true };
      }
    };

    const order = getOrder();
    const newTiles: Tile[] = [];
    const mergedPositions = new Set<string>();

    // Process each line (row or column)
    for (let primary = 0; primary < GRID_SIZE; primary++) {
      // Get tiles in this line
      let lineTiles = workingTiles.filter(t => 
        order.primary === 'row' ? t.row === primary : t.col === primary
      );

      // Sort by secondary axis
      lineTiles.sort((a, b) => {
        const aVal = order.primary === 'row' ? a.col : a.row;
        const bVal = order.primary === 'row' ? b.col : b.row;
        return order.reverse ? bVal - aVal : aVal - bVal;
      });

      // Process line - slide and merge
      let targetPos = order.reverse ? GRID_SIZE - 1 : 0;
      
      for (let i = 0; i < lineTiles.length; i++) {
        const tile = lineTiles[i];
        const posKey = order.primary === 'row' 
          ? `${primary},${targetPos}` 
          : `${targetPos},${primary}`;

        // Check if we can merge with previous tile
        const prevTile = newTiles.find(t => {
          if (order.primary === 'row') {
            return t.row === primary && t.col === targetPos && t.value === tile.value;
          } else {
            return t.col === primary && t.row === targetPos && t.value === tile.value;
          }
        });

        if (prevTile && !mergedPositions.has(posKey)) {
          // Merge
          prevTile.value *= 2;
          prevTile.isMerged = true;
          addedScore += prevTile.value;
          mergedPositions.add(posKey);
          moved = true;
        } else {
          // Move to target position
          const newRow = order.primary === 'row' ? primary : targetPos;
          const newCol = order.primary === 'row' ? targetPos : primary;
          
          if (tile.row !== newRow || tile.col !== newCol) {
            moved = true;
          }
          
          newTiles.push({
            ...tile,
            row: newRow,
            col: newCol
          });
          
          targetPos += order.reverse ? -1 : 1;
        }
      }
    }

    return { newTiles, addedScore, moved };
  }

  function move(direction: 'up' | 'down' | 'left' | 'right') {
    if (gameOver && !keepPlaying) return;

    const { newTiles, addedScore, moved } = moveTiles(direction, tiles);

    if (!moved) return;

    // Add new random tile
    const randomTile = addRandomTile(newTiles);
    const finalTiles = randomTile ? [...newTiles, randomTile] : newTiles;
    
    setTiles(finalTiles);
    
    const newScore = score + addedScore;
    setScore(newScore);
    
    if (newScore > bestScore) {
      setBestScore(newScore);
      localStorage.setItem('2048-best', newScore.toString());
    }

    // Check for win
    if (!won && !keepPlaying) {
      if (finalTiles.some(t => t.value === 2048)) {
        setWon(true);
        return;
      }
    }

    // Check for game over
    const grid = tilesToGrid(finalTiles);
    if (isGameOver(grid)) {
      setGameOver(true);
    }
  }

  function isGameOver(grid: Grid): boolean {
    // Check for empty cells
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (grid[i][j] === 0) return false;
      }
    }
    
    // Check for possible merges
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const current = grid[i][j];
        if (j < GRID_SIZE - 1 && grid[i][j + 1] === current) return false;
        if (i < GRID_SIZE - 1 && grid[i + 1][j] === current) return false;
      }
    }
    
    return true;
  }

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      const direction = e.key.replace('Arrow', '').toLowerCase() as 'up' | 'down' | 'left' | 'right';
      move(direction);
    }
  }, [tiles, score, gameOver, won, keepPlaying]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Touch handling with better swipe detection
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Prevent page scroll while swiping on game
    if (touchStartRef.current) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    
    const minSwipe = 30; // Daha hassas swipe algılama
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > minSwipe) {
        move(deltaX > 0 ? 'right' : 'left');
      }
    } else {
      if (Math.abs(deltaY) > minSwipe) {
        move(deltaY > 0 ? 'down' : 'up');
      }
    }
    
    touchStartRef.current = null;
  };

  const resetGame = () => {
    tileIdCounter = 0;
    setTiles(initializeTiles());
    setScore(0);
    setGameOver(false);
    setWon(false);
    setKeepPlaying(false);
  };

  const continuePlaying = () => {
    setKeepPlaying(true);
    setWon(false);
  };

  const getTileColor = (value: number): string => {
    const colors: Record<number, string> = {
      0: 'rgba(238, 228, 218, 0.35)',
      2: '#eee4da',
      4: '#ede0c8',
      8: '#f2b179',
      16: '#f59563',
      32: '#f67c5f',
      64: '#f65e3b',
      128: '#edcf72',
      256: '#edcc61',
      512: '#edc850',
      1024: '#edc53f',
      2048: '#edc22e',
    };
    return colors[value] || '#3c3a32';
  };

  const getTextColor = (value: number): string => {
    return value <= 4 ? '#776e65' : '#f9f6f2';
  };

  const getFontSize = (value: number): string => {
    if (value < 100) return '2rem';
    if (value < 1000) return '1.7rem';
    return '1.3rem';
  };

  return (
    <div className="game-container game-2048">
      <div className="game-2048-header">
        <div className="score-box">
          <span className="score-label">{t.score}</span>
          <span className="score-value">{score}</span>
        </div>
        <div className="score-box best">
          <span className="score-label">{t.best}</span>
          <span className="score-value">{bestScore}</span>
        </div>
      </div>

      <div 
        ref={gridRef}
        className="game-2048-grid"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Background cells */}
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => (
          <div key={`bg-${index}`} className="tile-2048-bg" />
        ))}
        
        {/* Animated tiles */}
        {tiles.map((tile) => (
          <div
            key={tile.id}
            className={`tile-2048 tile-filled ${tile.isNew ? 'tile-new' : ''} ${tile.isMerged ? 'tile-merged' : ''} ${tile.value >= 2048 ? 'tile-super' : ''}`}
            style={{
              backgroundColor: getTileColor(tile.value),
              color: getTextColor(tile.value),
              fontSize: getFontSize(tile.value),
              '--tile-row': tile.row,
              '--tile-col': tile.col,
            } as React.CSSProperties}
          >
            {tile.value}
          </div>
        ))}

        {/* Win Overlay */}
        {won && !keepPlaying && (
          <div className="game-2048-overlay win">
            <h2>{t.youWin}</h2>
            <div className="overlay-buttons">
              <button className="game-btn game-btn-primary" onClick={continuePlaying}>
                {t.continue}
              </button>
              <button className="game-btn game-btn-secondary" onClick={resetGame}>
                {t.newGame}
              </button>
            </div>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameOver && (
          <div className="game-2048-overlay gameover">
            <h2>{t.gameOver}</h2>
            <p>{t.score}: {score}</p>
            <button className="game-btn game-btn-primary" onClick={resetGame}>
              {t.tryAgain}
            </button>
          </div>
        )}
      </div>

      <div className="game-2048-footer">
        <p className="hint">{t.swipe}</p>
        <button className="game-btn game-btn-secondary" onClick={resetGame}>
          🔄 {t.newGame}
        </button>
      </div>
    </div>
  );
};

export default Game2048;
