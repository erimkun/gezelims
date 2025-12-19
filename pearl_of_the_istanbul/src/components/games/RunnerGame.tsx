import React, { useState, useEffect, useRef } from 'react';
import './Games.css';

// Oyun Sabitleri
const GAME_SPEED_INITIAL = 5; // px per frame approx
const SPAWN_RATE_INITIAL = 1500; // ms
const PLAYER_Y_POS = 80; // % from top

interface GameObject {
  id: number;
  lane: 0 | 1 | 2;
  y: number; // % from top (0 to 100+)
  type: 'coin' | 'rock' | 'barrier' | 'tree';
  collected?: boolean;
}

const RunnerGame: React.FC = () => {
  const [playerLane, setPlayerLane] = useState<0 | 1 | 2>(1); // 0: Left, 1: Center, 2: Right
  const [gameObjects, setGameObjects] = useState<GameObject[]>([]);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [runFrame, setRunFrame] = useState(0); // 0 or 1 for animation

  const requestRef = useRef<number>(0);
  const lastSpawnTime = useRef(0);
  const nextId = useRef(0);
  const speedRef = useRef(GAME_SPEED_INITIAL);
  const scoreRef = useRef(0);

  // Animation loop for running sprite
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setRunFrame(prev => (prev === 0 ? 1 : 0));
    }, 150);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const startGame = () => {
    setPlayerLane(1);
    setGameObjects([]);
    setScore(0);
    setCoins(0);
    scoreRef.current = 0;
    speedRef.current = 0.8; // Speed in % per frame
    setIsGameOver(false);
    setIsPlaying(true);
    lastSpawnTime.current = performance.now();
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const movePlayer = (direction: 'left' | 'right') => {
    if (!isPlaying) return;
    setPlayerLane(prev => {
      if (direction === 'left') return Math.max(0, prev - 1) as 0 | 1 | 2;
      if (direction === 'right') return Math.min(2, prev + 1) as 0 | 1 | 2;
      return prev;
    });
  };

  const spawnObject = () => {
    const lanes: (0 | 1 | 2)[] = [0, 1, 2];
    const lane = lanes[Math.floor(Math.random() * lanes.length)];
    const typeRoll = Math.random();
    let type: GameObject['type'] = 'coin';
    
    if (typeRoll > 0.6) type = 'rock';
    else if (typeRoll > 0.4) type = 'barrier';
    else if (typeRoll > 0.3) type = 'tree';
    
    // Ensure we don't spawn impossible patterns (simple logic for now)
    
    setGameObjects(prev => [
      ...prev,
      {
        id: nextId.current++,
        lane,
        y: -10, // Start slightly above screen
        type
      }
    ]);
  };

  const gameLoop = (time: number) => {
    if (!isPlaying) return;

    // Spawn logic
    // Increase difficulty: spawn faster as score increases
    const currentSpawnRate = Math.max(600, SPAWN_RATE_INITIAL - scoreRef.current * 2);
    
    if (time - lastSpawnTime.current > currentSpawnRate) {
      spawnObject();
      lastSpawnTime.current = time;
    }

    // Move objects & Collision Detection
    setGameObjects(prev => {
      const newObjects: GameObject[] = [];
      let gameOver = false;

      prev.forEach(obj => {
        const newY = obj.y + speedRef.current;
        
        // Collision Box (approximate)
        // Player is at PLAYER_Y_POS (80%), height approx 10%
        // Object hit zone approx 5% range
        const playerHitZoneStart = PLAYER_Y_POS - 5;
        const playerHitZoneEnd = PLAYER_Y_POS + 5;

        if (
          !obj.collected &&
          obj.lane === playerLane &&
          newY > playerHitZoneStart &&
          newY < playerHitZoneEnd
        ) {
          if (obj.type === 'coin') {
            setCoins(c => c + 1);
            setScore(s => s + 10);
            scoreRef.current += 10;
            obj.collected = true; // Mark as collected so we don't process again
            // Don't add to newObjects if we want it to disappear immediately
            // But maybe we want a "collected" animation? For now, just remove.
            return; 
          } else {
            // Hit obstacle
            gameOver = true;
          }
        }

        if (newY < 110) { // Keep if still on screen
          newObjects.push({ ...obj, y: newY });
        }
      });

      if (gameOver) {
        setIsGameOver(true);
        setIsPlaying(false);
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        return prev; // Return state as is to show collision
      }

      return newObjects;
    });

    if (!isGameOver) {
      // Passive score increase
      setScore(s => {
        const newScore = s + 0.1;
        scoreRef.current = newScore;
        return newScore;
      });
      
      // Speed up slightly
      speedRef.current = Math.min(2.5, 0.8 + (scoreRef.current / 1000));

      requestRef.current = requestAnimationFrame(gameLoop);
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') movePlayer('left');
      if (e.key === 'ArrowRight') movePlayer('right');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerLane, isPlaying]); // Dependencies for closure freshness if needed, though setState handles it

  return (
    <div className="game-container runner-game">
      <div className="game-score-board">
        <span>Score: {Math.floor(score)}</span>
        <span>Coins: {coins} 🟡</span>
      </div>

      <div className="runner-road">
        {/* Lanes */}
        <div className="runner-lane"></div>
        <div className="runner-lane"></div>
        <div className="runner-lane"></div>

        {/* Player */}
        <div 
          className={`runner-player lane-${playerLane} ${isGameOver ? 'hit' : ''}`}
          style={{ bottom: `${100 - PLAYER_Y_POS}%` }}
        >
          {/* Placeholder for Player Sprite */}
          {/* <img src={runFrame === 0 ? 'player_run_1.png' : 'player_run_2.png'} /> */}
          <div className={`player-sprite ${runFrame === 0 ? 'run-1' : 'run-2'}`}>
            🏃
          </div>
        </div>

        {/* Game Objects */}
        {gameObjects.map(obj => (
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
        {isGameOver && (
          <div className="game-over-overlay">
            <h2>Çarptın! 💥</h2>
            <p>Skor: {Math.floor(score)}</p>
            <p>Toplanan Altın: {coins}</p>
            <button className="game-btn game-btn-primary" onClick={startGame}>Tekrar Dene</button>
          </div>
        )}

        {/* Start Screen Overlay */}
        {!isPlaying && !isGameOver && (
          <div className="game-over-overlay" style={{ background: 'rgba(0,0,0,0.4)' }}>
            <h2>Runner</h2>
            <p>Engellerden kaç, altınları topla!</p>
            <button className="game-btn game-btn-primary" onClick={startGame}>Koşmaya Başla</button>
          </div>
        )}
      </div>

      {/* Mobile Controls */}
      <div className="runner-controls">
        <button className="runner-btn left" onPointerDown={() => movePlayer('left')}>⬅️</button>
        <button className="runner-btn right" onPointerDown={() => movePlayer('right')}>➡️</button>
      </div>
    </div>
  );
};

export default RunnerGame;
