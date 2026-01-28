import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Games.css';

interface TargetShootGameProps {
  language?: 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it';
}

const translations = {
  tr: {
    title: 'Hedef Vur',
    start: 'Başla',
    score: 'Puan',
    time: 'Süre',
    hits: 'İsabet',
    misses: 'Kaçan',
    accuracy: 'İsabet Oranı',
    gameOver: 'Süre Doldu!',
    playAgain: 'Tekrar Oyna',
    sharpshooter: 'Keskin Nişancı! 🎯',
    great: 'Harika! 🌟',
    good: 'İyi! 👍',
    practice: 'Biraz daha pratik yap! 💪'
  },
  en: {
    title: 'Target Shoot',
    start: 'Start',
    score: 'Score',
    time: 'Time',
    hits: 'Hits',
    misses: 'Misses',
    accuracy: 'Accuracy',
    gameOver: 'Time Up!',
    playAgain: 'Play Again',
    sharpshooter: 'Sharpshooter! 🎯',
    great: 'Great! 🌟',
    good: 'Good! 👍',
    practice: 'Keep practicing! 💪'
  },
  de: {
    title: 'Zielschießen',
    start: 'Start',
    score: 'Punkte',
    time: 'Zeit',
    hits: 'Treffer',
    misses: 'Daneben',
    accuracy: 'Genauigkeit',
    gameOver: 'Zeit vorbei!',
    playAgain: 'Nochmal',
    sharpshooter: 'Scharfschütze! 🎯',
    great: 'Super! 🌟',
    good: 'Gut! 👍',
    practice: 'Weiter üben! 💪'
  },
  fr: {
    title: 'Tir à la Cible',
    start: 'Commencer',
    score: 'Score',
    time: 'Temps',
    hits: 'Touchés',
    misses: 'Ratés',
    accuracy: 'Précision',
    gameOver: 'Temps écoulé!',
    playAgain: 'Rejouer',
    sharpshooter: 'Tireur d\'élite! 🎯',
    great: 'Super! 🌟',
    good: 'Bien! 👍',
    practice: 'Continue à t\'entraîner! 💪'
  },
  es: {
    title: 'Tiro al Blanco',
    start: 'Empezar',
    score: 'Puntos',
    time: 'Tiempo',
    hits: 'Aciertos',
    misses: 'Fallos',
    accuracy: 'Precisión',
    gameOver: '¡Tiempo!',
    playAgain: 'Jugar de nuevo',
    sharpshooter: '¡Francotirador! 🎯',
    great: '¡Genial! 🌟',
    good: '¡Bien! 👍',
    practice: '¡Sigue practicando! 💪'
  },
  it: {
    title: 'Tiro al Bersaglio',
    start: 'Inizia',
    score: 'Punti',
    time: 'Tempo',
    hits: 'Colpi',
    misses: 'Mancati',
    accuracy: 'Precisione',
    gameOver: 'Tempo scaduto!',
    playAgain: 'Gioca ancora',
    sharpshooter: 'Cecchino! 🎯',
    great: 'Fantastico! 🌟',
    good: 'Bene! 👍',
    practice: 'Continua ad allenarti! 💪'
  }
};

interface Target {
  id: number;
  x: number;
  y: number;
  size: number;
  type: 'normal' | 'bonus' | 'fast';
  createdAt: number;
}

const GAME_DURATION = 30;

const TargetShootGame: React.FC<TargetShootGameProps> = ({ language = 'tr' }) => {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [targets, setTargets] = useState<Target[]>([]);
  const [hitEffect, setHitEffect] = useState<{ x: number; y: number; points: number } | null>(null);
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const spawnRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const targetIdRef = useRef(0);

  const t = translations[language];

  const spawnTarget = useCallback(() => {
    const gameArea = gameAreaRef.current;
    if (!gameArea) return;

    const rect = gameArea.getBoundingClientRect();
    const padding = 40;
    
    const typeRandom = Math.random();
    let type: Target['type'] = 'normal';
    let size = 50;
    
    if (typeRandom > 0.9) {
      type = 'bonus';
      size = 40;
    } else if (typeRandom > 0.7) {
      type = 'fast';
      size = 35;
    }

    const newTarget: Target = {
      id: targetIdRef.current++,
      x: Math.random() * (rect.width - size - padding * 2) + padding,
      y: Math.random() * (rect.height - size - padding * 2) + padding,
      size,
      type,
      createdAt: Date.now()
    };

    setTargets(prev => [...prev, newTarget]);

    // Remove target after timeout
    const timeout = type === 'fast' ? 1000 : type === 'bonus' ? 1500 : 2000;
    setTimeout(() => {
      setTargets(prev => {
        const target = prev.find(t => t.id === newTarget.id);
        if (target) {
          setMisses(m => m + 1);
        }
        return prev.filter(t => t.id !== newTarget.id);
      });
    }, timeout);
  }, []);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setHits(0);
    setMisses(0);
    setTargets([]);
    targetIdRef.current = 0;
  };

  useEffect(() => {
    if (gameState === 'playing') {
      // Timer
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameState('result');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Spawn targets
      const scheduleSpawn = () => {
        const delay = Math.max(400, 1000 - (GAME_DURATION - timeLeft) * 10);
        spawnRef.current = setTimeout(() => {
          if (gameState === 'playing') {
            spawnTarget();
            scheduleSpawn();
          }
        }, delay);
      };
      scheduleSpawn();

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (spawnRef.current) clearTimeout(spawnRef.current);
      };
    }
  }, [gameState, spawnTarget]);

  const handleTargetClick = (target: Target, e: React.MouseEvent) => {
    e.stopPropagation();
    
    let points = 10;
    if (target.type === 'bonus') points = 25;
    if (target.type === 'fast') points = 20;

    setScore(prev => prev + points);
    setHits(prev => prev + 1);
    setTargets(prev => prev.filter(t => t.id !== target.id));

    // Show hit effect
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setHitEffect({ x: rect.left + rect.width / 2, y: rect.top, points });
    setTimeout(() => setHitEffect(null), 500);
  };

  const handleMiss = () => {
    // Only count as miss if clicked on empty area
    // setMisses(prev => prev + 1);
  };

  const accuracy = hits + misses > 0 ? Math.round((hits / (hits + misses)) * 100) : 0;

  const getResultMessage = () => {
    if (accuracy >= 80) return t.sharpshooter;
    if (accuracy >= 60) return t.great;
    if (accuracy >= 40) return t.good;
    return t.practice;
  };

  if (gameState === 'start') {
    return (
      <div className="game-container target-shoot">
        <div className="target-start">
          <h2>{t.title}</h2>
          <div className="target-demo">
            <div className="demo-target normal">🎯</div>
            <div className="demo-target bonus">⭐</div>
            <div className="demo-target fast">💨</div>
          </div>
          <button className="game-btn game-btn-primary" onClick={startGame}>
            {t.start} 🎯
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'result') {
    return (
      <div className="game-container target-shoot">
        <div className="target-result">
          <h2>{t.gameOver}</h2>
          <div className="target-result-score">{score}</div>
          <div className="target-stats">
            <div className="stat">
              <span className="stat-label">{t.hits}</span>
              <span className="stat-value">{hits}</span>
            </div>
            <div className="stat">
              <span className="stat-label">{t.misses}</span>
              <span className="stat-value">{misses}</span>
            </div>
            <div className="stat">
              <span className="stat-label">{t.accuracy}</span>
              <span className="stat-value">{accuracy}%</span>
            </div>
          </div>
          <p className="target-result-message">{getResultMessage()}</p>
          <button className="game-btn game-btn-primary" onClick={startGame}>
            🔄 {t.playAgain}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container target-shoot">
      <div className="target-header">
        <div className="target-stat">
          <span>{t.score}</span>
          <span className="value">{score}</span>
        </div>
        <div className="target-timer">
          {timeLeft}s
        </div>
        <div className="target-stat">
          <span>🎯</span>
          <span className="value">{hits}</span>
        </div>
      </div>

      <div 
        className="target-game-area" 
        ref={gameAreaRef}
        onClick={handleMiss}
      >
        {targets.map(target => (
          <button
            key={target.id}
            className={`target ${target.type}`}
            style={{
              left: target.x,
              top: target.y,
              width: target.size,
              height: target.size
            }}
            onClick={(e) => handleTargetClick(target, e)}
          >
            {target.type === 'normal' && '🎯'}
            {target.type === 'bonus' && '⭐'}
            {target.type === 'fast' && '💨'}
          </button>
        ))}

        {hitEffect && (
          <div 
            className="hit-effect"
            style={{ left: hitEffect.x, top: hitEffect.y }}
          >
            +{hitEffect.points}
          </div>
        )}
      </div>
    </div>
  );
};

export default TargetShootGame;
