import React, { useRef } from "react";
import Logo from "./assets/logo.svg";
import Background from "./Background";

const App = () => {
  return (
    <div className="h-screen flex w-screen flex-col relative items-center justify-center bg-gray-100 text-gray-900">
      <Background />
      <div className="p-8 h-full w-full absolute">
        <Nav />
        <Content />
        <Footer />
        <Links />
      </div>
    </div>
  );
};

const Content = () => {
  return (
    <main className="absolute top-[15%] left-0 right-0">
      <div className="flex-col flex gap-8 items-center justify-center">
        <h1 className="text-5xl font-semibold leading-[1.05] tracking-[-0.05em] text-center max-w-xl">
          Within every picture holds no story.
        </h1>
        <span>
          <button className="w-[160px] h-[50px] border-neutral-900 border-[1px] rounded-lg">
            Take a look →
          </button>
        </span>
      </div>
    </main>
  );
};

const Links = () => {
  const links = [
    { name: "X/Twitter", url: "#" },
    { name: "XHS", url: "#" },
    { name: "Github", url: "#" },
    { name: "Creative Developer", url: "#" },
    { name: "Discord", url: "#" },
    { name: "XHS", url: "#" },
  ];
  return (
    <div className="absolute bottom-0 right-0 flex p-[inherit] items-end gap-8">
      <div className="flex gap-8 text-neutral-700">
        <ul className="flex flex-col space-y-2">
          {links.slice(0, 3).map((link, index) => (
            <li key={index}>
              <a
                href={link.url}
                className="hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.name}
              </a>
            </li>
          ))}
        </ul>
        <ul className="flex flex-col space-y-2">
          {links.slice(3).map((link, index) => (
            <li key={index}>
              <a
                href={link.url}
                className="hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.name}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-neutral-900">© 2024 timming</p>
    </div>
  );
};

const Nav = () => {
  return (
    <nav className="absolute top-0 left-0 flex w-full p-[inherit] justify-center">
      <header className="flex flex-1 items-center">
        <img src={Logo} alt="logo" className="w-[50px]" />
      </header>
      <span className="flex flex-1 justify-end items-center">
        <a href="#" className="text-sm font-medium hover:underline">
          About
        </a>
      </span>
    </nav>
  );
};

const Footer = () => {
  return (
    <footer className="absolute bottom-0 left-0 flex p-[inherit] leading-[1.05] tracking-[-0.05em] text-neutral-700">
      <div className="flex flex-col">
        <p className="max-w-xs md:max-w-sm">
          AI-generated images often lack emotions because they are created using
          mathematical algorithms and neural networks, which interpret visual
          elements as data points rather than emotional expressions.
        </p>
        <br />
        <p className="max-w-xs md:max-w-sm">
          While advanced AI models can mimic facial expressions, colors, and
          compositions associated with emotions, they do not truly feel or
          understand the emotions they attempt to replicate.
        </p>
      </div>
    </footer>
  );
};

export default App;
