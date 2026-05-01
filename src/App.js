import React, { useState, useEffect } from 'react';
import './App.css';
import { database } from './firebase';
import { ref, onValue, set, update } from 'firebase/database';

const PROMPTS = [
  "The Accolytes are actually ___.",
  "Why did the Kool-Aid Man corner Jim Jones in the forest?",
  "The offer was: cyanide or ___.",
  "Jim's real journal entry said: ___.",
  "The shadow people are documenting ___.",
  "Month six of Jonestown brought ___.",
  "The newcomers never quite ___.",
  "Behind the chicken coops at 3 AM: ___.",
  "The Entity's true nature is ___.",
  "I stopped drinking anything because ___.",
  "The red face in the monsoon whispered ___.",
  "What the pills wouldn't erase: ___.",
  "The Kool-Aid Man's favorite word is ___.",
  "The capitalist conspiracy was always ___.",
  "When the infiltrators smile, they're thinking about ___.",
  "The final solution tastes like ___.",
  "Normies don't know that ___.",
  "The Sublevel 3 archives contain ___.",
  "Jim's last note said ___.",
  "The gape is where the Entity ___.",
  "Stay hydrated or the Accolytes ___.",
  "What makes someone not an Accolyte: ___.",
  "The jungle had ___.",
  "Oh yeah, that reminds me of the time ___."
];

export default function App() {

export default function App() {
  const [gameState, setGameState] = useState('setup');
  const [playerName, setPlayerName] = useState('');
  const [gameId, setGameId] = useState('');
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [gameData, setGameData] = useState(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [newCardText, setNewCardText] = useState('');
  const [newCardType, setNewCardType] = useState('white');
  const [answerText, setAnswerText] = useState('');

  useEffect(() => {
    if (gameId && gameState === 'playing') {
      const gameRef = ref(database, `games/${gameId}`);
      const unsubscribe = onValue(gameRef, (snapshot) => {
        if (snapshot.exists()) {
          setGameData(snapshot.val());
        }
      });
      return () => unsubscribe();
    }
  }, [gameId, gameState]);

  const startGame = () => {
    if (!playerName.trim()) return;
    const newGameId = `game_${Date.now()}`;
    const initialState = {
      players: [playerName],
      gameState: 'playing',
      roundNumber: 1,
      czarIndex: 0,
      scores: { [playerName]: 0 },
      currentPrompt: PROMPTS[Math.floor(Math.random() * PROMPTS.length)],
      submittedCards: {},
    };
    set(ref(database, `games/${newGameId}`), initialState);
    setGameId(newGameId);
    setCurrentPlayer(playerName);
    setGameState('playing');
  };

  const joinGame = () => {
    if (!playerName.trim() || !gameId.trim()) return;
    const gameRef = ref(database, `games/${gameId}`);
    onValue(gameRef, (snapshot) => {
      if (snapshot.exists()) {
        const game = snapshot.val();
        if (!game.players.includes(playerName)) {
          update(gameRef, {
            players: [...game.players, playerName],
            scores: { ...game.scores, [playerName]: 0 }
          });
        }
        setCurrentPlayer(playerName);
        setGameState('playing');
      } else {
        alert('Game not found!');
      }
    }, { onlyOnce: true });
  };

  const addCustomCard = () => {
    if (!newCardText.trim()) return;
    const cardsRef = ref(database, `cards/${newCardType}/${Date.now()}`);
    set(cardsRef, newCardText);
    setNewCardText('');
    alert('Card added!');
  };

  const submitAnswer = () => {
    if (!answerText.trim() || !gameData || !currentPlayer) return;
    const gameRef = ref(database, `games/${gameId}`);
    const czarIdx = gameData.czarIndex;
    //const currentSubmitted = gameData.submittedCards?.[czarIdx] || {};
    
    update(gameRef, {
      [`submittedCards/${czarIdx}/${currentPlayer}`]: answerText
    });
    setAnswerText('');
  };

  const selectWinner = (author) => {
    if (!gameData) return;
    const newScore = (gameData.scores[author] || 0) + 1;
    const gameRef = ref(database, `games/${gameId}`);

    if (newScore >= 5) {
      update(gameRef, {
        gameState: 'victory',
        winner: author,
        scores: { ...gameData.scores, [author]: newScore }
      });
      return;
    }

    const nextCzarIndex = (gameData.czarIndex + 1) % gameData.players.length;
    update(gameRef, {
      roundNumber: gameData.roundNumber + 1,
      czarIndex: nextCzarIndex,
      currentPrompt: PROMPTS[Math.floor(Math.random() * PROMPTS.length)],
      submittedCards: {},
      scores: { ...gameData.scores, [author]: newScore }
    });
  };

  // SETUP SCREEN
  if (gameState === 'setup') {
    return (
      <div className="container setup-screen">
        <h1>🍷 Kool-Aid Commune CAH 🍷</h1>
        <p className="subtitle">Multiplayer • Real-Time • NSFW</p>

        <div className="input-section">
          <input
            type="text"
            placeholder="Your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && startGame()}
          />
          <button onClick={startGame}>Create Game</button>
        </div>

        <div className="divider">OR</div>

        <div className="input-section">
          <input
            type="text"
            placeholder="Game ID"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && joinGame()}
          />
          <button onClick={joinGame}>Join</button>
        </div>

        <button className="admin-btn" onClick={() => setShowAdminPanel(!showAdminPanel)}>
          ⚙️ Admin
        </button>

        {showAdminPanel && (
          <div className="admin-panel">
            <h3>Add Custom Cards</h3>
            <select value={newCardType} onChange={(e) => setNewCardType(e.target.value)}>
              <option value="white">White Card</option>
              <option value="black">Black Card</option>
            </select>
            <textarea
              placeholder="Card text..."
              value={newCardText}
              onChange={(e) => setNewCardText(e.target.value)}
            />
            <button onClick={addCustomCard}>Add</button>
          </div>
        )}
      </div>
    );
  }

  // GAME SCREEN
  if (gameState === 'playing' && gameData) {
    const isCzar = gameData.players[gameData.czarIndex] === currentPlayer;
    const submittedAnswers = gameData.submittedCards?.[gameData.czarIndex] || {};

    if (gameData.gameState === 'victory') {
      return (
        <div className="container victory-screen">
          <h2>🍷 VICTORY 🍷</h2>
          <p className="winner">{gameData.winner} wins!</p>
          <div className="final-scores">
            {gameData.players.map((p) => (
              <div key={p} className="score-card">
                <div className="name">{p} {p === gameData.winner ? '👑' : ''}</div>
                <div className="score">{gameData.scores[p]}</div>
              </div>
            ))}
          </div>
          <button onClick={() => window.location.reload()}>Play Again</button>
        </div>
      );
    }

    return (
      <div className="container game-screen">
        <div className="game-info">
          <div className="round">Round {gameData.roundNumber}</div>
          <div className="czar">Czar: {gameData.players[gameData.czarIndex]}</div>
          <div className="timer">90s</div>
        </div>

        <div className="prompt-box">
          <h2>{gameData.currentPrompt}</h2>
        </div>

        {isCzar ? (
          <div className="voting-section">
            <h3>Pick the best answer</h3>
            <div className="answers-grid">
              {Object.entries(submittedAnswers).map(([author, answer]) => (
                <button
                  key={author}
                  className="answer-card"
                  onClick={() => selectWinner(author)}
                >
                  {answer}
                  <span className="author">— {author}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="submission-section">
            <h3>Your Answer</h3>
            <textarea
              placeholder="Type your answer..."
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
            />
            <button onClick={submitAnswer}>Submit</button>
          </div>
        )}

        <div className="scores-section">
          <h3>Scores</h3>
          <div className="scores-grid">
            {gameData.players.map((p) => (
              <div key={p} className="score-card">
                <div className="name">{p}</div>
                <div className="score">{gameData.scores[p]}/5</div>
              </div>
            ))}
          </div>
        </div>

        <div className="game-id">
          <small>Game ID: <code>{gameId}</code></small>
        </div>
      </div>
    );
  }

  return <div className="container"><p>Loading...</p></div>;
}