"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { leaderboardAPI } from "@/services/api";
import { motion } from "framer-motion";
import { Trophy, Medal } from "lucide-react";

interface Entry {
  rank: number;
  id: number;
  image_url: string;
  elo_rating: number;
  wins: number;
  losses: number;
  total_votes: number;
  uploader_username: string;
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    leaderboardAPI
      .get(50)
      .then((res) => setEntries(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const rankColor = (rank: number) => {
    if (rank === 1) return "text-yellow-400";
    if (rank === 2) return "text-gray-300";
    if (rank === 3) return "text-amber-600";
    return "text-gray-500";
  };

  const rankBadge = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="pt-20 pb-12 px-4 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <h1 className="text-3xl font-black text-white">Leaderboard</h1>
          </div>
          <p className="text-gray-500">Ranked by ELO rating</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No photos ranked yet. Start voting!
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                  entry.rank <= 3
                    ? "bg-gray-900 border-yellow-500/20"
                    : "bg-gray-900/50 border-gray-800"
                }`}
              >
                <div className={`text-xl font-black w-10 text-center ${rankColor(entry.rank)}`}>
                  {rankBadge(entry.rank)}
                </div>

                <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                  <Image
                    src={entry.image_url}
                    alt="Ranked photo"
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white">@{entry.uploader_username}</p>
                  <div className="flex gap-3 text-xs text-gray-500 mt-0.5">
                    <span>⚡ {Math.round(entry.elo_rating)} ELO</span>
                    <span className="text-green-400">✅ {entry.wins}W</span>
                    <span className="text-red-400">❌ {entry.losses}L</span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="text-2xl font-black text-white">
                    {Math.round(entry.elo_rating)}
                  </div>
                  <div className="text-xs text-gray-500">{entry.total_votes} votes</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}