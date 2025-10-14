"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { NavbarDemo } from "@/app/navbar";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { FileUpload } from "@/components/ui/file-upload";

export default function RecommendationsPage() {
  const [showGrid, setShowGrid] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [geminiAnalysis, setGeminiAnalysis] = useState<any>(null);
  const [productImages, setProductImages] = useState<{ [key: string]: string }>({});

  // 🖼️ Fetch product image using SerpAPI
  const fetchProductImage = async (productName: string): Promise<string> => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/recommendations?query=${encodeURIComponent(productName)}`
      );
      const data = await res.json();
      if (data.results && data.results.length > 0 && data.results[0].image) {
        return data.results[0].image;
      }
      return "/placeholder.png";
    } catch (error) {
      console.error("❌ Error fetching product image:", error);
      return "/placeholder.png";
    }
  };

  // 🧾 Handle file upload
  const handleFileUpload = async (files: File[]) => {
    if (!files.length) return;

    const file = files[0];
    setUploadedFiles(files);
    setUploadProgress(0);
    setUploadStatus("uploading");
    setGeminiAnalysis(null);
    setProductImages({});

    const formData = new FormData();
    formData.append("file", file);

    try {
      const xhr = new XMLHttpRequest();

      xhr.open("POST", "http://127.0.0.1:8000/upload_catalog", true);

      // Track progress event
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        }
      };

      // On success
      xhr.onload = async () => {
        if (xhr.status === 200) {
          console.log("✅ Upload successful!");
          const response = JSON.parse(xhr.responseText);
          console.log("📊 Analysis response:", response);
          
          // Extract Gemini analysis result
          if (response.analysis?.status === "success") {
            const analysis = response.analysis.result;
            setGeminiAnalysis(analysis);
            
            // Fetch images for best product and alternatives
            const imagesToFetch: string[] = [analysis.best_product];
            if (analysis.alternatives && analysis.alternatives.length > 0) {
              imagesToFetch.push(...analysis.alternatives);
            }

            const imageMap: { [key: string]: string } = {};
            for (const productName of imagesToFetch) {
              const image = await fetchProductImage(productName);
              imageMap[productName] = image;
            }
            setProductImages(imageMap);
          }
          
          setUploadStatus("success");
        } else {
          console.error("❌ Upload failed:", xhr.responseText);
          setUploadStatus("error");
        }
      };

      // On error
      xhr.onerror = () => {
        console.error("❌ Upload error");
        setUploadStatus("error");
      };

      xhr.send(formData);
    } catch (err) {
      console.error("❌ Upload exception:", err);
      setUploadStatus("error");
    }
  };

  // 🔍 Fetch Amazon recommendations
  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setShowGrid(true);
    setGeminiAnalysis(null);
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/recommendations?query=${encodeURIComponent(input)}`
      );
      const data = await res.json();
      setProducts(data.results || []);
    } catch (error) {
      console.error("❌ Error fetching recommendations:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // 💬 AI Explanation
  const handleExplain = async (product: any, index: number) => {
    try {
      setProducts((prev) =>
        prev.map((p, i) =>
          i === index ? { ...p, explanation: "⏳ Generating AI explanation..." } : p
        )
      );

      const res = await fetch("http://127.0.0.1:8000/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });

      const data = await res.json();

      setProducts((prev) =>
        prev.map((p, i) =>
          i === index
            ? { ...p, explanation: data.explanation || "⚠️ No explanation received." }
            : p
        )
      );
    } catch (error) {
      console.error("❌ Error in handleExplain:", error);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <NavbarDemo />

      {/* Header */}
      <div className="pt-32 text-center space-y-4 px-4">
        <h1 className="text-5xl font-bold">AI Product Recommendations</h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Enter a product name to get top Amazon results, or upload your own
          product catalog for AI-based insights.
        </p>
      </div>

      {/* Search + Upload */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mt-10 flex flex-col items-center gap-8 px-6"
      >
        {/* Search Bar */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 w-full md:w-auto">
          <input
            type="text"
            placeholder="Try: wireless earbuds"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-3 w-full md:w-[500px] focus:outline-none focus:ring-2 focus:ring-black"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            className="px-8 py-3 rounded-lg bg-black text-white font-medium shadow-md hover:bg-neutral-800 transition"
          >
            {loading ? "Loading..." : "Search"}
          </motion.button>
        </div>

        {/* File Upload Box */}
        <div className="w-full max-w-4xl mx-auto border border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
          <FileUpload onChange={handleFileUpload} />

          {/* Upload Progress Section */}
          {uploadStatus !== "idle" && (
            <div className="mt-4 w-full max-w-lg mx-auto">
              <div className="flex justify-between text-sm mb-1">
                <span
                  className={`${
                    uploadStatus === "success"
                      ? "text-black-600"
                      : uploadStatus === "error"
                      ? "text-gray-600"
                      : "text-gray-600"
                  }`}
                >
                  {uploadStatus === "uploading"
                    ? `Uploading... ${uploadProgress}%`
                    : uploadStatus === "success"
                    ? " Upload Successful!"
                    : uploadStatus === "error"
                    ? " Upload failed. Try again."
                    : ""}
                </span>
                {uploadStatus === "uploading" && (
                  <span className="text-black">
                    {Math.max(0, 100 - uploadProgress)}% remaining
                  </span>
                )}
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className={`h-3 ${
                    uploadStatus === "success"
                      ? "bg-black"
                      : uploadStatus === "error"
                      ? "bg-gray-500"
                      : "bg-gray-500"
                  }`}
                  style={{ width: `${uploadProgress}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Gemini AI Analysis Section */}
      {geminiAnalysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-12 px-6 max-w-5xl mx-auto"
        >
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
            <h2 className="text-3xl font-bold text-center mb-8 text-black">
              LLM Recommendations
            </h2>

            {/* Best Product */}
            <div className="bg-white/40 backdrop-blur-md rounded-2xl p-8 mb-6 shadow-lg border border-white/30">
              {/* Product Image */}
              {productImages[geminiAnalysis.best_product] && (
                <div className="mb-6 flex justify-center">
                  <img
                    src={productImages[geminiAnalysis.best_product]}
                    alt={geminiAnalysis.best_product}
                    className="w-full max-w-md h-64 object-contain rounded-xl shadow-md"
                  />
                </div>
              )}
              
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wider mb-2">
                  Recommended Product
                </p>
                <h3 className="text-3xl font-bold text-black">
                  {geminiAnalysis.best_product}
                </h3>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Key Benefits</h4>
                {geminiAnalysis.reasoning.map((reason: string, index: number) => (
                  <div key={index} className="flex gap-4 items-start bg-white/50 p-4 rounded-xl border border-gray-200/50">
                    <span className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <p className="text-gray-800 leading-relaxed pt-1">{reason}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Alternatives */}
            {geminiAnalysis.alternatives && geminiAnalysis.alternatives.length > 0 && (
              <div className="bg-white/40 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-white/30">
                <h2 className="text-3xl font-bold text-center mb-8 text-black">
              Suggested Recommendations
            </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {geminiAnalysis.alternatives.map((alt: string, index: number) => (
                    <div
                      key={index}
                      className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/60 shadow-md hover:shadow-lg hover:bg-white/80 transition-all overflow-hidden"
                    >
                      {/* Alternative Product Image */}
                      {productImages[alt] && (
                        <div className="w-full h-40 bg-gray-50 flex items-center justify-center p-4">
                          <img
                            src={productImages[alt]}
                            alt={alt}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      )}
                      <div className="p-4 text-center">
                        <p className="text-black font-medium">
                           {alt}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Product Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showGrid ? 1 : 0 }}
        transition={{ duration: 0.8 }}
        className="mt-16 px-6 pb-24"
      >
        {loading ? (
          <p className="text-center text-gray-500 mt-20">Fetching products...</p>
        ) : products.length > 0 ? (
          <>
            <h2 className="text-3xl font-semibold text-center mb-8">
              Top Recommendations
            </h2>
            <BentoGrid className="max-w-6xl mx-auto">
              {products.map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleExplain(item, i)}
                  className="rounded-2xl shadow-md overflow-hidden border border-gray-200 bg-white transition-all hover:shadow-lg cursor-pointer"
                >
                  <BentoGridItem
                    title={`${item.title} (${item.price})`}
                    description={item.explanation || item.description}
                    header={
                      <div className="relative w-full h-48">
                        <img
                          src={item.image || "/placeholder.png"}
                          alt={item.title}
                          className="w-full h-48 object-cover rounded-t-2xl"
                        />
                        {item.explanation?.includes("⏳") && (
                          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center text-gray-700 font-medium">
                            ⏳ AI is analyzing this product...
                          </div>
                        )}
                      </div>
                    }
                    icon={<span>🛍️</span>}
                  />
                  <div className="flex flex-col items-center justify-center gap-2 p-4">
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline text-sm block text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View on Amazon
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </BentoGrid>
          </>
        ) : (
          !geminiAnalysis && (
            <p className="text-center text-gray-500 mt-20">
              Type a query or upload a catalog to get results.
            </p>
          )
        )}
      </motion.div>
    </div>
  );
}