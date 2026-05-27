import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";
import App from "./App.jsx";
import { PlanProvider } from "./context/PlanContext.jsx";

createRoot(document.getElementById("root")).render(

    <BrowserRouter>
    <AuthProvider>
      <PlanProvider>
        <App />
      </PlanProvider>
    </AuthProvider>
    </BrowserRouter>
  
);