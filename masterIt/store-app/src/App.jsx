import { Route, Routes } from "react-router-dom";
import { CartProvider } from "./store/CartContext";
import Header from "./pages/store/Header";
import ProductGrid from "./pages/store/ProductGrid";
import ProductDetails from "./pages/store/ProductDetails";
import CartPage from "./pages/store/Cart";

export default function App() {
  return (
    <CartProvider>
      <Header />
      <main className="container">
        <Routes>
          <Route path="/" element={<ProductGrid />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </main>
    </CartProvider>
  );
}
