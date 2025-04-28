import { Link, useNavigate } from "react-router";
import MagneticWrapper from "./components/Magnetic";
import { backgroundStore } from "./stores";
import { useWindowSize } from "usehooks-ts";
import { motion } from "motion/react";
import { Helmet } from "react-helmet-async";

const App = () => {
  return (
    <>
      <Helmet>
        <title>meaningless</title>
        <meta
          name="description"
          content="meaningless is a simplistic collection of AI-generated images."
        />
      </Helmet>

      <div className={`p-[var(--padding)] h-full w-full pointer-events-none`}>
        <Content />
        <Footer />
        <Links />
      </div>
    </>
  );
};

const Content = () => {
  const navigate = useNavigate();
  const handleClick = () => {
    const id = backgroundStore.findClosestObjectId();
    if (id) {
      navigate(`/collections/${id}`);
    } else {
      console.error("No object found");
      navigate("/collections/01");
    }
  };
  return (
    <motion.main
      animate={{ opacity: 1, translateY: "0" }}
      initial={{ opacity: 0, translateY: "-20px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="absolute top-[calc(var(--nav-height)+15%-4rem)] sm:top-[15%] left-0 right-0"
    >
      <div className="flex-col flex gap-4 sm:gap-8 items-center justify-center">
        <h1 className="text-4xl sm:text-5xl font-semibold leading-[1.05] tracking-[-0.05em] text-center max-w-sm sm:max-w-lg md:max-w-xl">
          Within every picture holds no story.
        </h1>
        <span>
          <MagneticWrapper>
            <button
              onClick={() => handleClick()}
              className="w-[130px] text-sm sm:text-base h-[40px] sm:w-[160px] sm:h-[50px] border-neutral-900 border-[1px] rounded-lg bg-white bg-opacity-80 hover:bg-neutral-800 hover:mix-blend-difference hover:text-neutral-200 transition-[background-color] text-neutral-600"
            >
              Take a look →
            </button>
          </MagneticWrapper>
        </span>
      </div>
    </motion.main>
  );
};

const Links = () => {
  const links = [
    { name: "Github", url: "https://github.com/tim-ming" },
    // { name: "Discord", url: "#" },
    // { name: "LinkedIn", url: "#" },
  ];
  return (
    <motion.div
      animate={{ opacity: 1, translateY: "0" }}
      initial={{ opacity: 0, translateY: "20px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="absolute bottom-0 right-0 flex p-[inherit] items-end gap-8  text-neutral-500"
    >
      <div className="flex flex-col gap-4 items-end">
        <ul className="flex flex-col space-y-1 sm:space-y-2 text-sm sm:text-[16px]">
          {links.map((link, index) => (
            <li key={index}>
              <Link
                to={link.url}
                className="hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
        <p className="text-sm text-neutral-900">© 2024 timming</p>
      </div>
    </motion.div>
  );
};

const Footer = () => {
  const { width, height } = useWindowSize();
  return (
    <motion.footer
      animate={{ opacity: 1, translateY: "0" }}
      initial={{ opacity: 0, translateY: "20px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="absolute bottom-0 text-sm sm:text-[16px] left-0 flex p-[inherit] leading-[1.05] tracking-[-0.05em] text-neutral-500"
    >
      <div className="flex flex-col">
        {width > 500 && height > 500 ? (
          <>
            <p className="max-w-[calc(100%-8rem)] sm:max-w-sm">
              AI-generated images often lack emotions because they are created
              using mathematical algorithms and neural networks, which interpret
              visual elements as data points rather than emotional expressions.
              <br />
              <br />
              While advanced AI models can mimic facial expressions, colors, and
              compositions associated with emotions, they do not feel or
              understand the emotions they attempt to replicate.
            </p>
          </>
        ) : (
          <>
            <p className="max-w-[calc(100%-8rem)] sm:max-w-sm">
              AI-generated images often lack emotions because they are created
              using mathematical algorithms, which interpret visual elements as
              data points.
              <br />
              <br />
              While they can mimic facial expressions, colors and compositions,
              they fail to understand the meaning behind them.
            </p>
          </>
        )}
      </div>
    </motion.footer>
  );
};

export default App;
