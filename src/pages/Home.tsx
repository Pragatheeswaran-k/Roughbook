// Hero.tsx
import { motion } from "motion/react";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <div className="min-h-screen relative bg-gradient-to-br from-[#0f0f0f] via-[#111827] to-[#1e1e2f] px-6 py-20 text-white overflow-hidden">
      {/* Animated Background Blobs */}
      <motion.div
        className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-purple-600 rounded-full opacity-20 blur-3xl z-0"
        animate={{ x: [0, 50, 0], y: [0, 50, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute bottom-[-120px] right-[-120px] w-[300px] h-[300px] bg-yellow-400 rounded-full opacity-20 blur-3xl z-0"
        animate={{ x: [0, -40, 0], y: [0, -40, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 max-w-7xl mx-auto">
        {/* Left: Headline */}
        <div className="max-w-2xl text-center md:text-left">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-extrabold leading-tight mb-6"
          >
            Turn Your Code Ideas Into a <br />
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(146deg, rgb(255, 255, 255) 32%, rgb(126, 111, 240) 57%, rgb(255, 204, 109) 90.38%)",
              }}
            >
              Living Notebook
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-gray-400 text-lg mb-8"
          >
            Save snippets, document logic, and experiment freely — all in one dev-friendly space.
          </motion.p>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <Link
              to="/index-page"
              className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-lg rounded-xl shadow-lg transition"
            >
              ✏️ Start Writing Now
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}