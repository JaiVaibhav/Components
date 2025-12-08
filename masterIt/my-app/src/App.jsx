import "./styles.css";
import { useState, useEffect, useRef } from "react";

function ProgressBar({ percent }) {
  return (
    <div className="progressbar-container">
      <div
        className="progressbar-bar"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{ "--progress": `${percent}%` }}
      >
        {percent}%
      </div>
    </div>
  );
}

export function ProgessBarMain() {
  const [percent, setPercent] = useState(0);
  let intervalId = useRef(null);
  const [status, setStatus] = useState(0);
  const [isStarted, setIsStarted] = useState(0);
  useEffect(() => {
    if (status === 1 && isStarted == 1) {
      intervalId.current = setInterval(() => {
        setPercent((prev) => {
          if (prev < 100) {
            return prev + 1;
          } else {
            clearInterval(intervalId.current);
            return prev;
          }
        });
      }, 500);
    }

    return () => {
      clearInterval(intervalId.current);
    };
  }, [status, isStarted]);

  function handleStart() {
    setStatus(1);
    setIsStarted(1);
  }

  function handleStop() {
    setStatus(0);
    setIsStarted(0);
    setPercent(0);
    clearInterval(intervalId);
  }
  function handlePause() {
    setStatus(2);
    clearInterval(intervalId);
  }

  function handleResume() {
    setStatus(1);
  }
  return (
    <div className="progressContainer">
      <ProgressBar percent={percent} />
      <div style={{ display: "flex", gap: "2px" }}>
        {status === 1 ? <button onClick={handlePause}>Pause</button> : <></>}
        {status === 2 ? <button onClick={handleResume}>Resume</button> : ""}
        {status === 0 && <button onClick={handleStart}>Start</button>}
        {isStarted ? <button onClick={handleStop}>Stop</button> : ""}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div
      className="App"
      style={{ display: "flex", flexDirection: "column", gap: "2px" }}
    >
      {[1, 2, 3, 4].map((i) => {
        return <ProgessBarMain key={i} />;
      })}
    </div>
  );
}
