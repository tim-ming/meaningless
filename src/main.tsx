import { AnimatePresence } from "motion/react";
import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router";
import About from "./About.tsx";
import App from "./App.tsx";
import Background from "./Background.tsx";
import Collection from "./Collection.tsx";
import CollectionLayout from "./CollectionLayout.tsx";
import Nav from "./components/Nav.tsx";
import { TRANSITION } from "./helpers/constants.ts";
import "./index.css";
import NotFound from "./NotFound.tsx";
import SuspenseOverlay from "./SuspenseOverlay.tsx";
import { HelmetProvider } from "react-helmet-async";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <SuspenseOverlay />

      <Background />
      <InitialiseCSSVariable />
      <HelmetProvider>
        <AnimatedRoutes />
      </HelmetProvider>
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
        <Route path="404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
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
