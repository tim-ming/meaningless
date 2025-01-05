import React from "react";

const NotFound: React.FC = () => {
  return (
    <div className="z-[999999] pointer-events-none overflow-hidden items-center justify-center flex flex-col w-screen h-screen">
      <h1 className="text-[min(20vw,20vh)] tracking-[-0.05em] font-bold mix-blend-difference text-white">
        404
      </h1>
      <p className="text-white mix-blend-difference text-center">
        The page you are looking for does not exist.
      </p>
    </div>
  );
};

export default NotFound;
