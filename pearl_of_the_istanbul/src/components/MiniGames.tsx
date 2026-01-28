import React, { useState } from 'react';
import './MiniGames.css';
import MemoryGame from './games/MemoryGame';
import SnakeGame from './games/SnakeGame';
import BalloonPopGame from './games/BalloonPopGame';
import RunnerGame from './games/RunnerGame';
import TilePuzzleGame from './games/TilePuzzleGame';
import ReactionGame from './games/ReactionGame';
import WhackAMoleGame from './games/WhackAMoleGame';
import ColorMatchGame from './games/ColorMatchGame';
import Game2048 from './games/Game2048';
import UskudarQuizGame from './games/UskudarQuizGame';
import TicTacToeGame from './games/TicTacToeGame';
import MathRaceGame from './games/MathRaceGame';
import TargetShootGame from './games/TargetShootGame';

type LanguageKey = 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it';

interface MiniGamesProps {
  language?: LanguageKey;
  onBack?: () => void;
}

const translations = {
  tr: {
    title: '🎮 Mini Oyunlar',
    subtitle: 'Eğlenceli mini oyunlarla vakit geçir!',
    backToMap: 'Haritaya Dön',
    play: 'Oyna',
    comingSoon: 'Bu oyun henüz yapım aşamasında.',
    comingSoonSub: 'Çok yakında burada olacak! 🚧',
    memory: { title: 'Hafıza Oyunu', description: 'Kartları eşleştir, hafızanı test et!' },
    snake: { title: 'Mini Yılan', description: 'Klasik yılan, basit ve eğlenceli.' },
    balloon: { title: 'Balon Patlatma', description: 'Balonları yakala ve patlat!' },
    runner: { title: 'Sonsuz Koşu', description: 'Engelleri aş, altınları topla!' },
    puzzle: { title: 'Karo Bulmaca', description: 'Karoları sırala, bulmacayı çöz!' },
    reaction: { title: 'Refleks Testi', description: 'Ne kadar hızlısın? Test et!' },
    whack: { title: 'Köstebek Vur', description: 'Köstebekleri yakala, bombalara dikkat!' },
    color: { title: 'Renk Eşleştir', description: 'Renk ve kelimeyi eşleştir!' },
    game2048: { title: '2048', description: 'Sayıları birleştir, 2048\'e ulaş!' },
    uskudarQuiz: { title: 'Üsküdar Quiz', description: 'Üsküdar\'ı ne kadar tanıyorsun?' },
    tictactoe: { title: 'XOX', description: 'Klasik XOX, arkadaşınla veya yapay zekaya karşı!' },
    mathrace: { title: 'Matematik Yarışı', description: 'Hızlı matematik, beynini çalıştır!' },
    targetshoot: { title: 'Hedef Vur', description: 'Hedefleri yakala, puan topla!' },
  },
  en: {
    title: '🎮 Mini Games',
    subtitle: 'Have fun with quick mini games!',
    backToMap: 'Back to Map',
    play: 'Play',
    comingSoon: 'This game is under development.',
    comingSoonSub: 'Coming soon! 🚧',
    memory: { title: 'Memory Match', description: 'Match cards, test your memory!' },
    snake: { title: 'Mini Snake', description: 'Classic snake, simple and fun.' },
    balloon: { title: 'Balloon Pop', description: 'Catch and pop the balloons!' },
    runner: { title: 'Endless Runner', description: 'Dodge obstacles, collect coins!' },
    puzzle: { title: 'Tile Puzzle', description: 'Arrange tiles, solve the puzzle!' },
    reaction: { title: 'Reaction Test', description: 'How fast are you? Find out!' },
    whack: { title: 'Whack-a-Mole', description: 'Hit moles, avoid bombs!' },
    color: { title: 'Color Match', description: 'Match colors with words!' },
    game2048: { title: '2048', description: 'Merge numbers, reach 2048!' },
    uskudarQuiz: { title: 'Üsküdar Quiz', description: 'How well do you know Üsküdar?' },
    tictactoe: { title: 'Tic-Tac-Toe', description: 'Classic game, vs friend or AI!' },
    mathrace: { title: 'Math Race', description: 'Quick math, train your brain!' },
    targetshoot: { title: 'Target Shoot', description: 'Hit targets, score points!' },
  },
  de: {
    title: '🎮 Mini-Spiele',
    subtitle: 'Hab Spaß mit schnellen Mini-Spielen!',
    backToMap: 'Zurück zur Karte',
    play: 'Spielen',
    comingSoon: 'Dieses Spiel ist in Entwicklung.',
    comingSoonSub: 'Kommt bald! 🚧',
    memory: { title: 'Memory', description: 'Karten finden, Gedächtnis testen!' },
    snake: { title: 'Mini Snake', description: 'Klassische Schlange, einfach und lustig.' },
    balloon: { title: 'Ballons platzen', description: 'Fang und platze die Ballons!' },
    runner: { title: 'Endlos-Läufer', description: 'Weiche aus, sammle Münzen!' },
    puzzle: { title: 'Kachel-Puzzle', description: 'Ordne Kacheln, löse das Puzzle!' },
    reaction: { title: 'Reaktionstest', description: 'Wie schnell bist du? Finde es heraus!' },
    whack: { title: 'Maulwurf schlagen', description: 'Triff Maulwürfe, vermeide Bomben!' },
    color: { title: 'Farb-Match', description: 'Farben mit Wörtern abgleichen!' },
    game2048: { title: '2048', description: 'Zahlen verbinden, 2048 erreichen!' },
    uskudarQuiz: { title: 'Üsküdar Quiz', description: 'Wie gut kennst du Üsküdar?' },
    tictactoe: { title: 'Tic-Tac-Toe', description: 'Klassisches Spiel, gegen Freund oder KI!' },
    mathrace: { title: 'Mathe-Rennen', description: 'Schnelle Mathe, trainiere dein Gehirn!' },
    targetshoot: { title: 'Zielschießen', description: 'Triff Ziele, sammle Punkte!' },
  },
  fr: {
    title: '🎮 Mini Jeux',
    subtitle: 'Amuse-toi avec des mini jeux rapides!',
    backToMap: 'Retour à la Carte',
    play: 'Jouer',
    comingSoon: 'Ce jeu est en développement.',
    comingSoonSub: 'Bientôt disponible! 🚧',
    memory: { title: 'Memory', description: 'Trouve les paires, teste ta mémoire!' },
    snake: { title: 'Mini Snake', description: 'Serpent classique, simple et amusant.' },
    balloon: { title: 'Éclater Ballons', description: 'Attrape et éclate les ballons!' },
    runner: { title: 'Course Infinie', description: 'Esquive et collecte les pièces!' },
    puzzle: { title: 'Puzzle Tuiles', description: 'Arrange les tuiles, résous le puzzle!' },
    reaction: { title: 'Test de Réaction', description: 'Tu es rapide? Découvre-le!' },
    whack: { title: 'Tape-Taupe', description: 'Frappe les taupes, évite les bombes!' },
    color: { title: 'Match Couleur', description: 'Associe couleurs et mots!' },
    game2048: { title: '2048', description: 'Fusionne les nombres, atteins 2048!' },
    uskudarQuiz: { title: 'Quiz Üsküdar', description: 'Connaissez-vous Üsküdar?' },
    tictactoe: { title: 'Morpion', description: 'Jeu classique, contre ami ou IA!' },
    mathrace: { title: 'Course Math', description: 'Maths rapides, entraîne ton cerveau!' },
    targetshoot: { title: 'Tir à la Cible', description: 'Touche les cibles, marque des points!' },
  },
  es: {
    title: '🎮 Mini Juegos',
    subtitle: '¡Diviértete con mini juegos rápidos!',
    backToMap: 'Volver al Mapa',
    play: 'Jugar',
    comingSoon: 'Este juego está en desarrollo.',
    comingSoonSub: '¡Próximamente! 🚧',
    memory: { title: 'Memoria', description: '¡Empareja cartas, prueba tu memoria!' },
    snake: { title: 'Mini Serpiente', description: 'Serpiente clásica, simple y divertida.' },
    balloon: { title: 'Explotar Globos', description: '¡Atrapa y explota los globos!' },
    runner: { title: 'Carrera Infinita', description: '¡Esquiva y recoge monedas!' },
    puzzle: { title: 'Rompecabezas', description: '¡Ordena fichas, resuelve el puzzle!' },
    reaction: { title: 'Test de Reacción', description: '¿Qué tan rápido eres? ¡Descúbrelo!' },
    whack: { title: 'Golpea al Topo', description: '¡Golpea topos, evita bombas!' },
    color: { title: 'Match de Color', description: '¡Asocia colores con palabras!' },
    game2048: { title: '2048', description: '¡Fusiona números, alcanza 2048!' },
    uskudarQuiz: { title: 'Quiz Üsküdar', description: '¿Cuánto conoces Üsküdar?' },
    tictactoe: { title: 'Tres en Raya', description: '¡Juego clásico, contra amigo o IA!' },
    mathrace: { title: 'Carrera Matemática', description: '¡Mates rápidas, entrena tu cerebro!' },
    targetshoot: { title: 'Tiro al Blanco', description: '¡Acierta objetivos, suma puntos!' },
  },
  it: {
    title: '🎮 Mini Giochi',
    subtitle: 'Divertiti con mini giochi veloci!',
    backToMap: 'Torna alla Mappa',
    play: 'Gioca',
    comingSoon: 'Questo gioco è in sviluppo.',
    comingSoonSub: 'Prossimamente! 🚧',
    memory: { title: 'Memory', description: 'Abbina carte, testa la memoria!' },
    snake: { title: 'Mini Snake', description: 'Serpente classico, semplice e divertente.' },
    balloon: { title: 'Scoppia Palloncini', description: 'Cattura e scoppia i palloncini!' },
    runner: { title: 'Corsa Infinita', description: 'Schiva e raccogli monete!' },
    puzzle: { title: 'Puzzle Tessere', description: 'Ordina tessere, risolvi il puzzle!' },
    reaction: { title: 'Test di Reazione', description: 'Quanto sei veloce? Scoprilo!' },
    whack: { title: 'Acchiappa Talpa', description: 'Colpisci talpe, evita bombe!' },
    color: { title: 'Match Colore', description: 'Abbina colori con parole!' },
    game2048: { title: '2048', description: 'Unisci numeri, raggiungi 2048!' },
    uskudarQuiz: { title: 'Quiz Üsküdar', description: 'Quanto conosci Üsküdar?' },
    tictactoe: { title: 'Tris', description: 'Gioco classico, contro amico o IA!' },
    mathrace: { title: 'Gara Matematica', description: 'Matematica veloce, allena il cervello!' },
    targetshoot: { title: 'Tiro al Bersaglio', description: 'Colpisci bersagli, fai punti!' },
  },
};

const gameConfigs = [
  { id: 'memory', color: '#F472B6', emoji: '🧠', gradient: 'linear-gradient(135deg, #F472B6 0%, #EC4899 100%)' },
  { id: 'snake', color: '#34D399', emoji: '🐍', gradient: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)' },
  { id: 'balloon', color: '#F87171', emoji: '🎈', gradient: 'linear-gradient(135deg, #F87171 0%, #EF4444 100%)' },
  { id: 'runner', color: '#60A5FA', emoji: '🏃', gradient: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)' },
  { id: 'puzzle', color: '#A78BFA', emoji: '🧩', gradient: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' },
  { id: 'reaction', color: '#FBBF24', emoji: '⚡', gradient: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)' },
  { id: 'whack', color: '#4ADE80', emoji: '🐹', gradient: 'linear-gradient(135deg, #4ADE80 0%, #22C55E 100%)' },
  { id: 'color', color: '#818CF8', emoji: '🎨', gradient: 'linear-gradient(135deg, #818CF8 0%, #6366F1 100%)' },
  { id: 'game2048', color: '#F2B179', emoji: '🔢', gradient: 'linear-gradient(135deg, #EBC850 0%, #EDC22E 100%)' },
  { id: 'uskudarQuiz', color: '#00D4FF', emoji: '🏰', gradient: 'linear-gradient(135deg, #00D4FF 0%, #7B2FF7 100%)' },
  { id: 'tictactoe', color: '#818CF8', emoji: '⭕', gradient: 'linear-gradient(135deg, #60A5FA 0%, #F472B6 100%)' },
  { id: 'mathrace', color: '#22D3EE', emoji: '🧮', gradient: 'linear-gradient(135deg, #22D3EE 0%, #A855F7 100%)' },
  { id: 'targetshoot', color: '#EF4444', emoji: '🎯', gradient: 'linear-gradient(135deg, #EF4444 0%, #F97316 100%)' },
];

const MiniGames: React.FC<MiniGamesProps> = ({ language = 'tr', onBack }) => {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const t = translations[language];

  const getGameInfo = (id: string) => {
    return t[id as keyof typeof t] as { title: string; description: string };
  };

  const renderGame = () => {
    switch (activeGame) {
      case 'memory': return <MemoryGame />;
      case 'snake': return <SnakeGame />;
      case 'balloon': return <BalloonPopGame />;
      case 'runner': return <RunnerGame />;
      case 'puzzle': return <TilePuzzleGame language={language} />;
      case 'reaction': return <ReactionGame language={language} />;
      case 'whack': return <WhackAMoleGame language={language} />;
      case 'color': return <ColorMatchGame language={language} />;
      case 'game2048': return <Game2048 language={language} />;
      case 'uskudarQuiz': return <UskudarQuizGame language={language} />;
      case 'tictactoe': return <TicTacToeGame language={language} />;
      case 'mathrace': return <MathRaceGame language={language} />;
      case 'targetshoot': return <TargetShootGame language={language} />;
      default: return (
        <div className="placeholder-game">
          <p>{t.comingSoon}</p>
          <p>{t.comingSoonSub}</p>
        </div>
      );
    }
  };

  return (
    <div className="mini-games-root">
      <header className="mini-games-header">
        {onBack && (
          <button 
            className="back-to-map-btn" 
            onClick={onBack}
            aria-label={t.backToMap}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span>{t.backToMap}</span>
          </button>
        )}
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
      </header>

      <main className="games-grid" role="list" aria-label={t.title}>
        {gameConfigs.map((g) => {
          const gameInfo = getGameInfo(g.id);
          return (
            <button 
              key={g.id} 
              className="game-card-new"
              onClick={() => setActiveGame(g.id)}
              aria-label={`${t.play} ${gameInfo.title}`}
            >
              <div className="game-card-bg" style={{ background: g.gradient }} />
              <div className="game-card-content">
                <span className="game-emoji-large">{g.emoji}</span>
                <h3>{gameInfo.title}</h3>
                <p>{gameInfo.description}</p>
              </div>
              <div className="game-card-play">
                <span className="play-icon">▶</span>
                <span>{t.play}</span>
              </div>
            </button>
          );
        })}
      </main>

      {activeGame && (
        <div 
          className="mini-games-modal" 
          onClick={() => setActiveGame(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="game-modal-title"
        >
          <div className="mini-games-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 id="game-modal-title">
                {gameConfigs.find(g => g.id === activeGame)?.emoji} {getGameInfo(activeGame).title}
              </h2>
              <button 
                className="close-btn" 
                onClick={() => setActiveGame(null)}
                aria-label="Kapat"
              >
                ×
              </button>
            </div>
            <div className="mini-games-playarea">
              {renderGame()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MiniGames;
