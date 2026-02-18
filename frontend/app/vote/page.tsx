"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { photosAPI, voteAPI } from "@/services/api";
import toast from "react-hot-toast";
import { ThumbsUp, ThumbsDown, RefreshCw } from "lucide-react";

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
      const msg = err.response?.data?.detail || "Could not load photos";
      toast.error(msg);
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
      setTimeout(fetchPair, 800);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Vote failed");
      setChosen(null);
    } finally {
      setVoting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="pt-20 pb-8 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white">
            Who's{" "}
            <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              hotter?
            </span>
          </h1>
          <p className="text-gray-500 mt-1">
            Votes cast this session: <span className="text-pink-400 font-bold">{totalVotes}</span>
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
              className="inline-block bg-pink-500 hover:bg-pink-600 px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Upload a Photo
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:gap-8">
            {[
              { photo: pair.photo_a, side: "a" as const },
              { photo: pair.photo_b, side: "b" as const },
            ].map(({ photo, side }) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{
                  opacity: 1,
                  scale: chosen && chosen !== side ? 0.9 : 1,
                }}
                transition={{ duration: 0.3 }}
                className="relative group cursor-pointer"
                onClick={() => {
                  const other = side === "a" ? pair.photo_b : pair.photo_a;
                  vote(photo, other, side);
                }}
              >
                <div
                  className={`relative rounded-2xl overflow-hidden border-4 transition-all duration-300 ${
                    chosen === side
                      ? "border-pink-500 shadow-lg shadow-pink-500/30"
                      : chosen && chosen !== side
                      ? "border-gray-800 opacity-60"
                      : "border-gray-800 group-hover:border-pink-500/50"
                  }`}
                >
                  <div className="aspect-[3/4] relative">
                    <Image
                      src={photo.image_url}
                      alt="Candidate photo"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 400px"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <div className="flex items-center gap-2 text-white font-bold text-lg">
                        <ThumbsUp className="w-6 h-6" />
                        Vote
                      </div>
                    </div>

                    {/* Winner checkmark */}
                    {chosen === side && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-4 right-4 bg-pink-500 rounded-full p-2"
                      >
                        <ThumbsUp className="w-6 h-6 text-white" />
                      </motion.div>
                    )}
                  </div>

                  <div className="p-3 bg-gray-900">
                    <p className="text-sm text-gray-400">@{photo.uploader_username}</p>
                    <div className="flex gap-3 text-xs text-gray-500 mt-1">
                      <span>⚡ {Math.round(photo.elo_rating)}</span>
                      <span>✅ {photo.wins}W</span>
                      <span>❌ {photo.losses}L</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {pair && (
          <div className="flex justify-center mt-6 gap-4">
            <button
              onClick={fetchPair}
              disabled={loading || voting}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
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