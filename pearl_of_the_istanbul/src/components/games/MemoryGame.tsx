import React, { useState, useEffect } from 'react';
import './Games.css';

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const EMOJIS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];

const MemoryGame: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
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
  };

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2 || cards[id].isFlipped || cards[id].isMatched) return;

    const newCards = [...cards];
    newCards[id].isFlipped = true;
    setCards(newCards);

    const newFlippedCards = [...flippedCards, id];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoves(m => m + 1);
      checkForMatch(newFlippedCards);
    }
  };

  const checkForMatch = (currentFlipped: number[]) => {
    const [first, second] = currentFlipped;
    if (cards[first].emoji === cards[second].emoji) {
      const newCards = [...cards];
      newCards[first].isMatched = true;
      newCards[second].isMatched = true;
      setCards(newCards);
      setFlippedCards([]);
      
      if (newCards.every(card => card.isMatched)) {
        setIsGameOver(true);
      }
    } else {
      setTimeout(() => {
        const newCards = [...cards];
        newCards[first].isFlipped = false;
        newCards[second].isFlipped = false;
        setCards(newCards);
        setFlippedCards([]);
      }, 1000);
    }
  };

  return (
    <div className="game-container">
      <div className="game-score-board">
        <span>Moves: {moves}</span>
        <button className="game-btn game-btn-primary" onClick={initializeGame}>Restart</button>
      </div>

      <div className="memory-grid">
        {cards.map(card => (
          <div
            key={card.id}
            className={`memory-card ${card.isFlipped || card.isMatched ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''}`}
            onClick={() => handleCardClick(card.id)}
          >
            {(card.isFlipped || card.isMatched) ? card.emoji : ''}
          </div>
        ))}
      </div>

      {isGameOver && (
        <div className="game-over-overlay">
          <h2>Tebrikler! 🎉</h2>
          <p>Oyunu {moves} hamlede bitirdin.</p>
          <button className="game-btn game-btn-primary" onClick={initializeGame}>Tekrar Oyna</button>
        </div>
      )}
    </div>
  );
};

export default MemoryGame;
