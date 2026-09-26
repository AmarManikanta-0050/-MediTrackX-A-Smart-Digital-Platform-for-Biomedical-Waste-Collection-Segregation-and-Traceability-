import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const ThreeGlobeCanvas = () => {
  const containerRef = useRef(null);
  const [hasWebGL, setHasWebGL] = useState(true);
  const [activeNode, setActiveNode] = useState('Apex Memorial Hospital');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
        return;
      }
    } catch {
      setHasWebGL(false);
      return;
    }

    let animationFrameId;
    const width = container.clientWidth || 480;
    const height = container.clientHeight || 480;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 240;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Master Group for rotation
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // 1. Core Sphere (Semi-translucent dark emerald tech sphere)
    const sphereRadius = 68;
    const sphereGeo = new THREE.SphereGeometry(sphereRadius, 36, 36);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x059669,
      wireframe: true,
      transparent: true,
      opacity: 0.16,
    });
    const coreSphere = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(coreSphere);

    // 2. Inner glow shell
    const innerGeo = new THREE.SphereGeometry(sphereRadius * 0.98, 32, 32);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x0f766e,
      transparent: true,
      opacity: 0.08,
    });
    globeGroup.add(new THREE.Mesh(innerGeo, innerMat));

    // 3. Dot Grid / Particle Sphere (Surface points)
    const particleCount = 750;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const c1 = new THREE.Color(0x10b981); // Emerald
    const c2 = new THREE.Color(0x06b6d4); // Cyan
    const c3 = new THREE.Color(0x34d399); // Mint

    for (let i = 0; i < particleCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / particleCount);
      const theta = Math.sqrt(particleCount * Math.PI) * phi;
      const r = sphereRadius + (Math.random() * 2 - 1);

      const x = r * Math.cos(theta) * Math.sin(phi);
      const y = r * Math.sin(theta) * Math.sin(phi);
      const z = r * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const mixed = Math.random() > 0.5 ? c1 : Math.random() > 0.5 ? c2 : c3;
      colors[i * 3] = mixed.r;
      colors[i * 3 + 1] = mixed.g;
      colors[i * 3 + 2] = mixed.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 2.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    globeGroup.add(particles);

    // 4. Orbital rings
    const ringGeo1 = new THREE.RingGeometry(sphereRadius * 1.28, sphereRadius * 1.30, 64);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.28,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI * 0.4;
    ring1.rotation.y = Math.PI * 0.15;
    globeGroup.add(ring1);

    const ringGeo2 = new THREE.RingGeometry(sphereRadius * 1.42, sphereRadius * 1.43, 64);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.18,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = -Math.PI * 0.35;
    ring2.rotation.y = -Math.PI * 0.25;
    globeGroup.add(ring2);

    // 5. Healthcare Nodes (Hospitals, Treatment Plants, Bins, Transit)
    const nodes = [
      { name: 'Apex Multi-Speciality', lat: 28.6, lon: 77.2, type: 'hospital', color: 0x10b981 },
      { name: 'Metro City CBWTF Plant', lat: 19.0, lon: 72.8, type: 'treatment', color: 0x0284c7 },
      { name: 'CareMax Research Center', lat: 12.9, lon: 77.5, type: 'hospital', color: 0x10b981 },
      { name: 'BioFleet Unit #04 [In-Transit]', lat: 22.5, lon: 88.3, type: 'transit', color: 0xf59e0b },
      { name: 'District General Hospital', lat: 13.0, lon: 80.2, type: 'hospital', color: 0x10b981 },
    ];

    const latLonToVector3 = (lat, lon, radius) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);
      return new THREE.Vector3(x, y, z);
    };

    const nodeMeshes = [];
    nodes.forEach((node) => {
      const pos = latLonToVector3(node.lat, node.lon, sphereRadius + 1.2);

      // Node pin dot
      const dotGeo = new THREE.SphereGeometry(2.4, 16, 16);
      const dotMat = new THREE.MeshBasicMaterial({ color: node.color });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.copy(pos);
      globeGroup.add(dot);

      // Pulsing beacon ring
      const beaconGeo = new THREE.RingGeometry(2.8, 3.8, 16);
      const beaconMat = new THREE.MeshBasicMaterial({
        color: node.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.copy(pos);
      beacon.lookAt(new THREE.Vector3(0, 0, 0));
      globeGroup.add(beacon);

      nodeMeshes.push({ dot, beacon, initialScale: 1, baseOpacity: 0.7, name: node.name });
    });

    // 6. Arcs connecting nodes (Digital Waste Custody Arcs)
    const arcPairs = [
      [0, 1], // Apex -> CBWTF
      [2, 1], // CareMax -> CBWTF
      [0, 3], // Apex -> BioFleet
      [4, 1], // District -> CBWTF
    ];

    const arcGroup = new THREE.Group();
    globeGroup.add(arcGroup);

    const arcPulses = [];

    arcPairs.forEach(([fromIdx, toIdx]) => {
      const start = latLonToVector3(nodes[fromIdx].lat, nodes[fromIdx].lon, sphereRadius + 1.2);
      const end = latLonToVector3(nodes[toIdx].lat, nodes[toIdx].lon, sphereRadius + 1.2);

      // Mid-point pushed outwards to create a parabolic 3D arc
      const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      const distance = start.distanceTo(end);
      mid.normalize().multiplyScalar(sphereRadius + distance * 0.35);

      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const points = curve.getPoints(40);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(points);

      const arcMat = new THREE.LineBasicMaterial({
        color: 0x14b8a6,
        transparent: true,
        opacity: 0.45,
      });
      const arcLine = new THREE.Line(arcGeo, arcMat);
      arcGroup.add(arcLine);

      // Animated traveling pulse satellite on the arc
      const pulseGeo = new THREE.SphereGeometry(1.6, 12, 12);
      const pulseMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
      arcGroup.add(pulseMesh);

      arcPulses.push({
        curve,
        mesh: pulseMesh,
        progress: Math.random(),
        speed: 0.0035 + Math.random() * 0.003,
      });
    });

    // 7. Mouse Drag & Hover Interaction
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let targetRotationX = 0.2;
    let targetRotationY = 0;
    let autoRotationSpeed = 0.0022;

    const onPointerDown = (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e) => {
      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        targetRotationY += deltaX * 0.006;
        targetRotationX += deltaY * 0.006;

        // Clamp vertical tilt
        targetRotationX = Math.max(-0.6, Math.min(0.6, targetRotationX));

        previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 480;
      const h = container.clientHeight || 480;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth auto-rotation when not dragging
      if (!isDragging) {
        targetRotationY += autoRotationSpeed;
      }

      // Smooth interpolation for dampening
      globeGroup.rotation.y += (targetRotationY - globeGroup.rotation.y) * 0.08;
      globeGroup.rotation.x += (targetRotationX - globeGroup.rotation.x) * 0.08;

      // Orbit rings secondary spin
      ring1.rotation.z += 0.001;
      ring2.rotation.z -= 0.0015;

      // Pulse beacon rings
      nodeMeshes.forEach((item, idx) => {
        const s = 1 + 0.35 * Math.sin(elapsedTime * 3.5 + idx);
        item.beacon.scale.set(s, s, s);
        item.beacon.material.opacity = 0.3 + 0.4 * (1 - (s - 1) / 0.35);
      });

      // Advance traveling satellites on arcs
      arcPulses.forEach((p) => {
        p.progress += p.speed;
        if (p.progress > 1) p.progress = 0;
        const point = p.curve.getPoint(p.progress);
        p.mesh.position.copy(point);
      });

      renderer.render(scene, camera);
    };

    animate();

    // Node cycle for UI readout
    const nodeCycleInterval = setInterval(() => {
      setActiveNode((prev) => {
        const nextIdx = (nodes.findIndex((n) => n.name === prev) + 1) % nodes.length;
        return nodes[nextIdx].name;
      });
    }, 3800);

    // Cleanup
    return () => {
      clearInterval(nodeCycleInterval);
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      sphereGeo.dispose();
      sphereMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
    };
  }, []);

  if (!hasWebGL) {
    return (
      <div className="relative w-full h-[420px] lg:h-[480px] flex items-center justify-center">
        {/* CSS Radar Fallback */}
        <div className="relative w-72 h-72 rounded-full border-2 border-emerald-400/30 bg-emerald-950/20 backdrop-blur-xl flex items-center justify-center animate-pulse">
          <div className="w-56 h-56 rounded-full border border-teal-400/40" />
          <div className="w-40 h-40 rounded-full border border-cyan-400/50" />
          <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-glow-emerald" />
          <div className="absolute top-8 left-12 w-3 h-3 rounded-full bg-sky-400 animate-ping" />
          <div className="absolute bottom-12 right-14 w-3 h-3 rounded-full bg-amber-400 animate-ping" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[440px] sm:h-[480px] lg:h-[540px] flex items-center justify-center select-none">
      {/* Ambient background glow behind canvas */}
      <div
        className="absolute w-72 h-72 rounded-full blur-3xl opacity-40 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(16,185,129,0.35) 0%, rgba(6,182,212,0.18) 50%, transparent 75%)',
        }}
      />

      {/* Interactive Canvas */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center relative z-10"
        title="Click and drag to rotate 3D telemetry globe"
      />

      {/* Floating HUD Telemetry Pill */}
      <div className="absolute bottom-3 left-4 sm:left-6 z-20 pointer-events-none">
        <div className="flex items-center space-x-2.5 px-3.5 py-2 rounded-xl bg-white/90 backdrop-blur-md border border-emerald-200/80 shadow-card">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
          </span>
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Live Telemetry Link</span>
            <span className="text-xs font-semibold text-slate-800 tracking-tight">{activeNode}</span>
          </div>
        </div>
      </div>

      {/* Rotation hint pill */}
      <div className="absolute top-4 right-4 sm:right-6 z-20 pointer-events-none hidden sm:flex">
        <div className="px-3 py-1.5 rounded-full bg-white/80 backdrop-blur border border-emerald-100 shadow-sm text-[11px] font-medium text-slate-500 flex items-center space-x-1.5">
          <svg className="w-3.5 h-3.5 text-emerald-600 animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
          <span>3D Interactive &bull; Drag to Rotate</span>
        </div>
      </div>
    </div>
  );
};

export default ThreeGlobeCanvas;
