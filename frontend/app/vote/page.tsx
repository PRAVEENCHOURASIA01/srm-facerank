"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { photosAPI, voteAPI } from "@/services/api";
import toast from "react-hot-toast";
import { ThumbsUp, RefreshCw } from "lucide-react";

interface Photo {
  id: number;
  image_url: string;
  elo_rating: number;
  wins: number;
  losses: number;
  total_votes: number;
  uploader_username: string;
}

interface PhotoPair {
  photo_a: Photo;
  photo_b: Photo;
}

export default function VotePage() {
  const [pair, setPair] = useState<PhotoPair | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [chosen, setChosen] = useState<"a" | "b" | null>(null);
  const [totalVotes, setTotalVotes] = useState(0);

  const fetchPair = useCallback(async () => {
    setLoading(true);
    setChosen(null);
    try {
      const res = await photosAPI.getRandomPair();
      setPair(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Could not load photos");
      setPair(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPair();
  }, [fetchPair]);

  const vote = async (winner: Photo, loser: Photo, side: "a" | "b") => {
    if (voting || chosen) return;
    setVoting(true);
    setChosen(side);

    try {
      await voteAPI.cast(winner.id, loser.id);
      setTotalVotes((v) => v + 1);
      toast.success("Vote cast! 🔥");
      setTimeout(fetchPair, 700);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Vote failed");
      setChosen(null);
    } finally {
      setVoting(false);
    }
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-gray-950 via-gray-900 to-black overflow-hidden">
      <Navbar />

      {/* Background Glow */}
      <div className="absolute w-[600px] h-[600px] bg-pink-500/10 blur-3xl rounded-full -top-40 -left-40" />
      <div className="absolute w-[500px] h-[500px] bg-purple-600/10 blur-3xl rounded-full bottom-0 right-0" />

      <div className="relative pt-24 pb-16 px-4 max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            Who’s{" "}
            <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              hotter?
            </span>
          </h1>
          <p className="text-gray-400 mt-2">
            Votes this session:{" "}
            <span className="text-pink-400 font-bold">{totalVotes}</span>
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full" />
          </div>
        ) : !pair ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-4">
              Not enough photos yet. Be the first to upload!
            </p>
            <a
              href="/upload"
              className="inline-block bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all"
            >
              Upload a Photo
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-10">
            {[
              { photo: pair.photo_a, side: "a" as const },
              { photo: pair.photo_b, side: "b" as const },
            ].map(({ photo, side }) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  scale:
                    chosen && chosen !== side
                      ? 0.92
                      : chosen === side
                      ? 1.05
                      : 1,
                }}
                transition={{ duration: 0.3 }}
                className="relative group cursor-pointer"
                onClick={() => {
                  const other =
                    side === "a" ? pair.photo_b : pair.photo_a;
                  vote(photo, other, side);
                }}
              >
                <div
                  className={`relative rounded-3xl overflow-hidden border transition-all duration-300 backdrop-blur-md ${
                    chosen === side
                      ? "border-pink-500 shadow-2xl shadow-pink-500/30"
                      : chosen && chosen !== side
                      ? "border-gray-800 opacity-50"
                      : "border-gray-800 hover:border-pink-500/50"
                  }`}
                >
                  <div className="aspect-[3/4] relative">
                    <Image
                      src={photo.image_url}
                      alt="Candidate photo"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 400px"
                    />

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                      <div className="flex items-center gap-2 text-white font-bold text-lg">
                        <ThumbsUp className="w-6 h-6" />
                        Vote
                      </div>
                    </div>

                    {/* Winner Badge */}
                    {chosen === side && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-4 right-4 bg-pink-500 rounded-full p-3 shadow-lg"
                      >
                        <ThumbsUp className="w-6 h-6 text-white" />
                      </motion.div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="p-4 bg-gray-900/80 backdrop-blur-sm">
                    <p className="text-sm text-gray-400 truncate">
                      @{photo.uploader_username}
                    </p>

                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>⚡ {Math.round(photo.elo_rating)}</span>
                      <span className="text-green-400">
                        {photo.wins}W
                      </span>
                      <span className="text-red-400">
                        {photo.losses}L
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {pair && (
          <div className="flex justify-center mt-10">
            <button
              onClick={fetchPair}
              disabled={loading || voting}
              className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm font-medium transition-all hover:scale-105 disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4" />
              Skip
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
