import { Link } from "react-router-dom";

const lessons = [
  { to: "/progress", icon: "01", label: "State", title: "Progress Bars", description: "Practice component state, effects, intervals, and cleanup with start, pause, resume, and stop controls.", tags: ["useState", "useEffect", "useRef"] },
  { to: "/carousel", icon: "02", label: "Data fetching", title: "Product Carousel", description: "Fetch remote data and turn it into an automatically rotating, interactive carousel.", tags: ["fetch", "effects", "arrays"] },
  { to: "/infiniteScroll", icon: "03", label: "Custom hooks", title: "Infinite Scroll", description: "Load products as the last item enters view using IntersectionObserver and a reusable hook.", tags: ["custom hook", "observer", "pagination"] },
  { to: "/search", icon: "04", label: "Performance", title: "Throttle Practice", description: "Explore throttling behaviour and why event-heavy interactions need controlled updates.", tags: ["throttle", "closures", "events"] },
  { to: "/exercise", icon: "05", label: "Challenge", title: "Search Exercise", description: "A dedicated exercise area for debounce, callback, ref, and infinite-scroll patterns.", tags: ["debounce", "useCallback", "useRef"] },
];

export default function Main() {
  return (
    <main className="learning-page">
      <header className="learning-header container">
        <Link className="learning-brand" to="/"><span>⌘</span> React Lab</Link>
        <nav className="learning-nav" aria-label="Primary navigation">
          <a href="#lessons">Lessons</a>
          <Link to="/exercise">Challenges</Link>
        </nav>
      </header>

      <section className="learning-hero container">
        <div>
          <p className="eyebrow">BUILD · BREAK · LEARN</p>
          <h1>Practice React,<br /><em>one component</em> at a time.</h1>
          <p className="hero-copy">A small collection of interactive experiments for learning the React concepts that make real interfaces work.</p>
          <div className="hero-actions">
            <a className="learn-button primary" href="#lessons">Browse lessons <span>↓</span></a>
            <Link className="learn-button secondary" to="/exercise">Start a challenge</Link>
          </div>
        </div>
        <aside className="learning-progress" aria-label="Learning progress">
          <div className="progress-top"><span>YOUR PLAYGROUND</span><span className="pulse" /></div>
          <strong>5</strong><p>hands-on React lessons</p>
          <div className="progress-track"><span /></div>
          <small>Pick any lesson and experiment freely.</small>
        </aside>
      </section>

      <section id="lessons" className="lesson-section container">
        <div className="section-heading"><div><p className="eyebrow">LEARNING PATH</p><h2>Explore the lab</h2></div><p>Each lesson is a working demo. Read the code, change it, and see what happens.</p></div>
        <div className="lesson-grid">
          {lessons.map((lesson) => <Link className="lesson-card" to={lesson.to} key={lesson.to}>
            <div className="lesson-card-top"><span className="lesson-number">{lesson.icon}</span><span className="lesson-label">{lesson.label}</span><span className="arrow">↗</span></div>
            <h3>{lesson.title}</h3><p>{lesson.description}</p>
            <div className="lesson-tags">{lesson.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
          </Link>)}
        </div>
      </section>

      <section className="learning-note container"><span>✦</span><p>Tip: the goal isn’t to finish quickly—open DevTools, tweak the source, and make each example your own.</p></section>
      <footer className="learning-footer container">React Lab · built for deliberate practice</footer>
    </main>
  );
}
