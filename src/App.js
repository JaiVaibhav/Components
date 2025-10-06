import "./styles.css";
import { useState, useEffect, useRef } from "react";

function ProgressBar({ percent }) {
  return (
    <div className="container">
      <div
        className="bar"
        style={{ transform: `translateX(${percent - 100}%)` }}
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
      intervalId = setInterval(() => {
        if (percent < 100) {
          setPercent((prev) => prev + 1);
        } else {
          clearInterval(intervalId);
        }
      }, 500);
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [status, isStarted, percent]);

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
    <div className="App">
      <ProgessBarMain key={1} />
      <ProgessBarMain key={2} />
      <ProgessBarMain key={3} />
      <ProgessBarMain key={4} />
    </div>
  );
}
