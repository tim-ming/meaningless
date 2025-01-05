import React from "react";
import Wrapper from "./components/Wrapper";
import Nav from "./components/Nav";
import { motion } from "motion/react";
const About: React.FC = () => {
  return (
    <motion.main
      animate={{ opacity: 1, translateX: "0" }}
      initial={{ opacity: 0, translateX: "20px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="flex flex-col justify-center min-h-full p-8 absolute w-screen backdrop-blur-none sm:backdrop-blur-none bg-white bg-opacity-50 sm:bg-transparent"
    >
      <h1 className="text-5xl tracking-[-0.05em] font-bold mb-8 text-neutral-800">
        About
      </h1>
      <p className="text-neutral-700 mb-4">A display of AI generated images.</p>
      <div className="text-neutral-500 text-sm leading-4">
        <p>Images generated with AOM3A3_orangemixs.</p>
        <p>Labelled by Google Gemini Flash 1.5.</p>
      </div>
    </motion.main>
  );
};

export default About;
