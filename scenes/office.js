/**
 * 3D open-plan office environment (Three.js).
 * One persistent scene; the "three environments" from the design are camera
 * contexts inside it: office view, monitor close-up, hardware close-up.
 * All geometry is procedural (no external models) so the package stays tiny.
 */
import * as THREE from '../lib/three.module.min.js';
import { a11y } from '../js/accessibility.js';

const VIEWS = {
  establish: { pos: [6.0, 3.4, 6.8], look: [0, 0.8, -2.0] },
  office:    { pos: [1.6, 1.7, 0.9], look: [-1.3, 1.0, -3.0] },
  monitor:   { pos: [-1.35, 1.28, -1.62], look: [-1.35, 1.22, -3.0] },
  phone:     { pos: [-0.55, 1.35, -1.85], look: [-0.62, 0.86, -2.95] },
  hardware:  { pos: [-2.35, 1.25, -1.9], look: [-2.05, 0.78, -3.2] },
  cleanpc:   { pos: [1.9, 1.3, -1.75], look: [1.9, 1.05, -3.05] },
};

function mat(color, { rough = .85, metal = .05, emissive = 0x000000, emissiveIntensity = 0 } = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, emissive, emissiveIntensity });
}
const M = {
  deskWood: () => mat(0x9a7b5a, { rough: .7 }),
  deskLeg: () => mat(0x3c4658, { rough: .5, metal: .4 }),
  wall: () => mat(0xdfe3ea, { rough: .95 }),
  floor: () => mat(0x9aa3b2, { rough: .95 }),
  dark: () => mat(0x111827, { rough: .6 }),
  plastic: () => mat(0x2b3444, { rough: .55 }),
  plasticL: () => mat(0xd7dce5, { rough: .6 }),
  screenOff: () => new THREE.MeshBasicMaterial({ color: 0x05070d }),
};

export class Env3D {
  constructor(canvas, interactionSystem) {
    this.mode = '3d';
    this.canvas = canvas;
    this.sys = interactionSystem;
    this.onActivate = (id) => interactionSystem.activate(id);
    this.interactiveMeshes = [];
    this._hoverMesh = null;
    this._camTween = null;
    this._shakeAmp = 0;
    this._ringing = false;
    this._clock = new THREE.Clock();
    this._disposed = false;
  }

  init() {
    const renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, powerPreference: 'high-performance' });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    this.renderer = renderer;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0e1626);
    this.scene.fog = new THREE.Fog(0x0e1626, 14, 34);

    this.camera = new THREE.PerspectiveCamera(50, 16 / 9, 0.1, 60);
    this.camera.position.set(...VIEWS.establish.pos);
    this.camera.lookAt(new THREE.Vector3(...VIEWS.establish.look));

    this._buildLights();
    this._buildRoom();
    this._buildAliceStation();
    this._buildCleanStation();
    this._buildBackground();
    this._bindPointer();

    this._onResize = () => this.resize();
    window.addEventListener('resize', this._onResize);
    this.resize();
    this._paintScreens();
    renderer.setAnimationLoop(() => this._frame());
    return this;
  }

  dispose() {
    this._disposed = true;
    this.renderer?.setAnimationLoop(null);
    window.removeEventListener('resize', this._onResize);
    this.renderer?.dispose();
  }

  /* ================= building ================= */

  _buildLights() {
    const hemi = new THREE.HemisphereLight(0xdfe8ff, 0x3a4252, 0.75);
    this.scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfff2dd, 1.15);
    sun.position.set(4, 6.5, -2);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -8; sun.shadow.camera.right = 8;
    sun.shadow.camera.top = 8; sun.shadow.camera.bottom = -8;
    sun.shadow.bias = -0.0004;
    this.scene.add(sun);

    const fill = new THREE.PointLight(0xcfe0ff, 18, 16, 1.8);
    fill.position.set(-3, 3.4, 2.5);
    this.scene.add(fill);

    // Glow in front of the primary monitor — recolored as the story unfolds.
    this.monitorGlow = new THREE.PointLight(0x2dd4bf, 7, 4.5, 2);
    this.monitorGlow.position.set(-1.35, 1.3, -2.2);
    this.scene.add(this.monitorGlow);
  }

  _box(w, h, d, material, x, y, z, { cast = true, receive = true } = {}) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = cast;
    mesh.receiveShadow = receive;
    this.scene.add(mesh);
    return mesh;
  }

  _buildRoom() {
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(15, 11), M.floor());
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    const wallMat = M.wall();
    const back = this._box(15, 3.6, 0.2, wallMat, 0, 1.8, -5.4, { cast: false });
    this._box(0.2, 3.6, 11, wallMat, -7.6, 1.8, 0, { cast: false });
    this._box(0.2, 3.6, 11, wallMat, 7.6, 1.8, 0, { cast: false });
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(15, 11), mat(0xc9d2df));
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 3.6;
    this.scene.add(ceiling);

    // Windows along the back wall with bright panes and thin frames.
    const paneMat = new THREE.MeshBasicMaterial({ color: 0xeaf4ff });
    const frameMat = mat(0xaeb8c8, { rough: .5, metal: .3 });
    for (let i = -1; i <= 1; i++) {
      const cx = i * 4.6;
      this._box(3.6, 2.3, 0.06, paneMat, cx, 1.8, -5.31, { cast: false, receive: false });
      this._box(3.8, 0.12, 0.14, frameMat, cx, 2.98, -5.28, { cast: false });
      this._box(3.8, 0.12, 0.14, frameMat, cx, 0.62, -5.28, { cast: false });
      this._box(0.12, 2.5, 0.14, frameMat, cx - 1.85, 1.8, -5.28, { cast: false });
      this._box(0.12, 2.5, 0.14, frameMat, cx + 1.85, 1.8, -5.28, { cast: false });
      this._box(3.8, 0.06, 0.12, frameMat, cx, 1.8, -5.27, { cast: false });
    }

    // Ceiling light panels (emissive slabs).
    for (const [x, z] of [[-4, -2], [0, -2], [4, -2], [-4, 1.5], [0, 1.5], [4, 1.5]]) {
      this._box(1.7, 0.06, 0.55, new THREE.MeshBasicMaterial({ color: 0xf3f7ff }), x, 3.55, z, { cast: false, receive: false });
    }

    // Wall décor: whiteboard + clock.
    const board = this._box(2.4, 1.3, 0.06, mat(0xf4f7fb), 4.2, 1.9, -5.32, { cast: false });
    this._box(2.5, 0.08, 0.1, mat(0x8a94a8), 4.2, 2.6, -5.31, { cast: false });
    const clockRim = new THREE.Mesh(new THREE.CylinderGeometry(.22, .22, .05, 24), mat(0x334155, { metal: .4, rough: .4 }));
    clockRim.rotation.x = Math.PI / 2;
    clockRim.position.set(-7.47, 2.2, 0);
    this.scene.add(clockRim);
    const clockFace = new THREE.Mesh(new THREE.CircleGeometry(.2, 24), new THREE.MeshBasicMaterial({ color: 0xf8fafc }));
    clockFace.position.set(-7.43, 2.2, 0);
    clockFace.rotation.y = Math.PI / 2;
    this.scene.add(clockFace);
  }

  _deskUnit(x, z, w = 2.0, d = .85) {
    const top = this._box(w, .05, d, M.deskWood(), x, .74, z);
    this._box(.05, .72, d - .1, M.deskLeg(), x - w / 2 + .08, .37, z);
    this._box(.05, .72, d - .1, M.deskLeg(), x + w / 2 - .08, .37, z);
    this._box(w - .3, .35, .04, M.plasticL(), x, .5, z - d / 2 + .05); // modesty panel
    return top;
  }

  _monitorUnit(x, z, screenW = .62) {
    const g = new THREE.Group();
    g.position.set(x, .765, z);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(.11, .13, .02, 20), M.plastic());
    base.position.y = .01;
    const neck = new THREE.Mesh(new THREE.BoxGeometry(.05, .3, .05), M.plastic());
    neck.position.y = .16;
    const frame = new THREE.Mesh(new THREE.BoxGeometry(screenW + .05, screenW * .56 + .05, .04), M.plastic());
    frame.position.set(0, .44, .01);
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 288;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(screenW, screenW * .56), new THREE.MeshBasicMaterial({ map: texture }));
    screen.position.set(0, .44, .035);
    for (const part of [base, neck, frame]) { part.castShadow = true; g.add(part); }
    g.add(screen);
    this.scene.add(g);
    return { group: g, frame, screen, canvas, texture };
  }

  _buildAliceStation() {
    this._deskUnit(-1.35, -3.1);
    this.chair = this._chairUnit(-1.25, -2.25, Math.PI);

    this.workstation = this._monitorUnit(-1.35, -3.32);

    // Keyboard + mouse + docking station + phone.
    this._box(.42, .02, .15, M.plasticL(), -1.42, .775, -2.86);
    this._box(.07, .025, .11, M.plasticL(), -1.05, .775, -2.86);
    const dock = this._box(.34, .06, .22, M.plastic(), -2.0, .8, -3.05);
    this.dock = dock;
    const led = this._box(.03, .012, .03, new THREE.MeshBasicMaterial({ color: 0x2dd4bf }), -2.0, .833, -3.14, { cast: false, receive: false });
    this.dockLed = led;

    // Phone: small slab with emissive face; sits top-right of desk.
    const phoneG = new THREE.Group();
    phoneG.position.set(-0.62, .79, -2.95);
    const body = new THREE.Mesh(new THREE.BoxGeometry(.09, .015, .18), M.plastic());
    const face = new THREE.Mesh(new THREE.PlaneGeometry(.075, .16), new THREE.MeshBasicMaterial({ color: 0x0a1220 }));
    face.rotation.x = -Math.PI / 2;
    face.position.y = .008;
    this.phoneFaceMat = face.material;
    phoneG.add(body, face);
    body.castShadow = true;
    this.scene.add(phoneG);
    this.phone = phoneG;

    // Ethernet cable: dock → desk edge → floor port. Two variants, one visible.
    this.cablePlugged = this._cable(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-2.0, .80, -2.95),
        new THREE.Vector3(-2.05, .74, -2.55),
        new THREE.Vector3(-2.2, .06, -2.35),
        new THREE.Vector3(-2.32, .02, -2.5),
      ])
    );
    this.cableUnplugged = this._cable(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-2.0, .80, -2.95),
        new THREE.Vector3(-2.06, .55, -2.85),
        new THREE.Vector3(-2.05, .12, -2.9),
      ])
    );
    this.cableUnplugged.visible = false;

    // Floor network port the cable runs to.
    const port = this._box(.16, .04, .16, M.plastic(), -2.34, .02, -2.52, { cast: false });
    this.portLed = this._box(.05, .015, .05, new THREE.MeshBasicMaterial({ color: 0x4ade80 }), -2.34, .045, -2.52, { cast: false, receive: false });

    // Power button on the dock (glows soft white).
    this.powerBtn = this._box(.05, .012, .05, new THREE.MeshBasicMaterial({ color: 0xf8fafc }), -1.92, .833, -3.05, { cast: false, receive: false });

    // Register interactive targets (groups so any sub-mesh picks the object).
    this.interactMeshes = {
      monitor: this.workstation.group,
      phone: this.phone,
      cable: this.cablePlugged,
      power_button: this.powerBtn,
    };
  }

  _cable(curve) {
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, .012, 8), mat(0x1f2937, { rough: .5 }));
    tube.castShadow = true;
    const tip = new THREE.Mesh(new THREE.BoxGeometry(.03, .03, .05), M.plasticL());
    tip.position.copy(curve.getPoint(0));
    const grp = new THREE.Group();
    grp.add(tube, tip);
    this.scene.add(grp);
    return grp;
  }

  _chairUnit(x, z, rot) {
    const g = new THREE.Group();
    const seat = new THREE.Mesh(new THREE.BoxGeometry(.46, .06, .44), mat(0x233042, { rough: .7 }));
    seat.position.y = .48;
    const back = new THREE.Mesh(new THREE.BoxGeometry(.44, .5, .06), mat(0x233042, { rough: .7 }));
    back.position.set(0, .78, -.2);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, .4, 10), M.deskLeg());
    pole.position.y = .26;
    const base = new THREE.Mesh(new THREE.CylinderGeometry(.26, .28, .04, 5), M.plastic());
    base.position.y = .03;
    for (const p of [seat, back, pole, base]) { p.castShadow = true; g.add(p); }
    g.position.set(x, 0, z);
    g.rotation.y = rot;
    this.scene.add(g);
    return g;
  }

  _buildCleanStation() {
    this._deskUnit(1.9, -3.1, 1.5, .7);
    this._chairUnit(1.9, -2.35, Math.PI);

    // Laptop with its own little canvas screen.
    const g = new THREE.Group();
    g.position.set(1.9, .765, -3.02);
    g.rotation.y = -0.06;
    const base = new THREE.Mesh(new THREE.BoxGeometry(.44, .02, .3), M.plastic());
    base.position.y = .01;
    const lid = new THREE.Mesh(new THREE.BoxGeometry(.44, .3, .015), M.plastic());
    lid.position.set(0, .16, -.15);
    lid.rotation.x = -0.28;
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 144;
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(.41, .27), new THREE.MeshBasicMaterial({ map: texture }));
    screen.position.set(0, .16, -.14);
    screen.rotation.x = -0.28 + Math.PI; // face the room
    screen.rotateY(Math.PI);
    base.castShadow = lid.castShadow = true;
    g.add(base, lid, screen);
    this.scene.add(g);
    this.laptop = { group: g, canvas, texture, mesh: lid };
    this.interactMeshes.cleanpc = g;
  }

  _buildBackground() {
    // Two rows of non-interactive desks with dark monitors.
    for (const [x, z, rot] of [[-4.4, -0.6, 0], [-1.6, -0.6, 0], [1.6, -0.6, 0], [4.4, -0.6, 0],
                               [-3.2, 1.8, Math.PI], [0, 1.8, Math.PI], [3.2, 1.8, Math.PI]]) {
      this._deskUnit(x, z, 1.7, .75);
      this._monitorUnit(x, z - 0.18, .5);
      this._chairUnit(x, z + (rot === 0 ? .8 : -.8), rot);
    }
    // Plants.
    for (const [x, z] of [[-6.6, -4.4], [6.6, -4.4], [-6.6, 3.9], [6.6, 3.9]]) {
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(.22, .18, .35, 12), mat(0x8b5e46, { rough: .8 }));
      pot.position.set(x, .17, z);
      pot.castShadow = true;
      this.scene.add(pot);
      for (let i = 0; i < 3; i++) {
        const leaf = new THREE.Mesh(new THREE.ConeGeometry(.16, .8, 8), mat(0x2f7d4f, { rough: .9 }));
        leaf.position.set(x + (i - 1) * .1, .65 + i * .07, z);
        leaf.rotation.z = (i - 1) * .22;
        leaf.castShadow = true;
        this.scene.add(leaf);
      }
    }
  }

  /* ================= runtime ================= */

  resize() {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  setView(name, { instant = false } = {}) {
    const v = VIEWS[name];
    if (!v) return;
    const target = {
      pos: new THREE.Vector3(...v.pos),
      look: new THREE.Vector3(...v.look),
    };
    if (instant || a11y.reducedMotion()) {
      this.camera.position.copy(target.pos);
      this.camera.lookAt(target.look);
      this._camTween = null;
      return;
    }
    this._camTween = {
      fromPos: this.camera.position.clone(),
      fromLook: this._lastLook ? this._lastLook.clone() : this._currentLookPoint(),
      toPos: target.pos,
      toLook: target.look,
      t: 0,
      dur: 1.25,
    };
  }

  _currentLookPoint() {
    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);
    return this.camera.position.clone().add(dir.multiplyScalar(4));
  }

  shake() {
    if (a11y.reducedMotion()) return;
    this._shakeAmp = .05;
  }

  ringPhone(on) {
    this._ringing = on;
    if (on) {
      this.phoneFaceMat.color.set(0x1d4ed8);
    } else {
      this.phoneFaceMat.color.set(0x0a1220);
    }
  }

  setObjectState(id, st) {
    if (id === 'workstation') {
      this.paintMonitor(st === 'compromised' || st === 'isolated' ? 'ransom' : st === 'off' ? 'off' : 'desktop');
      if (st === 'compromised') this.monitorGlow.color.set(0xef4444);
      else if (st === 'isolated') this.monitorGlow.color.set(0xf59e0b);
      else if (st === 'off') this.monitorGlow.intensity = 0.5;
      else this.monitorGlow.color.set(0x2dd4bf);
    }
    if (id === 'cable') {
      this.cablePlugged.visible = st === 'plugged';
      this.cableUnplugged.visible = st === 'unplugged';
      this.portLed.material.color.set(st === 'unplugged' ? 0x64748b : 0x4ade80);
      this.dockLed.material.color.set(st === 'unplugged' ? 0xf59e0b : 0x2dd4bf);
    }
    if (id === 'cleanpc') {
      this._paintCanvas(this.laptop, st === 'login' ? 'login' : st === 'clean' ? 'desktop' : 'off', true);
    }
  }

  /* ---- monitor screen painting (canvas textures) ---- */

  paintMonitor(state) {
    this._paintCanvas(this.workstation, state, false);
  }

  _paintCanvas(unit, state, isLaptop) {
    const c = unit.canvas;
    const ctx = c.getContext('2d');
    const W = c.width, H = c.height;
    if (state === 'off') {
      ctx.fillStyle = '#04060c';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(148,163,184,.06)';
      ctx.beginPath(); ctx.moveTo(W * .1, H); ctx.lineTo(W * .5, 0); ctx.lineTo(W * .62, 0); ctx.lineTo(W * .22, H); ctx.fill();
      unit.texture.needsUpdate = true;
      return;
    }
    if (state === 'ransom') {
      const grad = ctx.createRadialGradient(W / 2, H * .35, 20, W / 2, H * .5, W * .7);
      grad.addColorStop(0, '#5c1116'); grad.addColorStop(1, '#160406');
      ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = '#f87171'; ctx.lineWidth = 6;
      ctx.strokeRect(8, 8, W - 16, H - 16);
      ctx.fillStyle = '#fca5a5';
      ctx.font = `800 ${W / 12}px system-ui`;
      ctx.textAlign = 'center';
      ctx.fillText('⚠ FILES ENCRYPTED', W / 2, H * .42);
      ctx.font = `600 ${W / 26}px system-ui`;
      ctx.fillStyle = '#fecaca';
      ctx.fillText('Do not shut down. Do not contact authorities.', W / 2, H * .56);
      unit.texture.needsUpdate = true;
      return;
    }
    // Desktop / login / email / warning share the NOVA wallpaper base.
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#0d1a30'); grad.addColorStop(1, '#123a44');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(45,212,191,.12)';
    ctx.beginPath(); ctx.arc(W * .78, H * .2, W * .18, 0, 7); ctx.fill();
    ctx.fillStyle = '#2dd4bf';
    ctx.font = `800 ${W / 14}px system-ui`;
    ctx.textAlign = 'left';
    ctx.fillText('NOVA', 18, H * .22);
    ctx.font = `500 ${W / 34}px system-ui`;
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Secure Desktop', 19, H * .22 + W / 24);

    if (state === 'login') {
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath(); ctx.arc(W / 2, H * .38, W * .07, 0, 7); ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.font = `700 ${W / 22}px system-ui`; ctx.textAlign = 'center';
      ctx.fillText('Alice', W / 2, H * .52);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(W * .35, H * .58, W * .3, H * .07);
      ctx.strokeStyle = '#2dd4bf'; ctx.strokeRect(W * .35, H * .58, W * .3, H * .07);
    } else if (state === 'email') {
      this._miniWindow(ctx, W, H, '#f8fafc');
      ctx.fillStyle = '#e6fbf7'; ctx.fillRect(W * .12, H * .3, W * .04, H * .4);
      ctx.fillStyle = '#0f172a';
      ctx.font = `700 ${W / 30}px system-ui`; ctx.textAlign = 'left';
      ctx.fillText('Mail — 1 new', W * .19, H * .38);
      ctx.fillStyle = '#dc2626';
      ctx.beginPath(); ctx.arc(W * .2, H * .5, W * .015, 0, 7); ctx.fill();
      ctx.fillStyle = '#94a3b8';
      for (let i = 0; i < 4; i++) ctx.fillRect(W * .19, H * (.46 + i * .07), W * .3, H * .02);
    } else if (state === 'warning') {
      this._miniWindow(ctx, W, H, '#ffffff');
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(W * .12, H * .28, W * .76, H * .1);
      ctx.fillStyle = '#fff';
      ctx.font = `800 ${W / 28}px system-ui`; ctx.textAlign = 'left';
      ctx.fillText('⚠ SECURITY WARNING', W * .15, H * .35);
      ctx.fillStyle = '#b91c1c';
      ctx.font = `600 ${W / 34}px system-ui`;
      ctx.fillText('Threat detected — Suspicious executable', W * .15, H * .5);
    } else if (state === 'clean') {
      this._miniWindow(ctx, W, H, '#f0fdfa');
      ctx.strokeStyle = '#16a34a'; ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(W / 2, H * .45, W * .05, 0, 7);
      ctx.moveTo(W * .47, H * .45); ctx.lineTo(W * .495, H * .48);
      ctx.lineTo(W * .53, H * .41);
      ctx.stroke();
      ctx.fillStyle = '#0f766e';
      ctx.font = `700 ${W / 30}px system-ui`; ctx.textAlign = 'center';
      ctx.fillText('Clean device verified', W / 2, H * .58);
    }
    unit.texture.needsUpdate = true;
  }

  _miniWindow(ctx, W, H, bg) {
    ctx.fillStyle = 'rgba(2,8,20,.35)';
    ctx.fillRect(W * .1, H * .22, W * .8, H * .62);
    ctx.fillStyle = bg;
    ctx.fillRect(W * .12, H * .24, W * .76, H * .58);
  }

  _paintScreens() {
    this.paintMonitor('desktop');
    this.setObjectState('cleanpc', 'off');
  }

  /* ---- pointer interaction ---- */

  _bindPointer() {
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.canvas.addEventListener('pointermove', (e) => this._onPointerMove(e));
    this.canvas.addEventListener('click', (e) => this._onClick(e));
  }

  _activeMeshList() {
    const ids = this.sys.activeIds;
    return Object.entries(this.interactMeshes)
      .filter(([id]) => ids.includes(id))
      .map(([, mesh]) => mesh);
  }

  _pick(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(this._activeMeshList(), true);
    if (!hits.length) return null;
    let obj = hits[0].object;
    while (obj) {
      const entry = Object.entries(this.interactMeshes).find(([, m]) => m === obj);
      if (entry) return entry[0];
      obj = obj.parent;
    }
    return null;
  }

  _onPointerMove(e) {
    const id = this._pick(e);
    this.canvas.style.cursor = id ? 'pointer' : 'default';
    if (id) {
      this.sys.showHoverLabel(id);
      this._hoverMesh = id;
    } else {
      this.sys.hideHoverLabel();
      this._hoverMesh = null;
    }
  }

  _onClick(e) {
    const id = this._pick(e);
    if (id) this.sys.activate(id);
  }

  /* ---- frame loop ---- */

  _frame() {
    if (this._disposed) return;
    const dt = Math.min(this._clock.getDelta(), 0.05);
    const t = this._clock.elapsedTime;

    if (this._camTween) {
      const tw = this._camTween;
      tw.t += dt / tw.dur;
      const k = tw.t >= 1 ? 1 : (tw.t < .5 ? 2 * tw.t * tw.t : 1 - Math.pow(-2 * tw.t + 2, 2) / 2);
      this.camera.position.lerpVectors(tw.fromPos, tw.toPos, k);
      this._camLook = tw.fromLook.clone().lerp(tw.toLook, k);
      this.camera.lookAt(this._camLook);
      this._lastLook = tw.toLook.clone();
      if (tw.t >= 1) this._camTween = null;
    }

    if (this._ringing && !a11y.reducedMotion()) {
      this.phone.position.y = .79 + Math.sin(t * 34) * .006;
      this.phone.rotation.z = Math.sin(t * 30) * .05;
    } else {
      this.phone.position.y = .79;
      this.phone.rotation.z = 0;
    }

    if (this._shakeAmp > 0.0005) {
      this.camera.position.x += (Math.random() - .5) * this._shakeAmp;
      this.camera.position.y += (Math.random() - .5) * this._shakeAmp;
      this._shakeAmp *= .9;
    }

    // Hover label follows its object.
    if (this.sys.hoveredId && this.sys.labelEl?.style.display === 'block') {
      const mesh = this.interactMeshes[this.sys.hoveredId];
      if (mesh) {
        const box = new THREE.Box3().setFromObject(mesh);
        const center = box.getCenter(new THREE.Vector3()).project(this.camera);
        const x = (center.x * .5 + .5) * this.canvas.clientWidth;
        const y = (-center.y * .5 + .5) * this.canvas.clientHeight;
        this.sys.positionLabel(x, y - 14, 'Click to interact');
      }
    }

    this.renderer.render(this.scene, this.camera);
  }
}
