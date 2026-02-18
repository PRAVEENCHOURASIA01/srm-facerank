"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    const timer = setTimeout(() => {
      if (token) {
        router.replace("/vote");
      } else {
        router.replace("/login");
      }
    }, 1200); // short branded splash delay

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <Flame className="w-10 h-10 text-pink-500 animate-pulse" />
          <h1 className="text-4xl font-black bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            FaceRank
          </h1>
        </div>

        {/* Tagline */}
        <p className="text-gray-400 mb-6 text-sm tracking-wide">
          Vote. Rank. Dominate.
        </p>

        {/* Premium Loader */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-10 h-10 border-4 border-pink-500/30 rounded-full" />
            <div className="absolute inset-0 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
