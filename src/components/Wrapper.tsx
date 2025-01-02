import React from "react";

interface WrapperProps {
  children: React.ReactNode;
  extraClassName?: string;
}

const Wrapper: React.FC<WrapperProps> = ({ children, extraClassName = "" }) => {
  return (
    <div className={`p-[var(--padding)] h-full w-full ${extraClassName}`}>
      {children}
    </div>
  );
};

export default Wrapper;
