import { Link } from "react-router-dom";

export default function Main() {
  return (
    <main className="site-root">
      <header className="site-header">
        <div className="site-brand">My Components</div>
        <nav className="site-nav">
          <Link to="/">Home</Link>
          <Link to="/carousel">Carousel</Link>
          <Link to="/progress">Progress</Link>
          <Link to="/store">Store</Link>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-inner">
          <h1 className="hero-title">A Modern Component Playground</h1>
          <p className="hero-sub">Explore reusable components, live demos, and a mini-store powered by the Fake Store API.</p>
          <div className="hero-ctas">
            <Link to="/carousel" className="btn btn-primary">Try Carousel</Link>
            <Link to="/store" className="btn btn-outline">Open Store</Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="visual-card">Preview</div>
        </div>
      </section>

      <section className="features container">
        <h2>Highlights</h2>
        <div className="feature-grid">
          <article className="feature-card">
            <h3>Reusable UI</h3>
            <p>Well-structured, testable components that are easy to extend.</p>
          </article>
          <article className="feature-card">
            <h3>Responsive</h3>
            <p>Layouts scale across devices with sensible defaults and accessibility considerations.</p>
          </article>
          <article className="feature-card">
            <h3>Shop Integration</h3>
            <p>Demo store with cart persistence and product pages — ready to plug into a real backend.</p>
          </article>
        </div>
      </section>

      <footer className="site-footer">
        <div className="container">© {new Date().getFullYear()} My Components — Built for demos</div>
      </footer>
    </main>
  );
}
