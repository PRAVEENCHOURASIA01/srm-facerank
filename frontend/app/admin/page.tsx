"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { adminAPI } from "@/services/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Shield, Ban, UserCheck } from "lucide-react";

interface User {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  is_banned: boolean;
  created_at: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setCurrentUser(JSON.parse(stored));

    adminAPI
      .listUsers()
      .then((res) => setUsers(res.data))
      .catch(() => toast.error("Access denied or error loading users"))
      .finally(() => setLoading(false));
  }, []);

  const toggleBan = async (user: User) => {
    try {
      if (user.is_banned) {
        await adminAPI.unbanUser(user.id);
        toast.success(`@${user.username} unbanned`);
      } else {
        await adminAPI.banUser(user.id);
        toast.success(`@${user.username} banned`);
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_banned: !u.is_banned } : u))
      );
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Action failed");
    }
  };

  if (!currentUser?.is_admin) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="pt-20 text-center py-20 text-gray-400">
          Access denied. Admin only.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="pt-20 pb-12 px-4 max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-red-400" />
          <h1 className="text-3xl font-black text-white">Admin Panel</h1>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-gray-800">
            <h2 className="font-bold text-lg">Users ({users.length})</h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {users.map((user) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">@{user.username}</span>
                      {user.is_admin && (
                        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
                          admin
                        </span>
                      )}
                      {user.is_banned && (
                        <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">
                          banned
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <p className="text-xs text-gray-600">
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {!user.is_admin && (
                    <button
                      onClick={() => toggleBan(user)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        user.is_banned
                          ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                          : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                      }`}
                    >
                      {user.is_banned ? (
                        <>
                          <UserCheck className="w-4 h-4" /> Unban
                        </>
                      ) : (
                        <>
                          <Ban className="w-4 h-4" /> Ban
                        </>
                      )}
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}