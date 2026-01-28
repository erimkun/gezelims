import React, { useState, useRef, useCallback } from 'react';
import './Games.css';

type GameState = 'waiting' | 'ready' | 'go' | 'result' | 'too-early';

interface ReactionGameProps {
  language?: 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it';
}

const translations = {
  tr: {
    title: 'Refleks Testi',
    waiting: 'Başlamak için tıkla',
    ready: 'Bekle...',
    go: 'TIKLA!',
    tooEarly: 'Çok erken! 😅',
    tooEarlySub: 'Yeşil olana kadar bekle',
    tryAgain: 'Tekrar Dene',
    result: 'Reaksiyon Süren',
    ms: 'ms',
    best: 'En İyi',
    average: 'Ortalama',
    attempts: 'Deneme',
    amazing: 'İnanılmaz! ⚡',
    great: 'Harika! 🔥',
    good: 'İyi! 👍',
    average_label: 'Ortalama 😊',
    slow: 'Biraz yavaş 🐢',
    playAgain: 'Tekrar Dene',
    stats: 'İstatistikler'
  },
  en: {
    title: 'Reaction Test',
    waiting: 'Click to start',
    ready: 'Wait...',
    go: 'CLICK!',
    tooEarly: 'Too early! 😅',
    tooEarlySub: 'Wait for green',
    tryAgain: 'Try Again',
    result: 'Your Reaction Time',
    ms: 'ms',
    best: 'Best',
    average: 'Average',
    attempts: 'Attempts',
    amazing: 'Amazing! ⚡',
    great: 'Great! 🔥',
    good: 'Good! 👍',
    average_label: 'Average 😊',
    slow: 'A bit slow 🐢',
    playAgain: 'Try Again',
    stats: 'Statistics'
  },
  de: {
    title: 'Reaktionstest',
    waiting: 'Klicken zum Starten',
    ready: 'Warte...',
    go: 'KLICK!',
    tooEarly: 'Zu früh! 😅',
    tooEarlySub: 'Warte auf Grün',
    tryAgain: 'Nochmal',
    result: 'Deine Reaktionszeit',
    ms: 'ms',
    best: 'Beste',
    average: 'Durchschnitt',
    attempts: 'Versuche',
    amazing: 'Unglaublich! ⚡',
    great: 'Super! 🔥',
    good: 'Gut! 👍',
    average_label: 'Durchschnitt 😊',
    slow: 'Etwas langsam 🐢',
    playAgain: 'Nochmal',
    stats: 'Statistiken'
  },
  fr: {
    title: 'Test de Réaction',
    waiting: 'Cliquez pour commencer',
    ready: 'Attendez...',
    go: 'CLIQUEZ!',
    tooEarly: 'Trop tôt! 😅',
    tooEarlySub: 'Attendez le vert',
    tryAgain: 'Réessayer',
    result: 'Votre Temps de Réaction',
    ms: 'ms',
    best: 'Meilleur',
    average: 'Moyenne',
    attempts: 'Essais',
    amazing: 'Incroyable! ⚡',
    great: 'Super! 🔥',
    good: 'Bien! 👍',
    average_label: 'Moyen 😊',
    slow: 'Un peu lent 🐢',
    playAgain: 'Réessayer',
    stats: 'Statistiques'
  },
  es: {
    title: 'Test de Reacción',
    waiting: 'Haz clic para empezar',
    ready: 'Espera...',
    go: '¡CLIC!',
    tooEarly: '¡Muy pronto! 😅',
    tooEarlySub: 'Espera el verde',
    tryAgain: 'Intentar de nuevo',
    result: 'Tu Tiempo de Reacción',
    ms: 'ms',
    best: 'Mejor',
    average: 'Promedio',
    attempts: 'Intentos',
    amazing: '¡Increíble! ⚡',
    great: '¡Genial! 🔥',
    good: '¡Bien! 👍',
    average_label: 'Promedio 😊',
    slow: 'Un poco lento 🐢',
    playAgain: 'Intentar de nuevo',
    stats: 'Estadísticas'
  },
  it: {
    title: 'Test di Reazione',
    waiting: 'Clicca per iniziare',
    ready: 'Aspetta...',
    go: 'CLICCA!',
    tooEarly: 'Troppo presto! 😅',
    tooEarlySub: 'Aspetta il verde',
    tryAgain: 'Riprova',
    result: 'Il Tuo Tempo di Reazione',
    ms: 'ms',
    best: 'Migliore',
    average: 'Media',
    attempts: 'Tentativi',
    amazing: 'Incredibile! ⚡',
    great: 'Ottimo! 🔥',
    good: 'Bene! 👍',
    average_label: 'Nella media 😊',
    slow: 'Un po\' lento 🐢',
    playAgain: 'Riprova',
    stats: 'Statistiche'
  }
};

const ReactionGame: React.FC<ReactionGameProps> = ({ language = 'tr' }) => {
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<number[]>([]);
  
  const timeoutRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  
  const t = translations[language];

  const getReactionMessage = (time: number): string => {
    if (time < 200) return t.amazing;
    if (time < 250) return t.great;
    if (time < 350) return t.good;
    if (time < 500) return t.average_label;
    return t.slow;
  };

  const getBackgroundColor = (): string => {
    switch (gameState) {
      case 'waiting': return '#3b82f6'; // Blue
      case 'ready': return '#ef4444'; // Red
      case 'go': return '#22c55e'; // Green
      case 'result': return '#8b5cf6'; // Purple
      case 'too-early': return '#f97316'; // Orange
      default: return '#3b82f6';
    }
  };

  const handleClick = useCallback(() => {
    switch (gameState) {
      case 'waiting':
        // Start the game - wait random time before showing green
        setGameState('ready');
        const delay = Math.random() * 3000 + 1500; // 1.5s to 4.5s
        timeoutRef.current = window.setTimeout(() => {
          setGameState('go');
          startTimeRef.current = performance.now();
        }, delay);
        break;
        
      case 'ready':
        // Clicked too early!
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        setGameState('too-early');
        break;
        
      case 'go':
        // Calculate reaction time
        const endTime = performance.now();
        const time = Math.round(endTime - startTimeRef.current);
        setReactionTime(time);
        setAttempts(prev => [...prev, time]);
        setGameState('result');
        break;
        
      case 'result':
      case 'too-early':
        // Reset to waiting
        setGameState('waiting');
        setReactionTime(null);
        break;
    }
  }, [gameState]);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getBestTime = (): number | null => {
    if (attempts.length === 0) return null;
    return Math.min(...attempts);
  };

  const getAverageTime = (): number | null => {
    if (attempts.length === 0) return null;
    return Math.round(attempts.reduce((a, b) => a + b, 0) / attempts.length);
  };

  const resetStats = () => {
    setAttempts([]);
    setReactionTime(null);
    setGameState('waiting');
  };

  return (
    <div className="game-container reaction-game">
      {/* Stats Bar */}
      {attempts.length > 0 && (
        <div className="reaction-stats-bar">
          <span>🏆 {t.best}: {getBestTime()}{t.ms}</span>
          <span>📊 {t.average}: {getAverageTime()}{t.ms}</span>
          <span>🎯 {t.attempts}: {attempts.length}</span>
        </div>
      )}

      {/* Main Game Area */}
      <div 
        className={`reaction-area state-${gameState}`}
        style={{ backgroundColor: getBackgroundColor() }}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            handleClick();
          }
        }}
        aria-label={gameState === 'go' ? t.go : t.waiting}
      >
        {gameState === 'waiting' && (
          <div className="reaction-content">
            <div className="reaction-icon">⚡</div>
            <h2>{t.title}</h2>
            <p>{t.waiting}</p>
          </div>
        )}

        {gameState === 'ready' && (
          <div className="reaction-content">
            <div className="reaction-icon pulse">🎯</div>
            <h2>{t.ready}</h2>
            <p className="ready-hint">🟢</p>
          </div>
        )}

        {gameState === 'go' && (
          <div className="reaction-content">
            <div className="reaction-icon bounce">👆</div>
            <h2 className="go-text">{t.go}</h2>
          </div>
        )}

        {gameState === 'too-early' && (
          <div className="reaction-content">
            <div className="reaction-icon shake">❌</div>
            <h2>{t.tooEarly}</h2>
            <p>{t.tooEarlySub}</p>
            <p className="click-hint">{t.tryAgain}</p>
          </div>
        )}

        {gameState === 'result' && reactionTime !== null && (
          <div className="reaction-content">
            <div className="reaction-icon">{reactionTime < 300 ? '🚀' : '⏱️'}</div>
            <p className="result-label">{t.result}</p>
            <h2 className="reaction-time">{reactionTime}<span className="ms">{t.ms}</span></h2>
            <p className="reaction-message">{getReactionMessage(reactionTime)}</p>
            <p className="click-hint">{t.playAgain}</p>
          </div>
        )}
      </div>

      {/* Reset Stats Button */}
      {attempts.length > 0 && (
        <div className="reaction-footer">
          <button className="game-btn game-btn-secondary" onClick={resetStats}>
            🔄 Reset {t.stats}
          </button>
        </div>
      )}
    </div>
  );
};

export default ReactionGame;
