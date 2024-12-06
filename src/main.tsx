import { StrictMode } from "react";
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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Nav />
      <AnimatePresence mode="wait">
        <AnimatedRoutes />
      </AnimatePresence>
    </BrowserRouter>
  </StrictMode>
);

function AnimatedRoutes() {
  const location = useLocation();
  console.log(location);
  return (
    <Routes location={location} key={location.pathname}>
      <Route
        index
        element={
          <AnimationWrapper>
            <App />
          </AnimationWrapper>
        }
      />
      <Route
        path="collections"
        element={
          <AnimationWrapper>
            <Collections />
          </AnimationWrapper>
        }
      />
      <Route
        path="about"
        element={
          <AnimationWrapper>
            <About />
          </AnimationWrapper>
        }
      />
    </Routes>
  );
}

function AnimationWrapper({ children }) {
  return (
    <>
      {children}
      <motion.div
        animate={{
          scaleY: 0,
        }}
        initial={{
          scaleY: 0,
        }}
        exit={{
          scaleY: 1,
        }}
        transition={{
          duration: 1,
        }}
        className="bg-black w-full h-screen fixed top-0 left-0 z-[9999] origin-bottom"
      ></motion.div>
      <motion.div
        animate={{
          scaleY: 0,
        }}
        initial={{
          scaleY: 1,
        }}
        exit={{
          scaleY: 0,
        }}
        transition={{
          duration: 1,
        }}
        className="bg-black w-full h-screen fixed top-0 left-0 z-[9999] origin-top"
      ></motion.div>
    </>
  );
}
