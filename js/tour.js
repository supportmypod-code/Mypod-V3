// MY POD RANGE · 3D studio: procedural Foldable Home concept model.
// Drag to orbit, pinch/wheel to zoom, unfold slider, view modes. Concept visualisation, indicative dimensions.
import * as THREE from './three.module.min.js';

const C = { L: 5.9, W: 2.2, H: 2.5, wing: 2.05, base: 0.32 };
const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function createTour(host, onChange) {
  const W = () => host.clientWidth, H = () => host.clientHeight;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(W(), H());
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  host.appendChild(renderer.domElement);
  renderer.domElement.style.touchAction = 'pan-y';

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0e1628, 18, 42);
  const cam = new THREE.PerspectiveCamera(36, W() / H(), 0.1, 100);

  // lights: dusk sky + warm interior
  scene.add(new THREE.HemisphereLight(0xdfe8f5, 0x1a2236, 0.55));
  scene.add(new THREE.AmbientLight(0xfff1dc, 0.35));
  const sun = new THREE.DirectionalLight(0xffe6c2, 2.8);
  sun.position.set(-7, 10, 6); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9 });
  sun.shadow.bias = -0.0005; scene.add(sun);
  const rim = new THREE.DirectionalLight(0x8ea6c6, 0.8); rim.position.set(8, 4, -8); scene.add(rim);
  const warm = new THREE.PointLight(0xffb347, 0, 9, 1.6); warm.position.set(0, 1.9, 0); scene.add(warm);

  // ground
  const ground = new THREE.Mesh(new THREE.CircleGeometry(16, 64), new THREE.MeshStandardMaterial({ color: 0x15233b, roughness: 1 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  const grid = new THREE.GridHelper(24, 48, 0x2a3c5e, 0x1c2a45); grid.position.y = 0.002; scene.add(grid);

  // materials
  const M = {
    panel: new THREE.MeshStandardMaterial({ color: 0xfbfaf7, roughness: .6, metalness: 0, transparent: true }),
    frame: new THREE.MeshStandardMaterial({ color: 0x2b3038, roughness: .45, metalness: .6, transparent: true }),
    floor: new THREE.MeshStandardMaterial({ color: 0xb98a5a, roughness: .7, transparent: true }),
    glass: new THREE.MeshStandardMaterial({ color: 0x9fc3e6, roughness: .05, metalness: .2, transparent: true, opacity: .32, emissive: 0xffa640, emissiveIntensity: 0 }),
    deck: new THREE.MeshStandardMaterial({ color: 0x8a5a34, roughness: .8, transparent: true }),
    sofa: new THREE.MeshStandardMaterial({ color: 0xe6e0d6, roughness: .9 }),
    accent: new THREE.MeshStandardMaterial({ color: 0xffc20d, roughness: .6 }),
  };
  const edgeMat = new THREE.LineBasicMaterial({ color: 0xffc20d, transparent: true, opacity: 0 });
  const edges = [];
  const box = (w, h, d, mat, parent, x = 0, y = 0, z = 0, edge = true) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m);
    if (edge) { const e = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry), edgeMat); m.add(e); edges.push(e); }
    return m;
  };

  const home = new THREE.Group(); scene.add(home);
  // base frame + legs
  const baseG = new THREE.Group(); home.add(baseG);
  box(C.L, .16, C.W, M.frame, baseG, 0, .2, 0);
  for (const x of [-C.L / 2 + .15, 0, C.L / 2 - .15]) for (const z of [-C.W / 2 + .1, C.W / 2 - .1]) box(.16, .14, .16, M.frame, baseG, x, .07, z, false);
  // core
  const core = new THREE.Group(); home.add(core);
  box(C.L, .06, C.W, M.floor, core, 0, C.base, 0, false);
  for (const s of [-1, 1]) {
    const end = new THREE.Group(); end.position.x = s * C.L / 2; core.add(end);
    box(.08, C.H - .1, C.W, M.panel, end, 0, C.base + C.H / 2, 0);
    box(.1, C.H, .1, M.frame, end, 0, C.base + C.H / 2, C.W / 2, false);
    box(.1, C.H, .1, M.frame, end, 0, C.base + C.H / 2, -C.W / 2, false);
    box(.09, .9, .9, M.glass, end, s * .01, C.base + 1.5, 0, false);
  }
  const roofG = new THREE.Group(); home.add(roofG);
  box(C.L + .1, .14, C.W + .1, M.frame, roofG, 0, C.base + C.H + .05, 0);

  // wings: floor flap (hinged at core edge) + sliding shell
  const wings = [];
  for (const s of [1, -1]) {
    const hinge = new THREE.Group(); hinge.position.set(0, C.base, s * C.W / 2); home.add(hinge);
    const flap = box(C.L, .07, C.wing, [M.frame, M.frame, M.floor, M.panel, M.frame, M.frame], hinge, 0, 0, s * C.wing / 2);
    box(C.L, .12, .06, M.frame, hinge, 0, -.05, s * C.wing, false); // edge beam
    const shell = new THREE.Group(); home.add(shell);
    const wall = new THREE.Group(); shell.add(wall);
    box(C.L, C.H - .1, .07, M.panel, wall, 0, C.base + C.H / 2, 0);
    // openings: front = double glass door + two windows, back = three windows
    if (s === 1) {
      box(1.5, 2.0, .09, M.glass, wall, 0, C.base + 1.05, .01, false);
      box(.06, 2.05, .1, M.frame, wall, 0, C.base + 1.05, .02, false);
      for (const x of [-1.9, 1.9]) box(1.1, .9, .09, M.glass, wall, x, C.base + 1.45, .01, false);
    } else for (const x of [-1.9, 0, 1.9]) box(1.0, .8, .09, M.glass, wall, x, C.base + 1.5, -.01, false);
    for (const x of [-C.L / 2, C.L / 2]) box(.1, C.H, .1, M.frame, wall, x, C.base + C.H / 2, 0, false);
    const ends = [-1, 1].map(e => box(.07, C.H - .1, 1, M.panel, shell, e * C.L / 2, C.base + C.H / 2, 0));
    const roof = box(C.L + .1, .12, 1, M.frame, shell, 0, C.base + C.H + .04, 0);
    wings.push({ s, hinge, flap, shell, wall, ends, roof });
  }
  // deck + steps + interior (appear when ready)
  const extras = new THREE.Group(); home.add(extras);
  const deck = box(2.6, .1, 1.1, M.deck, extras, 0, .26, C.W / 2 + C.wing + .6);
  box(2.6, .1, .4, M.deck, extras, 0, .12, C.W / 2 + C.wing + 1.3);
  const interior = new THREE.Group(); home.add(interior);
  box(2.0, .45, .8, M.sofa, interior, -1.2, C.base + .25, 1.6, false);
  box(.8, .3, .5, M.accent, interior, .6, C.base + .2, 1.5, false);
  box(1.8, .4, 1.9, M.sofa, interior, 1.6, C.base + .22, -1.9, false);
  box(.5, .5, .2, M.accent, interior, 1.6, C.base + .5, -2.75, false);
  interior.scale.setScalar(.001);
  const shadowCatch = deck; void shadowCatch;

  // state
  const st = { t: 0, target: 0, mode: 'exterior', ex: 0, exT: 0, st: 0, stT: 0, theta: .78, phi: 1.12, r: 15, rT: 0, auto: true, dragging: false };

  function layout() {
    const t = st.t;
    const a = ease(clamp(t / .5, 0, 1));            // unfold flaps
    const b = ease(clamp((t - .45) / .5, 0, 1));    // expand shells
    const x = st.ex;                                 // exploded amount
    for (const w of wings) {
      w.hinge.rotation.x = -w.s * (Math.PI / 2) * (1 - a);
      const out = C.W / 2 - .06 + (C.wing + .03) * b;
      w.shell.position.z = w.s * (out + .9 * x);
      w.shell.visible = b > .01 || x > 0;
      const depth = Math.max(.02, out - C.W / 2 + .05 + .9 * x);
      for (const e of w.ends) { e.scale.z = depth; e.position.z = -w.s * depth / 2; }
      w.roof.scale.z = depth; w.roof.position.z = -w.s * depth / 2; w.roof.position.y = C.base + C.H + .04 + 1.1 * x;
      w.wall.position.y = 0;
    }
    roofG.position.y = 1.3 * x; baseG.position.y = -.45 * x;
    const ready = ease(clamp((t - .9) / .1, 0, 1));
    extras.scale.setScalar(Math.max(.001, ready)); interior.scale.setScalar(Math.max(.001, ready * (1 - x)));
    warm.intensity = 14 * ready; M.glass.emissiveIntensity = .55 * ready;
    // structure mode fades skins, shows yellow edges
    const sk = 1 - .88 * st.st;
    for (const k of ['panel', 'floor', 'deck']) M[k].opacity = sk;
    M.frame.opacity = 1 - .5 * st.st; M.glass.opacity = .32 * (1 - .6 * st.st);
    edgeMat.opacity = st.st;
    const width = C.W + 2 * C.wing * b, area = C.L * width;
    onChange && onChange({ t, width, area, volume: area * C.H, length: C.L, height: C.H + C.base + .1,
      stage: t < .08 ? 0 : t < .48 ? 1 : t < .95 ? 2 : 3 });
  }

  // orbit controls (custom, light)
  let px = 0, py = 0, pinch = 0, idle = 0;
  const el = renderer.domElement;
  el.addEventListener('pointerdown', e => { st.dragging = true; st.auto = false; px = e.clientX; py = e.clientY; el.setPointerCapture(e.pointerId); });
  el.addEventListener('pointermove', e => { if (!st.dragging) return; st.theta -= (e.clientX - px) * .006; st.phi = clamp(st.phi - (e.clientY - py) * .004, .45, 1.45); px = e.clientX; py = e.clientY; idle = 0; kick(); });
  const up = () => { st.dragging = false; idle = 0; };
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  el.addEventListener('wheel', e => { if (!(e.ctrlKey || e.metaKey)) return; e.preventDefault(); st.rT = clamp(st.rT + e.deltaY * .01, -6, 8); kick(); }, { passive: false });
  el.addEventListener('touchmove', e => { if (e.touches.length === 2) { const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); if (pinch) st.rT = clamp(st.rT - (d - pinch) * .03, -6, 8); pinch = d; e.preventDefault(); kick(); } }, { passive: false });
  el.addEventListener('touchend', () => pinch = 0);

  let visible = true, raf = 0, last = performance.now(), play = null;
  function frame(now) {
    raf = 0; const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (play) { st.target = clamp(st.target + dt / play, 0, 1); if (st.target >= 1) play = null; }
    const k = 1 - Math.pow(.0015, dt);
    st.t += (st.target - st.t) * k; st.ex += (st.exT - st.ex) * k; st.st += (st.stT - st.st) * k; const rGoal = clamp(12.5 + 8.5 * st.t + 3 * st.ex + st.rT, 8, 30); st.r += (rGoal - st.r) * k;
    if (!st.dragging) { idle += dt; if (st.auto || idle > 4) st.theta += dt * .12; }
    cam.position.set(Math.sin(st.theta) * Math.sin(st.phi) * st.r, Math.cos(st.phi) * st.r + 1.2, Math.cos(st.theta) * Math.sin(st.phi) * st.r);
    cam.lookAt(0, 1.1 + .5 * st.ex, 0);
    layout(); renderer.render(scene, cam);
    if (visible) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf && visible) { last = performance.now(); raf = requestAnimationFrame(frame); } }
  const io = new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) kick(); }, { threshold: .05 });
  io.observe(host);
  const ro = new ResizeObserver(() => { renderer.setSize(W(), H()); cam.aspect = W() / H(); cam.updateProjectionMatrix(); kick(); });
  ro.observe(host);
  kick();

  return {
    setUnfold(v) { play = null; st.target = clamp(v, 0, 1); kick(); },
    play(sec = 5) { if (st.target >= .99) { st.target = 0; st.t = 0; } play = sec; kick(); },
    setMode(m) { st.mode = m; st.exT = m === 'exploded' ? 1 : 0; st.stT = m === 'structure' ? 1 : 0; if (m !== 'exterior' && st.target < .99) st.target = 1; kick(); },
    zoom(d) { st.rT = clamp(st.rT + d, -6, 8); kick(); },
    get unfold() { return st.target; },
    dispose() { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); renderer.dispose(); el.remove(); }
  };
}
