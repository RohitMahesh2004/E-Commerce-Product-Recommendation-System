"use client";

import { useFrame, useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";
import { useRef, useMemo } from "react";

export default function BoxModel() {
  // 🧩 Load your GLTF model
  const gltf = useLoader(GLTFLoader, "/models/ration_cardboard_box_gltf/scene.gltf");
  const group = useRef<THREE.Group>(null);

  // 🎨 Load PBR textures (BaseColor, MetallicRoughness, Normal)
  const [baseColorMap, metallicRoughnessMap, normalMap] = useMemo(() => {
    const loader = new THREE.TextureLoader();
    return [
      loader.load("/models/ration_cardboard_box_gltf/textures/closed_box_baseColor.png"),
      loader.load("/models/ration_cardboard_box_gltf/textures/closed_box_metallicRoughness.png"),
      loader.load("/models/ration_cardboard_box_gltf/textures/closed_box_normal.png"), // ✅ fixed path
    ];
  }, []);

  // 🪄 Configure textures (color space, wrapping, anisotropy)
  [baseColorMap, metallicRoughnessMap, normalMap].forEach((tex) => {
    if (tex) {
      tex.colorSpace = THREE.SRGBColorSpace; // ✅ correct enum, not string
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.anisotropy = 16;
    }
  });

  // 🧱 Apply materials to all meshes in the model
  gltf.scene.traverse((child: any) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;

      child.material = new THREE.MeshStandardMaterial({
        map: baseColorMap,
        metalnessMap: metallicRoughnessMap,
        roughnessMap: metallicRoughnessMap,
        normalMap: normalMap,
        metalness: 0.6,       // ✅ less metallic → more realistic cardboard
        roughness: 0.9,       // ✅ slightly rougher, softer light response
        envMapIntensity: 1.8, // ✅ brighter reflections from environment
      });
    }
  });

  // 🔄 Floating & rotating animation
  const worldUp = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const revPerSec = 1 / 6;
  const angularSpeed = 2 * Math.PI * revPerSec;

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.rotateOnWorldAxis(worldUp, angularSpeed * delta);
    const t = performance.now() * 0.001;
    group.current.position.y = -0.4 + Math.sin(t * 3) * 0.05;
  });

  return (
    <group
      ref={group}
      scale={15}              // ✅ Adjust size to fit your scene
      position={[0, -0.5, 0]} // Keeps it centered in view
      rotation={[0, 0.6, 0]}  // Slight tilt for aesthetic
      castShadow
    >
      <primitive object={gltf.scene} />
    </group>
  );
}
