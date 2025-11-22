import { Routes, Route, Link, Outlet } from "react-router-dom";
import { CartProvider } from "../store/CartContext";
import ProductGrid from "./store/ProductGrid";
import ProductDetails from "./store/ProductDetails";
import CartPage from "./store/Cart";

export default function Store() {
  return (
    <CartProvider>
      <div style={{ padding: 18 }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1>Store</h1>
          <nav>
            <Link to="/">Home</Link> {" | "}
            <Link to="/store">Products</Link> {" | "}
            <Link to="/store/cart">Cart</Link>
          </nav>
        </header>

        <Routes>
          <Route path="/" element={<ProductGrid />} />
          <Route path="/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<CartPage />} />
        </Routes>

        <Outlet />
      </div>
    </CartProvider>
  );
}
