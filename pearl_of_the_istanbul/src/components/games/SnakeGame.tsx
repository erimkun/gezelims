import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import './Games.css';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const GAME_SPEED = 150;

interface TouchRef {
  x: number;
  y: number;
}

interface SnakeGameProps {
  language?: 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it';
}

const translations = {
  tr: {
    score: 'Skor',
    restart: 'Yeniden Başlat',
    reset: 'Sıfırla',
    gameOver: 'Oyun Bitti! 🐍',
    yourScore: 'Skorun',
    playAgain: 'Tekrar Oyna',
    pause: 'Duraklat',
    resume: 'Devam Et',
    up: 'Yukarı',
    down: 'Aşağı',
    left: 'Sol',
    right: 'Sağ',
    instructions: 'Ok tuşları veya WASD ile yılanı kontrol edin. P ile duraklatın.',
    ateFood: 'Yem yendi! +10 puan',
    newHighScore: 'Yeni en yüksek skor!',
  },
  en: {
    score: 'Score',
    restart: 'Restart',
    reset: 'Reset',
    gameOver: 'Game Over! 🐍',
    yourScore: 'Your Score',
    playAgain: 'Play Again',
    pause: 'Pause',
    resume: 'Resume',
    up: 'Up',
    down: 'Down',
    left: 'Left',
    right: 'Right',
    instructions: 'Use arrow keys or WASD to control. Press P to pause.',
    ateFood: 'Food eaten! +10 points',
    newHighScore: 'New high score!',
  },
  de: {
    score: 'Punkte',
    restart: 'Neustart',
    reset: 'Zurücksetzen',
    gameOver: 'Spiel vorbei! 🐍',
    yourScore: 'Deine Punkte',
    playAgain: 'Nochmal spielen',
    pause: 'Pause',
    resume: 'Weiter',
    up: 'Hoch',
    down: 'Runter',
    left: 'Links',
    right: 'Rechts',
    instructions: 'Pfeiltasten oder WASD zum Steuern. P für Pause.',
    ateFood: 'Futter gefressen! +10 Punkte',
    newHighScore: 'Neuer Rekord!',
  },
  fr: {
    score: 'Score',
    restart: 'Recommencer',
    reset: 'Réinitialiser',
    gameOver: 'Fin du jeu! 🐍',
    yourScore: 'Ton score',
    playAgain: 'Rejouer',
    pause: 'Pause',
    resume: 'Continuer',
    up: 'Haut',
    down: 'Bas',
    left: 'Gauche',
    right: 'Droite',
    instructions: 'Flèches ou WASD pour diriger. P pour pause.',
    ateFood: 'Nourriture mangée! +10 points',
    newHighScore: 'Nouveau record!',
  },
  es: {
    score: 'Puntos',
    restart: 'Reiniciar',
    reset: 'Restablecer',
    gameOver: '¡Fin del juego! 🐍',
    yourScore: 'Tu puntuación',
    playAgain: 'Jugar de nuevo',
    pause: 'Pausa',
    resume: 'Continuar',
    up: 'Arriba',
    down: 'Abajo',
    left: 'Izquierda',
    right: 'Derecha',
    instructions: 'Flechas o WASD para controlar. P para pausar.',
    ateFood: '¡Comida comida! +10 puntos',
    newHighScore: '¡Nuevo récord!',
  },
  it: {
    score: 'Punti',
    restart: 'Ricomincia',
    reset: 'Resetta',
    gameOver: 'Gioco finito! 🐍',
    yourScore: 'Il tuo punteggio',
    playAgain: 'Gioca ancora',
    pause: 'Pausa',
    resume: 'Continua',
    up: 'Su',
    down: 'Giù',
    left: 'Sinistra',
    right: 'Destra',
    instructions: 'Frecce o WASD per controllare. P per pausa.',
    ateFood: 'Cibo mangiato! +10 punti',
    newHighScore: 'Nuovo record!',
  },
};

const SnakeGame: React.FC<SnakeGameProps> = ({ language = 'tr' }) => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 15, y: 5 });
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  
  const directionRef = useRef(INITIAL_DIRECTION);
  const touchStartRef = useRef<TouchRef | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  
  const t = translations[language];
  
  // Screen reader announcement
  const announce = useCallback((message: string) => {
    setAnnouncement(message);
    setTimeout(() => setAnnouncement(''), 1000);
  }, []);

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

  // Enhanced keyboard controls with WASD support and pause/restart
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          changeDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          changeDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          changeDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          changeDirection({ x: 1, y: 0 });
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          if (!isGameOver) {
            setIsPaused(prev => !prev);
            announce(isPaused ? t.resume : t.pause);
          }
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          resetGame();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGameOver, isPaused, announce, t.resume, t.pause]);

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

  // Focus board on mount
  useEffect(() => {
    boardRef.current?.focus();
  }, []);

  return (
    <div 
      className="game-container snake-game"
      role="application"
      aria-label="Yılan Oyunu"
    >
      {/* Screen reader announcements */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      >
        {announcement}
      </div>
      
      {/* Hidden instructions */}
      <span id="snake-instructions" className="sr-only">
        {t.instructions}
      </span>

      <div className="game-score-board" role="status" aria-live="polite">
        <span aria-label={`${t.score}: ${score}`}>{t.score}: {score}</span>
        <button 
          className="game-btn game-btn-primary" 
          onClick={resetGame}
          aria-label={isGameOver ? t.restart : t.reset}
        >
          {isGameOver ? t.restart : t.reset}
        </button>
      </div>

      <div 
        ref={boardRef}
        className="snake-board"
        role="grid"
        aria-label="Yılan oyun tahtası"
        aria-describedby="snake-instructions"
        aria-rowcount={GRID_SIZE}
        aria-colcount={GRID_SIZE}
        tabIndex={0}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
          const x = i % GRID_SIZE;
          const y = Math.floor(i / GRID_SIZE);
          const isSnake = snake.some(s => s.x === x && s.y === y);
          const isHead = snake[0]?.x === x && snake[0]?.y === y;
          const isFood = food.x === x && food.y === y;

          return (
            <div
              key={i}
              className={`snake-cell ${isSnake ? 'snake-body' : ''} ${isHead ? 'snake-head' : ''} ${isFood ? 'snake-food' : ''}`}
              role="gridcell"
              aria-label={isHead ? 'Yılan başı' : isSnake ? 'Yılan gövdesi' : isFood ? 'Yem' : 'Boş'}
              aria-rowindex={y + 1}
              aria-colindex={x + 1}
            />
          );
        })}
      </div>

      {/* Mobile controls with ARIA labels */}
      <div className="snake-controls-mobile" role="group" aria-label="Yön kontrolleri">
        <div></div>
        <button 
          className="snake-btn" 
          onClick={() => changeDirection({ x: 0, y: -1 })}
          aria-label={t.up}
        >
          ⬆️
        </button>
        <div></div>
        <button 
          className="snake-btn" 
          onClick={() => changeDirection({ x: -1, y: 0 })}
          aria-label={t.left}
        >
          ⬅️
        </button>
        <button 
          className="snake-btn" 
          onClick={() => setIsPaused(!isPaused)}
          aria-label={isPaused ? t.resume : t.pause}
          aria-pressed={isPaused}
        >
          {isPaused ? '▶️' : '⏸️'}
        </button>
        <button 
          className="snake-btn" 
          onClick={() => changeDirection({ x: 1, y: 0 })}
          aria-label={t.right}
        >
          ➡️
        </button>
        <div></div>
        <button 
          className="snake-btn" 
          onClick={() => changeDirection({ x: 0, y: 1 })}
          aria-label={t.down}
        >
          ⬇️
        </button>
        <div></div>
      </div>

      {isGameOver && (
        <div 
          className="game-over-overlay"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="snake-game-over-title"
          aria-describedby="snake-game-over-desc"
        >
          <h2 id="snake-game-over-title">{t.gameOver}</h2>
          <p id="snake-game-over-desc">{t.yourScore}: {score}</p>
          <button 
            className="game-btn game-btn-primary" 
            onClick={resetGame}
            autoFocus
          >
            {t.playAgain}
          </button>
        </div>
      )}
    </div>
  );
};

// Performance optimization with React.memo
export default memo(SnakeGame, (prevProps, nextProps) => {
  return prevProps.language === nextProps.language;
});
