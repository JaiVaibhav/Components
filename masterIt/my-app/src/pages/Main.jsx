import { Link } from "react-router-dom";

export default function Main() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Component Playground</h1>
      <p>Select a demo to open:</p>
      <ul>
        <li>
          <Link to="/carousel">Carousel</Link>
        </li>
        <li>
          <Link to="/progress">Progress Bars</Link>
        </li>
      </ul>
    </div>
  );
}
