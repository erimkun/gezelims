import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Games.css';

interface ColorMatchGameProps {
  language?: 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it';
}

const translations = {
  tr: {
    title: 'Renk Eşleştir',
    score: 'Skor',
    time: 'Süre',
    start: 'Başla!',
    gameOver: 'Oyun Bitti!',
    finalScore: 'Final Skor',
    playAgain: 'Tekrar Oyna',
    correct: 'Doğru',
    wrong: 'Yanlış',
    question: 'Yazının RENGİ ile kelimenin ANLAMINI eşleştir!',
    yes: 'EVET ✓',
    no: 'HAYIR ✗',
    ready: 'Hazır mısın?',
    hint: 'Yazının rengi, kelimenin anlamıyla eşleşiyor mu?',
    streak: 'Seri',
    best: 'En İyi'
  },
  en: {
    title: 'Color Match',
    score: 'Score',
    time: 'Time',
    start: 'Start!',
    gameOver: 'Game Over!',
    finalScore: 'Final Score',
    playAgain: 'Play Again',
    correct: 'Correct',
    wrong: 'Wrong',
    question: 'Does the COLOR match the WORD meaning?',
    yes: 'YES ✓',
    no: 'NO ✗',
    ready: 'Ready?',
    hint: 'Does the text color match what the word says?',
    streak: 'Streak',
    best: 'Best'
  },
  de: {
    title: 'Farb-Match',
    score: 'Punkte',
    time: 'Zeit',
    start: 'Start!',
    gameOver: 'Spiel vorbei!',
    finalScore: 'Endpunktzahl',
    playAgain: 'Nochmal',
    correct: 'Richtig',
    wrong: 'Falsch',
    question: 'Stimmt die FARBE mit der BEDEUTUNG überein?',
    yes: 'JA ✓',
    no: 'NEIN ✗',
    ready: 'Bereit?',
    hint: 'Stimmt die Textfarbe mit der Wortbedeutung überein?',
    streak: 'Serie',
    best: 'Beste'
  },
  fr: {
    title: 'Match Couleur',
    score: 'Score',
    time: 'Temps',
    start: 'Commencer!',
    gameOver: 'Fin du jeu!',
    finalScore: 'Score Final',
    playAgain: 'Rejouer',
    correct: 'Correct',
    wrong: 'Faux',
    question: 'La COULEUR correspond-elle au MOT?',
    yes: 'OUI ✓',
    no: 'NON ✗',
    ready: 'Prêt?',
    hint: 'La couleur du texte correspond-elle à la signification?',
    streak: 'Série',
    best: 'Meilleur'
  },
  es: {
    title: 'Match de Color',
    score: 'Puntos',
    time: 'Tiempo',
    start: '¡Empezar!',
    gameOver: '¡Fin del juego!',
    finalScore: 'Puntuación Final',
    playAgain: 'Jugar de nuevo',
    correct: 'Correcto',
    wrong: 'Incorrecto',
    question: '¿El COLOR coincide con la PALABRA?',
    yes: 'SÍ ✓',
    no: 'NO ✗',
    ready: '¿Listo?',
    hint: '¿El color del texto coincide con el significado?',
    streak: 'Racha',
    best: 'Mejor'
  },
  it: {
    title: 'Match Colore',
    score: 'Punteggio',
    time: 'Tempo',
    start: 'Inizia!',
    gameOver: 'Fine del gioco!',
    finalScore: 'Punteggio Finale',
    playAgain: 'Gioca ancora',
    correct: 'Corretto',
    wrong: 'Sbagliato',
    question: 'Il COLORE corrisponde alla PAROLA?',
    yes: 'SÌ ✓',
    no: 'NO ✗',
    ready: 'Pronto?',
    hint: 'Il colore del testo corrisponde al significato?',
    streak: 'Serie',
    best: 'Migliore'
  }
};

interface ColorWord {
  word: string;
  color: string;
  colorName: string;
}

const colorData = {
  tr: [
    { name: 'KIRMIZI', color: '#EF4444' },
    { name: 'MAVİ', color: '#3B82F6' },
    { name: 'YEŞİL', color: '#22C55E' },
    { name: 'SARI', color: '#EAB308' },
    { name: 'MOR', color: '#A855F7' },
    { name: 'TURUNCU', color: '#F97316' },
  ],
  en: [
    { name: 'RED', color: '#EF4444' },
    { name: 'BLUE', color: '#3B82F6' },
    { name: 'GREEN', color: '#22C55E' },
    { name: 'YELLOW', color: '#EAB308' },
    { name: 'PURPLE', color: '#A855F7' },
    { name: 'ORANGE', color: '#F97316' },
  ],
  de: [
    { name: 'ROT', color: '#EF4444' },
    { name: 'BLAU', color: '#3B82F6' },
    { name: 'GRÜN', color: '#22C55E' },
    { name: 'GELB', color: '#EAB308' },
    { name: 'LILA', color: '#A855F7' },
    { name: 'ORANGE', color: '#F97316' },
  ],
  fr: [
    { name: 'ROUGE', color: '#EF4444' },
    { name: 'BLEU', color: '#3B82F6' },
    { name: 'VERT', color: '#22C55E' },
    { name: 'JAUNE', color: '#EAB308' },
    { name: 'VIOLET', color: '#A855F7' },
    { name: 'ORANGE', color: '#F97316' },
  ],
  es: [
    { name: 'ROJO', color: '#EF4444' },
    { name: 'AZUL', color: '#3B82F6' },
    { name: 'VERDE', color: '#22C55E' },
    { name: 'AMARILLO', color: '#EAB308' },
    { name: 'MORADO', color: '#A855F7' },
    { name: 'NARANJA', color: '#F97316' },
  ],
  it: [
    { name: 'ROSSO', color: '#EF4444' },
    { name: 'BLU', color: '#3B82F6' },
    { name: 'VERDE', color: '#22C55E' },
    { name: 'GIALLO', color: '#EAB308' },
    { name: 'VIOLA', color: '#A855F7' },
    { name: 'ARANCIONE', color: '#F97316' },
  ],
};

const GAME_DURATION = 30;

const ColorMatchGame: React.FC<ColorMatchGameProps> = ({ language = 'tr' }) => {
  const [currentWord, setCurrentWord] = useState<ColorWord | null>(null);
  const [isMatch, setIsMatch] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const timerRef = useRef<number | null>(null);
  const t = translations[language];
  const colors = colorData[language];

  const generateWord = useCallback(() => {
    const wordIndex = Math.floor(Math.random() * colors.length);
    const colorIndex = Math.floor(Math.random() * colors.length);
    
    // 50% chance to match
    const shouldMatch = Math.random() > 0.5;
    const finalColorIndex = shouldMatch ? wordIndex : colorIndex;
    
    setCurrentWord({
      word: colors[wordIndex].name,
      color: colors[finalColorIndex].color,
      colorName: colors[finalColorIndex].name
    });
    setIsMatch(wordIndex === finalColorIndex);
  }, [colors]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setStreak(0);
    setIsPlaying(true);
    setIsGameOver(false);
    setFeedback(null);
    generateWord();
  };

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

  const handleAnswer = (answer: boolean) => {
    if (!isPlaying || !currentWord) return;

    const isCorrect = answer === isMatch;
    
    if (isCorrect) {
      const points = 10 + streak * 2;
      setScore(prev => prev + points);
      setStreak(prev => {
        const newStreak = prev + 1;
        if (newStreak > bestStreak) setBestStreak(newStreak);
        return newStreak;
      });
      setFeedback('correct');
    } else {
      setStreak(0);
      setFeedback('wrong');
    }

    setTimeout(() => {
      setFeedback(null);
      generateWord();
    }, 300);
  };

  // Keyboard controls
  useEffect(() => {
    if (!isPlaying) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        handleAnswer(true);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        handleAnswer(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isMatch, currentWord]);

  return (
    <div className={`game-container color-match-game ${feedback ? `feedback-${feedback}` : ''}`}>
      <div className="game-score-board">
        <span>🎯 {t.score}: {score}</span>
        <span>⏱️ {t.time}: {timeLeft}s</span>
        {streak > 0 && <span className="streak-display">🔥 {t.streak}: {streak}</span>}
      </div>

      {isPlaying && currentWord && (
        <div className="color-match-content">
          <p className="color-question">{t.question}</p>
          
          <div className="color-word-container">
            <span 
              className="color-word"
              style={{ color: currentWord.color }}
            >
              {currentWord.word}
            </span>
          </div>

          <div className="color-buttons">
            <button 
              className="color-btn yes-btn"
              onClick={() => handleAnswer(true)}
            >
              {t.yes}
            </button>
            <button 
              className="color-btn no-btn"
              onClick={() => handleAnswer(false)}
            >
              {t.no}
            </button>
          </div>

          <p className="keyboard-hint">← A / D →</p>
        </div>
      )}

      {!isPlaying && !isGameOver && (
        <div className="color-match-start">
          <h2>🎨 {t.title}</h2>
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
          <p>{t.best} {t.streak}: {bestStreak}</p>
          <button className="game-btn game-btn-primary" onClick={startGame}>
            {t.playAgain}
          </button>
        </div>
      )}
    </div>
  );
};

export default ColorMatchGame;
