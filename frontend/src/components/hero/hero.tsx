"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function HeroText() {
  const router = useRouter();

  const handleExploreClick = () => {
    router.push("/recommendations");
  };

  return (
    <section className="absolute inset-0 flex flex-col lg:flex-row items-center justify-between max-w-7xl mx-auto px-6 lg:px-16 z-20 text-black">
      {/* Left Section - Text */}
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
        className="lg:w-1/2 text-left space-y-6 mt-24 lg:mt-0"
      >
        <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight leading-snug">
          E-commerce Product Recommender
        </h1>

        <p className="text-lg lg:text-xl font-normal leading-relaxed text-justify max-w-lg">
          Discover products tailored just for you — powered by intelligent
          recommendation algorithms and LLM-generated explanations that help
          you understand why each item matches your preferences. Experience
          personalized product discovery designed to make every shopping
          experience smarter and simpler.
        </p>
      </motion.div>

      {/* Right Button */}
      <motion.button
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: -50 }}
        transition={{ duration: 0, delay: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleExploreClick}
        className="absolute bottom-12 right-16 px-8 py-3 rounded-full bg-black text-white font-semibold shadow-md hover:bg-neutral-800 transition-all duration-300 z-30"
      >
        Explore Recommendations →
      </motion.button>
    </section>
  );
}
