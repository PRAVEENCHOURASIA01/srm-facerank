"use client";
import { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/Navbar";
import { adminAPI } from "@/services/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  Shield,
  Ban,
  UserCheck,
  Users,
  Search,
} from "lucide-react";

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
  const [search, setSearch] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setCurrentUser(JSON.parse(stored));

    adminAPI
      .listUsers()
      .then((res) => setUsers(res.data))
      .catch(() => toast.error("Access denied"))
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
        prev.map((u) =>
          u.id === user.id ? { ...u, is_banned: !u.is_banned } : u
        )
      );
    } catch (err: any) {
      toast.error("Action failed");
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(
      (u) =>
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  if (!currentUser?.is_admin) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="pt-24 text-center py-20 text-gray-400">
          Access denied. Admin only.
        </div>
      </div>
    );
  }

  const totalUsers = users.length;
  const bannedUsers = users.filter((u) => u.is_banned).length;
  const admins = users.filter((u) => u.is_admin).length;

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-red-400" />
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Admin Dashboard
            </h1>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard title="Total Users" value={totalUsers} icon={<Users />} />
          <StatCard title="Admins" value={admins} icon={<Shield />} />
          <StatCard title="Banned" value={bannedUsers} icon={<Ban />} />
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by username or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-red-500 transition"
          />
        </div>

        {/* User Cards (Mobile Friendly) */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full" />
            </div>
          ) : (
            filteredUsers.map((user) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:border-red-500/40 transition"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-white">
                      @{user.username}
                    </span>

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

                  <p className="text-sm text-gray-500 mt-1 break-all">
                    {user.email}
                  </p>

                  <p className="text-xs text-gray-600 mt-1">
                    Joined {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>

                {!user.is_admin && (
                  <button
                    onClick={() => toggleBan(user)}
                    className={`w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      user.is_banned
                        ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                        : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                    }`}
                  >
                    {user.is_banned ? (
                      <div className="flex items-center justify-center gap-2">
                        <UserCheck className="w-4 h-4" />
                        Unban
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Ban className="w-4 h-4" />
                        Ban
                      </div>
                    )}
                  </button>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Stat Card ---------- */

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center justify-between hover:border-red-500/40 transition">
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide">
          {title}
        </p>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
      </div>
      <div className="text-red-400">{icon}</div>
    </div>
  );
}
