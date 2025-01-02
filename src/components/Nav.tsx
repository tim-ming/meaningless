import React from "react";
import Logo from "../assets/logo.svg";
import { Link } from "react-router";

interface NavProps {
  position?: "fixed" | "sticky";
}

const Nav: React.FC<NavProps> = ({ position = "fixed" }) => {
  return (
    <nav
      className={`${position} top-0 left-0 flex w-full z-[999] px-[var(--padding)] pointer-events-none bg-white ${
        position == "fixed" ? "h-[var(--nav-height)]" : ""
      } justify-center`}
    >
      <Link to="/" className="flex flex-1 items-center">
        <img src={Logo} alt="logo" className="w-9 sm:w-12" />
      </Link>
      <span className="flex flex-1 justify-end items-center gap-8">
        <Link to="/about" className="text-sm font-medium hover:underline">
          About
        </Link>
      </span>
    </nav>
  );
};

export default Nav;
