import { AnimatePresence } from "motion/react";
import { StrictMode, Suspense, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import About from "./About.tsx";
import App from "./App.tsx";
import Background from "./Background.tsx";
import Nav from "./components/Nav.tsx";
import { TRANSITION } from "./helpers/constants.ts";
import "./index.css";
import SuspenseOverlay from "./SuspenseOverlay.tsx";
import { Loader } from "@react-three/drei";
import Collection from "./Collection.tsx";
import CollectionLayout from "./CollectionLayout.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <SuspenseOverlay />

      <Background />
      <InitialiseCSSVariable />
      <AnimatedRoutes />
      <Nav />
    </BrowserRouter>
  </StrictMode>
);

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route index element={<App />} />
        <Route path="about" element={<About />} />

        <Route path="collections" element={<CollectionLayout />}>
          <Route path=":id" element={<Collection />} />
        </Route>
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
