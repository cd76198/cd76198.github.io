import * as THREE from 'https://esm.sh/three@0.180.0';
import { OrbitControls } from 'https://esm.sh/three@0.180.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://esm.sh/three@0.180.0/examples/jsm/loaders/GLTFLoader.js';

export function initSpatialViewer(models) {
  const canvas = document.getElementById('viewer-canvas');
  const holder = document.getElementById('viewer-stage');
  const statusEl = document.getElementById('viewer-status');
  const switcher = document.getElementById('model-switcher');

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100000);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.screenSpacePanning = true;
  controls.maxPolarAngle = Math.PI * 0.495;

  scene.add(new THREE.HemisphereLight(0xffffff, 0x626b76, 2.3));
  const sun = new THREE.DirectionalLight(0xffffff, 1.9);
  sun.position.set(6, 10, 8);
  scene.add(sun);

  const grid = new THREE.GridHelper(100, 20, 0x59616c, 0x343a42);
  grid.visible = false;
  scene.add(grid);

  const axes = new THREE.AxesHelper(25);
  axes.visible = false;
  scene.add(axes);

  const loader = new GLTFLoader();

  let modelRoot = null;
  let currentModelId = null;
  let center = new THREE.Vector3();
  let size = new THREE.Vector3();
  let radius = 1;
  let originalMaterials = new Map();
  let restoredEnabled = true;

  const neutralMaterial = new THREE.MeshStandardMaterial({
    color: 0xaeb4bc,
    roughness: 0.9,
    metalness: 0.02,
    side: THREE.DoubleSide
  });

  const hintMaterials = {
    red: new THREE.MeshStandardMaterial({
      color: 0xd34b4b,
      emissive: 0x3a0b0b,
      emissiveIntensity: 0.5,
      roughness: 0.75,
      side: THREE.DoubleSide
    }),
    green: new THREE.MeshStandardMaterial({
      color: 0x54b86b,
      emissive: 0x0b2f13,
      emissiveIntensity: 0.5,
      roughness: 0.75,
      side: THREE.DoubleSide
    }),
    blue: new THREE.MeshStandardMaterial({
      color: 0x4f7edb,
      emissive: 0x0b1838,
      emissiveIntensity: 0.5,
      roughness: 0.75,
      side: THREE.DoubleSide
    })
  };

  function setStatus(message, error = false) {
    statusEl.textContent = message;
    statusEl.classList.toggle('error', error);
    statusEl.style.display = message ? 'block' : 'none';
  }

  function disposeModel(root) {
    if (!root) return;

    scene.remove(root);
    root.traverse(obj => {
      if (!obj.isMesh) return;
      if (obj.geometry) obj.geometry.dispose();

      const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
      for (const mat of materials) {
        if (!mat || mat === neutralMaterial || Object.values(hintMaterials).includes(mat)) continue;
        for (const key in mat) {
          const value = mat[key];
          if (value && value.isTexture) value.dispose();
        }
        if (mat.dispose) mat.dispose();
      }
    });
  }

  function materialName(mat) {
    return String(mat?.name || '').toLowerCase();
  }

  function isMagenta(mat) {
    if (!mat || !mat.color) return false;
    const c = mat.color;
    return c.r > 0.85 && c.g < 0.2 && c.b > 0.85;
  }

  function repairedMaterialFor(mat) {
    const name = materialName(mat);

    if (name.includes('grid_red')) return hintMaterials.red;
    if (name.includes('grid_green')) return hintMaterials.green;
    if (name.includes('grid_blue')) return hintMaterials.blue;
    if (isMagenta(mat)) return neutralMaterial;

    return mat;
  }

  function applyMaterials() {
    if (!modelRoot) return;

    modelRoot.traverse(obj => {
      if (!obj.isMesh) return;
      const original = originalMaterials.get(obj.uuid);
      if (!original) return;

      if (!restoredEnabled) {
        obj.material = neutralMaterial;
      } else if (Array.isArray(original)) {
        obj.material = original.map(repairedMaterialFor);
      } else {
        obj.material = repairedMaterialFor(original);
      }
    });

    const button = document.getElementById('restore-colors');
    button.classList.toggle('active', restoredEnabled);
    button.textContent = restoredEnabled ? 'RESTORED COLORS' : 'ALL GRAY';
  }

  function updateBounds() {
    const box = new THREE.Box3().setFromObject(modelRoot);
    box.getCenter(center);
    box.getSize(size);
    radius = Math.max(size.length() / 2, 1);

    grid.position.set(center.x, box.min.y, center.z);
    grid.scale.setScalar(Math.max(size.x, size.y, size.z, 1) / 100);
    axes.position.copy(center);
  }

  function setCamera(position) {
    camera.position.copy(position);
    controls.target.copy(center);
    camera.near = Math.max(radius / 1000, 0.01);
    camera.far = Math.max(radius * 100, 1000);
    camera.updateProjectionMatrix();
    controls.update();
  }

  function quarterView() {
    const d = radius * 2.25;
    setCamera(new THREE.Vector3(
      center.x + d * 0.8,
      center.y + d * 0.95,
      center.z + d * 0.8
    ));
  }

  function topView() {
    const d = radius * 2.6;
    setCamera(new THREE.Vector3(
      center.x,
      center.y + d,
      center.z + 0.001
    ));
  }

  function freeView() {
    const d = radius * 2.15;
    setCamera(new THREE.Vector3(
      center.x + d * 0.95,
      center.y + d * 0.75,
      center.z + d * 0.95
    ));
  }

  function markView(name) {
    document.querySelectorAll('[data-view]').forEach(button => {
      button.classList.toggle('active', button.dataset.view === name);
    });
  }

  function loadModel(modelConfig) {
    if (!modelConfig?.enabled) return;

    setStatus(`Loading ${modelConfig.label}…`);
    currentModelId = modelConfig.id;

    loader.load(
      modelConfig.path,
      gltf => {
        disposeModel(modelRoot);
        modelRoot = gltf.scene;
        originalMaterials = new Map();

        scene.add(modelRoot);

        modelRoot.traverse(obj => {
          if (obj.isMesh) originalMaterials.set(obj.uuid, obj.material);
        });

        updateBounds();
        applyMaterials();
        quarterView();
        markView('quarter');
        setStatus('');
        markModel(modelConfig.id);
      },
      xhr => {
        if (xhr.total) {
          const percent = Math.round((xhr.loaded / xhr.total) * 100);
          setStatus(`Loading ${modelConfig.label}… ${percent}%`);
        }
      },
      err => {
        console.error(err);
        setStatus(`${modelConfig.label} GLB 로딩 실패`, true);
      }
    );
  }

  function markModel(id) {
    switcher.querySelectorAll('button').forEach(button => {
      button.classList.toggle('active', button.dataset.model === id);
    });
  }

  function renderModelButtons() {
    switcher.innerHTML = '';

    for (const model of models || []) {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.model = model.id;
      button.textContent = model.label;
      button.disabled = !model.enabled;
      if (!model.enabled) button.title = 'site-data.js에서 enabled: true로 변경하고 GLB 파일을 추가하세요.';

      button.addEventListener('click', () => loadModel(model));
      switcher.appendChild(button);
    }
  }

  document.querySelectorAll('[data-view]').forEach(button => {
    button.addEventListener('click', () => {
      if (!modelRoot) return;
      const view = button.dataset.view;

      if (view === 'top') topView();
      else if (view === 'quarter') quarterView();
      else if (view === 'free') freeView();
      else if (view === 'reset') {
        quarterView();
        markView('quarter');
        return;
      }

      markView(view);
    });
  });

  document.getElementById('restore-colors').addEventListener('click', () => {
    restoredEnabled = !restoredEnabled;
    applyMaterials();
  });

  document.getElementById('toggle-grid').addEventListener('click', event => {
    grid.visible = !grid.visible;
    event.currentTarget.classList.toggle('active', grid.visible);
  });

  document.getElementById('toggle-axis').addEventListener('click', event => {
    axes.visible = !axes.visible;
    event.currentTarget.classList.toggle('active', axes.visible);
  });

  function resize() {
    const width = Math.max(1, holder.clientWidth);
    const height = Math.max(1, canvas.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  new ResizeObserver(resize).observe(holder);
  resize();

  function loop() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
  loop();

  renderModelButtons();

  const firstEnabled = (models || []).find(model => model.enabled);
  if (firstEnabled) loadModel(firstEnabled);
  else setStatus('활성화된 GLB 모델이 없습니다.', true);
}
