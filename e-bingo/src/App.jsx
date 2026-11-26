import { useState } from 'react';
import BingoCard from './components/BingoCard';
import './App.css';

export default function App() {
  const [gameCodeInput, setGameCodeInput] = useState('HEelhJos');
  const [activeGameCode, setActiveGameCode] = useState('');
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchNewCard = async (code, resetExisting = false) => {
    const trimmed = code.trim();
    if (!trimmed) {
      setError('Please enter a Game Code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(
        `/api/getcard.php?bcode=${encodeURIComponent(trimmed)}`
      );
      const rawText = (await res.text()).trim();

      if (rawText === '0' || !rawText) {
        setError(`Game code "${trimmed}" was not found. Check the host dashboard.`);
        setLoading(false);
        return;
      }

      const data = JSON.parse(rawText);
      if (!data.playcard_token || !data.card) {
        setError('Invalid card data received from server.');
        setLoading(false);
        return;
      }

      setActiveGameCode(trimmed);
      setCards((prev) => (resetExisting ? [data] : [...prev, data]));
    } catch {
      setError('Unable to reach the Bingo server. Make sure Vite proxy is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGame = (e) => {
    e.preventDefault();
    fetchNewCard(gameCodeInput, true);
  };

  const handleAddAnotherCard = () => {
    fetchNewCard(activeGameCode || gameCodeInput, false);
  };

  const handleRemoveCard = (token) => {
    setCards((prev) => prev.filter((c) => c.playcard_token !== token));
  };

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div>
          <h1>E-Bingo Player</h1>
          <p className="subtitle">
            Enter a Game Code below to join and manage multiple Bingo cards at the same time.
          </p>
        </div>

        <a
          href={`http://www.hyeumine.com/bingodashboard.php${
            activeGameCode ? `?bcode=${encodeURIComponent(activeGameCode)}` : ''
          }`}
          target="_blank"
          rel="noreferrer"
          className="dashboard-link"
        >
          Open Host Dashboard ↗
        </a>
      </header>

      {/* Join / Add Card Controls */}
      <section className="control-panel">
        <form onSubmit={handleJoinGame} className="join-form">
          <label htmlFor="bcode-input" className="sr-only">
            Game Code
          </label>
          <input
            id="bcode-input"
            type="text"
            value={gameCodeInput}
            onChange={(e) => setGameCodeInput(e.target.value)}
            placeholder="Enter Game Code (e.g. HEelhJos)"
            className="code-input"
          />
          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? 'Loading...' : 'Join Game'}
          </button>
        </form>

        {activeGameCode && (
          <div className="session-bar">
            <span>
              Active Game: <strong>{activeGameCode}</strong> ({cards.length}{' '}
              {cards.length === 1 ? 'card' : 'cards'})
            </span>
            <button
              type="button"
              className="secondary-btn"
              onClick={handleAddAnotherCard}
              disabled={loading}
            >
              + Add Another Card
            </button>
          </div>
        )}

        {error && <div className="error-banner">{error}</div>}
      </section>

      {/* Multi-Card Responsive Grid */}
      {cards.length === 0 ? (
        <div className="empty-state">
          <p>No active cards yet. Enter a Game Code above and click <strong>Join Game</strong>.</p>
        </div>
      ) : (
        <main className="cards-container">
          {cards.map((cardObj, index) => (
            <BingoCard
              key={cardObj.playcard_token}
              cardData={cardObj}
              cardNumber={index + 1}
              onRemove={handleRemoveCard}
            />
          ))}
        </main>
      )}
    </div>
  );
}