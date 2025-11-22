import { useState, useEffect, useRef } from "react";

function ProductCard({ product }) {
  return (
    <div className="product-card">
      <div className="product-image">
        <img src={product.image} alt={product.title} />
      </div>
      <div className="product-body">
        <div className="product-title" title={product.title}>
          {product.title}
        </div>
        <div className="product-price">₹{product.price.toFixed(2)}</div>
        <div className="product-rating">⭐ {product.rating?.rate} ({product.rating?.count})</div>
      </div>
    </div>
  );
}

export default function Carousel() {
  const [products, setProducts] = useState([]);
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    fetch("https://fakestoreapi.com/products")
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        // limit to first 8 products
        setProducts(data.slice(0, 8));
      })
      .catch(() => {
        if (!mounted) return;
        setProducts([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (products.length === 0) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % products.length);
    }, 4000);
    return () => clearInterval(timerRef.current);
  }, [products]);

  function prev() {
    if (products.length === 0) return;
    setIndex((i) => (i - 1 + products.length) % products.length);
  }

  function next() {
    if (products.length === 0) return;
    setIndex((i) => (i + 1) % products.length);
  }

  return (
    <div className="carousel-page">
      <h2>Trending Products</h2>
      <div className="carousel-wrapper">
        <div className="carousel-track" style={{ transform: `translateX(-${index * 100}%)` }}>
          {products.map((p) => (
            <div className="slide" key={p.id}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
      <div className="carousel-controls">
        <button onClick={prev}>Prev</button>
        <div className="dots">
          {products.map((_, i) => (
            <button
              key={i}
              className={i === index ? "dot active" : "dot"}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
        <button onClick={next}>Next</button>
      </div>
    </div>
  );
}
