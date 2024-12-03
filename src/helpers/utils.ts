import { BufferGeometry, BufferAttribute } from "three";

/**
 * Creates a rounded rectangle geometry.
 * @reference https://discourse.threejs.org/t/plane-mesh-with-rounded-corners-that-can-have-an-image-texture/46892 by hofk
 * @param {number} w - The width of the rectangle.
 * @param {number} h - The height of the rectangle.
 * @param {number} r - The radius of the corners.
 * @param {number} s - The smoothness of the corners.
 * @returns {BufferGeometry} The resulting BufferGeometry.
 */
export function RoundedRectangle(
  w: number,
  h: number,
  r: number,
  s: number
): BufferGeometry {
  // This function uses width, height, radiusCorner and smoothness
  const pi2 = Math.PI * 2;
  const n = (s + 1) * 4; // number of segments
  let indices: number[] = [];
  let positions: number[] = [];
  let uvs: number[] = [];
  let qu: number, sgx: number, sgy: number, x: number, y: number;

  for (let j = 1; j < n + 1; j++) indices.push(0, j, j + 1); // 0 is center
  indices.push(0, n, 1);
  positions.push(0, 0, 0); // rectangle center
  uvs.push(0.5, 0.5);
  for (let j = 0; j < n; j++) contour(j);

  const geometry = new BufferGeometry();
  geometry.setIndex(new BufferAttribute(new Uint32Array(indices), 1));
  geometry.setAttribute(
    "position",
    new BufferAttribute(new Float32Array(positions), 3)
  );
  geometry.setAttribute("uv", new BufferAttribute(new Float32Array(uvs), 2));

  return geometry;

  function contour(j: number): void {
    qu = Math.trunc((4 * j) / n) + 1; // quadrant  qu: 1..4
    sgx = qu === 1 || qu === 4 ? 1 : -1; // signum left/right
    sgy = qu < 3 ? 1 : -1; // signum  top / bottom
    x = sgx * (w / 2 - r) + r * Math.cos((pi2 * (j - qu + 1)) / (n - 4)); // corner center + circle
    y = sgy * (h / 2 - r) + r * Math.sin((pi2 * (j - qu + 1)) / (n - 4));

    positions.push(x, y, 0);
    uvs.push(0.5 + x / w, 0.5 + y / h);
  }
}
