import React from "react";

interface WrapperProps {
  children: React.ReactNode;
  extraClassName?: string;
}

const Wrapper: React.FC<WrapperProps> = ({ children, extraClassName = "" }) => {
  return (
    <div className={`p-8 h-full w-full ${extraClassName}`}>{children}</div>
  );
};

export default Wrapper;
