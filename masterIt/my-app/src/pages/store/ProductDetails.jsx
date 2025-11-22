import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCart } from "../../store/CartContext";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [curImage, setCurImage] = useState(0);
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    let mounted = true;
    fetch(`https://dummyjson.com/products/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setProduct(data);
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
    return () => (mounted = false);
  }, [id]);

  if (loading) return <div>Loading…</div>;
  if (!product) return <div>Product not found</div>;

  const ratingValue = product?.rating?.rate ?? product?.rating ?? 'N/A';

  return (
    <div className="product-page container">
      <div className="product-grid">
        <div className="product-gallery">
          <div className="main-image">
            <button className="gallery-arrow left" onClick={() => setCurImage((i) => (i - 1 + (product.images?.length || 1)) % (product.images?.length || 1))} aria-label="Previous image">‹</button>
            <img src={product.images?.[curImage] || product.thumbnail} alt={product.title} />
            <button className="gallery-arrow right" onClick={() => setCurImage((i) => (i + 1) % (product.images?.length || 1))} aria-label="Next image">›</button>
          </div>
          <div className="thumbs">
            {(product.images || [product.thumbnail]).map((img, i) => (
              <button key={i} className={i === curImage ? 'thumb active' : 'thumb'} onClick={() => setCurImage(i)}>
                <img src={img} alt={`thumb-${i}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="product-info">
          <div className="product-header">
            <h2 className="product-title-large">{product.title}</h2>
            <div className="rating-badge">⭐ {ratingValue}</div>
          </div>
          <div className="price-row">
            <div className="price">₹{(product.price || 0).toFixed(2)}</div>
            <div className="stock">{product.stock ? `${product.stock} in stock` : '—'}</div>
          </div>

          <div className="product-desc">{product.description}</div>

          <div className="product-actions">
            <label className="qty-control">Qty
              <input type="number" min="1" value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value || 1)))} />
            </label>
            <button className="btn btn-primary" onClick={() => addToCart(product, qty)}>Add to cart</button>
            <Link to="/store/cart"><button className="btn btn-outline">Go to cart</button></Link>
          </div>

          <div className="product-meta">Category: <strong>{product.category}</strong></div>
        </div>
      </div>
    </div>
  );
}
