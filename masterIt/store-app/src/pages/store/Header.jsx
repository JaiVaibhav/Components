import { Link, NavLink } from "react-router-dom";
import { useCart } from "../../store/CartContext";

export default function Header() {
  const { items } = useCart();
  const count = items.reduce((total, item) => total + item.qty, 0);

  return (
    <header className="site-header">
      <div className="container header-content">
        <Link className="brand" to="/">Component Store</Link>
        <nav aria-label="Main navigation">
          <NavLink to="/" end>Products</NavLink>
          <NavLink to="/cart">Cart ({count})</NavLink>
        </nav>
      </div>
    </header>
  );
}
