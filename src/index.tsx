import { BrowserRouter } from "react-router-dom";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App.tsx";
import "@/styles/Primary.css";

const rootElement = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

rootElement.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
