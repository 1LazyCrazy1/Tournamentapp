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

const DEFAULT_WHITE_CARDS = [
  "The Accolytes wearing human skin","SPP's third eye","Rockstar's contemplative stare into the void","A packet of red powder","The Kool-Aid Man's erection","Jim's secret journal entries","The gape","Stay hydrated","The jungle has teeth","Behind the chicken coops","An infiltrator's smile","What makes you not one of them","The shadow people watching","Month six of clarity","The Entity's true endgame","Cyanide or the other thing","A monsoon and manifest destiny","Oh yeah","Sublevel 3 archives","The final solution","White gloves on red hands","What the pills wouldn't erase","Normies","Day 3","The second milly","The cartoon they banned","The Nickel Church opening","The Clap Attack","The Rez Feet episode (unedited)","JowPawl's missing context","Lothrop's sideways knowledge","Goat's actual purpose","Crystal Mess dancing between worlds","Sara's warnings nobody heard","Joey's complicity","Stimmed consciousness","CuntCake's real name","Tayshie's ascension","Lacie's true form","Lazy Crazy's prophecy","Cris laughing at the end","The commune's real founding document","What was in the Flavor-Aid","The side quest nobody completed","Punch Jones and his regrets","A 3 AM gathering","The offer Jim actually wanted to take","The shape in the periphery","A bathtub reflection that stared back","Preaching while being watched","The newcomers' midnight circles","Accolytes conducting conferences without words","Not a hallucination","The primary effect","The only effect","A cosmic entity with a smile","Capitalism's actual face","The revolution's real enemy","When Jim reached for the pills","What would have stopped it all","The journals that prove everything","The recordings nobody can unhear","The warning signs in retrospect","What the children drank first","The second helping","The third wave","The red smile at the treeline","The glassy eyes of the replaced","The too-wide grins","The lack of blinks","The synchronized movements","The thing that whispered from pipes","The monsoon that brought clarity","The forest corner where deals are made","The rubber hose flogging that changed everything","The 2 AM awakening","The realization it was never a dream","The moment Jim understood","The choice that wasn't one","The sacrament they offered","The taste of copper and grapes","The smell of artificial fruit","The texture of being watched always","The sound of 'Oh yeah' in the dark","Sean Paul's prophecies","SPP's hidden calculations","The Kool-Aid Man's patience","The Entity's sense of humor","Capitalist efficiency meets cult logic","When the joke became real","When real became the joke","The punchline nobody asked for","The setup that was always there","The delivery mechanism","The distribution network","The supply chain of souls","The customer satisfaction guarantee","The fine print in the contract","The clauses about consent","The section about free will","The asterisk that changes everything","A cosmic thirst","A refreshing betrayal","A flavor that persists","A red stain that won't wash out","A smile that haunts eternally","A question nobody should ask","An answer nobody wants to know","A truth that breaks sanity","A lie that feels truer","A game that plays itself","A move that was always inevitable","A checkmate in history","A prophecy misread as recipe","A ritual mistaken for dinner","A sacrament marketed as refreshment","The archives remembering","The purple watching still","The silence of Sublevel 3","The sound of pages turning","The weight of accumulated knowledge","The burden of being a witness","The curse of clarity","The blessing of ignorance","The price of knowing","The cost of not knowing","The debt that never gets paid","The interest that compounds","The principle that multiplies","The investment in futures that never come","Drinking the kool-aid unironically","Becoming the joke","The joke becoming you","When satire turns prophetic","When dark humor becomes dark practice","When the commune becomes real","When real becomes communal","When you can't leave the compound","When the compound won't leave you","The boundary that dissolved","The line that was never drawn","The wall that looked both ways","The mirror that showed the truth","The reflection that had its own ideas","The image that wouldn't fade","The ghost of futures past","The specter of history repeating","The eternal return of thirst","The infinite cycle of offering","The loop that eats its tail","The ouroboros made of packets","The serpent made of smiles","The dragon made of compliance","What happens when you say no","What happens when you say yes","What happens when you don't speak at all","The silence that screams","The scream that whispers","The whisper that shouts","The voice from everywhere","The everywhere that is nowhere","The nowhere that is home","A manifestation in the walls","The shadow people's true form","Possession by committee","A haunting that tastes sweet","Poltergeists throwing red packets","A séance gone communal","The Entity's physical anatomy","A portal behind the bathtub","Screaming in frequencies only Accolytes hear","A ghost that says 'Oh yeah'","Summoning the ancestors gone wrong","A ritual that rhymes with cyanide","The shadow people breeding","A demonic smile made corporate","Channeling the void at potluck","A phantom that requires hydration","The otherworldly committee meeting","A curse written in packets","Seeing through the eyes of replacements","The Entity's birthday cake","A cosmic horror with a logo","Prophetic dreams in red","An apparition that's self-aware","Haunting that's actually just marketing","The collective unconscious of the Accolytes","Getting fucked by the Entity","The Kool-Aid Man's cock","Creampie courtesy of shadow people","A threesome with two Accolytes","Jim's secret fetish","The thing the Accolytes do at 3 AM","Cumming while being watched","A blowjob in the jungle","The Entity's foreplay","Sex as a sacrament","Losing your virginity to an infiltrator","The packets were actually for lube","Gang banged by the committee","A glory hole in Sublevel 3","Fucking someone who isn't who they claim","The Entity's orgasm","Sex that tastes like artificial grape","Being fucked into compliance","The Accolyte's mating ritual","A wet dream about being replaced","Cumulative trauma from cosmic dick","The final solution: consensual sex","Semen made of red powder","Fucking in front of the shadow people","The Entity watching you fuck"
];

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
    const currentSubmitted = gameData.submittedCards?.[czarIdx] || {};
    
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