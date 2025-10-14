"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useState } from "react";
import { motion } from "framer-motion";
import { GridBackgroundDemo } from "@/components/ui/grid";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import BoxModel from "@/components/models/BoxModel";
import * as THREE from "three";

export default function IntroScene() {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
    >
      {/* 🌈 Aurora/Grid Background */}
      <div className="absolute inset-0 z-0">
      <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white opacity-40 pointer-events-none z-[5]" />

        <GridBackgroundDemo />
      </div>

      {/* 🌟 Floating 3D Box */}
      <div className="absolute inset-0 z-10">
        <Canvas
          shadows
          camera={{ position: [1.8, 1.2, 4.8], fov: 40 }} // ⬅️ shifted right & back
          gl={{ toneMapping: THREE.ACESFilmicToneMapping }}
        >
          {/* 💡 Enhanced Lighting Setup */}
          <ambientLight intensity={1.1} color="#ffffff" />
          <directionalLight position={[4, 5, 4]} intensity={2} />
          <pointLight position={[2, 2, -2]} intensity={1} color="#aaddff" />
          <hemisphereLight
            skyColor={"#ffffff"}
            groundColor={"#b9b9b9"}
            intensity={0.7}
          />

          {/* Contact Shadows */}
          <ContactShadows
            position={[1.2, -1.1, 0]} // ⬅️ aligned with shifted model
            opacity={0.5}
            scale={8}
            blur={3.2}
            far={4}
            resolution={1024}
            color="#000000"
          />

          {/* 🎁 Hover + Floating Animation */}
          <Suspense fallback={null}>
            <group
              onPointerOver={() => setHovered(true)}
              onPointerOut={() => setHovered(false)}
              scale={hovered ? [0.04, 0.04, 0.04] : [0.035, 0.035, 0.035]}
              position={[1.3, -0.5, 0]} // ⬅️ moved right so it no longer overlaps text
              rotation={[0, Math.PI / 8, 0]} // small angled turn for perspective
            >
              <BoxModel />
            </group>
          </Suspense>

          {/* Optional orbit interaction (disabled zoom/pan) */}
          <OrbitControls enableZoom={false} enablePan={false} />
        </Canvas>
      </div>

      {/* ✨ Optional Floating Label (kept clean for now) */}
      <motion.div
        className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center z-20 text-center"
        animate={{
          y: hovered ? [0, -5, 0] : 0,
          opacity: hovered ? [1, 0.8, 1] : 1,
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.div>
  );
}
