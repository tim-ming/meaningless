import { proxy } from "valtio";

type BackgroundStore = {
  findClosestObjectId: () => string | null;
};

export const backgroundStore = proxy<BackgroundStore>({
  findClosestObjectId: () => null, // This will hold the function
});
