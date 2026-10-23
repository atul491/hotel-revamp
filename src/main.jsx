import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DesignProvider } from "./design";
import { UserVariantsProvider } from "./user";
import Final from "./pages/Final";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <DesignProvider>
        <UserVariantsProvider>
        <Routes>
          {/* Only /final is kept; every other address lands there. */}
          <Route path="/final" element={<Final />} />
          <Route path="*" element={<Navigate to="/final" replace />} />
        </Routes>
        </UserVariantsProvider>
      </DesignProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
