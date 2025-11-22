import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../store/CartContext";

// Use DummyJSON for paginated products: https://dummyjson.com/docs/products
const API = "https://dummyjson.com/products";
const PAGE_SIZE = 12;

export default function ProductGrid() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);
  const { addToCart } = useCart();

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}?limit=${PAGE_SIZE}&skip=${skip}`);
      const data = await res.json();
      const newProducts = data.products || [];
      setProducts((p) => [...p, ...newProducts]);
      setSkip((s) => s + newProducts.length);
      if (products.length + newProducts.length >= (data.total || 0)) {
        setHasMore(false);
      }
    } catch (err) {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [skip, loading, hasMore, products.length]);

  useEffect(() => {
    // initial load
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!sentinelRef.current) return;
    // disconnect previous
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMore();
      }
    }, { rootMargin: "300px" });
    observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current && observerRef.current.disconnect();
  }, [loadMore]);

  return (
    <div>
      <div className="store-utility" style={{ margin: "8px 0 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong>All Products</strong>
        <div style={{ color: "var(--muted)" }}>{products.length} items</div>
      </div>

      <div className="store-grid">
        {products.map((p) => (
          <div key={p.id} className="store-card">
            <Link to={`/store/${p.id}`} className="store-card-link">
              <div className="store-img">
                <img src={p.thumbnail || p.image} alt={p.title} />
              </div>
              <div className="store-meta">
                <div className="store-title" title={p.title}>{p.title}</div>
                <div className="store-price">₹{(p.price || 0).toFixed(2)}</div>
              </div>
            </Link>
            <div className="store-card-actions">
              <button className="btn btn-primary" onClick={() => addToCart(p, 1)}>Add to cart</button>
              <Link to={`/store/${p.id}`} className="btn btn-outline">View</Link>
            </div>
          </div>
        ))}

        {/* skeleton placeholders while loading next page */}
        {loading && Array.from({ length: 4 }).map((_, i) => (
          <div key={`s-${i}`} className="store-card store-skeleton">
            <div className="store-img skeleton" />
            <div className="store-meta">
              <div className="skeleton skeleton-text" style={{ width: '70%' }} />
              <div className="skeleton skeleton-text" style={{ width: '40%', marginTop: 8 }} />
            </div>
          </div>
        ))}
      </div>

      {error && <div style={{ color: 'var(--danger)', marginTop: 12 }}>{error}</div>}

      <div ref={sentinelRef} style={{ height: 1 }} />

      {!hasMore && <div style={{ marginTop: 18, color: 'var(--muted)' }}>End of results</div>}
    </div>
  );
}
