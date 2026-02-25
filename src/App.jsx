import { useEffect, useMemo, useRef, useState } from 'react';

const COMMANDS = [
  { key: 'A', label: 'DIVE', hint: 'Press A' },
  { key: 'S', label: 'SPIN', hint: 'Press S' },
  { key: 'D', label: 'ECHO', hint: 'Press D' },
  { key: 'F', label: 'SURFACE', hint: 'Press F' }
];

const NARRATOR_LINES = [
  'Dolphin Commander: Focus, land mammal. Focus.',
  'You call that reflexes? My grandma dolphin is faster.',
  'Ocean law says you must lock in right now.',
  'Panic is temporary. High score screenshots are forever.'
];

export default function App() {
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [streak, setStreak] = useState(0);
  const [mode, setMode] = useState('normal');
  const [command, setCommand] = useState(COMMANDS[0]);
  const [narrator, setNarrator] = useState(NARRATOR_LINES[0]);

  const timerRef = useRef(null);

  const speedMs = useMemo(() => Math.max(1400 - score * 25, 450), [score]);

  function randomCommand() {
    const next = COMMANDS[Math.floor(Math.random() * COMMANDS.length)];
    setCommand(next);
  }

  function randomLine() {
    setNarrator(NARRATOR_LINES[Math.floor(Math.random() * NARRATOR_LINES.length)]);
  }

  function startGame() {
    setStarted(true);
    setGameOver(false);
    setScore(0);
    setStreak(0);
    setTimeLeft(45);
    setMode('normal');
    randomCommand();
    randomLine();
  }

  function endGame(reason) {
    setGameOver(true);
    setStarted(false);
    setNarrator(reason || 'Mission failed. The dolphin is disappointed.');
  }

  useEffect(() => {
    if (!started) return;
    const tick = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(tick);
          endGame('Time up. Return to the sea and train.');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [started]);

  useEffect(() => {
    if (!started) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      endGame('Too slow. The wave passed you.');
    }, speedMs);
    return () => clearTimeout(timerRef.current);
  }, [command, started, speedMs]);

  useEffect(() => {
    if (!started) return;
    if (score >= 8) setMode('inverse');
  }, [score, started]);

  function handleInput(rawKey) {
    if (!started) return;
    const pressed = rawKey.toUpperCase();
    const isCorrect = pressed === command.key;
    const shouldSucceed = mode === 'normal' ? isCorrect : !isCorrect;

    if (shouldSucceed) {
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
      if ((streak + 1) % 4 === 0) randomLine();
      randomCommand();
    } else {
      endGame(mode === 'inverse' ? 'Wrong. In inverse mode you must press ANY OTHER key.' : 'Wrong key. Dolphin panic consumed you.');
    }
  }

  useEffect(() => {
    function onKey(e) {
      handleInput(e.key);
    }

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [started, command, mode, streak]);

  return (
    <div className="page">
      <div className="card">
        <h1>🐬 Dolphin Panic</h1>
        <p className="subtitle">Reflex chaos. Hit the right keys before the ocean judges you.</p>

        {!started && !gameOver && (
          <div className="panel">
            <p><strong>Controls:</strong> A = DIVE, S = SPIN, D = ECHO, F = SURFACE</p>
            <p>At score 8+, <strong>INVERSE MODE</strong> activates: press any key EXCEPT the shown one.</p>
            <button onClick={startGame}>Start Panic</button>
          </div>
        )}

        {(started || gameOver) && (
          <>
            <div className="stats">
              <span>Score: <strong>{score}</strong></span>
              <span>Streak: <strong>{streak}</strong></span>
              <span>Time: <strong>{timeLeft}s</strong></span>
              <span className={mode === 'inverse' ? 'inverse' : ''}>Mode: <strong>{mode.toUpperCase()}</strong></span>
            </div>

            {started && (
              <>
                <div className="command">
                  <div className="label">COMMAND</div>
                  <div className="value">{command.label}</div>
                  <div className="hint">{command.hint}</div>
                  {mode === 'inverse' && <div className="warning">INVERSE: Press any key except {command.key}</div>}
                </div>

                <div className="touchControls">
                  {COMMANDS.map((c) => (
                    <button key={c.key} className="touchBtn" onClick={() => handleInput(c.key)}>{c.key}</button>
                  ))}
                </div>
              </>
            )}

            <p className="narrator">🎙️ {narrator}</p>

            {gameOver && (
              <div className="panel">
                <p>Final Score: <strong>{score}</strong></p>
                <button onClick={startGame}>Play Again</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
