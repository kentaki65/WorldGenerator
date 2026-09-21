import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { chunks } from "./chunkData.js";

const CHUNK_SIZE = 32;

const CHUNK_COUNT_X = 10;
const CHUNK_COUNT_Y = 3;
const CHUNK_COUNT_Z = 10;

const startChunkX = 0;
const startChunkY = -32;
const startChunkZ = 0;

const WORLD_SIZE_X = CHUNK_SIZE * CHUNK_COUNT_X;
const WORLD_SIZE_Y = CHUNK_SIZE * CHUNK_COUNT_Y;
const WORLD_SIZE_Z = CHUNK_SIZE * CHUNK_COUNT_Z;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);

camera.position.set(180, 180, 180);

const renderer = new THREE.WebGLRenderer({
  antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

controls.enableDamping = true;

scene.add(
  new THREE.HemisphereLight(
    0xffffff,
    0x666666,
    1.5
  )
);

const sun = new THREE.DirectionalLight(
  0xffffff,
  2
);

sun.position.set(100, 200, 100);
scene.add(sun);

scene.add(new THREE.AxesHelper(10));

function getBlockColor(id) {
  return 0xff00ff;
}
// 原点マーカー
const originGeometry = new THREE.SphereGeometry(4, 16, 16);
const originMaterial = new THREE.MeshBasicMaterial({
  color: 0xff0000
});

const originMarker = new THREE.Mesh(
  originGeometry,
  originMaterial
);

originMarker.position.set(0, 0, 0);
scene.add(originMarker);

// XYZ軸
const axisLength = 30;

const xAxis = new THREE.ArrowHelper(
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(0, 0, 0),
  axisLength,
  0xff0000,
  5,
  3
);

const yAxis = new THREE.ArrowHelper(
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, 0, 0),
  axisLength,
  0x00ff00,
  5,
  3
);

const zAxis = new THREE.ArrowHelper(
  new THREE.Vector3(0, 0, 1),
  new THREE.Vector3(0, 0, 0),
  axisLength,
  0x0000ff,
  5,
  3
);

scene.add(xAxis);
scene.add(yAxis);
scene.add(zAxis);

function getBlock(x, y, z) {
  if (
    x < 0 || x >= WORLD_SIZE_X ||
    y < 0 || y >= WORLD_SIZE_Y ||
    z < 0 || z >= WORLD_SIZE_Z
  ) {
    return 0;
  }

  const chunkIndexX = Math.floor(x / CHUNK_SIZE);
  const chunkIndexY = Math.floor(y / CHUNK_SIZE);
  const chunkIndexZ = Math.floor(z / CHUNK_SIZE);

  const localX = x % CHUNK_SIZE;
  const localY = y % CHUNK_SIZE;
  const localZ = z % CHUNK_SIZE;

  const chunkX =
    startChunkX + chunkIndexX * CHUNK_SIZE;

  const chunkY =
    startChunkY + chunkIndexY * CHUNK_SIZE;

  const chunkZ =
    startChunkZ + chunkIndexZ * CHUNK_SIZE;

  const chunk = chunks.find(
    chunk =>
      chunk.chunkX === chunkX &&
      chunk.chunkY === chunkY &&
      chunk.chunkZ === chunkZ
  );

  if (!chunk) {
    return 0;
  }

  return chunk.data[
    localX * 1024 +
    localY * 32 +
    localZ
  ];
}

const blocks = [];

const directions = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1]
];

for (let x = 0; x < WORLD_SIZE_X; x++) {
  for (let y = 0; y < WORLD_SIZE_Y; y++) {
    for (let z = 0; z < WORLD_SIZE_Z; z++) {
      const id = getBlock(x, y, z);

      if (id === 0) {
        continue;
      }

      let visible = false;

      for (const [dx, dy, dz] of directions) {
        const nx = x + dx;
        const ny = y + dy;
        const nz = z + dz;

        if (getBlock(nx, ny, nz) === 0) {
          visible = true;
          break;
        }
      }

      if (visible) {
        const index =
          x * WORLD_SIZE_Y * WORLD_SIZE_Z +
          y * WORLD_SIZE_Z +
          z;

        blocks.push({
          x,
          y,
          z,
          id,
          index
        });
      }
    }
  }
}

console.log("Visible blocks:", blocks.length);

const geometry = new THREE.BoxGeometry(1, 1, 1);

const material = new THREE.MeshLambertMaterial({
  color: 0xffffff
});

const mesh = new THREE.InstancedMesh(
  geometry,
  material,
  blocks.length
);

const dummy = new THREE.Object3D();
const color = new THREE.Color();

for (let i = 0; i < blocks.length; i++) {
  const block = blocks[i];

  dummy.position.set(
    block.x,
    block.y,
    -block.z
  );

  dummy.updateMatrix();

  mesh.setMatrixAt(i, dummy.matrix);

  color.setHex(
    getBlockColor(block.id)
  );

  mesh.setColorAt(i, color);
}

mesh.instanceMatrix.needsUpdate = true;

if (mesh.instanceColor) {
  mesh.instanceColor.needsUpdate = true;
}

scene.add(mesh);

controls.target.set(
  WORLD_SIZE_X / 2,
  WORLD_SIZE_Y / 2,
  WORLD_SIZE_Z / 2
);

camera.position.set(
  180,
  180,
  180
);

function animate() {
  requestAnimationFrame(animate);

  controls.update();
  renderer.render(scene, camera);
}

animate();

window.addEventListener(
  "resize",
  () => {
    camera.aspect =
      window.innerWidth /
      window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );
  }
);