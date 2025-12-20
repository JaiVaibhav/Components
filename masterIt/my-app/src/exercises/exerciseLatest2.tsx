import React, { useEffect, useState, useRef, useCallback } from "react";

/**
 * ProductCatalogStarter.jsx (fixed)
 *
 * - Normalizes categories so we never attempt to render raw objects as children.
 * - Keeps clear TODO markers for where to add DEBOUNCE (search) and THROTTLE (scroll / analytics).
 *
 * NOTE: This file intentionally does NOT implement debounce/throttle. Add them where indicated.
 */

const PAGE_LIMIT = 12;

function buildApiUrl({ query, category, limit = PAGE_LIMIT, skip = 0 }) {
  if (query && query.trim().length > 0) {
    return `https://dummyjson.com/products/search?q=${encodeURIComponent(
      query
    )}&limit=${limit}&skip=${skip}`;
  } else if (category && category !== "all") {
    return `https://dummyjson.com/products/category/${encodeURIComponent(
      category
    )}?limit=${limit}&skip=${skip}`;
  } else {
    return `https://dummyjson.com/products?limit=${limit}&skip=${skip}`;
  }
}

export default function ProductCatalogStarter() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [products, setProducts] = useState([]);
  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  // categories normalized as { value, label }
  const [categories, setCategories] = useState([{ value: "all", label: "all" }]);

  const [cart, setCart] = useState([]);
  const [analyticsLog, setAnalyticsLog] = useState([]);

  const mountedRef = useRef(true);

  // Fetch categories and normalize them to { value, label }
  useEffect(() => {
    mountedRef.current = true;

    async function fetchCategories() {
      try {
        const res = await fetch("https://dummyjson.com/products/categories");
        const data = await res.json();

        // Normalize into array of { value, label }
        let normalized = [];

        if (Array.isArray(data) && data.length > 0) {
          if (typeof data[0] === "string") {
            normalized = data.map((s) => ({ value: s, label: s }));
          } else {
            // defensive: if API returns objects, map to value/label
            normalized = data.map((obj, idx) => ({
              value: obj.slug ?? obj.value ?? obj.name ?? String(idx),
              label: obj.name ?? obj.label ?? obj.slug ?? String(obj),
            }));
          }
        }

        if (!mountedRef.current) return;
        setCategories([{ value: "all", label: "all" }, ...normalized]);
      } catch (err) {
        console.error("Failed to fetch categories", err);
        // keep default categories on error
      }
    }

    fetchCategories();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Core fetch function used for initial and paginated loads
  async function fetchProducts({ reset = false, nextSkip = 0 } = {}) {
    try {
      if (reset) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const url = buildApiUrl({ query, category, limit: PAGE_LIMIT, skip: nextSkip });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Network response not ok");
      const data = await res.json();

      const fetched = data.products || data;
      const fetchedTotal = typeof data.total === "number" ? data.total : fetched.length;

      if (!mountedRef.current) return;

      if (reset) {
        setProducts(fetched);
        setSkip(fetched.length);
      } else {
        setProducts((prev) => [...prev, ...fetched]);
        setSkip((prev) => prev + fetched.length);
      }
      setTotal(fetchedTotal);
    } catch (err) {
      console.error(err);
      if (mountedRef.current) setError("Failed to load products");
    } finally {
      if (!mountedRef.current) return;
      setLoading(false);
      setLoadingMore(false);
    }
  }

  // Effect: when query or category changes → fetch first page
  // TODO: DEBOUNCE the trigger of fetchProducts({ reset: true }) so search is debounced (300-600ms)

  const timer = useRef(0);
  const onQueryChange = useCallback(()=>{
    clearTimeout(timer.current);
    timer.current = setTimeout(()=>{
    setProducts([]);
    setSkip(0);
    setTotal(null);
    setError(null);

    // Naive immediate fetch — replace with debounced trigger as your task
    fetchProducts({ reset: true, nextSkip: 0 });
    },1000)
  },[query,category])


  useEffect(() => {
    onQueryChange()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, category]);

  // Infinite scroll: naive handler (fires on every scroll)
  // TODO: THROTTLE this handler (100-250ms) to improve performance

  const throttled = useRef(false);
  const timerref = useRef(0);
  function handleThrottle(callback){
    if(!throttled.current){
      console.log("asdfasdf");
      throttled.current = true;
      console.log(callback);
     timerref.current =  setTimeout(()=>{
        callback();
        throttled.current = false;
      },1000)
    }
  }

  const scrolledFromTop = useRef(0);
      const pageHeight = useRef(0);

const onScroll = useCallback(()=>{
  // console.log("asdfasdfa", scrolledFromTop.current + 300 >= pageHeight.current);
      if (
        scrolledFromTop.current + 300 >= pageHeight.current &&
        !loadingMore &&
        !loading &&
        total !== null &&
        products.length < total
      ) {
        fetchProducts({ reset: false, nextSkip: skip });
      }
    },[skip, products.length, total, loadingMore, loading])

  useEffect(() => {

    function fun(){
           scrolledFromTop.current = window.scrollY + window.innerHeight;
       pageHeight.current = document.documentElement.scrollHeight;
     handleThrottle(onScroll);
    }
    window.addEventListener("scroll", fun);
    return () => {
window.removeEventListener("scroll", fun);
throttled.current=false;
clearTimeout(timerref.current);
    }
  }, [skip, products.length, total, loadingMore, loading]);

  // "Add to Cart" handler (naive)
  function handleAddToCart(product) {
    setCart((prev) => [...prev, { id: product.id, title: product.title }]);

    const timestamp = new Date().toISOString();
    setAnalyticsLog((prev) => [
      `ADD_TO_CART: ${product.id} @ ${timestamp}`,
      ...prev.slice(0, 49),
    ]);

    // TODO: THROTTLE ANALYTICS — wrap or replace this handler to limit analytics calls (e.g., 1/s)
  }
  // UI handlers
  function handleQueryChange(e) {
    setQuery(e.target.value);
  }
  function handleCategoryChange(e) {
    // event value is the string 'value' from normalized categories
    setCategory(e.target.value);
  }
  function clearFilters() {
    setQuery("");
    setCategory("all");
  }

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: 18, maxWidth: 980 }}>
      <h2>Product Catalog Starter (fixed categories)</h2>

      <section style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
        <input
          value={query}
          onChange={handleQueryChange}
          placeholder="Search products..."
          style={{ padding: "8px 10px", width: 360, borderRadius: 6, border: "1px solid #ccc" }}
        />

        {/* Render normalized categories as <option value,label> */}
        <select value={category} onChange={handleCategoryChange} style={{ padding: 8 }}>
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>

        <button onClick={clearFilters}>Clear</button>
        <div style={{ marginLeft: "auto", color: "#555", fontSize: 13 }}>
          Debounce search: <strong>300–600ms</strong> (recommended)
        </div>
      </section>

      <section style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <div>
            <strong>Products</strong>
            {loading && <span style={{ marginLeft: 8 }}>Loading...</span>}
          </div>
          <div style={{ color: "#666", fontSize: 13 }}>
            Showing {products.length} {total ? `of ${total}` : ""}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 12,
          }}
        >
          {products.map((p) => (
            <div
              key={p.id}
              style={{
                border: "1px solid #eee",
                borderRadius: 8,
                padding: 12,
                display: "flex",
                flexDirection: "column",
                gap: 8,
                background: "#fff",
              }}
            >
              <img
                src={p.thumbnail || p.images?.[0] || p.image}
                alt={p.title}
                style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 6 }}
              />
              <div style={{ fontWeight: 600 }}>{p.title}</div>
              <div style={{ color: "#666", fontSize: 13 }}>{p.brand || p.category}</div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>${p.price}</div>
              <div style={{ marginTop: 6, display: "flex", gap: 8 }}>
                <button onClick={() => handleAddToCart(p)}>Add to cart</button>
                <button
                  onClick={() =>
                    setAnalyticsLog((prev) => [
                      `LIKE: ${p.id} @ ${new Date().toISOString()}`,
                      ...prev.slice(0, 49),
                    ])
                  }
                >
                  Like
                </button>
              </div>
            </div>
          ))}
        </div>

        {loadingMore && <div style={{ marginTop: 12 }}>Loading more...</div>}
        {!loading && !loadingMore && total !== null && products.length >= total && (
          <div style={{ marginTop: 12, color: "#777" }}>No more products</div>
        )}
      </section>

      <section style={{ marginTop: 18 }}>
        <h4>Analytics / Activity Log</h4>
        <div style={{ background: "#fafafa", padding: 12, borderRadius: 6, minHeight: 80 }}>
          {analyticsLog.length === 0 ? (
            <div style={{ color: "#777" }}>No events yet</div>
          ) : (
            analyticsLog.map((l, i) => <div key={i}>{l}</div>)
          )}
        </div>
        <small style={{ display: "block", marginTop: 8, color: "#555" }}>
          TODO: throttle analytics/add-to-cart events to avoid spamming backend.
        </small>
      </section>

      <section style={{ marginTop: 18 }}>
        <h4>Local Cart (client only)</h4>
        <div style={{ background: "#fff", border: "1px solid #eee", padding: 12, borderRadius: 6 }}>
          {cart.length === 0 ? (
            <div style={{ color: "#777" }}>Cart empty</div>
          ) : (
            cart.map((c, i) => (
              <div key={i} style={{ padding: 6, borderBottom: i === cart.length - 1 ? "none" : "1px solid #f4f4f4" }}>
                {c.title}
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
