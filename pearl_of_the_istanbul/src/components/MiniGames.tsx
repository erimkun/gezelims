import React, { useState } from 'react';
import './MiniGames.css';
import MemoryGame from './games/MemoryGame';
import SnakeGame from './games/SnakeGame';
import BalloonPopGame from './games/BalloonPopGame';
import RunnerGame from './games/RunnerGame';

type LanguageKey = 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it';

interface MiniGamesProps {
  language?: LanguageKey;
  onBack?: () => void;
}

const translations = {
  tr: {
    title: 'Mini Oyunlar',
    subtitle: 'Hızlı, mobil dostu mini oyunlar — temaya uygun renklerle.',
    backToMap: 'Haritaya Dön',
    play: 'Oyna',
    comingSoon: 'Bu oyun henüz yapım aşamasında.',
    comingSoonSub: 'Çok yakında burada olacak! 🚧',
    memory: { title: 'Hafıza Oyunu', description: 'Kart eşleştirme oyunu — hafızanı teste sok.' },
    snake: { title: 'Mini Yılan', description: 'Klasik yılan oyunu, kısa ve mobil dostu.' },
    balloon: { title: 'Balon Patlatma', description: 'Balonları patlat — kaçırmamaya çalış!' },
    runner: { title: 'Sonsuz Koşu', description: 'Engellerden kaç, altınları topla!' },
    puzzle: { title: 'Karo Bulmaca', description: 'Resmi yeniden oluştur — hızlı ve keyifli.' },
    reaction: { title: 'Refleks Testi', description: 'Refleks testi — en hızlı sen misin?' },
  },
  en: {
    title: 'Mini Games',
    subtitle: 'Fast, mobile-friendly mini games with theme colors.',
    backToMap: 'Back to Map',
    play: 'Play',
    comingSoon: 'This game is under development.',
    comingSoonSub: 'Coming soon! 🚧',
    memory: { title: 'Memory Match', description: 'Card matching game — test your memory.' },
    snake: { title: 'Mini Snake', description: 'Classic snake game, short and mobile-friendly.' },
    balloon: { title: 'Balloon Pop', description: 'Pop the balloons — try not to miss!' },
    runner: { title: 'Endless Runner', description: 'Dodge obstacles, collect coins!' },
    puzzle: { title: 'Tile Puzzle', description: 'Reconstruct the image — fast and fun.' },
    reaction: { title: 'Reaction Test', description: 'Reflex test — are you the fastest?' },
  },
  de: {
    title: 'Mini-Spiele',
    subtitle: 'Schnelle, mobilfreundliche Mini-Spiele mit Themenfarben.',
    backToMap: 'Zurück zur Karte',
    play: 'Spielen',
    comingSoon: 'Dieses Spiel ist in Entwicklung.',
    comingSoonSub: 'Kommt bald! 🚧',
    memory: { title: 'Memory', description: 'Kartenpaare finden — teste dein Gedächtnis.' },
    snake: { title: 'Mini Snake', description: 'Klassisches Snake-Spiel, kurz und mobilfreundlich.' },
    balloon: { title: 'Ballons platzen', description: 'Platze die Ballons — verpasse keine!' },
    runner: { title: 'Endlos-Läufer', description: 'Weiche Hindernissen aus, sammle Münzen!' },
    puzzle: { title: 'Kachel-Puzzle', description: 'Bild wiederherstellen — schnell und lustig.' },
    reaction: { title: 'Reaktionstest', description: 'Reflextest — bist du der Schnellste?' },
  },
  fr: {
    title: 'Mini Jeux',
    subtitle: 'Mini jeux rapides et adaptés aux mobiles.',
    backToMap: 'Retour à la Carte',
    play: 'Jouer',
    comingSoon: 'Ce jeu est en développement.',
    comingSoonSub: 'Bientôt disponible! 🚧',
    memory: { title: 'Memory', description: 'Jeu de paires — testez votre mémoire.' },
    snake: { title: 'Mini Snake', description: 'Jeu de serpent classique, court et mobile.' },
    balloon: { title: 'Éclater Ballons', description: 'Éclatez les ballons — ne manquez pas!' },
    puzzle: { title: 'Puzzle Tuiles', description: 'Reconstruisez l\'image — rapide et amusant.' },
    reaction: { title: 'Test de Réaction', description: 'Test de réflexes — êtes-vous le plus rapide?' },
  },
  es: {
    title: 'Mini Juegos',
    subtitle: 'Mini juegos rápidos y aptos para móviles.',
    backToMap: 'Volver al Mapa',
    play: 'Jugar',
    comingSoon: 'Este juego está en desarrollo.',
    comingSoonSub: '¡Próximamente! 🚧',
    memory: { title: 'Memoria', description: 'Juego de emparejar cartas — pon a prueba tu memoria.' },
    snake: { title: 'Mini Serpiente', description: 'Juego de serpiente clásico, corto y móvil.' },
    balloon: { title: 'Explotar Globos', description: '¡Explota los globos — no falles!' },
    puzzle: { title: 'Rompecabezas', description: 'Reconstruye la imagen — rápido y divertido.' },
    reaction: { title: 'Test de Reacción', description: 'Test de reflejos — ¿eres el más rápido?' },
  },
  it: {
    title: 'Mini Giochi',
    subtitle: 'Mini giochi veloci e adatti ai dispositivi mobili.',
    backToMap: 'Torna alla Mappa',
    play: 'Gioca',
    comingSoon: 'Questo gioco è in sviluppo.',
    comingSoonSub: 'Prossimamente! 🚧',
    memory: { title: 'Memory', description: 'Gioco di abbinamento carte — metti alla prova la memoria.' },
    snake: { title: 'Mini Snake', description: 'Classico gioco del serpente, breve e mobile.' },
    balloon: { title: 'Scoppia Palloncini', description: 'Scoppia i palloncini — non mancarne nessuno!' },
    puzzle: { title: 'Puzzle Tessere', description: 'Ricostruisci l\'immagine — veloce e divertente.' },
    reaction: { title: 'Test di Reazione', description: 'Test dei riflessi — sei il più veloce?' },
  },
};

const gameConfigs = [
  { id: 'memory', color: '#F472B6', emoji: '🧠' },
  { id: 'snake', color: '#34D399', emoji: '🐍' },
  { id: 'balloon', color: '#F87171', emoji: '🎈' },
  { id: 'runner', color: '#87CEEB', emoji: '🏃' },
  { id: 'puzzle', color: '#60A5FA', emoji: '🧩' },
  { id: 'reaction', color: '#FBBF24', emoji: '⚡️' },
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
            <article 
              key={g.id} 
              className="game-card" 
              style={{ borderColor: g.color }} 
              tabIndex={0}
              role="listitem"
              aria-label={gameInfo.title}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveGame(g.id);
                }
              }}
            >
              <div className="game-card-top" style={{ background: `linear-gradient(135deg, ${g.color}22, ${g.color}11)` }}>
                <div className="game-thumb" style={{ backgroundColor: g.color }}>
                  <span className="game-emoji" aria-hidden="true">{g.emoji}</span>
                </div>
              </div>
              <div className="game-card-body">
                <h3>{gameInfo.title}</h3>
                <p className="game-desc">{gameInfo.description}</p>
                <div className="game-actions">
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => setActiveGame(g.id)}
                    aria-label={`${t.play} ${gameInfo.title}`}
                  >
                    {t.play}
                  </button>
                </div>
              </div>
            </article>
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
              <h2 id="game-modal-title">{getGameInfo(activeGame).title}</h2>
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
