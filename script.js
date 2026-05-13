/* ============================================================
   AYUSH KUMAR SINGH — PORTFOLIO JAVASCRIPT
   File: script.js
   Depends on: Three.js (r128) loaded before this file
   ============================================================ */

(function () {

  /* ──────────────────────────────────────────
     SETUP: Renderer, Scene, Camera
  ────────────────────────────────────────── */
  const canvas = document.getElementById('bg-canvas');

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    200
  );
  camera.position.set(0, 0, 30);

  /* ──────────────────────────────────────────
     COLOR PALETTE
  ────────────────────────────────────────── */
  const RUST    = new THREE.Color(0xbf4520);
  const TEAL    = new THREE.Color(0x1e6b5a);
  const NEUTRAL = new THREE.Color(0x8a857d);
  const DARK    = new THREE.Color(0x3a3530);
  const palette = [RUST, TEAL, NEUTRAL, DARK, RUST];

  /* ──────────────────────────────────────────
     GEOMETRIES
  ────────────────────────────────────────── */
  const geos = [
    new THREE.OctahedronGeometry(1.2, 0),
    new THREE.TetrahedronGeometry(1.4, 0),
    new THREE.IcosahedronGeometry(1.0, 0),
    new THREE.BoxGeometry(1.4, 1.4, 1.4),
    new THREE.TorusGeometry(0.9, 0.3, 8, 12),
  ];

  /* ──────────────────────────────────────────
     FLOATING SHAPES (26 total)
  ────────────────────────────────────────── */
  const shapes = [];

  for (let i = 0; i < 26; i++) {
    const col    = palette[i % palette.length];
    const isWire = i % 3 === 0;

    const mat = new THREE.MeshPhongMaterial({
      color:     col,
      wireframe: isWire,
      transparent: true,
      opacity:   isWire ? 0.20 : 0.11,
      shininess: 70,
    });

    const mesh   = new THREE.Mesh(geos[i % geos.length], mat);
    const spread = 55;

    mesh.position.set(
      (Math.random() - 0.5) * spread,
      (Math.random() - 0.5) * spread,
      (Math.random() - 0.5) * 28 - 5
    );

    const s = 0.5 + Math.random() * 2.4;
    mesh.scale.setScalar(s);
    mesh.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );

    shapes.push({
      mesh,
      rx:        (Math.random() - 0.5) * 0.006,
      ry:        (Math.random() - 0.5) * 0.006,
      rz:        (Math.random() - 0.5) * 0.004,
      floatAmp:  0.010 + Math.random() * 0.012,
      floatFreq: 0.28  + Math.random() * 0.4,
      floatOff:  Math.random() * Math.PI * 2,
      dx:        (Math.random() - 0.5) * 0.007,
      dy:        (Math.random() - 0.5) * 0.007,
    });

    scene.add(mesh);
  }

  /* ──────────────────────────────────────────
     PARTICLE CLOUD (600 particles)
  ────────────────────────────────────────── */
  const N   = 600;
  const pos = new Float32Array(N * 3);

  for (let i = 0; i < N; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * 100;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 100;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 60;
  }

  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

  const pMat = new THREE.PointsMaterial({
    color:       0xbf4520,
    size:        0.16,
    transparent: true,
    opacity:     0.32,
  });

  scene.add(new THREE.Points(pGeo, pMat));

  /* ──────────────────────────────────────────
     LIGHTING
  ────────────────────────────────────────── */
  scene.add(new THREE.AmbientLight(0xf7f3ec, 0.65));

  const sun = new THREE.DirectionalLight(0xbf4520, 0.85);
  sun.position.set(12, 16, 10);
  scene.add(sun);

  const fill = new THREE.DirectionalLight(0x1e6b5a, 0.4);
  fill.position.set(-12, -8, 6);
  scene.add(fill);

  /* ──────────────────────────────────────────
     INPUT: Mouse Parallax + Scroll
  ────────────────────────────────────────── */
  let mx = 0;
  let my = 0;

  document.addEventListener('mousemove', function (e) {
    mx = (e.clientX / window.innerWidth  - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  let scrollY = 0;
  window.addEventListener('scroll', function () {
    scrollY = window.scrollY;
  });

  /* ──────────────────────────────────────────
     RESIZE HANDLER
  ────────────────────────────────────────── */
  window.addEventListener('resize', function () {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });

  /* ──────────────────────────────────────────
     ANIMATION LOOP
  ────────────────────────────────────────── */
  let t = 0;

  (function tick() {
    requestAnimationFrame(tick);
    t += 0.016;

    /* Camera: mouse parallax + scroll depth */
    camera.position.x += (mx * 2.5 - camera.position.x) * 0.03;
    camera.position.y += (-my * 2  - camera.position.y) * 0.03;
    camera.position.z  = 30 - scrollY * 0.011;
    camera.lookAt(scene.position);

    /* Update each shape */
    shapes.forEach(function (o) {
      o.mesh.rotation.x += o.rx;
      o.mesh.rotation.y += o.ry;
      o.mesh.rotation.z += o.rz;

      /* Sinusoidal float */
      o.mesh.position.y += Math.sin(t * o.floatFreq + o.floatOff) * o.floatAmp;

      /* Slow drift */
      o.mesh.position.x += o.dx * 0.3;
      o.mesh.position.y += o.dy * 0.3;

      /* Wrap around bounds */
      if (o.mesh.position.x >  36) o.mesh.position.x = -36;
      if (o.mesh.position.x < -36) o.mesh.position.x =  36;
      if (o.mesh.position.y >  36) o.mesh.position.y = -36;
      if (o.mesh.position.y < -36) o.mesh.position.y =  36;
    });

    renderer.render(scene, camera);
  })();

})();