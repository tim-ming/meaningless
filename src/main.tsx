import { AnimatePresence } from "motion/react";
import { StrictMode, Suspense, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import About from "./About.tsx";
import App from "./App.tsx";
import Background from "./Background.tsx";
import Collections from "./Collections.tsx";
import Nav from "./components/Nav.tsx";
import { TRANSITION } from "./helpers/constants.ts";
import "./index.css";
import Overlay from "./Overlay.tsx";
import SuspenseOverlay from "./SuspenseOverlay.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      {/* <Suspense fallback={<SuspenseOverlay />}> */}
      <Overlay />
      <Background />
      <InitialiseCSSVariable />
      <AnimatedRoutes />
      <Nav />
      {/* </Suspense> */}
    </BrowserRouter>
  </StrictMode>
);

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route index element={<App />} />
        <Route path="collections" element={<Collections />} />
        <Route path="about" element={<About />} />
        <Route path="loading" element={<Overlay />} />
      </Routes>
    </AnimatePresence>
  );
}

function InitialiseCSSVariable() {
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--transition-duration",
      `${TRANSITION.DURATION_S}s`
    );
  }, []);
  return <></>;
}
