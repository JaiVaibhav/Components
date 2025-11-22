import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useCart } from "../../store/CartContext";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
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

  return (
    <div style={{ display: "flex", gap: 20, padding: 12 }}>
      <div style={{ flex: "0 0 320px", height: 380, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img src={product.thumbnail || product.images?.[0]} alt={product.title} style={{ maxHeight: 360, objectFit: "contain" }} />
      </div>
      <div style={{ flex: 1 }}>
        <h2>{product.title}</h2>
        <div style={{ color: "#e53935", fontWeight: 700, fontSize: 20 }}>₹{product.price.toFixed(2)}</div>
        <div style={{ marginTop: 8 }}>{product.description}</div>
        <div style={{ marginTop: 12 }}>
          <button onClick={() => addToCart(product, 1)}>Add to cart</button>
          <Link to="/store/cart"><button style={{ marginLeft: 8 }}>Go to cart</button></Link>
        </div>
      </div>
    </div>
  );
}
