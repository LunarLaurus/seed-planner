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
  const [configLoaded, setConfigLoaded] = useState(false);

  useEffect(() => {
    fetch("/config")
      .then((res) => res.json())
      .then((data) => {
        window.env = data; // Store env vars globally
        setConfigLoaded(true); // Mark as loaded
      })
      .catch((err) => {
        console.error("Failed to load config", err);
        setConfigLoaded(true); // Allow app to render even if config fails
      });
  }, []);

  if (!configLoaded) {
    return <div>Loading configuration...</div>; // Prevent app from rendering before config loads
  }

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
