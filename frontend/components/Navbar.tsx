"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Flame, Trophy, Upload, LogOut, Shield } from "lucide-react";

interface User {
  id: number;
  username: string;
  is_admin: boolean;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, [pathname]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!user) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/vote" className="flex items-center gap-2 font-bold text-xl">
          <Flame className="text-pink-500 w-6 h-6" />
          <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            SRM FaceRank
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/vote"
            className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors ${
              pathname === "/vote"
                ? "bg-pink-500/20 text-pink-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Flame className="w-4 h-4" />
            Vote
          </Link>
          <Link
            href="/leaderboard"
            className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors ${
              pathname === "/leaderboard"
                ? "bg-yellow-500/20 text-yellow-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Trophy className="w-4 h-4" />
            Leaderboard
          </Link>
          <Link
            href="/upload"
            className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors ${
              pathname === "/upload"
                ? "bg-blue-500/20 text-blue-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload
          </Link>
          {user.is_admin && (
            <Link
              href="/admin"
              className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors ${
                pathname === "/admin"
                  ? "bg-red-500/20 text-red-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Shield className="w-4 h-4" />
              Admin
            </Link>
          )}

          <div className="flex items-center gap-2 ml-2 pl-4 border-l border-gray-700">
            <span className="text-sm text-gray-400">@{user.username}</span>
            <button
              onClick={logout}
              className="text-gray-500 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}