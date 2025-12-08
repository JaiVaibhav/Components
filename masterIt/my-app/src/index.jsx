import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import App from "./App";
import Main from "./pages/Main";
import Carousel from "./pages/Carousel";
import Store from "./pages/Store";
import InfiniteScroll from "./pages/InfiniteScroll";
const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  // <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/carousel" element={<Carousel />} />
        <Route path="/progress" element={<App />} />
        <Route path="/store/*" element={<Store/>} />
        <Route path="/infiniteScroll" element={<InfiniteScroll/>}/>
      </Routes>
    </BrowserRouter>
  // </StrictMode>
);
