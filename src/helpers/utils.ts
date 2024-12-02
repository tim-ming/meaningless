import { BufferGeometry, BufferAttribute } from "three";

interface RoundedRectangleParams {}

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

// indexed BufferGeometry

export function RoundedRectangle2(w, h, r, s) {
  // width, height, radius corner, smoothness

  // helper const's
  const wi = w / 2 - r; // inner width
  const hi = h / 2 - r; // inner height
  const w2 = w / 2; // half width
  const h2 = h / 2; // half height
  const ul = r / w; // u left
  const ur = (w - r) / w; // u right
  const vl = r / h; // v low
  const vh = (h - r) / h; // v high

  let positions = [wi, hi, 0, -wi, hi, 0, -wi, -hi, 0, wi, -hi, 0];

  let uvs = [ur, vh, ul, vh, ul, vl, ur, vl];

  let n = [
    3 * (s + 1) + 3,
    3 * (s + 1) + 4,
    s + 4,
    s + 5,
    2 * (s + 1) + 4,
    2,
    1,
    2 * (s + 1) + 3,
    3,
    4 * (s + 1) + 3,
    4,
    0,
  ];

  let indices = [
    n[0],
    n[1],
    n[2],
    n[0],
    n[2],
    n[3],
    n[4],
    n[5],
    n[6],
    n[4],
    n[6],
    n[7],
    n[8],
    n[9],
    n[10],
    n[8],
    n[10],
    n[11],
  ];

  let phi, cos, sin, xc, yc, uc, vc, idx;

  for (let i = 0; i < 4; i++) {
    xc = i < 1 || i > 2 ? wi : -wi;
    yc = i < 2 ? hi : -hi;

    uc = i < 1 || i > 2 ? ur : ul;
    vc = i < 2 ? vh : vl;

    for (let j = 0; j <= s; j++) {
      phi = (Math.PI / 2) * (i + j / s);
      cos = Math.cos(phi);
      sin = Math.sin(phi);

      positions.push(xc + r * cos, yc + r * sin, 0);

      uvs.push(uc + ul * cos, vc + vl * sin);

      if (j < s) {
        idx = (s + 1) * i + j + 4;
        indices.push(i, idx, idx + 1);
      }
    }
  }

  const geometry = new BufferGeometry();
  geometry.setIndex(new BufferAttribute(new Uint32Array(indices), 1));
  geometry.setAttribute(
    "position",
    new BufferAttribute(new Float32Array(positions), 3)
  );
  geometry.setAttribute("uv", new BufferAttribute(new Float32Array(uvs), 2));

  return geometry;
}
