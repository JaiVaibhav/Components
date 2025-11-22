import { useCart } from "../../store/CartContext";
import { Link } from "react-router-dom";

export default function CartPage() {
  const { items, updateQty, removeFromCart, clearCart } = useCart();

  const total = items.reduce((s, it) => s + it.product.price * it.qty, 0);

  if (items.length === 0)
    return (
      <div style={{ padding: 18 }}>
        <h3>Your cart is empty</h3>
        <Link to="/store">Continue shopping</Link>
      </div>
    );

  return (
    <div style={{ padding: 18 }}>
      <h3>Your Cart</h3>
      <div style={{ display: "grid", gap: 12 }}>
        {items.map((it) => (
          <div key={it.id} style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <img src={it.product.image} alt="" style={{ width: 72, height: 72, objectFit: "contain" }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>{it.product.title}</div>
              <div>₹{it.product.price.toFixed(2)}</div>
            </div>
            <div>
              <input type="number" min={1} value={it.qty} onChange={(e) => updateQty(it.id, Math.max(1, Number(e.target.value || 1)))} style={{ width: 64 }} />
            </div>
            <div>
              <button onClick={() => removeFromCart(it.id)}>Remove</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <strong>Total:</strong> ₹{total.toFixed(2)}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => { alert('Pretend checkout executed — integrate real payment gateway to proceed.'); clearCart(); }}>Checkout</button>
          <Link to="/store"><button>Continue shopping</button></Link>
        </div>
      </div>
    </div>
  );
}
