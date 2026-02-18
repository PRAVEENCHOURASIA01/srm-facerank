"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { leaderboardAPI } from "@/services/api";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";

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

  const topThree = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <h1 className="text-3xl sm:text-4xl font-black text-white">
              Leaderboard
            </h1>
          </div>
          <p className="text-gray-500 text-sm sm:text-base">
            Ranked by ELO rating
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-24 text-gray-500">
            No photos ranked yet. Start voting!
          </div>
        ) : (
          <>
            {/* ================= TOP 3 SECTION ================= */}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
              {topThree.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15 }}
                  className="relative bg-gradient-to-br from-gray-900 to-gray-800 border border-yellow-500/20 rounded-3xl p-6 text-center hover:scale-105 transition-transform"
                >
                  {/* Medal */}
                  <div className="text-4xl mb-3">
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                  </div>

                  {/* Image */}
                  <div className="relative w-28 h-36 mx-auto rounded-2xl overflow-hidden mb-4 shadow-lg">
                    <Image
                      src={entry.image_url}
                      alt="Top ranked"
                      fill
                      className="object-cover"
                    />
                  </div>

                  <p className="font-semibold text-white text-lg">
                    @{entry.uploader_username}
                  </p>

                  <div className="mt-2 text-yellow-400 font-black text-xl">
                    {Math.round(entry.elo_rating)} ELO
                  </div>

                  <div className="flex justify-center gap-3 mt-2 text-xs text-gray-400">
                    <span>✅ {entry.wins}</span>
                    <span>❌ {entry.losses}</span>
                    <span>🗳 {entry.total_votes}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* ================= REST OF LIST ================= */}

            <div className="space-y-3">
              {rest.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="bg-gray-900 border border-gray-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:border-pink-500/40 transition"
                >
                  {/* Rank */}
                  <div className="text-lg font-bold text-gray-400 w-12 text-center">
                    #{entry.rank}
                  </div>

                  {/* Image */}
                  <div className="relative w-16 h-20 rounded-xl overflow-hidden flex-shrink-0">
                    <Image
                      src={entry.image_url}
                      alt="Ranked photo"
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">
                      @{entry.uploader_username}
                    </p>

                    <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-1">
                      <span>⚡ {Math.round(entry.elo_rating)} ELO</span>
                      <span className="text-green-400">
                        ✅ {entry.wins}W
                      </span>
                      <span className="text-red-400">
                        ❌ {entry.losses}L
                      </span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <div className="text-xl font-black text-white">
                      {Math.round(entry.elo_rating)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {entry.total_votes} votes
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
