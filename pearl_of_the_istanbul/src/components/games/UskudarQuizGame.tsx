import React, { useState, useCallback } from 'react';
import './Games.css';

interface UskudarQuizGameProps {
  language?: 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it';
}

const translations = {
  tr: {
    title: 'Üsküdar Bilgi Yarışması',
    subtitle: 'Üsküdar\'ın tarihi ve kültürel mekanlarını ne kadar tanıyorsun?',
    start: 'Başla',
    next: 'Sonraki Soru',
    question: 'Soru',
    score: 'Puan',
    correct: 'Doğru! ✓',
    wrong: 'Yanlış!',
    correctAnswer: 'Doğru cevap:',
    gameOver: 'Tebrikler!',
    yourScore: 'Puanın',
    playAgain: 'Tekrar Oyna',
    perfect: 'Mükemmel! Gerçek bir Üsküdar uzmanısın! 🏆',
    great: 'Harika! Üsküdar\'ı çok iyi biliyorsun! 🌟',
    good: 'İyi! Biraz daha keşfet! 📚',
    tryAgain: 'Üsküdar\'ı keşfetmeye devam et! 🔍'
  },
  en: {
    title: 'Üsküdar Quiz',
    subtitle: 'How well do you know the historical and cultural sites of Üsküdar?',
    start: 'Start',
    next: 'Next Question',
    question: 'Question',
    score: 'Score',
    correct: 'Correct! ✓',
    wrong: 'Wrong!',
    correctAnswer: 'Correct answer:',
    gameOver: 'Congratulations!',
    yourScore: 'Your Score',
    playAgain: 'Play Again',
    perfect: 'Perfect! You are a true Üsküdar expert! 🏆',
    great: 'Great! You know Üsküdar very well! 🌟',
    good: 'Good! Explore a bit more! 📚',
    tryAgain: 'Keep exploring Üsküdar! 🔍'
  },
  de: {
    title: 'Üsküdar Quiz',
    subtitle: 'Wie gut kennst du die historischen Stätten von Üsküdar?',
    start: 'Starten',
    next: 'Nächste Frage',
    question: 'Frage',
    score: 'Punkte',
    correct: 'Richtig! ✓',
    wrong: 'Falsch!',
    correctAnswer: 'Richtige Antwort:',
    gameOver: 'Herzlichen Glückwunsch!',
    yourScore: 'Deine Punkte',
    playAgain: 'Nochmal spielen',
    perfect: 'Perfekt! Du bist ein Üsküdar-Experte! 🏆',
    great: 'Super! Du kennst Üsküdar sehr gut! 🌟',
    good: 'Gut! Entdecke noch mehr! 📚',
    tryAgain: 'Erkunde Üsküdar weiter! 🔍'
  },
  fr: {
    title: 'Quiz Üsküdar',
    subtitle: 'Connaissez-vous les sites historiques d\'Üsküdar?',
    start: 'Commencer',
    next: 'Question suivante',
    question: 'Question',
    score: 'Score',
    correct: 'Correct! ✓',
    wrong: 'Faux!',
    correctAnswer: 'Bonne réponse:',
    gameOver: 'Félicitations!',
    yourScore: 'Votre Score',
    playAgain: 'Rejouer',
    perfect: 'Parfait! Expert d\'Üsküdar! 🏆',
    great: 'Super! Vous connaissez bien Üsküdar! 🌟',
    good: 'Bien! Explorez davantage! 📚',
    tryAgain: 'Continuez à explorer Üsküdar! 🔍'
  },
  es: {
    title: 'Quiz de Üsküdar',
    subtitle: '¿Cuánto conoces los sitios históricos de Üsküdar?',
    start: 'Empezar',
    next: 'Siguiente',
    question: 'Pregunta',
    score: 'Puntos',
    correct: '¡Correcto! ✓',
    wrong: '¡Incorrecto!',
    correctAnswer: 'Respuesta correcta:',
    gameOver: '¡Felicidades!',
    yourScore: 'Tu Puntuación',
    playAgain: 'Jugar de nuevo',
    perfect: '¡Perfecto! ¡Eres experto en Üsküdar! 🏆',
    great: '¡Genial! ¡Conoces muy bien Üsküdar! 🌟',
    good: '¡Bien! ¡Explora más! 📚',
    tryAgain: '¡Sigue explorando Üsküdar! 🔍'
  },
  it: {
    title: 'Quiz Üsküdar',
    subtitle: 'Quanto conosci i siti storici di Üsküdar?',
    start: 'Inizia',
    next: 'Prossima',
    question: 'Domanda',
    score: 'Punti',
    correct: 'Corretto! ✓',
    wrong: 'Sbagliato!',
    correctAnswer: 'Risposta corretta:',
    gameOver: 'Congratulazioni!',
    yourScore: 'Il tuo Punteggio',
    playAgain: 'Gioca ancora',
    perfect: 'Perfetto! Sei un esperto di Üsküdar! 🏆',
    great: 'Ottimo! Conosci bene Üsküdar! 🌟',
    good: 'Bene! Esplora di più! 📚',
    tryAgain: 'Continua a esplorare Üsküdar! 🔍'
  }
};

interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  category: string;
  emoji: string;
  info: string;
}

// Üsküdar'a özgü sorular
const questionsData: Question[] = [
  {
    id: 1,
    question: "Boğaz'ın ortasında yer alan ve Üsküdar'ın simgesi olan tarihi yapı hangisidir?",
    options: ["Galata Kulesi", "Kız Kulesi", "Beylerbeyi Sarayı", "Çamlıca Kulesi"],
    correctIndex: 1,
    category: "Tarihi Yapı",
    emoji: "🏰",
    info: "Kız Kulesi, 2500 yıllık tarihi ile İstanbul'un en eski yapılarından biridir."
  },
  {
    id: 2,
    question: "Mimar Sinan tarafından 1548'de yaptırılan cami hangisidir?",
    options: ["Yeni Valide Camii", "Mihrimah Sultan Camii", "Şemsipaşa Camii", "Atik Valide Camii"],
    correctIndex: 1,
    category: "Cami",
    emoji: "🕌",
    info: "Mihrimah Sultan Camii, Kanuni'nin kızı için yapılmış olup iki adet minaresi vardır."
  },
  {
    id: 3,
    question: "Üsküdar'daki Beylerbeyi Sarayı hangi padişah döneminde inşa edilmiştir?",
    options: ["Sultan Abdülmecid", "Sultan Abdülaziz", "Sultan II. Mahmud", "Sultan II. Abdülhamid"],
    correctIndex: 1,
    category: "Saray",
    emoji: "👑",
    info: "Beylerbeyi Sarayı, 1861-1865 yılları arasında Sultan Abdülaziz için yapılmıştır."
  },
  {
    id: 4,
    question: "Üsküdar'ın en eski semtlerinden biri olan ve sahilde yer alan mahalle hangisidir?",
    options: ["Acıbadem", "Salacak", "Bağlarbaşı", "Altunizade"],
    correctIndex: 1,
    category: "Semt",
    emoji: "🏘️",
    info: "Salacak, Kız Kulesi manzarası ile ünlü tarihi bir sahil semtidir."
  },
  {
    id: 5,
    question: "Çinili Camii'nin diğer adı nedir?",
    options: ["Yeni Valide Camii", "Atik Valide Camii", "Valide-i Atik Camii", "Çinili Hamam Camii"],
    correctIndex: 2,
    category: "Cami",
    emoji: "🕌",
    info: "Çinili Camii, 16. yüzyılda Nurbanu Sultan tarafından yaptırılmıştır."
  },
  {
    id: 6,
    question: "Üsküdar'daki Florence Nightingale Müzesi hangi yapının içindedir?",
    options: ["Beylerbeyi Sarayı", "Selimiye Kışlası", "Adile Sultan Sarayı", "Haydarpaşa Garı"],
    correctIndex: 1,
    category: "Müze",
    emoji: "🏥",
    info: "Florence Nightingale, Kırım Savaşı'nda burada hemşirelik yapmıştır."
  },
  {
    id: 7,
    question: "Adile Sultan Sarayı hangi amaçla kullanılmaktadır?",
    options: ["Müze", "Otel", "Kültür Merkezi", "Üniversite"],
    correctIndex: 2,
    category: "Tarihi Yapı",
    emoji: "🏛️",
    info: "Adile Sultan Sarayı, Sultan Abdülmecid'in kız kardeşi için yaptırılmıştır."
  },
  {
    id: 8,
    question: "Üsküdar'ın en yüksek noktasında bulunan kule hangisidir?",
    options: ["Galata Kulesi", "Beyazıt Kulesi", "Çamlıca Kulesi", "Kız Kulesi"],
    correctIndex: 2,
    category: "Modern Yapı",
    emoji: "📡",
    info: "Çamlıca Kulesi, 369 metre yüksekliği ile Türkiye'nin en yüksek kulesdir."
  },
  {
    id: 9,
    question: "Şemsipaşa Camii'nin mimarı kimdir?",
    options: ["Davut Ağa", "Sedefkar Mehmed Ağa", "Mimar Sinan", "Sarkis Balyan"],
    correctIndex: 2,
    category: "Cami",
    emoji: "🕌",
    info: "Denize en yakın cami olarak bilinir ve 1580'de yapılmıştır."
  },
  {
    id: 10,
    question: "Hababam Sınıfı filmlerinin çekildiği okul hangi semttedir?",
    options: ["Çengelköy", "Kuzguncuk", "Altunizade", "Üsküdar Merkez"],
    correctIndex: 1,
    category: "Kültür",
    emoji: "🎬",
    info: "Kuzguncuk'taki eski okul binası artık bir müze olarak hizmet vermektedir."
  },
  {
    id: 11,
    question: "Nakkaştepe hangi özelliği ile bilinir?",
    options: ["Tarihi çeşmeleri", "Boğaz manzarası", "Antik kalıntıları", "Osmanlı mezarlığı"],
    correctIndex: 1,
    category: "Semt",
    emoji: "🌅",
    info: "Nakkaştepe, İstanbul Boğazı'nın en güzel manzara noktalarından biridir."
  },
  {
    id: 12,
    question: "Üsküdar'daki tarihi Çinili Hamam hangi dönemden kalmadır?",
    options: ["Bizans", "Selçuklu", "Osmanlı", "Cumhuriyet"],
    correctIndex: 2,
    category: "Hamam",
    emoji: "🛁",
    info: "Çinili Hamam, 16. yüzyılda Mimar Sinan tarafından inşa edilmiştir."
  }
];

const UskudarQuizGame: React.FC<UskudarQuizGameProps> = ({ language = 'tr' }) => {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);

  const t = translations[language];
  const totalQuestions = 10;

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const startGame = useCallback(() => {
    const shuffled = shuffleArray(questionsData).slice(0, totalQuestions);
    setQuestions(shuffled);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedOption(null);
    setShowFeedback(false);
    setGameState('playing');
  }, []);

  const handleOptionClick = (index: number) => {
    if (selectedOption !== null) return;
    
    setSelectedOption(index);
    setShowFeedback(true);
    
    if (index === questions[currentQuestionIndex].correctIndex) {
      setScore(prev => prev + 10);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowFeedback(false);
    } else {
      setGameState('result');
    }
  };

  const getResultMessage = () => {
    const percentage = (score / (totalQuestions * 10)) * 100;
    if (percentage === 100) return t.perfect;
    if (percentage >= 70) return t.great;
    if (percentage >= 40) return t.good;
    return t.tryAgain;
  };

  const getStars = () => {
    const percentage = (score / (totalQuestions * 10)) * 100;
    if (percentage === 100) return '⭐⭐⭐⭐⭐';
    if (percentage >= 80) return '⭐⭐⭐⭐';
    if (percentage >= 60) return '⭐⭐⭐';
    if (percentage >= 40) return '⭐⭐';
    return '⭐';
  };

  if (gameState === 'start') {
    return (
      <div className="game-container uskudar-quiz">
        <div className="quiz-start">
          <div className="quiz-landmark-icon">🏰🕌🌉</div>
          <h2>{t.title}</h2>
          <p>{t.subtitle}</p>
          <button className="quiz-start-btn" onClick={startGame}>
            {t.start} 🚀
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'result') {
    return (
      <div className="game-container uskudar-quiz">
        <div className="quiz-result">
          <h2>{t.gameOver}</h2>
          <div className="quiz-stars">{getStars()}</div>
          <div className="quiz-result-score">{score}/{totalQuestions * 10}</div>
          <p className="quiz-result-message">{getResultMessage()}</p>
          <button className="quiz-start-btn" onClick={startGame}>
            {t.playAgain} 🔄
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="game-container uskudar-quiz">
      <div className="quiz-header">
        <div className="quiz-progress">
          <span>{t.question} {currentQuestionIndex + 1}/{totalQuestions}</span>
          <div className="quiz-progress-bar">
            <div 
              className="quiz-progress-fill" 
              style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>
        <div className="quiz-score">
          {t.score}: {score}
        </div>
      </div>

      <div className="quiz-question-container">
        <span className="quiz-category">{currentQuestion.category}</span>
        <div className="quiz-image">{currentQuestion.emoji}</div>
        <p className="quiz-question">{currentQuestion.question}</p>

        <div className="quiz-options">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              className={`quiz-option ${
                selectedOption !== null
                  ? index === currentQuestion.correctIndex
                    ? 'correct'
                    : index === selectedOption
                    ? 'wrong'
                    : ''
                  : ''
              }`}
              onClick={() => handleOptionClick(index)}
              disabled={selectedOption !== null}
            >
              {option}
            </button>
          ))}
        </div>

        {showFeedback && (
          <>
            <div className={`quiz-feedback ${selectedOption === currentQuestion.correctIndex ? 'correct' : 'wrong'}`}>
              {selectedOption === currentQuestion.correctIndex ? t.correct : `${t.wrong} ${t.correctAnswer} ${currentQuestion.options[currentQuestion.correctIndex]}`}
            </div>
            <p className="quiz-info">{currentQuestion.info}</p>
            <button className="quiz-next-btn" onClick={nextQuestion}>
              {currentQuestionIndex < questions.length - 1 ? t.next : t.gameOver} →
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default UskudarQuizGame;
