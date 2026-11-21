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

    
}