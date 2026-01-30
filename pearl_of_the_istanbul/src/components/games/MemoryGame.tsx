import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import './Games.css';

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryGameProps {
  language?: 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it';
}

const EMOJIS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
const GRID_SIZE = 4;

const translations = {
  tr: {
    moves: 'Hamle',
    restart: 'Yeniden Başlat',
    congratulations: 'Tebrikler! 🎉',
    completedIn: 'Oyunu {moves} hamlede bitirdin.',
    playAgain: 'Tekrar Oyna',
    cardFlipped: 'Kart açıldı',
    cardHidden: 'Kapalı kart',
    matched: 'Eşleşti!',
    noMatch: 'Eşleşmedi',
    instructions: 'Ok tuşları ile kartlar arasında gezin. Enter veya Space ile kart açın.',
  },
  en: {
    moves: 'Moves',
    restart: 'Restart',
    congratulations: 'Congratulations! 🎉',
    completedIn: 'You completed in {moves} moves.',
    playAgain: 'Play Again',
    cardFlipped: 'Card flipped',
    cardHidden: 'Hidden card',
    matched: 'Matched!',
    noMatch: 'No match',
    instructions: 'Use arrow keys to navigate cards. Press Enter or Space to flip.',
  },
  de: {
    moves: 'Züge',
    restart: 'Neustart',
    congratulations: 'Glückwunsch! 🎉',
    completedIn: 'Du hast in {moves} Zügen gewonnen.',
    playAgain: 'Nochmal spielen',
    cardFlipped: 'Karte umgedreht',
    cardHidden: 'Versteckte Karte',
    matched: 'Treffer!',
    noMatch: 'Kein Treffer',
    instructions: 'Pfeiltasten zum Navigieren. Enter oder Leertaste zum Aufdecken.',
  },
  fr: {
    moves: 'Coups',
    restart: 'Recommencer',
    congratulations: 'Félicitations! 🎉',
    completedIn: 'Terminé en {moves} coups.',
    playAgain: 'Rejouer',
    cardFlipped: 'Carte retournée',
    cardHidden: 'Carte cachée',
    matched: 'Trouvé!',
    noMatch: 'Pas de match',
    instructions: 'Flèches pour naviguer. Entrée ou Espace pour retourner.',
  },
  es: {
    moves: 'Movimientos',
    restart: 'Reiniciar',
    congratulations: '¡Felicidades! 🎉',
    completedIn: 'Completado en {moves} movimientos.',
    playAgain: 'Jugar de nuevo',
    cardFlipped: 'Carta volteada',
    cardHidden: 'Carta oculta',
    matched: '¡Coincide!',
    noMatch: 'No coincide',
    instructions: 'Flechas para navegar. Enter o Espacio para voltear.',
  },
  it: {
    moves: 'Mosse',
    restart: 'Ricomincia',
    congratulations: 'Congratulazioni! 🎉',
    completedIn: 'Completato in {moves} mosse.',
    playAgain: 'Gioca ancora',
    cardFlipped: 'Carta girata',
    cardHidden: 'Carta nascosta',
    matched: 'Trovato!',
    noMatch: 'Nessuna corrispondenza',
    instructions: 'Frecce per navigare. Invio o Spazio per girare.',
  },
};

const MemoryGame: React.FC<MemoryGameProps> = ({ language = 'tr' }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [announcement, setAnnouncement] = useState('');
  
  const gridRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  
  const t = translations[language];

  // Screen reader announcement
  const announce = useCallback((message: string) => {
    setAnnouncement(message);
    setTimeout(() => setAnnouncement(''), 1000);
  }, []);

  const initializeGame = useCallback(() => {
    const shuffledEmojis = [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5);
    
    const newCards = shuffledEmojis.map((emoji, index) => ({
      id: index,
      emoji,
      isFlipped: false,
      isMatched: false,
    }));

    setCards(newCards);
    setFlippedCards([]);
    setMoves(0);
    setIsGameOver(false);
    setFocusedIndex(0);
    
    // Focus first card after initialization
    setTimeout(() => {
      cardRefs.current[0]?.focus();
    }, 100);
  }, []);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const handleCardClick = useCallback((id: number) => {
    if (flippedCards.length === 2 || cards[id].isFlipped || cards[id].isMatched) return;

    const newCards = [...cards];
    newCards[id].isFlipped = true;
    setCards(newCards);
    announce(`${t.cardFlipped}: ${newCards[id].emoji}`);

    const newFlippedCards = [...flippedCards, id];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoves(m => m + 1);
      checkForMatch(newFlippedCards, newCards);
    }
  }, [cards, flippedCards, announce, t.cardFlipped]);

  const checkForMatch = useCallback((currentFlipped: number[], currentCards: Card[]) => {
    const [first, second] = currentFlipped;
    if (currentCards[first].emoji === currentCards[second].emoji) {
      const newCards = [...currentCards];
      newCards[first].isMatched = true;
      newCards[second].isMatched = true;
      setCards(newCards);
      setFlippedCards([]);
      announce(t.matched);
      
      if (newCards.every(card => card.isMatched)) {
        setIsGameOver(true);
        announce(t.congratulations);
      }
    } else {
      announce(t.noMatch);
      setTimeout(() => {
        const newCards = [...currentCards];
        newCards[first].isFlipped = false;
        newCards[second].isFlipped = false;
        setCards(newCards);
        setFlippedCards([]);
      }, 1000);
    }
  }, [announce, t.matched, t.noMatch, t.congratulations]);

  // Keyboard navigation handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent, cardId: number) => {
    const currentIndex = cardId;
    let newIndex = currentIndex;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        newIndex = Math.max(0, currentIndex - GRID_SIZE);
        break;
      case 'ArrowDown':
        e.preventDefault();
        newIndex = Math.min(cards.length - 1, currentIndex + GRID_SIZE);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        newIndex = Math.max(0, currentIndex - 1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        newIndex = Math.min(cards.length - 1, currentIndex + 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleCardClick(cardId);
        return;
      case 'r':
      case 'R':
        e.preventDefault();
        initializeGame();
        return;
    }

    if (newIndex !== currentIndex) {
      setFocusedIndex(newIndex);
      cardRefs.current[newIndex]?.focus();
    }
  }, [cards.length, handleCardClick, initializeGame]);

  const getCardLabel = (card: Card, index: number): string => {
    const row = Math.floor(index / GRID_SIZE) + 1;
    const col = (index % GRID_SIZE) + 1;
    const position = `Satır ${row}, Sütun ${col}`;
    
    if (card.isMatched) {
      return `${card.emoji} - Eşleşti. ${position}`;
    }
    if (card.isFlipped) {
      return `${card.emoji}. ${position}`;
    }
    return `${t.cardHidden}. ${position}`;
  };

  return (
    <div 
      className="game-container memory-game"
      role="application"
      aria-label="Hafıza Oyunu"
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
      <span id="memory-instructions" className="sr-only">
        {t.instructions}
      </span>

      <div className="game-score-board" role="status" aria-live="polite">
        <span aria-label={`${t.moves}: ${moves}`}>{t.moves}: {moves}</span>
        <button 
          className="game-btn game-btn-primary" 
          onClick={initializeGame}
          aria-label={t.restart}
        >
          {t.restart}
        </button>
      </div>

      <div 
        ref={gridRef}
        className="memory-grid"
        role="grid"
        aria-label="Hafıza kartları"
        aria-rowcount={GRID_SIZE}
        aria-colcount={GRID_SIZE}
        aria-describedby="memory-instructions"
      >
        {cards.map((card, index) => (
          <button
            key={card.id}
            ref={el => cardRefs.current[index] = el}
            className={`memory-card ${card.isFlipped || card.isMatched ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''}`}
            onClick={() => handleCardClick(card.id)}
            onKeyDown={(e) => handleKeyDown(e, card.id)}
            role="gridcell"
            aria-label={getCardLabel(card, index)}
            aria-pressed={card.isFlipped || card.isMatched}
            aria-disabled={card.isMatched}
            tabIndex={index === focusedIndex ? 0 : -1}
            aria-rowindex={Math.floor(index / GRID_SIZE) + 1}
            aria-colindex={(index % GRID_SIZE) + 1}
          >
            <span aria-hidden="true">
              {(card.isFlipped || card.isMatched) ? card.emoji : '❓'}
            </span>
          </button>
        ))}
      </div>

      {isGameOver && (
        <div 
          className="game-over-overlay"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="game-over-title"
          aria-describedby="game-over-desc"
        >
          <h2 id="game-over-title">{t.congratulations}</h2>
          <p id="game-over-desc">{t.completedIn.replace('{moves}', moves.toString())}</p>
          <button 
            className="game-btn game-btn-primary" 
            onClick={initializeGame}
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
export default memo(MemoryGame, (prevProps, nextProps) => {
  return prevProps.language === nextProps.language;
});
