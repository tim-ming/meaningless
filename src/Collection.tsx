import { useNavigate, useParams } from "react-router";
import MagneticWrapper from "./components/Magnetic";
import data from "./assets/collections.json";

const Collection: React.FC = () => {
  const { id } = useParams();
  return (
    <div className="flex flex-col gap-4 items-center justify-center">
      <h1 className="font-bold text-6xl  leading-[1.05] tracking-[-0.05em] text-neutral-800">
        {id}
      </h1>
      <p>
        {data.find((item) => item.id === id)?.title ||
          "No description available"}
      </p>
    </div>
  );
};

export default Collection;
