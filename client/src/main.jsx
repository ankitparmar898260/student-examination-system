import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { EnrollmentDraftProvider } from "./context/EnrollmentDraftContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <EnrollmentDraftProvider>
      <App />
    </EnrollmentDraftProvider>
  </React.StrictMode>
);
