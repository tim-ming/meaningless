import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import {
  BrowserRouter,
  Routes,
  Route,
  HashRouter,
  useLocation,
} from "react-router";
import App from "./App.tsx";
import Collections from "./Collections.tsx";
import Layout from "./Layout.tsx";
import About from "./About.tsx";
import { AnimatePresence } from "motion/react";
import Nav from "./components/Nav.tsx";
import { motion } from "motion/react";
import Loading from "./Loading.tsx";
import { TRANSITION } from "./helpers/constants.ts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <InitialiseCSSVariable />
      <AnimatedRoutes />
      <Nav />
      <TransitionOverlay />
    </BrowserRouter>
  </StrictMode>
);

function AnimatedRoutes() {
  const location = useLocation();
  console.log(location);
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route index element={<App />} />
        <Route path="collections" element={<Collections />} />
        <Route path="about" element={<About />} />
        <Route path="loading" element={<Loading />} />
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

function TransitionOverlay() {
  return <Loading />;
}
