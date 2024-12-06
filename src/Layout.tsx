import React from "react";
import Nav from "./components/Nav";
import { Outlet } from "react-router";
import { motion } from "motion/react";

const Layout = () => {
  return (
    <>
      <motion.div
        animate={{
          scaleY: "0",
        }}
        initial={{
          scaleY: "0",
        }}
        exit={{
          scaleY: "1",
        }}
        className="bg-black w-screen h-screen fixed top-0 left-0 z-[9999]"
      ></motion.div>
      <Outlet />
    </>
  );
};

export default Layout;
