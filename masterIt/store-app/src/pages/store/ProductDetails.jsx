import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCart } from "../../store/CartContext";

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setProduct(null); setImageIndex(0); setQty(1);
    fetch(`https://dummyjson.com/products/${id}`).then((response) => response.ok ? response.json() : null).then(setProduct).catch(() => setProduct(false));
  }, [id]);

  if (product === null) return <p className="status">Loading product…</p>;
  if (!product) return <p className="status">Product not found. <Link to="/">Back to products</Link></p>;
  const images = product.images?.length ? product.images : [product.thumbnail];
  const outOfStock = product.stock === 0;

  return <section className="product-page">
    <Link to="/">← Back to products</Link>
    <div className="product-layout">
      <div><div className="main-image"><img src={images[imageIndex]} alt={product.title} /></div>
        <div className="thumbnails">{images.map((image, index) => <button className={index === imageIndex ? "selected" : ""} key={image} onClick={() => setImageIndex(index)}><img src={image} alt={`View ${index + 1}`} /></button>)}</div>
      </div>
      <div><h1>{product.title}</h1><p className="price">₹{product.price.toFixed(2)}</p><p>{product.description}</p><p className="muted">Category: {product.category} · {product.stock} in stock</p>
        <div className="purchase"><label>Quantity <input type="number" min="1" max={product.stock} value={qty} onChange={(event) => setQty(Math.max(1, Number(event.target.value) || 1))} /></label>
          <button disabled={outOfStock || qty > product.stock} onClick={() => addToCart(product, qty)}>{outOfStock ? "Out of stock" : "Add to cart"}</button>
        </div>
      </div>
    </div>
  </section>;
}
