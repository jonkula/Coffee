import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ─── Photo Data ─────────────────────────────────────────────────────────────
// Each entry: { url, caption }
// Using picsum.photos with fixed seeds so images are consistent across reloads.
const PHOTOS = [
  { url: 'https://picsum.photos/seed/ph01/900/675', caption: 'Ethiopia Yirgacheffe · Blueberry · Jasmine · Lemon Zest' },
  { url: 'https://picsum.photos/seed/ph02/900/675', caption: 'Colombia Huila · Caramel · Red Apple · Milk Chocolate' },
  { url: 'https://picsum.photos/seed/ph03/900/675', caption: 'Sumatra Mandheling · Dark Chocolate · Cedar · Earthy' },
  { url: 'https://picsum.photos/seed/ph04/900/675', caption: 'Guatemala Antigua · Brown Sugar · Orange · Cocoa' },
  { url: 'https://picsum.photos/seed/ph05/900/675', caption: 'Kenya Nyeri AA · Blackcurrant · Grapefruit · Tomato' },
  { url: 'https://picsum.photos/seed/ph06/900/675', caption: 'Costa Rica Tarrazu · Honey · Citrus · Stone Fruit' },
  { url: 'https://picsum.photos/seed/ph07/900/675', caption: 'Brazil Cerrado · Chocolate · Hazelnut · Low Acidity' },
  { url: 'https://picsum.photos/seed/ph08/900/675', caption: 'Vietnam Dalat · Bold · Smoky · Full Body' },
  { url: 'https://picsum.photos/seed/ph09/900/675', caption: 'India Monsooned Malabar · Spiced · Woody · Musty' },
  { url: 'https://picsum.photos/seed/ph10/900/675', caption: 'Rwanda Nyungwe · Peach · Floral · Berry' },
  { url: 'https://picsum.photos/seed/ph11/900/675', caption: 'Panama Geisha · Tropical · Jasmine · Complex' },
  { url: 'https://picsum.photos/seed/ph12/900/675', caption: 'Yemen Mocha · Rich · Wine-Like · Fruity Dry Process' },
  { url: 'https://picsum.photos/seed/ph13/900/675', caption: 'Bolivia Caranavi · Sweet · Silky · Apricot' },
  { url: 'https://picsum.photos/seed/ph14/900/675', caption: 'Honduras Marcala · Mild · Balanced · Caramel Finish' },
  { url: 'https://picsum.photos/seed/ph15/900/675', caption: 'Tanzania Kilimanjaro · Cherry · Winey · Blackberry' },
  { url: 'https://picsum.photos/seed/ph16/900/675', caption: 'Peru Cajamarca · Sweet · Citrus · Light Roast' },
  { url: 'https://picsum.photos/seed/ph17/900/675', caption: 'Jamaica Blue Mountain · Mild · Clean · Silky' },
  { url: 'https://picsum.photos/seed/ph18/900/675', caption: 'Hawaii Kona · Smooth · Bright · Nutty' },
  { url: 'https://picsum.photos/seed/ph19/900/675', caption: 'Mexico Chiapas · Nutty · Sweet · Medium Body' },
  { url: 'https://picsum.photos/seed/ph20/900/675', caption: 'Myanmar Shan State · Spice · Berry · Herbal' },
  { url: 'https://picsum.photos/seed/ph21/900/675', caption: 'Burundi Kayanza · Raspberry · Orange Peel · Floral' },
  { url: 'https://picsum.photos/seed/ph22/900/675', caption: 'Nicaragua Matagalpa · Toffee · Plum · Mild Acidity' },
  { url: 'https://picsum.photos/seed/ph23/900/675', caption: 'El Salvador Santa Ana · Vanilla · Almond · Honey' },
  { url: 'https://picsum.photos/seed/ph24/900/675', caption: 'Papua New Guinea Sigri · Earthy · Herbs · Low Acid' },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Distributes n points evenly on a sphere surface using the Fibonacci lattice.
 * Returns an array of THREE.Vector3.
 */
function fibonacciSphere(n, radius) {
  const pts = [];
  const phi = Math.PI * (Math.sqrt(5) - 1); // golden angle in radians
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;          // y goes from +1 to -1
    const r = Math.sqrt(1 - y * y);
    const theta = phi * i;
    pts.push(new THREE.Vector3(
      Math.cos(theta) * r * radius,
      y * radius,
      Math.sin(theta) * r * radius,
    ));
  }
  return pts;
}

/**
 * Builds a soft radial-gradient canvas texture for the central glow sprite.
 */
function makeGlowTexture(size, innerColor, outerColor) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const ctx = cv.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0,   innerColor);
  g.addColorStop(0.4, innerColor.replace(/[\d.]+\)$/, '0.06)'));
  g.addColorStop(1,   outerColor);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(cv);
}

// ─── Scene Setup ────────────────────────────────────────────────────────────

const canvas  = document.getElementById('canvas');
const W = () => window.innerWidth;
const H = () => window.innerHeight;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(W(), H());
renderer.setClearColor(0x07071a, 1);

const scene  = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, W() / H(), 0.1, 500);
camera.position.set(0, 0, 16);

// ─── Orbit Controls ─────────────────────────────────────────────────────────

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping    = true;
controls.dampingFactor    = 0.07;
controls.rotateSpeed      = 0.55;
controls.zoomSpeed        = 0.9;
controls.minDistance      = 3.5;   // can get very close
controls.maxDistance      = 22;    // pulls back to see the whole orb
controls.autoRotate       = true;
controls.autoRotateSpeed  = 0.35;

// Pause auto-rotate while the user is interacting, resume after 6 s of idle.
let autoRotateTimer = null;
controls.addEventListener('start', () => {
  controls.autoRotate = false;
  clearTimeout(autoRotateTimer);
});
controls.addEventListener('end', () => {
  autoRotateTimer = setTimeout(() => { controls.autoRotate = true; }, 6000);
});

// ─── Background Stars ────────────────────────────────────────────────────────

function createStarField(count, spread) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    // Reject points inside the sphere of interest to avoid visual clutter
    let x, y, z, d;
    do {
      x = (Math.random() - 0.5) * spread;
      y = (Math.random() - 0.5) * spread;
      z = (Math.random() - 0.5) * spread;
      d = Math.sqrt(x*x + y*y + z*z);
    } while (d < 18);
    positions[i*3]   = x;
    positions[i*3+1] = y;
    positions[i*3+2] = z;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.14, sizeAttenuation: true });
  return new THREE.Points(geo, mat);
}

scene.add(createStarField(2400, 280));

// ─── Central Glow Sprite ─────────────────────────────────────────────────────

const glowTex  = makeGlowTexture(512, 'rgba(100,150,255,0.18)', 'rgba(0,0,0,0)');
const glowMat  = new THREE.SpriteMaterial({
  map:      glowTex,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
const glowSprite = new THREE.Sprite(glowMat);
glowSprite.scale.set(14, 14, 1);
scene.add(glowSprite);

// ─── Photo Meshes ────────────────────────────────────────────────────────────

const SPHERE_RADIUS = 4.2;
const PHOTO_W = 2.4;
const PHOTO_H = PHOTO_W * (3 / 4); // 4:3 aspect

const loader   = new THREE.TextureLoader();
const photoMeshes = [];            // clickable photo planes
const borderMeshes = [];           // matching highlight borders

const positions = fibonacciSphere(PHOTOS.length, SPHERE_RADIUS);

// Helper: orient a mesh so its +Z local axis points away from the sphere center
function orientOutward(mesh, pos) {
  mesh.position.copy(pos);
  // lookAt makes the mesh's -Z face the target; we want +Z outward,
  // so look "inward" (toward origin) which makes -Z face inward, +Z face outward.
  // Actually: THREE.Mesh's front face is +Z. lookAt points -Z toward the target.
  // We want the visible front to face away from origin, so use the opposite direction.
  const outward = pos.clone().normalize().multiplyScalar(SPHERE_RADIUS * 2);
  mesh.lookAt(outward);
}

let loadedCount  = 0;
const totalPhotos = PHOTOS.length;

PHOTOS.forEach((photo, i) => {
  // --- Border (highlight ring shown on hover / selection) ---
  const borderGeo = new THREE.PlaneGeometry(PHOTO_W + 0.16, PHOTO_H + 0.16);
  const borderMat = new THREE.MeshBasicMaterial({
    color:       0x7eb8ff,
    side:        THREE.FrontSide,
    transparent: true,
    opacity:     0.0,
    depthWrite:  false,
  });
  const border = new THREE.Mesh(borderGeo, borderMat);
  orientOutward(border, positions[i]);
  // Push it *slightly* behind the photo so it peeks out as a border
  border.translateZ(-0.01);
  scene.add(border);
  borderMeshes.push(border);

  // --- Photo plane (loaded async) ---
  const photoGeo = new THREE.PlaneGeometry(PHOTO_W, PHOTO_H);

  loader.load(
    photo.url,
    (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      const mat = new THREE.MeshBasicMaterial({
        map:  tex,
        side: THREE.FrontSide,
      });
      const mesh = new THREE.Mesh(photoGeo, mat);
      orientOutward(mesh, positions[i]);
      mesh.userData = { photo, borderIndex: i };
      scene.add(mesh);
      photoMeshes.push(mesh);
      onPhotoLoaded();
    },
    undefined,
    () => {
      // On error, use a subtle placeholder colour so layout still fills in
      const mat = new THREE.MeshBasicMaterial({
        color: 0x1a1a2e,
        side:  THREE.FrontSide,
      });
      const mesh = new THREE.Mesh(photoGeo, mat);
      orientOutward(mesh, positions[i]);
      mesh.userData = { photo, borderIndex: i };
      scene.add(mesh);
      photoMeshes.push(mesh);
      onPhotoLoaded();
    }
  );
});

function onPhotoLoaded() {
  loadedCount++;
  if (loadedCount >= totalPhotos) {
    // Hide loading screen
    const loadEl = document.getElementById('loading');
    loadEl.classList.add('fade-out');
    setTimeout(() => { loadEl.style.display = 'none'; }, 650);
  }
}

// ─── Hover ──────────────────────────────────────────────────────────────────

const raycaster   = new THREE.Raycaster();
const mouseNDC    = new THREE.Vector2();
let   hoveredMesh = null;

function setHover(mesh) {
  if (mesh === hoveredMesh) return;

  // Un-hover previous
  if (hoveredMesh) {
    hoveredMesh.scale.setScalar(1.0);
    const bi = hoveredMesh.userData.borderIndex;
    if (borderMeshes[bi]) borderMeshes[bi].material.opacity = 0;
    renderer.domElement.style.cursor = 'grab';
  }

  hoveredMesh = mesh;

  if (mesh) {
    mesh.scale.setScalar(1.08);
    const bi = mesh.userData.borderIndex;
    if (borderMeshes[bi]) borderMeshes[bi].material.opacity = 1;
    renderer.domElement.style.cursor = 'pointer';
  }
}

renderer.domElement.addEventListener('mousemove', (e) => {
  mouseNDC.x =  (e.clientX / W()) * 2 - 1;
  mouseNDC.y = -(e.clientY / H()) * 2 + 1;

  raycaster.setFromCamera(mouseNDC, camera);
  const hits = raycaster.intersectObjects(photoMeshes, false);
  setHover(hits.length ? hits[0].object : null);
});

// ─── Click → Modal ──────────────────────────────────────────────────────────

const modal       = document.getElementById('modal');
const modalImg    = document.getElementById('modal-img');
const modalCap    = document.getElementById('modal-caption');
const modalClose  = document.getElementById('modal-close');
const modalBack   = document.getElementById('modal-backdrop');

// Track pointer-down position to distinguish drag from click
let pointerDownX = 0;
let pointerDownY = 0;

renderer.domElement.addEventListener('pointerdown', (e) => {
  pointerDownX = e.clientX;
  pointerDownY = e.clientY;
});

renderer.domElement.addEventListener('pointerup', (e) => {
  const dx = Math.abs(e.clientX - pointerDownX);
  const dy = Math.abs(e.clientY - pointerDownY);
  if (dx > 6 || dy > 6) return; // drag – ignore

  mouseNDC.x =  (e.clientX / W()) * 2 - 1;
  mouseNDC.y = -(e.clientY / H()) * 2 + 1;

  raycaster.setFromCamera(mouseNDC, camera);
  const hits = raycaster.intersectObjects(photoMeshes, false);
  if (hits.length) openModal(hits[0].object.userData.photo);
});

function openModal(photo) {
  modalImg.src    = photo.url;
  modalCap.textContent = photo.caption;
  modal.classList.remove('hidden');
  controls.enabled = false; // freeze orbit while modal is open
}

function closeModal() {
  modal.classList.add('hidden');
  controls.enabled = true;
  // Brief delay so the image src clears after the animation ends
  setTimeout(() => { modalImg.src = ''; }, 380);
}

modalClose.addEventListener('click',   closeModal);
modalBack.addEventListener('click',    closeModal);
document.addEventListener('keydown',   (e) => { if (e.key === 'Escape') closeModal(); });

// ─── Hint Fade-Out ───────────────────────────────────────────────────────────

const hintEl = document.getElementById('hint');
setTimeout(() => {
  hintEl.classList.add('hidden');
  setTimeout(() => { hintEl.style.display = 'none'; }, 1100);
}, 5000);

// ─── Resize ──────────────────────────────────────────────────────────────────

window.addEventListener('resize', () => {
  camera.aspect = W() / H();
  camera.updateProjectionMatrix();
  renderer.setSize(W(), H());
});

// ─── Animate ─────────────────────────────────────────────────────────────────

// Subtle float animation: each photo slowly oscillates in position
// We store each photo's "rest position" and give it a small sinusoidal offset
// based on a per-photo phase so they don't all move in sync.
const clock = new THREE.Clock();

// Assign a unique phase and amplitude to each photo mesh once it's loaded.
// We do this lazily: the first time we see a mesh in the loop, attach userData.float.
function ensureFloatData(mesh, i) {
  if (!mesh.userData.float) {
    mesh.userData.float = {
      phase:     (i / totalPhotos) * Math.PI * 2,
      amp:       0.04 + Math.random() * 0.04,   // radial oscillation
      restPos:   positions[i].clone(),
    };
  }
}

function animate() {
  requestAnimationFrame(animate);

  const t = clock.getElapsedTime();

  photoMeshes.forEach((mesh, i) => {
    ensureFloatData(mesh, i);
    const { phase, amp, restPos } = mesh.userData.float;
    // Radial float: move the mesh slightly toward/away from the center
    const offset = Math.sin(t * 0.55 + phase) * amp;
    const dir = restPos.clone().normalize();
    mesh.position.copy(restPos).addScaledVector(dir, offset);

    // Keep border aligned with the photo
    const bi = mesh.userData.borderIndex;
    if (borderMeshes[bi]) {
      borderMeshes[bi].position.copy(mesh.position).addScaledVector(dir, -0.01);
    }
  });

  controls.update();
  renderer.render(scene, camera);
}

animate();
