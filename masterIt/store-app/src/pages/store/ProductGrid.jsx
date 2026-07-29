import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../store/CartContext";

const API = "https://dummyjson.com/products";
const PAGE_SIZE = 12;

export default function ProductGrid() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const sentinelRef = useRef(null);
  const { addToCart } = useCart();

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API}?limit=${PAGE_SIZE}&skip=${skip}`);
      if (!response.ok) throw new Error("Unable to load products");
      const data = await response.json();
      const nextProducts = data.products ?? [];
      setProducts((current) => [...current, ...nextProducts]);
      setSkip((current) => current + nextProducts.length);
      if (nextProducts.length === 0 || skip + nextProducts.length >= data.total) setHasMore(false);
    } catch {
      setError("Products could not be loaded. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, skip]);

  useEffect(() => { loadMore(); }, [loadMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) loadMore();
    }, { rootMargin: "300px" });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  return (
    <section>
      <div className="store-utility"><h1>Products</h1><span>{products.length} items</span></div>
      <div className="store-grid">
        {products.map((product) => <article className="store-card" key={product.id}>
          <Link className="store-card-link" to={`/products/${product.id}`}>
            <div className="store-image"><img src={product.thumbnail} alt={product.title} /></div>
            <h2>{product.title}</h2><strong>₹{product.price.toFixed(2)}</strong>
          </Link>
          <div className="actions"><button onClick={() => addToCart(product)}>Add to cart</button><Link to={`/products/${product.id}`}>View</Link></div>
        </article>)}
      </div>
      {error && <p className="error">{error}</p>}
      {loading && <p className="status">Loading products…</p>}
      <div ref={sentinelRef} />
      {!hasMore && <p className="status">End of products</p>}
    </section>
  );
}
