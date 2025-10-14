"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { X } from "lucide-react";

export default function RecommendationDashboard({ onClose }: { onClose: () => void }) {
  const [input, setInput] = useState("");
  const [recommendations, setRecommendations] = useState<
    { name: string; reason: string }[]
  >([]);

  const handleSubmit = () => {
    // Simulated recommendation logic (replace with backend later)
    setRecommendations([
      {
        name: "Nike Air Zoom Pegasus 40",
        reason: "Because you previously viewed running shoes and sportswear.",
      },
      {
        name: "Adidas Ultraboost 22",
        reason: "You prefer high-cushion footwear and performance comfort.",
      },
      {
        name: "Asics Gel Nimbus 25",
        reason: "You’ve shown interest in marathon training and long-distance gear.",
      },
    ]);
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-2xl shadow-xl w-[90%] md:w-[60%] lg:w-[50%] p-8 relative text-black"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-600 hover:text-black"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-3xl font-extrabold mb-6 text-center">
          Product Recommendation Dashboard
        </h2>

        {/* Input Section */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-center mb-8">
          <input
            type="text"
            placeholder="Enter: Product catalog + user behavior"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <motion.button
            onClick={handleSubmit}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-neutral-800 transition"
          >
            Generate
          </motion.button>
        </div>

        {/* Output Section */}
        <div className="mt-6 space-y-6">
          {recommendations.length > 0 ? (
            recommendations.map((rec, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition"
              >
                <h3 className="text-xl font-semibold">{rec.name}</h3>
                <p className="text-gray-600 text-sm mt-2">{rec.reason}</p>
              </motion.div>
            ))
          ) : (
            <p className="text-center text-gray-500">
              Enter your product catalog and behavior to see AI recommendations.
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
