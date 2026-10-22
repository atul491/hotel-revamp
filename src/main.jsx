import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DesignProvider } from "./design";
import Home from "./pages/Home";
import Universal from "./pages/Universal";
import Options from "./pages/Options";
import IBCurrent from "./pages/IBCurrent";
import Final from "./pages/Final";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <DesignProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/universal" element={<Universal />} />
          <Route path="/options" element={<Options />} />
          <Route path="/ib" element={<IBCurrent />} />
          <Route path="/final" element={<Final />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </DesignProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
