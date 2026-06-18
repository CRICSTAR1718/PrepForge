import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { PlacementDoodles } from "./components/PlacementDoodles";
import "./index.css";
import App from "./App.jsx";
import { PlanProvider } from "./context/PlanContext.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <PlanProvider>
          <PlacementDoodles />
          <App />
        </PlanProvider>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);
