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

  // when product changes, reset gallery state
  useEffect(() => {
    setCurImage(0);
    setQty(1);
  }, [product]);

  if (loading)
    return (
      <div className="product-page container">
        <div style={{ padding: 40, textAlign: "center" }}>
          <div className="loader" aria-hidden="true" />
          <div style={{ marginTop: 12, color: "var(--muted)" }}>Loading product…</div>
        </div>
      </div>
    );
  if (!product)
    return (
      <div className="product-page container">
        <div style={{ padding: 40, textAlign: "center" }}>
          <div style={{ marginBottom: 12 }}>Product not found.</div>
          <Link to="/store" className="btn btn-outline">Back to store</Link>
        </div>
      </div>
    );

  const ratingValue = product?.rating ?? product?.rating?.rate ?? "N/A";
  const images = product?.images?.length ? product.images : product?.thumbnail ? [product.thumbnail] : [];
  const hasImages = images.length > 0;
  const priceFormatted = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(product?.price || 0);

  return (
    <div className="product-page container">
      <div className="product-grid">
          <div className="product-gallery">
            <div className="main-image" role="region" aria-label="Product images">
              <button
                type="button"
                className="gallery-arrow left"
                onClick={() => hasImages && setCurImage((i) => (i - 1 + images.length) % images.length)}
                aria-label="Previous image"
                disabled={!hasImages}
              >
                ‹
              </button>

              <img
                src={hasImages ? images[curImage] : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='20'%3ENo image%3C/text%3E%3C/svg%3E"}
                alt={product.title}
                loading="lazy"
              />

              <button
                type="button"
                className="gallery-arrow right"
                onClick={() => hasImages && setCurImage((i) => (i + 1) % images.length)}
                aria-label="Next image"
                disabled={!hasImages}
              >
                ›
              </button>
            </div>

            <div className="thumbs" role="tablist" aria-label="Product thumbnails">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  className={i === curImage ? "thumb active" : "thumb"}
                  onClick={() => setCurImage(i)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setCurImage(i);
                  }}
                  aria-pressed={i === curImage}
                >
                  <img src={img} alt={`Thumbnail ${i + 1} for ${product.title}`} loading="lazy" />
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
            <div className="price">{priceFormatted}</div>
            <div className="stock">{product.stock ? `${product.stock} in stock` : "—"}</div>
          </div>

          <div className="product-desc">{product.description}</div>

          <div className="product-actions">
            <label className="qty-control">Qty
              <input type="number" min="1" value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value || 1)))} />
            </label>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => addToCart(product, qty)}
              disabled={product.stock === 0 || qty > (product.stock || Infinity)}
            >
              {product.stock === 0 ? "Out of stock" : `Add ${qty} to cart`}
            </button>
            <Link to="/store/cart"><button type="button" className="btn btn-outline">Go to cart</button></Link>
          </div>
          {product.stock !== undefined && qty > product.stock && (
            <div style={{ color: 'var(--danger)', marginTop: 8 }}>Selected quantity exceeds available stock.</div>
          )}

          <div className="product-meta">Category: <strong>{product.category}</strong></div>
        </div>
      </div>
    </div>
  );
}
