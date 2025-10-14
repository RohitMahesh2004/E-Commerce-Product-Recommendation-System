"use client";

import IntroScene from "@/components/intro/Introscene";
import { NavbarDemo } from "@/app/navbar";
import HeroText from "@/components/hero/hero";

export default function Page() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-transparent">
      <NavbarDemo />
      <IntroScene />
      <HeroText />
    </div>
  );
}
