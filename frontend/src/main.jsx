import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext.jsx";
import App from "./App.jsx";
import "./index.css";
import "./styles/00-mobile-viewport.css";

function installMobileZoomLock() {
  const isTouchDevice =
    "ontouchstart" in window || navigator.maxTouchPoints > 0;

  if (!isTouchDevice) {
    return;
  }

  const preventGesture = (event) => {
    event.preventDefault();
  };

  document.addEventListener("gesturestart", preventGesture, {
    passive: false,
  });

  document.addEventListener("gesturechange", preventGesture, {
    passive: false,
  });

  document.addEventListener("gestureend", preventGesture, {
    passive: false,
  });

  document.addEventListener(
    "touchmove",
    (event) => {
      if (event.touches && event.touches.length > 1) {
        event.preventDefault();
      }
    },
    { passive: false }
  );

  let lastTouchEnd = 0;

  document.addEventListener(
    "touchend",
    (event) => {
      const now = Date.now();

      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }

      lastTouchEnd = now;
    },
    { passive: false }
  );
}

installMobileZoomLock();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);