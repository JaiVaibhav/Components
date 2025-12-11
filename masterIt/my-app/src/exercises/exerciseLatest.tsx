import React, { useEffect, useState } from "react";

/**
 * Beginner-level component with clear places to implement:
 *  - Debounce: when calling fetchBooks on input changes
 *  - Throttle: when handling rapid button clicks
 *
 * IMPORTANT: This component is intentionally naive (no debounce/throttle).
 * Your task is to implement debounce for the search and throttle for the button.
 */

export default function SearchStarter() {
  const [searchText, setSearchText] = useState("");     // controlled input
  const [books, setBooks] = useState([]);               // fetched results
  const [loading, setLoading] = useState(false);        // loading indicator
  const [error, setError] = useState(null);             // error state

  // A simple log updated on every rapid button click
  // (This is the place to add throttling)
  const [actionLog, setActionLog] = useState([]);

  // -----------------------------------------
  // Naive search: this effect calls the API
  // whenever searchText changes (no debounce).
  // -----------------------------------------
  useEffect(() => {
    // We only search when query length >= 3
    if (!searchText || searchText.trim().length < 3) {
      setBooks([]);
      setError(null);
      return;
    }

    // NOTE: This is the naive implementation that calls the API immediately.
    // TODO (for you): Replace this effect logic with a debounced version so the
    // API is called only after the user has stopped typing for N ms.
    async function fetchBooks() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `https://openlibrary.org/search.json?q=${encodeURIComponent(
            searchText
          )}&fields=title,author_name,first_publish_year`
        );
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        const list =
          Array.isArray(data.docs) && data.docs.length > 0
            ? data.docs.slice(0, 10).map((b) => ({
                title: b.title,
                authorName: (b.author_name || []).join(", "),
                firstPublishYear: b.first_publish_year,
              }))
            : [];
        setBooks(list);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch books");
        setBooks([]);
      } finally {
        setLoading(false);
      }
    }

    fetchBooks();
  }, [searchText]);

  // -----------------------------------------
  // Naive rapid-action handler (no throttle)
  //
  // This runs for every click. Replace this handler
  // with a throttled version so repeated clicks only
  // invoke the action at most once per N ms.
  // -----------------------------------------
  function handleRapidAction() {
    const time = new Date().toLocaleTimeString();
    setActionLog((prev) => [`Clicked @ ${time}`, ...prev].slice(0, 20));
  }

  // Small helpers for UI
  function handleInputChange(e) {
    setSearchText(e.target.value);
  }
  function clearSearch() {
    setSearchText("");
    setBooks([]);
    setError(null);
  }
  function clearLog() {
    setActionLog([]);
  }

  return (
    <main style={{ fontFamily: "sans-serif", padding: 20, maxWidth: 760 }}>
      <h2>Search Starter (no debounce/throttle)</h2>

      <section style={{ marginBottom: 18 }}>
        <label>
          <strong>Search books (>= 3 chars):</strong>
          <input
            value={searchText}
            onChange={handleInputChange}
            placeholder="Type book name..."
            style={{
              marginLeft: 8,
              padding: "6px 8px",
              width: 360,
              borderRadius: 4,
              border: "1px solid #ccc",
            }}
          />
        </label>
        <button onClick={clearSearch} style={{ marginLeft: 8 }}>
          Clear
        </button>
        <div style={{ marginTop: 8 }}>
          <small style={{ color: "#555" }}>
            NOTE: API is called immediately on input change (this is naive). Implement
            debounce here to reduce requests.
          </small>
        </div>
      </section>

      <section style={{ marginBottom: 18 }}>
        <div style={{ marginBottom: 8 }}>
          <strong>Results:</strong>
          {loading && <span style={{ marginLeft: 8 }}>Loading...</span>}
        </div>

        {error && (
          <div style={{ color: "crimson", marginBottom: 8 }}>{error}</div>
        )}

        <div style={{ border: "1px solid #eee", borderRadius: 6 }}>
          {books.length === 0 ? (
            <div style={{ padding: 12, color: "#666" }}>
              No results (type at least 3 characters)
            </div>
          ) : (
            books.map((b, i) => (
              <div
                key={i}
                style={{
                  padding: 12,
                  borderBottom: i === books.length - 1 ? "none" : "1px solid #f4f4f4",
                }}
              >
                <div style={{ fontWeight: 600 }}>{b.title}</div>
                <div style={{ fontSize: 13 }}>{b.authorName}</div>
                <div style={{ fontSize: 12, color: "#777" }}>{b.firstPublishYear}</div>
              </div>
            ))
          )}
        </div>
      </section>

      <section style={{ marginTop: 12 }}>
        <h4>Rapid action (button)</h4>
        <div style={{ marginBottom: 8 }}>
          <button onClick={handleRapidAction}>Rapid Action</button>
          <button onClick={clearLog} style={{ marginLeft: 8 }}>
            Clear Log
          </button>
        </div>
        <small style={{ color: "#555", display: "block", marginBottom: 8 }}>
          NOTE: This handler runs on every click. Implement throttling here so repeated
          clicks are limited (for example, at most once per 1000ms).
        </small>

        <div
          style={{
            background: "#f8f8f8",
            padding: 12,
            borderRadius: 6,
            whiteSpace: "pre-wrap",
            minHeight: 48,
          }}
        >
          {actionLog.length === 0 ? (
            <span style={{ color: "#777" }}>No actions yet</span>
          ) : (
            actionLog.map((l, i) => <div key={i}>{l}</div>)
          )}
        </div>
      </section>
    </main>
  );
}
