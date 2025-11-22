import { Routes, Route, Link, Outlet } from "react-router-dom";
import { CartProvider, useCart } from "../store/CartContext";
import ProductGrid from "./store/ProductGrid";
import ProductDetails from "./store/ProductDetails";
import CartPage from "./store/Cart";

export default function Store() {
  return (
    <CartProvider>
      <div style={{ padding: 18 }}>
        <Header />

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
