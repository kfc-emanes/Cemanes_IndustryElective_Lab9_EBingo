import { useState } from "react";

const COLUMNS = ['B', 'I', 'N', 'G', 'O'];

export default function BingoCard({ cardData, cardNumber, onRemove }) {
    const { playcard_token, card } = cardData;
    const [marked, setMarked] = useState({});
    const [winStatus, setWinStatus] = useState(null);
    const [checking, setChecking] = useState(false);

    const toggleCell = (col, rowIdx) => {
        const key = `${col}-${rowIdx}`;
        setMarked((prev) => ({ ...prev, [key]: !prev[key]}));
    };

    const handleCheckWin = async () => {
        setChecking(true);
        try {
            const res = await fetch(
                `api/checkwin.php?playcard_token=${encodeURIComponent(playcard_token)}`
            );
            const text = (await res.text()).trim();
            setWinStatus(text === '1' ? 'win' : 'not-yet');
        } catch {
            setWinStatus('error');
        } finally {
            setChecking(false);
        }
    };

    return (
        <div className={`bingo-card ${winStatus === 'win' ? 'card-winner' : ''}`}>
            <div className="card-header">
                <div>
                    <span className="card-badge">Card #{cardNumber}</span>
                    <span className="token-text" title="Playcard Token">Token: {playcard_token}</span>
                </div>
                    <button
                        type="button"
                        className="remove-btn"
                        onClick={() => onRemove(playcard_token)}
                        title="Remove card"
                    >
                        X
                    </button>
            </div>
            
    {/* BINGO Column Header */}
            <div className="bingo-grid">
                {COLUMNS.map((letter) => (
                    <div key={letter} className={`grid-header col-${letter}`}>
                        {letter}
                    </div>
                ))}

    {/* 5 Rows */}
            {[0, 1, 2, 3, 4].map((rowIdx) =>
                COLUMNS.map((col) => {
                    const num = card[col][rowIdx];
                    const isMarked = !!marked[`${col}-${rowIdx}`];
                    return (
                        <button
                            key={`${col}-${rowIdx}`}
                            type="button"
                            className={`grid-cell ${isMarked ? 'marked' : ''}`}
                            onClick={() => toggleCell(col, rowIdx)}
                        >
                            {num}
                        </button>
                    );
                })
            )}
            
            </div>

    {/* Win Check Footer */}
            <div className="card-footer">
                <button
                    type="button"
                    className="check-btn"
                    onClick={handleCheckWin}
                    disabled={checking}
                >
                    {checking ? 'Checking...' : 'Check Win'}
                </button>

                {winStatus === 'win' && (
                    <span className="status-badge status-win">BINGO! We have a Winner!</span>
                )}
                {winStatus === 'not-yet' && (
                    <span className="status-badge status-win">No Bingo yet.</span>
                )}
                {winStatus === 'error' && (
                    <span className="status-badge status-win">Check failed.</span>
                )}
            </div>
        </div>
    );
}