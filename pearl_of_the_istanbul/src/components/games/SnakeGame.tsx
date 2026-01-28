import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Games.css';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const GAME_SPEED = 150;

interface TouchRef {
  x: number;
  y: number;
}

const SnakeGame: React.FC = () => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 15, y: 5 });
  // Removed unused direction state, using ref for logic
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const directionRef = useRef(INITIAL_DIRECTION);
  const touchStartRef = useRef<TouchRef | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const generateFood = useCallback(() => {
    let newFood: { x: number, y: number };
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    setFood(newFood);
  }, [snake]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    directionRef.current = INITIAL_DIRECTION;
    setScore(0);
    setIsGameOver(false);
    setIsPaused(false);
    generateFood();
  };

  const changeDirection = (newDir: { x: number, y: number }) => {
    // Prevent reversing direction
    if (newDir.x === -directionRef.current.x && newDir.y === -directionRef.current.y) return;
    directionRef.current = newDir;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': changeDirection({ x: 0, y: -1 }); break;
        case 'ArrowDown': changeDirection({ x: 0, y: 1 }); break;
        case 'ArrowLeft': changeDirection({ x: -1, y: 0 }); break;
        case 'ArrowRight': changeDirection({ x: 1, y: 0 }); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
    if (!touchStartRef.current) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    
    const minSwipe = 30;
    
    // Determine swipe direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > minSwipe) {
        changeDirection(deltaX > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 });
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > minSwipe) {
        changeDirection(deltaY > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 });
      }
    }
    
    touchStartRef.current = null;
  }, []);

  useEffect(() => {
    if (isGameOver || isPaused) return;

    const moveSnake = setInterval(() => {
      setSnake(prevSnake => {
        const newHead = {
          x: prevSnake[0].x + directionRef.current.x,
          y: prevSnake[0].y + directionRef.current.y
        };

        // Check collisions
        if (
          newHead.x < 0 || newHead.x >= GRID_SIZE ||
          newHead.y < 0 || newHead.y >= GRID_SIZE ||
          prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)
        ) {
          setIsGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check food
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => s + 10);
          generateFood();
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, GAME_SPEED);

    return () => clearInterval(moveSnake);
  }, [isGameOver, isPaused, food, generateFood]);

  return (
    <div className="game-container">
      <div className="game-score-board">
        <span>Score: {score}</span>
        <button className="game-btn game-btn-primary" onClick={resetGame}>
          {isGameOver ? 'Restart' : 'Reset'}
        </button>
      </div>

      <div 
        ref={boardRef}
        className="snake-board"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
          const x = i % GRID_SIZE;
          const y = Math.floor(i / GRID_SIZE);
          const isSnake = snake.some(s => s.x === x && s.y === y);
          const isFood = food.x === x && food.y === y;

          return (
            <div
              key={i}
              className={`snake-cell ${isSnake ? 'snake-body' : ''} ${isFood ? 'snake-food' : ''}`}
            />
          );
        })}
      </div>

      <div className="snake-controls-mobile">
        <div></div>
        <button className="snake-btn" onClick={() => changeDirection({ x: 0, y: -1 })}>⬆️</button>
        <div></div>
        <button className="snake-btn" onClick={() => changeDirection({ x: -1, y: 0 })}>⬅️</button>
        <button className="snake-btn" onClick={() => setIsPaused(!isPaused)}>{isPaused ? '▶️' : '⏸️'}</button>
        <button className="snake-btn" onClick={() => changeDirection({ x: 1, y: 0 })}>➡️</button>
        <div></div>
        <button className="snake-btn" onClick={() => changeDirection({ x: 0, y: 1 })}>⬇️</button>
        <div></div>
      </div>

      {isGameOver && (
        <div className="game-over-overlay">
          <h2>Oyun Bitti! 🐍</h2>
          <p>Skorun: {score}</p>
          <button className="game-btn game-btn-primary" onClick={resetGame}>Tekrar Oyna</button>
        </div>
      )}
    </div>
  );
};

export default SnakeGame;
