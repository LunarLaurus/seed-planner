import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NavBar from "./components/navigation/NavBar";
import Dashboard from "@/pages/Dashboard";
import Trays from "@/pages/Trays";
import Plants from "@/pages/Plants";
import Species from "@/pages/SpeciesPage";
import SeedingCalendar from "@/pages/SeedingCalendar";
import "./styles/Primary.css";
import { loadConfig } from "./utils/api";

const queryClient = new QueryClient();

declare global {
  interface Window {
    env?: Record<string, any>;
  }
}

const App: React.FC = () => {
  const [configLoaded, setConfigLoaded] = useState<boolean>(false);

  useEffect(() => {
    loadConfig().finally(() => setConfigLoaded(true));
  }, []);

  if (!configLoaded) {
    return <div>Loading configuration...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <NavBar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/trays" element={<Trays />} />
          <Route path="/plants" element={<Plants />} />
          <Route path="/species" element={<Species />} />
          <Route path="/calendar" element={<SeedingCalendar />} />
        </Routes>
      </div>
    </QueryClientProvider>
  );
};

export default App;
