import React, { useState, useCallback } from 'react';
import './Games.css';

interface TicTacToeGameProps {
  language?: 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it';
}

const translations = {
  tr: {
    title: 'XOX Oyunu',
    playerX: 'Oyuncu X',
    playerO: 'Oyuncu O',
    turn: 'sırası',
    wins: 'kazandı!',
    draw: 'Berabere!',
    playAgain: 'Tekrar Oyna',
    vsComputer: 'Bilgisayara Karşı',
    vs2Player: '2 Oyuncu',
    you: 'Sen',
    computer: 'Bilgisayar',
    yourTurn: 'Senin sıran!',
    thinking: 'Düşünüyor...'
  },
  en: {
    title: 'Tic-Tac-Toe',
    playerX: 'Player X',
    playerO: 'Player O',
    turn: 'turn',
    wins: 'wins!',
    draw: 'Draw!',
    playAgain: 'Play Again',
    vsComputer: 'vs Computer',
    vs2Player: '2 Players',
    you: 'You',
    computer: 'Computer',
    yourTurn: 'Your turn!',
    thinking: 'Thinking...'
  },
  de: {
    title: 'Tic-Tac-Toe',
    playerX: 'Spieler X',
    playerO: 'Spieler O',
    turn: 'ist dran',
    wins: 'gewinnt!',
    draw: 'Unentschieden!',
    playAgain: 'Nochmal',
    vsComputer: 'gegen Computer',
    vs2Player: '2 Spieler',
    you: 'Du',
    computer: 'Computer',
    yourTurn: 'Du bist dran!',
    thinking: 'Denkt nach...'
  },
  fr: {
    title: 'Morpion',
    playerX: 'Joueur X',
    playerO: 'Joueur O',
    turn: 'à jouer',
    wins: 'gagne!',
    draw: 'Match nul!',
    playAgain: 'Rejouer',
    vsComputer: 'vs Ordinateur',
    vs2Player: '2 Joueurs',
    you: 'Toi',
    computer: 'Ordinateur',
    yourTurn: 'Ton tour!',
    thinking: 'Réfléchit...'
  },
  es: {
    title: 'Tres en Raya',
    playerX: 'Jugador X',
    playerO: 'Jugador O',
    turn: 'turno',
    wins: '¡gana!',
    draw: '¡Empate!',
    playAgain: 'Jugar de nuevo',
    vsComputer: 'vs Ordenador',
    vs2Player: '2 Jugadores',
    you: 'Tú',
    computer: 'Ordenador',
    yourTurn: '¡Tu turno!',
    thinking: 'Pensando...'
  },
  it: {
    title: 'Tris',
    playerX: 'Giocatore X',
    playerO: 'Giocatore O',
    turn: 'turno',
    wins: 'vince!',
    draw: 'Pareggio!',
    playAgain: 'Gioca ancora',
    vsComputer: 'vs Computer',
    vs2Player: '2 Giocatori',
    you: 'Tu',
    computer: 'Computer',
    yourTurn: 'Tocca a te!',
    thinking: 'Sta pensando...'
  }
};

type Cell = 'X' | 'O' | null;
type Board = Cell[];

const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6] // diagonals
];

const TicTacToeGame: React.FC<TicTacToeGameProps> = ({ language = 'tr' }) => {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [gameMode, setGameMode] = useState<'menu' | '2player' | 'computer'>('menu');
  const [scores, setScores] = useState({ x: 0, o: 0, draw: 0 });
  const [isComputerThinking, setIsComputerThinking] = useState(false);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);

  const t = translations[language];

  const checkWinner = useCallback((squares: Board): { winner: Cell; line: number[] | null } => {
    for (const line of WINNING_LINES) {
      const [a, b, c] = line;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line };
      }
    }
    return { winner: null, line: null };
  }, []);

  const isDraw = (squares: Board): boolean => {
    return squares.every(cell => cell !== null) && !checkWinner(squares).winner;
  };

  const findBestMove = useCallback((squares: Board): number => {
    // Try to win
    for (let i = 0; i < 9; i++) {
      if (!squares[i]) {
        const testBoard = [...squares];
        testBoard[i] = 'O';
        if (checkWinner(testBoard).winner === 'O') return i;
      }
    }
    // Block player
    for (let i = 0; i < 9; i++) {
      if (!squares[i]) {
        const testBoard = [...squares];
        testBoard[i] = 'X';
        if (checkWinner(testBoard).winner === 'X') return i;
      }
    }
    // Take center
    if (!squares[4]) return 4;
    // Take corners
    const corners = [0, 2, 6, 8];
    const emptyCorners = corners.filter(i => !squares[i]);
    if (emptyCorners.length > 0) {
      return emptyCorners[Math.floor(Math.random() * emptyCorners.length)];
    }
    // Take any empty
    const emptyCells = squares.map((cell, i) => cell === null ? i : -1).filter(i => i !== -1);
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }, [checkWinner]);

  const handleClick = (index: number) => {
    if (board[index] || checkWinner(board).winner || isComputerThinking) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);

    const { winner, line } = checkWinner(newBoard);
    if (winner) {
      setWinningLine(line);
      setScores(prev => ({
        ...prev,
        [winner.toLowerCase()]: prev[winner.toLowerCase() as 'x' | 'o'] + 1
      }));
      return;
    }

    if (isDraw(newBoard)) {
      setScores(prev => ({ ...prev, draw: prev.draw + 1 }));
      return;
    }

    if (gameMode === 'computer' && isXNext) {
      setIsXNext(false);
      setIsComputerThinking(true);
      
      setTimeout(() => {
        const computerMove = findBestMove(newBoard);
        const computerBoard = [...newBoard];
        computerBoard[computerMove] = 'O';
        setBoard(computerBoard);
        setIsComputerThinking(false);

        const { winner: compWinner, line: compLine } = checkWinner(computerBoard);
        if (compWinner) {
          setWinningLine(compLine);
          setScores(prev => ({ ...prev, o: prev.o + 1 }));
        } else if (isDraw(computerBoard)) {
          setScores(prev => ({ ...prev, draw: prev.draw + 1 }));
        } else {
          setIsXNext(true);
        }
      }, 500);
    } else {
      setIsXNext(!isXNext);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinningLine(null);
    setIsComputerThinking(false);
  };

  const backToMenu = () => {
    resetGame();
    setGameMode('menu');
    setScores({ x: 0, o: 0, draw: 0 });
  };

  const { winner } = checkWinner(board);
  const draw = isDraw(board);
  const gameOver = winner || draw;

  if (gameMode === 'menu') {
    return (
      <div className="game-container tictactoe-game">
        <div className="ttt-menu">
          <h2>{t.title}</h2>
          <div className="ttt-preview">
            <span className="x-symbol">X</span>
            <span className="vs-text">VS</span>
            <span className="o-symbol">O</span>
          </div>
          <div className="ttt-mode-buttons">
            <button 
              className="game-btn ttt-mode-btn computer"
              onClick={() => setGameMode('computer')}
            >
              🤖 {t.vsComputer}
            </button>
            <button 
              className="game-btn ttt-mode-btn twoplayer"
              onClick={() => setGameMode('2player')}
            >
              👥 {t.vs2Player}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container tictactoe-game">
      <div className="ttt-header">
        <button className="ttt-back-btn" onClick={backToMenu}>←</button>
        <div className="ttt-scores">
          <div className="ttt-score x">
            <span className="score-label">{gameMode === 'computer' ? t.you : 'X'}</span>
            <span className="score-value">{scores.x}</span>
          </div>
          <div className="ttt-score draw">
            <span className="score-label">≈</span>
            <span className="score-value">{scores.draw}</span>
          </div>
          <div className="ttt-score o">
            <span className="score-label">{gameMode === 'computer' ? '🤖' : 'O'}</span>
            <span className="score-value">{scores.o}</span>
          </div>
        </div>
      </div>

      <div className="ttt-status">
        {gameOver ? (
          winner ? (
            <span className={`winner-text ${winner.toLowerCase()}`}>
              {gameMode === 'computer' 
                ? (winner === 'X' ? `${t.you} ${t.wins}` : `${t.computer} ${t.wins}`)
                : `${winner} ${t.wins}`
              }
            </span>
          ) : (
            <span className="draw-text">{t.draw}</span>
          )
        ) : isComputerThinking ? (
          <span className="thinking-text">🤖 {t.thinking}</span>
        ) : (
          <span className={`turn-text ${isXNext ? 'x' : 'o'}`}>
            {gameMode === 'computer' && isXNext ? t.yourTurn : `${isXNext ? 'X' : 'O'} ${t.turn}`}
          </span>
        )}
      </div>

      <div className="ttt-board">
        {board.map((cell, index) => (
          <button
            key={index}
            className={`ttt-cell ${cell ? cell.toLowerCase() : ''} ${winningLine?.includes(index) ? 'winning' : ''}`}
            onClick={() => handleClick(index)}
            disabled={!!cell || !!gameOver || isComputerThinking}
          >
            {cell && <span className="cell-symbol">{cell}</span>}
          </button>
        ))}
      </div>

      {gameOver && (
        <button className="game-btn game-btn-primary ttt-play-again" onClick={resetGame}>
          🔄 {t.playAgain}
        </button>
      )}
    </div>
  );
};

export default TicTacToeGame;
