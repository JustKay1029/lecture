"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

interface BalloonBirthdaySceneProps {
  onComplete: () => void;
}

export const BalloonBirthdayScene = ({ onComplete }: BalloonBirthdaySceneProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  
  const targetRotation = useRef({ x: 0, y: 0 });
  const currentRotation = useRef({ x: 0, y: 0 });

  // Load Three.js + OrbitControls dynamically
  useEffect(() => {
    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject();
        document.body.appendChild(script);
      });
    };

    const initThree = async () => {
      try {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js');
        await loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js');
        setIsLoaded(true);
      } catch (err) {
        console.error('Failed to load Three.js:', err);
      }
    };

    initThree();
  }, []);

  // Gyroscope permission checker for iOS
  useEffect(() => {
    const checkOrientation = () => {
      if (typeof DeviceOrientationEvent !== 'undefined' && 'requestPermission' in DeviceOrientationEvent) {
        setHasPermission(false);
      } else {
        setHasPermission(true);
        window.addEventListener('deviceorientation', handleOrientation);
      }
    };

    checkOrientation();
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  const handleOrientation = (e: DeviceOrientationEvent) => {
    const beta = e.beta || 0;
    const gamma = e.gamma || 0;

    const deadzone = 2;
    let targetX = 0;
    let targetY = 0;

    if (Math.abs(beta) > deadzone) {
      targetX = Math.max(-20, Math.min(20, (beta - 45) * 0.5));
    }
    if (Math.abs(gamma) > deadzone) {
      targetY = Math.max(-25, Math.min(25, gamma * 0.5));
    }

    targetRotation.current = { x: targetX, y: targetY };
  };

  const requestPermission = async () => {
    const request = (DeviceOrientationEvent as any).requestPermission;
    if (typeof request === 'function') {
      try {
        const response = await request();
        if (response === 'granted') {
          setHasPermission(true);
          window.addEventListener('deviceorientation', handleOrientation);
        } else {
          setHasPermission(false);
        }
      } catch (err) {
        setHasPermission(false);
      }
    }
  };

  // Three.js WebGL Render Cycle
  useEffect(() => {
    if (!isLoaded || !containerRef.current) return;

    const THREE = (window as any).THREE;
    const container = containerRef.current;
    
    // 1. Scene & Render
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x35070e); // Rich royal red velvet base
    
    // Atmospheric fog matching background color
    scene.fog = new THREE.FogExp2(0x35070e, 0.012);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 1000);
    // Position further away for mobile screen adjustments
    const isMobile = window.innerWidth < 768;
    camera.position.set(0, 4, isMobile ? 54 : 44);

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 4. OrbitControls Setup (fallback)
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 20;
    controls.maxDistance = 80;
    controls.maxPolarAngle = Math.PI / 2 + 0.1; // lock camera angles slightly
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.3;

    // 5. Main Parenting Scale Group for Mobile Responsiveness
    const mainGroup = new THREE.Group();
    if (isMobile) {
      mainGroup.scale.set(0.72, 0.72, 0.72);
      mainGroup.position.set(0, 1.5, 0);
    } else {
      mainGroup.position.set(0, 0, 0);
    }
    scene.add(mainGroup);

    // 6. Lighting configuration (Velvet Red & Rich Gold tones)
    const setupLighting = () => {
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
      scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
      dirLight.position.set(10, 35, 15);
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      scene.add(dirLight);

      // Gold warm fill lighting to illuminate letters and cake wicks
      const goldPointLight = new THREE.PointLight(0xffd700, 3.5, 50);
      goldPointLight.position.set(0, 8, 12);
      scene.add(goldPointLight);

      // Rich magenta/crimson bounce rim light on high-spec objects
      const bounceRimLight = new THREE.PointLight(0xff0044, 4.0, 40);
      bounceRimLight.position.set(-15, -4, 10);
      scene.add(bounceRimLight);
    };
    setupLighting();

    // Materials mapping for Royal Velvet theme
    const velvetRedMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x800020, // Royal Burgundy
      roughness: 0.35,
      metalness: 0.1,
      clearcoat: 0.3,
      clearcoatRoughness: 0.35,
      name: 'velvetRed'
    });

    const glossyGoldMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffd700, // Gold
      roughness: 0.1,
      metalness: 0.85,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      name: 'glossyGold'
    });

    const frostingMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffeef2, // Rich Cream Frosting
      roughness: 0.25,
      clearcoat: 0.6,
      name: 'creamFrosting'
    });

    // 7. BUILD STAGE platforms
    const buildStage = () => {
      const geom = new THREE.CylinderGeometry(15, 15.5, 1.5, 48);
      const mesh = new THREE.Mesh(geom, velvetRedMaterial);
      mesh.position.y = -8.5;
      mesh.receiveShadow = true;
      mainGroup.add(mesh);
    };
    buildStage();

    // 8. BUILD CAKE (Bottom section)
    let candleFlame: any;
    const buildCake = () => {
      const cakeGroup = new THREE.Group();
      cakeGroup.position.set(-4.5, -7.7, -1);

      // Cake bottom
      const bottomGeom = new THREE.CylinderGeometry(3.6, 3.6, 2.2, 40);
      const bottomMesh = new THREE.Mesh(bottomGeom, velvetRedMaterial);
      bottomMesh.position.y = 1.1;
      bottomMesh.castShadow = true;
      bottomMesh.receiveShadow = true;
      cakeGroup.add(bottomMesh);

      // Cream Frosting ring 1
      const frosting1Geom = new THREE.TorusGeometry(3.5, 0.3, 16, 40);
      const frosting1 = new THREE.Mesh(frosting1Geom, frostingMaterial);
      frosting1.rotation.x = Math.PI / 2;
      frosting1.position.y = 2.2;
      cakeGroup.add(frosting1);

      // Cake top
      const topGeom = new THREE.CylinderGeometry(2.6, 2.6, 1.8, 40);
      const topMesh = new THREE.Mesh(topGeom, velvetRedMaterial);
      topMesh.position.y = 3.1;
      topMesh.castShadow = true;
      cakeGroup.add(topMesh);

      // Cream Frosting ring 2
      const frosting2Geom = new THREE.TorusGeometry(2.5, 0.25, 16, 40);
      const frosting2 = new THREE.Mesh(frosting2Geom, frostingMaterial);
      frosting2.rotation.x = Math.PI / 2;
      frosting2.position.y = 4.0;
      cakeGroup.add(frosting2);

      // Gold Candle
      const candleGeom = new THREE.CylinderGeometry(0.12, 0.12, 2.0, 12);
      const candle = new THREE.Mesh(candleGeom, glossyGoldMaterial);
      candle.position.y = 5.0;
      candle.castShadow = true;
      cakeGroup.add(candle);

      // Candle Flame
      const flameGeom = new THREE.ConeGeometry(0.2, 0.6, 12);
      flameGeom.translate(0, 0.3, 0);
      const flameMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
      candleFlame = new THREE.Mesh(flameGeom, flameMat);
      candleFlame.position.set(0, 6.0, 0);
      
      const flameLight = new THREE.PointLight(0xff6a00, 1.2, 8);
      flameLight.position.set(0, 0.2, 0);
      candleFlame.add(flameLight);

      cakeGroup.add(candleFlame);
      mainGroup.add(cakeGroup);
    };
    buildCake();

    // 9. BUILD GIFT BOX (Bottom right section)
    let giftBoxObj: any;
    let isBoxClicked = false;
    const buildGiftBox = () => {
      const giftGroup = new THREE.Group();
      giftGroup.position.set(4.5, -7.7, 2);

      // Box body
      const boxGeom = new THREE.BoxGeometry(3.6, 3.6, 3.6);
      giftBoxObj = new THREE.Mesh(boxGeom, velvetRedMaterial);
      giftBoxObj.position.y = 1.8;
      giftBoxObj.castShadow = true;
      giftBoxObj.receiveShadow = true;
      giftBoxObj.userData = { clickable: true };
      giftGroup.add(giftBoxObj);

      // Gold Ribbon lines
      const ribbonVGeom = new THREE.BoxGeometry(0.5, 3.7, 3.7);
      const ribbonV = new THREE.Mesh(ribbonVGeom, glossyGoldMaterial);
      ribbonV.position.y = 1.8;
      giftBoxObj.add(ribbonV);

      const ribbonHGeom = new THREE.BoxGeometry(3.7, 3.7, 0.5);
      const ribbonH = new THREE.Mesh(ribbonHGeom, glossyGoldMaterial);
      ribbonH.position.y = 1.8;
      giftBoxObj.add(ribbonH);

      // Top ribbon knot spheres
      const knotGeom = new THREE.SphereGeometry(0.4, 16, 16);
      const knot = new THREE.Mesh(knotGeom, glossyGoldMaterial);
      knot.position.y = 3.8;
      giftGroup.add(knot);

      mainGroup.add(giftGroup);
    };
    buildGiftBox();

    // 10. BUILD PROCEDURAL 3D PUFFY BUBBLE LETTERS (HAPPY BIRTHDAY)
    const LETTER_STROKES = {
      'H': [
        { start: [-1.2, 1.2], end: [-1.2, -1.2] },
        { start: [1.2, 1.2], end: [1.2, -1.2] },
        { start: [-1.2, 0], end: [1.2, 0] }
      ],
      'A': [
        { start: [-1.2, -1.2], end: [0, 1.2] },
        { start: [0, 1.2], end: [1.2, -1.2] },
        { start: [-0.6, -0.2], end: [0.6, -0.2] }
      ],
      'P': [
        { start: [-1.0, 1.2], end: [-1.0, -1.2] },
        { start: [-1.0, 1.2], end: [0.4, 1.2] },
        { start: [0.4, 1.2], end: [0.4, 0.1] },
        { start: [0.4, 0.1], end: [-1.0, 0.1] }
      ],
      'Y': [
        { start: [-1.2, 1.2], end: [0, 0] },
        { start: [1.2, 1.2], end: [0, 0] },
        { start: [0, 0], end: [0, -1.2] }
      ],
      'B': [
        { start: [-1.0, 1.2], end: [-1.0, -1.2] },
        { start: [-1.0, 1.2], end: [0.3, 1.2] },
        { start: [0.3, 1.2], end: [0.3, 0.1] },
        { start: [0.3, 0.1], end: [-1.0, 0.1] },
        { start: [-1.0, 0.1], end: [0.5, 0.1] },
        { start: [0.5, 0.1], end: [0.5, -1.2] },
        { start: [0.5, -1.2], end: [-1.0, -1.2] }
      ],
      'I': [
        { start: [0, 1.2], end: [0, -1.2] },
        { start: [-0.8, 1.2], end: [0.8, 1.2] },
        { start: [-0.8, -1.2], end: [0.8, -1.2] }
      ],
      'R': [
        { start: [-1.0, 1.2], end: [-1.0, -1.2] },
        { start: [-1.0, 1.2], end: [0.4, 1.2] },
        { start: [0.4, 1.2], end: [0.4, 0.1] },
        { start: [0.4, 0.1], end: [-1.0, 0.1] },
        { start: [-0.2, 0.1], end: [0.8, -1.2] }
      ],
      'T': [
        { start: [-1.2, 1.2], end: [1.2, 1.2] },
        { start: [0, 1.2], end: [0, -1.2] }
      ],
      'D': [
        { start: [-1.0, 1.2], end: [-1.0, -1.2] },
        { start: [-1.0, 1.2], end: [0.2, 1.2] },
        { start: [0.2, 1.2], end: [0.7, 0.5] },
        { start: [0.7, 0.5], end: [0.7, -0.5] },
        { start: [0.7, -0.5], end: [0.2, -1.2] },
        { start: [0.2, -1.2], end: [-1.0, -1.2] }
      ]
    };

    const createProceduralLetter = (char: string, geom: any, mat: any) => {
      const letterGroup = new THREE.Group();
      const strokes = (LETTER_STROKES as any)[char];
      if (!strokes) return letterGroup;

      strokes.forEach((stroke: any) => {
        const startPt = new THREE.Vector2(stroke.start[0], stroke.start[1]);
        const endPt = new THREE.Vector2(stroke.end[0], stroke.end[1]);
        const distance = startPt.distanceTo(endPt);
        const steps = Math.max(12, Math.floor(distance * 10));

        for (let j = 0; j <= steps; j++) {
          const t = j / steps;
          const x = THREE.MathUtils.lerp(startPt.x, endPt.x, t);
          const y = THREE.MathUtils.lerp(startPt.y, endPt.y, t);

          const ball = new THREE.Mesh(geom, mat);
          ball.position.set(x, y, 0);
          ball.castShadow = true;
          letterGroup.add(ball);
        }
      });
      return letterGroup;
    };

    const buildPuffyLetters = () => {
      const ballGeom = new THREE.SphereGeometry(0.38, 16, 16);
      
      // Render "HAPPY" on top
      const happyWords = "HAPPY";
      const happySpacing = 2.4;
      const happyStartX = -((happyWords.length - 1) * happySpacing) / 2;

      for (let i = 0; i < happyWords.length; i++) {
        const letter = createProceduralLetter(happyWords[i], ballGeom, glossyGoldMaterial);
        letter.position.set(happyStartX + (i * happySpacing), 6.5, 0);
        letter.userData = { originalY: 6.5, phase: i * 0.6 };
        mainGroup.add(letter);
      }

      // Render "BIRTHDAY" on bottom
      const bdayWords = "BIRTHDAY";
      const bdaySpacing = 1.9;
      const bdayStartX = -((bdayWords.length - 1) * bdaySpacing) / 2;

      for (let i = 0; i < bdayWords.length; i++) {
        const letter = createProceduralLetter(bdayWords[i], ballGeom, glossyGoldMaterial);
        letter.position.set(bdayStartX + (i * bdaySpacing), -3.0, 0);
        letter.userData = { originalY: -3.0, phase: i * 0.5 + 2.0 };
        mainGroup.add(letter);
      }
    };
    buildPuffyLetters();

    // 11. BUILD 19th ORB (Centerpiece)
    let glassOrb: any;
    const buildGlassOrb = () => {
      const orbGroup = new THREE.Group();
      orbGroup.position.set(0, 1.8, 0);

      // Translucent glossy glass shell
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xffd700,
        roughness: 0.05,
        metalness: 0.1,
        transparent: true,
        opacity: 0.35,
        transmission: 0.9,
        thickness: 1.2,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02
      });

      const sphereGeom = new THREE.SphereGeometry(2.6, 32, 32);
      glassOrb = new THREE.Mesh(sphereGeom, glassMat);
      glassOrb.castShadow = true;
      orbGroup.add(glassOrb);

      // Inner glowing core
      const coreGeom = new THREE.SphereGeometry(1.0, 16, 16);
      const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const core = new THREE.Mesh(coreGeom, coreMat);
      
      const coreLight = new THREE.PointLight(0xffa500, 2.5, 12);
      core.add(coreLight);
      orbGroup.add(core);

      mainGroup.add(orbGroup);
    };
    buildGlassOrb();

    // 12. Floating Bubbles (Decorative background)
    const bubbleMeshes: any[] = [];
    const buildBubbles = () => {
      const bubbleMat = new THREE.MeshPhysicalMaterial({
        color: 0xffbbcc,
        roughness: 0.02,
        metalness: 0.1,
        transparent: true,
        opacity: 0.3,
        transmission: 0.95,
        thickness: 0.5,
        clearcoat: 1.0,
      });

      const bubbleGeom = new THREE.SphereGeometry(0.8, 16, 16);

      for (let i = 0; i < 22; i++) {
        const bubble = new THREE.Mesh(bubbleGeom, bubbleMat);
        bubble.position.set(
          (Math.random() - 0.5) * 35,
          (Math.random() - 0.5) * 30 + 2,
          (Math.random() - 0.5) * 20 - 4
        );
        bubble.userData = {
          speedY: 0.015 + Math.random() * 0.02,
          phase: Math.random() * Math.PI * 2,
          amplitude: 0.01 + Math.random() * 0.015
        };
        mainGroup.add(bubble);
        bubbleMeshes.push(bubble);
      }
    };
    buildBubbles();

    // 13. Interaction Raycasting for present box click
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (e: MouseEvent) => {
      // Calculate normalized mouse coords
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      // Check if clicked object belongs to the present box
      const giftClicked = intersects.some(
        (intersect) =>
          intersect.object === giftBoxObj || intersect.object.parent === giftBoxObj
      );

      if (giftClicked && !isBoxClicked) {
        isBoxClicked = true;
        
        // Explosion / Pop animation scale effect
        let animationStep = 0;
        const animateClick = () => {
          if (animationStep < 20) {
            giftBoxObj.scale.addScalar(0.04);
            giftBoxObj.rotation.y += 0.15;
            animationStep++;
            requestAnimationFrame(animateClick);
          } else {
            // Unboxed! Trigger navigation to letter screen
            onComplete();
          }
        };
        animateClick();
      }
    };
    renderer.domElement.addEventListener('click', handlePointerDown);

    // 14. Render loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsed = clock.getElapsedTime();

      // Gyroscope tilt lerping
      currentRotation.current.x += (targetRotation.current.x - currentRotation.current.x) * 0.08;
      currentRotation.current.y += (targetRotation.current.y - currentRotation.current.y) * 0.08;

      mainGroup.rotation.x = currentRotation.current.x * (Math.PI / 180);
      mainGroup.rotation.y = currentRotation.current.y * (Math.PI / 180);

      // Letter floating animations
      mainGroup.children.forEach((child: any) => {
        if (child.userData && child.userData.originalY !== undefined) {
          child.position.y = child.userData.originalY + Math.sin(elapsed * 1.5 + child.userData.phase) * 0.22;
        }
      });

      // Flame winking/flickering scale
      if (candleFlame) {
        const scaleVal = 1.0 + Math.sin(elapsed * 18) * 0.06;
        candleFlame.scale.set(scaleVal, scaleVal, scaleVal);
      }

      // Glass orb wobble
      if (glassOrb) {
        glassOrb.rotation.y = elapsed * 0.35;
        glassOrb.rotation.z = Math.sin(elapsed * 0.6) * 0.08;
      }

      // Bubbles movement upwards
      bubbleMeshes.forEach((bubble) => {
        bubble.position.y += bubble.userData.speedY;
        bubble.position.x += Math.sin(elapsed + bubble.userData.phase) * bubble.userData.amplitude;
        
        // Wrap around when bubble floats above screen
        if (bubble.position.y > 18) {
          bubble.position.y = -18;
        }
      });

      controls.update();
      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };
    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      renderer.domElement.removeEventListener('click', handlePointerDown);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      controls.dispose();
      renderer.dispose();
    };
  }, [isLoaded]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 w-full h-full z-50 flex flex-col justify-between items-center py-8 select-none overflow-hidden"
      style={{
        background: '#35070e', // Fallback rich royal burgundy red background
        perspective: '1000px',
        touchAction: 'none'
      }}
    >
      {/* Dynamic Permissions overlays for iOS motion */}
      <div className="z-50 h-8 flex items-center">
        {hasPermission === false && (
          <button 
            onClick={requestPermission}
            className="px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider bg-white/10 border border-white/20 text-[#ffb3b5] hover:bg-white/15 cursor-pointer active:scale-95 transition-all shadow-md"
          >
            Enable Motion Controls 📱
          </button>
        )}
      </div>

      {/* Floating hints */}
      <div className="absolute top-16 left-4 right-4 z-10 text-center pointer-events-none">
        <h3 className="font-serif italic text-2xl text-[#ffd700] drop-shadow-md tracking-wide">
          Happy 19th Birthday
        </h3>
        <p className="text-[10px] text-[#ffb3b5]/60 uppercase tracking-widest font-sans mt-1">
          Tap the red velvet present box to open 🎁
        </p>
      </div>

      {/* THREE.JS CANVAS TARGET VIEWPORT MOUNTED HERE */}
      {!isLoaded && (
        <div className="flex-1 flex items-center justify-center text-white/50 text-xs tracking-widest uppercase">
          Loading 3D Birthday Space...
        </div>
      )}

      {/* Dynamic UI HUD guide */}
      <div className="absolute bottom-6 z-10 text-center pointer-events-none">
        <p className="text-[9px] text-[#ffb3b5]/40 tracking-wider font-sans uppercase">
          Drag to Orbit • Tilt Phone for Gyro 3D
        </p>
      </div>
    </div>
  );
};
export default BalloonBirthdayScene;
