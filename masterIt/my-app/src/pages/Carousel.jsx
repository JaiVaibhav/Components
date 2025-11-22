import { useState, useEffect, useRef } from "react";

const slides = [
  { id: 1, color: "#ff6b6b", title: "Slide 1" },
  { id: 2, color: "#6bc1ff", title: "Slide 2" },
  { id: 3, color: "#6bff95", title: "Slide 3" },
];

export default function Carousel() {
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timerRef.current);
  }, []);

  function prev() {
    setIndex((i) => (i - 1 + slides.length) % slides.length);
  }

  function next() {
    setIndex((i) => (i + 1) % slides.length);
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Carousel</h2>
      <div
        style={{
          width: 480,
          height: 240,
          position: "relative",
          overflow: "hidden",
          borderRadius: 8,
          boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
        }}
      >
        {slides.map((s, i) => (
          <div
            key={s.id}
            style={{
              position: "absolute",
              top: 0,
              left: `${(i - index) * 100}%`,
              width: "100%",
              height: "100%",
              transition: "left 400ms ease",
              background: s.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 28,
            }}
          >
            {s.title}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button onClick={prev}>Prev</button>
        <button onClick={next}>Next</button>
      </div>
    </div>
  );
}
