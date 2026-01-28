import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Games.css';

interface MathRaceGameProps {
  language?: 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it';
}

const translations = {
  tr: {
    title: 'Matematik Yarışı',
    start: 'Başla',
    score: 'Puan',
    time: 'Süre',
    streak: 'Seri',
    correct: 'Doğru!',
    wrong: 'Yanlış!',
    gameOver: 'Süre Doldu!',
    finalScore: 'Toplam Puan',
    playAgain: 'Tekrar Oyna',
    excellent: 'Mükemmel! 🏆',
    great: 'Harika! 🌟',
    good: 'İyi! 👍',
    tryAgain: 'Tekrar dene! 💪'
  },
  en: {
    title: 'Math Race',
    start: 'Start',
    score: 'Score',
    time: 'Time',
    streak: 'Streak',
    correct: 'Correct!',
    wrong: 'Wrong!',
    gameOver: 'Time Up!',
    finalScore: 'Final Score',
    playAgain: 'Play Again',
    excellent: 'Excellent! 🏆',
    great: 'Great! 🌟',
    good: 'Good! 👍',
    tryAgain: 'Try again! 💪'
  },
  de: {
    title: 'Mathe-Rennen',
    start: 'Start',
    score: 'Punkte',
    time: 'Zeit',
    streak: 'Serie',
    correct: 'Richtig!',
    wrong: 'Falsch!',
    gameOver: 'Zeit vorbei!',
    finalScore: 'Endpunktzahl',
    playAgain: 'Nochmal',
    excellent: 'Ausgezeichnet! 🏆',
    great: 'Super! 🌟',
    good: 'Gut! 👍',
    tryAgain: 'Nochmal versuchen! 💪'
  },
  fr: {
    title: 'Course Mathématique',
    start: 'Commencer',
    score: 'Score',
    time: 'Temps',
    streak: 'Série',
    correct: 'Correct!',
    wrong: 'Faux!',
    gameOver: 'Temps écoulé!',
    finalScore: 'Score Final',
    playAgain: 'Rejouer',
    excellent: 'Excellent! 🏆',
    great: 'Super! 🌟',
    good: 'Bien! 👍',
    tryAgain: 'Réessaie! 💪'
  },
  es: {
    title: 'Carrera Matemática',
    start: 'Empezar',
    score: 'Puntos',
    time: 'Tiempo',
    streak: 'Racha',
    correct: '¡Correcto!',
    wrong: '¡Incorrecto!',
    gameOver: '¡Tiempo!',
    finalScore: 'Puntuación Final',
    playAgain: 'Jugar de nuevo',
    excellent: '¡Excelente! 🏆',
    great: '¡Genial! 🌟',
    good: '¡Bien! 👍',
    tryAgain: '¡Inténtalo de nuevo! 💪'
  },
  it: {
    title: 'Gara Matematica',
    start: 'Inizia',
    score: 'Punti',
    time: 'Tempo',
    streak: 'Serie',
    correct: 'Corretto!',
    wrong: 'Sbagliato!',
    gameOver: 'Tempo scaduto!',
    finalScore: 'Punteggio Finale',
    playAgain: 'Gioca ancora',
    excellent: 'Eccellente! 🏆',
    great: 'Fantastico! 🌟',
    good: 'Bene! 👍',
    tryAgain: 'Riprova! 💪'
  }
};

interface Question {
  num1: number;
  num2: number;
  operator: '+' | '-' | '×' | '÷';
  answer: number;
  options: number[];
}

const GAME_DURATION = 60; // seconds

const MathRaceGame: React.FC<MathRaceGameProps> = ({ language = 'tr' }) => {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [question, setQuestion] = useState<Question | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [difficulty, setDifficulty] = useState(1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const t = translations[language];

  const generateQuestion = useCallback((): Question => {
    const operators: ('+' | '-' | '×' | '÷')[] = ['+', '-', '×', '÷'];
    const operator = operators[Math.floor(Math.random() * Math.min(operators.length, difficulty + 1))];
    
    let num1: number, num2: number, answer: number;
    const maxNum = Math.min(5 + difficulty * 3, 20);

    switch (operator) {
      case '+':
        num1 = Math.floor(Math.random() * maxNum) + 1;
        num2 = Math.floor(Math.random() * maxNum) + 1;
        answer = num1 + num2;
        break;
      case '-':
        num1 = Math.floor(Math.random() * maxNum) + 5;
        num2 = Math.floor(Math.random() * Math.min(num1, maxNum)) + 1;
        answer = num1 - num2;
        break;
      case '×':
        num1 = Math.floor(Math.random() * Math.min(10, maxNum)) + 1;
        num2 = Math.floor(Math.random() * Math.min(10, maxNum)) + 1;
        answer = num1 * num2;
        break;
      case '÷':
        num2 = Math.floor(Math.random() * 9) + 2;
        answer = Math.floor(Math.random() * 10) + 1;
        num1 = num2 * answer;
        break;
      default:
        num1 = 1; num2 = 1; answer = 2;
    }

    // Generate wrong options
    const options = new Set<number>([answer]);
    while (options.size < 4) {
      const offset = Math.floor(Math.random() * 10) - 5;
      const wrongAnswer = answer + (offset === 0 ? 1 : offset);
      if (wrongAnswer > 0) options.add(wrongAnswer);
    }

    return {
      num1,
      num2,
      operator,
      answer,
      options: Array.from(options).sort(() => Math.random() - 0.5)
    };
  }, [difficulty]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setStreak(0);
    setBestStreak(0);
    setDifficulty(1);
    setQuestion(generateQuestion());
    setFeedback(null);
  };

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('result');
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [gameState, timeLeft]);

  const handleAnswer = (selectedAnswer: number) => {
    if (!question || feedback) return;

    const isCorrect = selectedAnswer === question.answer;
    setFeedback(isCorrect ? 'correct' : 'wrong');

    if (isCorrect) {
      const bonusPoints = Math.min(streak, 5);
      setScore(prev => prev + 10 + bonusPoints);
      setStreak(prev => {
        const newStreak = prev + 1;
        if (newStreak > bestStreak) setBestStreak(newStreak);
        if (newStreak % 5 === 0) setDifficulty(d => Math.min(d + 1, 5));
        return newStreak;
      });
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      setFeedback(null);
      setQuestion(generateQuestion());
    }, 500);
  };

  const getResultMessage = () => {
    if (score >= 200) return t.excellent;
    if (score >= 100) return t.great;
    if (score >= 50) return t.good;
    return t.tryAgain;
  };

  if (gameState === 'start') {
    return (
      <div className="game-container math-race">
        <div className="math-start">
          <h2>{t.title}</h2>
          <div className="math-icons">
            <span>➕</span>
            <span>➖</span>
            <span>✖️</span>
            <span>➗</span>
          </div>
          <button className="game-btn game-btn-primary math-start-btn" onClick={startGame}>
            {t.start} 🚀
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'result') {
    return (
      <div className="game-container math-race">
        <div className="math-result">
          <h2>{t.gameOver}</h2>
          <div className="math-result-score">{score}</div>
          <p>{t.finalScore}</p>
          <p className="math-result-message">{getResultMessage()}</p>
          <p className="math-best-streak">🔥 {t.streak}: {bestStreak}</p>
          <button className="game-btn game-btn-primary" onClick={startGame}>
            🔄 {t.playAgain}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container math-race">
      <div className="math-header">
        <div className="math-stat">
          <span className="stat-label">{t.score}</span>
          <span className="stat-value">{score}</span>
        </div>
        <div className="math-timer" style={{ 
          '--progress': `${(timeLeft / GAME_DURATION) * 100}%` 
        } as React.CSSProperties}>
          <span>{timeLeft}s</span>
        </div>
        <div className="math-stat">
          <span className="stat-label">🔥 {t.streak}</span>
          <span className="stat-value">{streak}</span>
        </div>
      </div>

      {question && (
        <div className={`math-question ${feedback || ''}`}>
          <div className="math-equation">
            <span className="num">{question.num1}</span>
            <span className="operator">{question.operator}</span>
            <span className="num">{question.num2}</span>
            <span className="equals">=</span>
            <span className="answer-placeholder">?</span>
          </div>

          <div className="math-options">
            {question.options.map((option, index) => (
              <button
                key={index}
                className={`math-option ${
                  feedback === 'correct' && option === question.answer ? 'correct' : ''
                } ${
                  feedback === 'wrong' && option === question.answer ? 'show-correct' : ''
                }`}
                onClick={() => handleAnswer(option)}
                disabled={!!feedback}
              >
                {option}
              </button>
            ))}
          </div>

          {feedback && (
            <div className={`math-feedback ${feedback}`}>
              {feedback === 'correct' ? t.correct : t.wrong}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MathRaceGame;
