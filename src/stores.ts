import { Object3D } from "three";
import { proxy } from "valtio";

type BackgroundStore = {
  findClosestObjectId: (x: number, y: number) => string | null;
};

export const backgroundStore = proxy<BackgroundStore>({
  findClosestObjectId: () => null, // This will hold the function
});
