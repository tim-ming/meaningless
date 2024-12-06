import { Link, useNavigate } from "react-router";
import Background from "./Background";
import Wrapper from "./components/Wrapper";

const App = () => {
  return (
    <>
      <Background />
      <Wrapper extraClassName="pointer-events-none">
        <Content />
        <Footer />
        <Links />
      </Wrapper>
    </>
  );
};

const Content = () => {
  const navigate = useNavigate();
  return (
    <main className="absolute top-[15%] left-0 right-0">
      <div className="flex-col flex gap-8 items-center justify-center">
        <h1 className="text-5xl font-semibold leading-[1.05] tracking-[-0.05em] text-center max-w-xl">
          Within every picture holds no story.
        </h1>
        <span>
          <button
            onClick={() => navigate("/collections")}
            className="w-[160px] h-[50px] border-neutral-900 border-[1px] rounded-lg"
          >
            Take a look →
          </button>
        </span>
      </div>
    </main>
  );
};

const Links = () => {
  const links = [
    { name: "Github", url: "#" },
    { name: "Discord", url: "#" },
    { name: "LinkedIn", url: "#" },
  ];
  return (
    <div className="absolute bottom-0 right-0 flex p-[inherit] items-end gap-8">
      <div className="flex flex-col gap-4 items-end text-neutral-700">
        <ul className="flex flex-col space-y-2">
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
    </div>
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
