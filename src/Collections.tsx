import { Link } from "react-router";
import data from "./assets/collections.json";
import ScrollToAnchor from "./components/ScrollToAnchor";
import { useTransitionStore } from "./stores";
import { useEffect } from "react";
import { usePresence } from "motion/react";
import { TRANSITION } from "./helpers/constants";
import Transitioner from "./components/Transitioner";

const Collections = () => {
  return (
    <>
      <Transitioner />
      <ScrollToAnchor />

      <div className="mt-[var(--nav-height)] w-screen min-h-screen flex justify-center">
        <span className="fixed border-t-[1px] w-screen"></span>
        <div className="grid grid-cols-2 relative justify-center border-x-[1px]">
          {/* Sidebar */}
          <aside className="px-[var(--padding)] max-w-[720px] relative pt-6 border-r border-gray-300">
            <div className="fixed flex flex-col gap-20">
              <h1 className="text-5xl leading-[1.05] tracking-[-0.05em] font-semibold">
                Collections
              </h1>
              <ul className="flex flex-col gap-1">
                {data.map((item, index) => (
                  <div key={index}>
                    <Link
                      to={`/collections#${item.id}`}
                      className="text-lg leading-[1.05] tracking-[-0.05em] hover:underline"
                    >
                      {item.title}
                    </Link>
                  </div>
                ))}
              </ul>
            </div>
          </aside>

          {/* Main Content */}
          <main className=" max-w-[720px]">
            {data.map((item, _) => (
              <section className="flex flex-col" id={item.id} key={item.id}>
                <div className="mb-4">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full object-cover p-6"
                  />
                </div>
                <header className="flex justify-between items-start mb-4 px-6">
                  <h2 className="text-3xl font-semibold leading-[1.05] tracking-[-0.05em]">
                    {item.title}
                  </h2>
                </header>
                <div className="flex space-x-8 px-6">
                  <p className="text-neutral-600 leading-[1.15] tracking-[-0.04em]">
                    {item.description}
                  </p>
                </div>
                <span className="text-xl my-16 font-medium text-neutral-800 px-6">
                  {item.id}
                </span>
                <span className="border-b-[1px] w-full mt-8" />
              </section>
            ))}
          </main>
        </div>
      </div>
    </>
  );
};

export default Collections;
