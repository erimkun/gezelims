import React, { useState, useEffect, useRef } from 'react';
import './Games.css';

interface Balloon {
  id: number;
  x: number; // percentage
  speed: number;
  color: string;
  popped: boolean;
}

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const BalloonPopGame: React.FC = () => {
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const requestRef = useRef(0);
  const nextId = useRef(0);
  const lastSpawnTime = useRef(0);

  const startGame = () => {
    setBalloons([]);
    setScore(0);
    setMissed(0);
    setIsGameOver(false);
    setIsPlaying(true);
    nextId.current = 0;
    lastSpawnTime.current = performance.now();
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const gameLoop = (time: number) => {
    if (!isPlaying) return;

    // Spawn new balloon every 1000ms (decreases as score increases)
    const spawnRate = Math.max(400, 1000 - score * 10);
    if (time - lastSpawnTime.current > spawnRate) {
      spawnBalloon();
      lastSpawnTime.current = time;
    }

    setBalloons(prevBalloons => {
      const newBalloons = prevBalloons.map(b => {
        // Move balloon up (CSS animation handles visual, but we need to track for removal)
        // Actually, let's use JS for movement to detect "missed" easily
        // Or just use CSS animation and onAnimationEnd?
        // Let's stick to simple CSS animation for movement visual, but we need to know when it's gone.
        // A simpler way: use JS for position.
        return b;
      }).filter(b => !b.popped);
      
      return newBalloons;
    });

    // Check for missed balloons (using animation events might be better for React)
    // But let's try a pure JS approach for position if we want collision/miss detection
    // For simplicity in this "mini" game, let's use CSS animation and `onAnimationEnd` event on the element.

    requestRef.current = requestAnimationFrame(gameLoop);
  };

  // Since we use CSS animation, we don't strictly need a JS game loop for movement, 
  // but we need it for spawning.
  
  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, score]); // Re-bind when score changes to update spawn rate logic if needed

  const spawnBalloon = () => {
    const newBalloon: Balloon = {
      id: nextId.current++,
      x: Math.random() * 80 + 10, // 10% to 90%
      speed: Math.random() * 2 + 3, // 3s to 5s duration
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      popped: false,
    };
    setBalloons(prev => [...prev, newBalloon]);
  };

  const popBalloon = (id: number) => {
    if (isGameOver) return;
    // Play sound?
    setBalloons(prev => prev.map(b => b.id === id ? { ...b, popped: true } : b));
    setScore(s => s + 1);
    // Remove from list after a short delay or immediately? 
    // Immediately for now, or mark as popped and show animation.
    // Let's just filter it out in the next render or use a timeout.
    // For now, just remove it.
    setBalloons(prev => prev.filter(b => b.id !== id));
  };

  const handleAnimationEnd = (id: number) => {
    // If animation ends, it means balloon reached top without popping
    setBalloons(prev => {
      const exists = prev.find(b => b.id === id);
      if (exists) {
        setMissed(m => {
          const newMissed = m + 1;
          if (newMissed >= 5) {
            setIsPlaying(false);
            setIsGameOver(true);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
          }
          return newMissed;
        });
        return prev.filter(b => b.id !== id);
      }
      return prev;
    });
  };

  return (
    <div className="game-container">
      <div className="game-score-board">
        <span>Score: {score}</span>
        <span>Missed: {missed}/5</span>
      </div>

      <div className="balloon-container">
        {!isPlaying && !isGameOver && (
          <div className="game-over-overlay" style={{ background: 'transparent', color: '#333' }}>
            <button className="game-btn game-btn-primary" onClick={startGame}>Start Game</button>
          </div>
        )}

        {balloons.map(balloon => (
          <div
            key={balloon.id}
            className="balloon"
            style={{
              left: `${balloon.x}%`,
              backgroundColor: balloon.color,
              animationDuration: `${balloon.speed}s`
            }}
            onClick={() => popBalloon(balloon.id)}
            onAnimationEnd={() => handleAnimationEnd(balloon.id)}
          >
            🎈
          </div>
        ))}

        {isGameOver && (
          <div className="game-over-overlay">
            <h2>Oyun Bitti! 🎈</h2>
            <p>Skorun: {score}</p>
            <button className="game-btn game-btn-primary" onClick={startGame}>Tekrar Oyna</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BalloonPopGame;
