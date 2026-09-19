import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import AdminAuth from "./auth/AdminAuth";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AdminAuth />
  </StrictMode>,
);