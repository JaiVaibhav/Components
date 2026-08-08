import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import Slider from "./Slider";
import "./styles.css";
import InfiniteScroll from "./InfiniteScroll";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      {/* <App /> */}
      {/* <Slider/> */}
      <InfiniteScroll />
    </BrowserRouter>
  </StrictMode>,
);
