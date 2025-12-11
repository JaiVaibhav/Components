import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import App from "./App";
import Main from "./pages/Main";
import Carousel from "./pages/Carousel";
import Store from "./pages/Store";
import InfiniteScroll from "./pages/InfiniteScroll";
import {AdminDashboard} from "./exercises/exerciseLatest";
import SearchFunctionality from "./pages/search";
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
        <Route path="/exercise" element={<AdminDashboard/>}/>
        <Route path="/search" element={<SearchFunctionality/>}/>

      </Routes>
    </BrowserRouter>
  // </StrictMode>
);
