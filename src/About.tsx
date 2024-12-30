import React from "react";
import Wrapper from "./components/Wrapper";
import Nav from "./components/Nav";

const About: React.FC = () => {
  return (
    <>
      <main className="flex flex-col items-center justify-center min-h-screen p-8 absolute">
        <h1 className="text-4xl font-bold mb-4">About</h1>
        <p>A display of AI generated images.</p>
        <p>Images generated with AOM3A3_orangemixs.</p>
        <p>Labelled by Google Gemini Flash 1.5.</p>
      </main>
    </>
  );
};

export default About;
