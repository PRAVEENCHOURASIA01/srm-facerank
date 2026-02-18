"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import toast from "react-hot-toast";
import { authAPI } from "@/services/api";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      const { access_token } = res.data;
      localStorage.setItem("token", access_token);

      // Fetch user info
      const { default: api } = await import("@/services/api");
      api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
      const meRes = await authAPI.me();
      localStorage.setItem("user", JSON.stringify(meRes.data));

      toast.success("Welcome back!");
      router.push("/vote");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Flame className="w-10 h-10 text-pink-500" />
            <h1 className="text-4xl font-black bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              FaceRank
            </h1>
          </div>
          <p className="text-gray-400">SRM Campus Photo Rankings</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-6">Sign In</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Username</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-pink-500 transition-colors"
                placeholder="your_username"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-pink-500 transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 font-semibold py-3 rounded-xl transition-all"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
          <p className="text-center text-gray-500 text-sm mt-6">
            No account?{" "}
            <Link href="/register" className="text-pink-400 hover:text-pink-300">
              Register here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}