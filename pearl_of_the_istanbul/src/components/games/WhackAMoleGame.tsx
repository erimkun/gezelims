import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Games.css';

interface WhackAMoleGameProps {
  language?: 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it';
}

const translations = {
  tr: {
    title: 'Köstebek Vur',
    score: 'Skor',
    time: 'Süre',
    start: 'Başla!',
    gameOver: 'Süre Doldu!',
    finalScore: 'Final Skor',
    playAgain: 'Tekrar Oyna',
    hit: 'Vur',
    missed: 'Kaçırdın',
    combo: 'Kombo',
    ready: 'Hazır mısın?',
    hint: 'Köstebeklere tıkla, bombalardan kaçın!'
  },
  en: {
    title: 'Whack-a-Mole',
    score: 'Score',
    time: 'Time',
    start: 'Start!',
    gameOver: 'Time\'s Up!',
    finalScore: 'Final Score',
    playAgain: 'Play Again',
    hit: 'Hit',
    missed: 'Missed',
    combo: 'Combo',
    ready: 'Ready?',
    hint: 'Tap moles, avoid bombs!'
  },
  de: {
    title: 'Maulwurf schlagen',
    score: 'Punkte',
    time: 'Zeit',
    start: 'Start!',
    gameOver: 'Zeit abgelaufen!',
    finalScore: 'Endpunktzahl',
    playAgain: 'Nochmal',
    hit: 'Treffer',
    missed: 'Verfehlt',
    combo: 'Kombo',
    ready: 'Bereit?',
    hint: 'Tippe auf Maulwürfe, vermeide Bomben!'
  },
  fr: {
    title: 'Tape-Taupe',
    score: 'Score',
    time: 'Temps',
    start: 'Commencer!',
    gameOver: 'Temps écoulé!',
    finalScore: 'Score Final',
    playAgain: 'Rejouer',
    hit: 'Touché',
    missed: 'Raté',
    combo: 'Combo',
    ready: 'Prêt?',
    hint: 'Tape les taupes, évite les bombes!'
  },
  es: {
    title: 'Golpea al Topo',
    score: 'Puntos',
    time: 'Tiempo',
    start: '¡Empezar!',
    gameOver: '¡Tiempo!',
    finalScore: 'Puntuación Final',
    playAgain: 'Jugar de nuevo',
    hit: 'Golpe',
    missed: 'Fallaste',
    combo: 'Combo',
    ready: '¿Listo?',
    hint: '¡Toca los topos, evita las bombas!'
  },
  it: {
    title: 'Acchiappa la Talpa',
    score: 'Punteggio',
    time: 'Tempo',
    start: 'Inizia!',
    gameOver: 'Tempo scaduto!',
    finalScore: 'Punteggio Finale',
    playAgain: 'Gioca ancora',
    hit: 'Colpito',
    missed: 'Mancato',
    combo: 'Combo',
    ready: 'Pronto?',
    hint: 'Tocca le talpe, evita le bombe!'
  }
};

type HoleState = 'empty' | 'mole' | 'golden' | 'bomb' | 'hit' | 'missed';

const GAME_DURATION = 30; // seconds
const GRID_SIZE = 9; // 3x3

const WhackAMoleGame: React.FC<WhackAMoleGameProps> = ({ language = 'tr' }) => {
  const [holes, setHoles] = useState<HoleState[]>(Array(GRID_SIZE).fill('empty'));
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [combo, setCombo] = useState(0);
  const [showCombo, setShowCombo] = useState(false);

  const gameLoopRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const t = translations[language];

  const spawnMole = useCallback(() => {
    if (!isPlaying) return;

    setHoles(prev => {
      const newHoles = [...prev];
      // Clear old moles that weren't hit
      for (let i = 0; i < newHoles.length; i++) {
        if (newHoles[i] === 'mole' || newHoles[i] === 'golden' || newHoles[i] === 'bomb') {
          newHoles[i] = 'empty';
        }
      }

      // Spawn 1-3 moles
      const numMoles = Math.floor(Math.random() * 2) + 1;
      const availableHoles = newHoles.map((_, i) => i).filter(i => newHoles[i] === 'empty');
      
      for (let i = 0; i < numMoles && availableHoles.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * availableHoles.length);
        const holeIndex = availableHoles.splice(randomIndex, 1)[0];
        
        const roll = Math.random();
        if (roll < 0.1) {
          newHoles[holeIndex] = 'golden'; // 10% golden mole (bonus points)
        } else if (roll < 0.25) {
          newHoles[holeIndex] = 'bomb'; // 15% bomb
        } else {
          newHoles[holeIndex] = 'mole'; // 75% normal mole
        }
      }

      return newHoles;
    });
  }, [isPlaying]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setCombo(0);
    setIsPlaying(true);
    setIsGameOver(false);
    setHoles(Array(GRID_SIZE).fill('empty'));
  };

  // Game loop - spawn moles
  useEffect(() => {
    if (!isPlaying) return;

    const spawnInterval = () => {
      spawnMole();
      // Speed up as time decreases
      const baseInterval = 800;
      const speedBonus = (GAME_DURATION - timeLeft) * 15;
      const interval = Math.max(400, baseInterval - speedBonus);
      gameLoopRef.current = window.setTimeout(spawnInterval, interval);
    };

    spawnInterval();

    return () => {
      if (gameLoopRef.current) clearTimeout(gameLoopRef.current);
    };
  }, [isPlaying, spawnMole, timeLeft]);

  // Timer
  useEffect(() => {
    if (!isPlaying) return;

    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsPlaying(false);
          setIsGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  const handleHoleClick = (index: number) => {
    if (!isPlaying) return;

    const currentState = holes[index];
    
    if (currentState === 'mole') {
      setScore(prev => prev + 10 + combo * 2);
      setCombo(prev => prev + 1);
      setShowCombo(true);
      setTimeout(() => setShowCombo(false), 300);
      setHoles(prev => {
        const newHoles = [...prev];
        newHoles[index] = 'hit';
        setTimeout(() => {
          setHoles(h => {
            const updated = [...h];
            if (updated[index] === 'hit') updated[index] = 'empty';
            return updated;
          });
        }, 200);
        return newHoles;
      });
    } else if (currentState === 'golden') {
      setScore(prev => prev + 50 + combo * 5);
      setCombo(prev => prev + 3);
      setShowCombo(true);
      setTimeout(() => setShowCombo(false), 300);
      setHoles(prev => {
        const newHoles = [...prev];
        newHoles[index] = 'hit';
        setTimeout(() => {
          setHoles(h => {
            const updated = [...h];
            if (updated[index] === 'hit') updated[index] = 'empty';
            return updated;
          });
        }, 200);
        return newHoles;
      });
    } else if (currentState === 'bomb') {
      setScore(prev => Math.max(0, prev - 30));
      setCombo(0);
      setHoles(prev => {
        const newHoles = [...prev];
        newHoles[index] = 'missed';
        setTimeout(() => {
          setHoles(h => {
            const updated = [...h];
            if (updated[index] === 'missed') updated[index] = 'empty';
            return updated;
          });
        }, 300);
        return newHoles;
      });
    } else {
      // Empty hole - reset combo
      setCombo(0);
    }
  };

  const getHoleContent = (state: HoleState) => {
    switch (state) {
      case 'mole': return '🐹';
      case 'golden': return '⭐';
      case 'bomb': return '💣';
      case 'hit': return '💥';
      case 'missed': return '💨';
      default: return '';
    }
  };

  return (
    <div className="game-container whack-game">
      <div className="game-score-board">
        <span>🎯 {t.score}: {score}</span>
        <span>⏱️ {t.time}: {timeLeft}s</span>
        {combo > 1 && <span className={`combo-display ${showCombo ? 'pop' : ''}`}>🔥 x{combo}</span>}
      </div>

      <div className="whack-grid">
        {holes.map((state, index) => (
          <button
            key={index}
            className={`whack-hole state-${state}`}
            onClick={() => handleHoleClick(index)}
            disabled={!isPlaying}
            aria-label={`Hole ${index + 1}`}
          >
            <div className="hole-bg"></div>
            <div className={`mole-container ${state !== 'empty' ? 'visible' : ''}`}>
              {getHoleContent(state)}
            </div>
          </button>
        ))}
      </div>

      {!isPlaying && !isGameOver && (
        <div className="whack-overlay">
          <h2>🐹 {t.title}</h2>
          <p>{t.hint}</p>
          <button className="game-btn game-btn-primary" onClick={startGame}>
            {t.start}
          </button>
        </div>
      )}

      {isGameOver && (
        <div className="game-over-overlay">
          <h2>{t.gameOver}</h2>
          <p className="final-score">{t.finalScore}: {score}</p>
          <button className="game-btn game-btn-primary" onClick={startGame}>
            {t.playAgain}
          </button>
        </div>
      )}
    </div>
  );
};

export default WhackAMoleGame;
