import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../store/CartContext";

export default function ProductGrid() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    let mounted = true;
    fetch("https://fakestoreapi.com/products")
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setProducts(data);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
    return () => (mounted = false);
  }, []);

  if (loading) return <div>Loading products…</div>;

  return (
    <div>
      <div style={{ margin: "8px 0 18px" }}>
        <strong>All Products</strong>
      </div>
      <div className="store-grid">
        {products.map((p) => (
          <div key={p.id} className="store-card">
            <Link to={`/store/${p.id}`} className="store-card-link">
              <div className="store-img">
                <img src={p.image} alt={p.title} />
              </div>
              <div className="store-meta">
                <div className="store-title" title={p.title}>{p.title}</div>
                <div className="store-price">₹{p.price.toFixed(2)}</div>
              </div>
            </Link>
            <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
              <button onClick={() => addToCart(p, 1)}>Add to cart</button>
              <Link to={`/store/${p.id}`}><button>View</button></Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
