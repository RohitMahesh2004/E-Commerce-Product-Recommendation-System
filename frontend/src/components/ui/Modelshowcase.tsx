"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import { AuroraBackgroundDemo } from "@/app/loading page";
import BoxModel from "@/components/models/BoxModel";
import * as THREE from "three";

export default function ModelShowcase() {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <AuroraBackgroundDemo />

      <div className="absolute inset-0 z-20">
        <Canvas
          shadows
          camera={{ position: [0, 1.3, 5], fov: 40 }}
          gl={{ toneMapping: THREE.ACESFilmicToneMapping }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1.3} />
          <pointLight position={[-3, 2, -3]} intensity={0.7} color="#88ccff" />
          <pointLight position={[3, -2, 3]} intensity={0.4} color="#ffaa88" />

          <Suspense fallback={null}>
            <BoxModel />
            <ContactShadows
              position={[0, -1.2, 0]}
              opacity={0.5}
              scale={8}
              blur={2.5}
              far={4}
              resolution={1024}
              color="#000000"
            />
          </Suspense>

          <OrbitControls enableZoom={false} enablePan={false} />
        </Canvas>
      </div>

      <div className="absolute bottom-14 left-1/2 -translate-x-1/2 text-center z-30">
        <p className="text-white text-xl font-semibold drop-shadow-lg">
          Discover Your Product in Motion
        </p>
        <p className="text-gray-300 text-sm md:text-base">
          Hover and explore your product — powered by AI ✨
        </p>
      </div>
    </div>
  );
}
