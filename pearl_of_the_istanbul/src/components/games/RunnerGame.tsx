import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Games.css';

// Oyun Sabitleri
const SPAWN_RATE_INITIAL = 1200; // ms
const PLAYER_Y_POS = 80; // % from top
const INITIAL_SPEED = 1.2; // % per frame

interface GameObject {
  id: number;
  lane: 0 | 1 | 2;
  y: number; // % from top (0 to 100+)
  type: 'coin' | 'rock' | 'barrier' | 'tree';
  collected?: boolean;
  passed?: boolean; // Object has passed the player - no collision check needed
}

interface GameState {
  playerLane: 0 | 1 | 2;
  objects: GameObject[];
  score: number;
  coins: number;
  isPlaying: boolean;
  isGameOver: boolean;
  speed: number;
}

interface TouchRef {
  x: number;
  y: number;
  time: number;
}

const RunnerGame: React.FC = () => {
  // UI state for rendering
  const [displayState, setDisplayState] = useState<GameState>({
    playerLane: 1,
    objects: [],
    score: 0,
    coins: 0,
    isPlaying: false,
    isGameOver: false,
    speed: INITIAL_SPEED
  });
  const [runFrame, setRunFrame] = useState(0);

  // Game state refs (for game loop - avoids stale closures)
  const gameStateRef = useRef<GameState>({
    playerLane: 1,
    objects: [],
    score: 0,
    coins: 0,
    isPlaying: false,
    isGameOver: false,
    speed: INITIAL_SPEED
  });
  const requestRef = useRef<number>(0);
  const lastSpawnTime = useRef(0);
  const lastFrameTime = useRef(0);
  const nextId = useRef(0);
  const touchStartRef = useRef<TouchRef | null>(null);
  const roadRef = useRef<HTMLDivElement>(null);

  // Sync display state with game state
  const syncDisplayState = useCallback(() => {
    setDisplayState({ ...gameStateRef.current });
  }, []);

  // Animation loop for running sprite
  useEffect(() => {
    if (!displayState.isPlaying) return;
    const interval = setInterval(() => {
      setRunFrame(prev => (prev === 0 ? 1 : 0));
    }, 150);
    return () => clearInterval(interval);
  }, [displayState.isPlaying]);

  const spawnObject = useCallback(() => {
    const lanes: (0 | 1 | 2)[] = [0, 1, 2];
    const lane = lanes[Math.floor(Math.random() * lanes.length)];
    const typeRoll = Math.random();
    let type: GameObject['type'] = 'coin';
    
    if (typeRoll > 0.65) type = 'rock';
    else if (typeRoll > 0.45) type = 'barrier';
    else if (typeRoll > 0.35) type = 'tree';
    
    const newObject: GameObject = {
      id: nextId.current++,
      lane,
      y: -10,
      type
    };

    gameStateRef.current.objects.push(newObject);
  }, []);

  const gameLoop = useCallback((time: number) => {
    const state = gameStateRef.current;
    
    if (!state.isPlaying || state.isGameOver) {
      return;
    }

    // Calculate delta time for smooth movement
    const deltaTime = lastFrameTime.current ? (time - lastFrameTime.current) / 16.67 : 1;
    lastFrameTime.current = time;

    // Spawn logic - spawn more frequently as score increases
    const currentSpawnRate = Math.max(500, SPAWN_RATE_INITIAL - state.score * 1.5);
    
    if (time - lastSpawnTime.current > currentSpawnRate) {
      spawnObject();
      lastSpawnTime.current = time;
    }

    // Move objects & Collision Detection
    const newObjects: GameObject[] = [];
    let gameOver = false;
    let coinsCollected = 0;
    let scoreFromCoins = 0;

    for (const obj of state.objects) {
      if (obj.collected) continue;

      const newY = obj.y + state.speed * deltaTime;
      
      // Collision detection - proper hitbox calculation
      // Object: top = newY, bottom = newY + OBJECT_HEIGHT (~15%)
      // Player: top = PLAYER_Y_POS - 5, bottom = PLAYER_Y_POS + 5
      const OBJECT_HEIGHT = 12; // Object height in %
      const PLAYER_HEIGHT = 6; // Player hitbox height in %
      
      const objectTop = newY;
      const objectBottom = newY + OBJECT_HEIGHT;
      const playerTop = PLAYER_Y_POS - PLAYER_HEIGHT;
      const playerBottom = PLAYER_Y_POS + PLAYER_HEIGHT;

      // Mark object as passed once it goes below the player
      // This prevents collision when player moves into a lane after object has passed
      if (objectTop > playerBottom) {
        obj.passed = true;
      }

      // Only check collision if object hasn't passed the player yet
      // Objects overlap when: objectBottom > playerTop AND objectTop < playerBottom
      const isOverlapping = objectBottom > playerTop && objectTop < playerBottom;

      if (!obj.passed && obj.lane === state.playerLane && isOverlapping) {
        if (obj.type === 'coin') {
          coinsCollected++;
          scoreFromCoins += 10;
          obj.collected = true;
          continue; // Don't add collected coins
        } else {
          // Hit obstacle
          gameOver = true;
          break;
        }
      }

      if (newY < 115) {
        newObjects.push({ ...obj, y: newY, passed: obj.passed });
      }
    }

    // Update game state
    state.objects = newObjects;
    state.coins += coinsCollected;
    state.score += scoreFromCoins + 0.1; // Passive score increase
    state.speed = Math.min(3.0, INITIAL_SPEED + (state.score / 800));

    if (gameOver) {
      state.isGameOver = true;
      state.isPlaying = false;
      syncDisplayState();
      return;
    }

    // Sync to React state for rendering (throttled)
    syncDisplayState();

    // Continue loop
    requestRef.current = requestAnimationFrame(gameLoop);
  }, [spawnObject, syncDisplayState]);

  const startGame = useCallback(() => {
    // Reset game state
    gameStateRef.current = {
      playerLane: 1,
      objects: [],
      score: 0,
      coins: 0,
      isPlaying: true,
      isGameOver: false,
      speed: INITIAL_SPEED
    };
    nextId.current = 0;
    lastSpawnTime.current = performance.now();
    lastFrameTime.current = 0;
    
    syncDisplayState();
    
    // Start game loop
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    requestRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop, syncDisplayState]);

  const movePlayer = useCallback((direction: 'left' | 'right') => {
    const state = gameStateRef.current;
    if (!state.isPlaying) return;
    
    if (direction === 'left') {
      state.playerLane = Math.max(0, state.playerLane - 1) as 0 | 1 | 2;
    } else {
      state.playerLane = Math.min(2, state.playerLane + 1) as 0 | 1 | 2;
    }
    syncDisplayState();
  }, [syncDisplayState]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        movePlayer('left');
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        movePlayer('right');
      }
      // Space to start/restart
      if (e.key === ' ' || e.key === 'Space') {
        e.preventDefault();
        if (!gameStateRef.current.isPlaying) {
          startGame();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePlayer, startGame]);

  // Touch/Swipe controls
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { 
      x: touch.clientX, 
      y: touch.clientY,
      time: Date.now()
    };
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    // Prevent page scroll while swiping
    if (touchStartRef.current) {
      e.preventDefault();
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaTime = Date.now() - touchStartRef.current.time;
    
    // Swipe detection - minimum 30px horizontal, max 300ms
    const minSwipe = 30;
    
    if (Math.abs(deltaX) > minSwipe && deltaTime < 300) {
      movePlayer(deltaX > 0 ? 'right' : 'left');
    }
    
    touchStartRef.current = null;
  }, [movePlayer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  return (
    <div className="game-container runner-game">
      <div className="game-score-board">
        <span>Skor: {Math.floor(displayState.score)}</span>
        <span>Altın: {displayState.coins} 🟡</span>
      </div>

      <div 
        ref={roadRef}
        className="runner-road"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Lanes */}
        <div className="runner-lane"></div>
        <div className="runner-lane"></div>
        <div className="runner-lane"></div>

        {/* Road markings animation */}
        {displayState.isPlaying && (
          <div className="road-markings-container">
            <div className="road-marking"></div>
            <div className="road-marking"></div>
            <div className="road-marking"></div>
          </div>
        )}

        {/* Player */}
        <div 
          className={`runner-player lane-${displayState.playerLane} ${displayState.isGameOver ? 'hit' : ''}`}
          style={{ bottom: `${100 - PLAYER_Y_POS}%` }}
        >
          <div className={`player-sprite ${runFrame === 0 ? 'run-1' : 'run-2'}`}>
            🏃
          </div>
        </div>

        {/* Game Objects */}
        {displayState.objects.map(obj => (
          <div
            key={obj.id}
            className={`runner-object lane-${obj.lane} type-${obj.type}`}
            style={{ top: `${obj.y}%` }}
          >
            {obj.type === 'coin' && '🟡'}
            {obj.type === 'rock' && '🪨'}
            {obj.type === 'barrier' && '🚧'}
            {obj.type === 'tree' && '🌲'}
          </div>
        ))}

        {/* Game Over Overlay */}
        {displayState.isGameOver && (
          <div className="game-over-overlay">
            <h2>Çarptın! 💥</h2>
            <p>Skor: {Math.floor(displayState.score)}</p>
            <p>Toplanan Altın: {displayState.coins}</p>
            <button className="game-btn game-btn-primary" onClick={startGame}>Tekrar Dene</button>
          </div>
        )}

        {/* Start Screen Overlay */}
        {!displayState.isPlaying && !displayState.isGameOver && (
          <div className="game-over-overlay start-overlay">
            <h2>🏃 Sonsuz Koşu</h2>
            <p>Engellerden kaç, altınları topla!</p>
            <p className="controls-hint">⬅️ ➡️ tuşları veya butonlar ile hareket et</p>
            <button className="game-btn game-btn-primary" onClick={startGame}>Koşmaya Başla</button>
          </div>
        )}
      </div>

      {/* Mobile Controls */}
      <div className="runner-controls">
        <button 
          className="runner-btn left" 
          onPointerDown={() => movePlayer('left')}
          onTouchStart={(e) => { e.preventDefault(); movePlayer('left'); }}
        >
          ⬅️
        </button>
        <button 
          className="runner-btn right" 
          onPointerDown={() => movePlayer('right')}
          onTouchStart={(e) => { e.preventDefault(); movePlayer('right'); }}
        >
          ➡️
        </button>
      </div>
    </div>
  );
};

export default RunnerGame;
