import { useMemo } from "react";
import { Outlet, useNavigate, useParams } from "react-router";
import data from "./assets/collections.json";

const CollectionLayout = () => {
  const { id } = useParams(); // Directly get `id` from the URL
  const navigate = useNavigate();

  // Memoize sorted IDs
  const d = useMemo(
    () => data.sort((a, b) => a.id.localeCompare(b.id)).map((item) => item.id),
    [data]
  );

  // Handle invalid `id`
  if (!id || !d.includes(id)) {
    navigate("/404");
    return null;
  }

  function next() {
    if (!id) return;
    const index = d.indexOf(id);
    const to = index === d.length - 1 ? d[0] : d[index + 1];
    navigate(`${to}`);
  }

  function prev() {
    if (!id) return;
    const index = d.indexOf(id);
    const to = index === 0 ? d[d.length - 1] : d[index - 1];
    navigate(`${to}`);
  }
  return (
    <main className="flex flex-col w-screen absolute top-[calc(var(--nav-height)+10%-4rem)] px-4 sm:px-8 z-[999999] pointer-events-none">
      <div className="flex items-center pt-8 w-full justify-center">
        <div className="flex items-center w-full justify-between max-w-[500px]">
          <button
            onClick={prev}
            className="flex rounded-full border-[1px] border-neutral-500 p-4 text-neutral-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 sm:h-8 w-6 sm:w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <Outlet />
          <button
            onClick={next}
            className="flex rounded-full border-[1px] border-neutral-500 p-4 text-neutral-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 sm:h-8 w-6 sm:w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </main>
  );
};

export default CollectionLayout;
