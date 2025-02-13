import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NavBar from "./components/navigation/NavBar";
import Dashboard from "./pages/Dashboard";
import Trays from "./pages/Trays";
import Plants from "./pages/Plants";
import Species from "./pages/Species";
import SeedingCalendar from "./pages/SeedingCalendar";
import EditTray from "./pages/edit/EditTray";
import EditPlant from "./pages/edit/EditPlant";
import "./styles/Primary.css";

const queryClient = new QueryClient();

const App = () => {
  const [config, setConfig] = useState({ API_URL: "", OTEL_EXPORTER_OTLP_ENDPOINT: "" });

  useEffect(() => {
    fetch("/config")
      .then((res) => res.json())
      .then((data) => {
        window.env = data;
        setConfig(data);
      })
      .catch((err) => console.error("Failed to load config", err));
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <NavBar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/trays" element={<Trays />} />
            <Route path="/plants" element={<Plants />} />
            <Route path="/species" element={<Species />} />
            <Route path="/calendar" element={<SeedingCalendar />} />
            <Route path="/edit-tray/:trayId" element={<EditTray />} />
            <Route path="/edit-plant/:plantId" element={<EditPlant />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
