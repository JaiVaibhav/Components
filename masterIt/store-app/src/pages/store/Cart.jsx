import { Link } from "react-router-dom";
import { useCart } from "../../store/CartContext";

export default function CartPage() {
  const { items, updateQty, removeFromCart, clearCart } = useCart();
  const total = items.reduce((sum, item) => sum + item.product.price * item.qty, 0);

  if (!items.length) return <section className="empty"><h1>Your cart is empty</h1><Link to="/">Continue shopping</Link></section>;

  return <section className="cart"><h1>Your cart</h1>
    {items.map(({ id, product, qty }) => <article className="cart-item" key={id}>
      <img src={product.thumbnail ?? product.images?.[0]} alt={product.title} />
      <div><h2>{product.title}</h2><strong>₹{product.price.toFixed(2)}</strong></div>
      <label>Qty <input type="number" min="1" value={qty} onChange={(event) => updateQty(id, Math.max(1, Number(event.target.value) || 1))} /></label>
      <button className="text-button" onClick={() => removeFromCart(id)}>Remove</button>
    </article>)}
    <div className="cart-total"><strong>Total: ₹{total.toFixed(2)}</strong><div><Link to="/">Continue shopping</Link><button onClick={() => { clearCart(); window.alert("Mock checkout completed."); }}>Checkout</button></div></div>
  </section>;
}
