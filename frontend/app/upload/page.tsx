"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { photosAPI } from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Upload, Trash2, Image as ImageIcon, X } from "lucide-react";

interface Photo {
  id: number;
  image_url: string;
  elo_rating: number;
  wins: number;
  losses: number;
  total_votes: number;
}

export default function UploadPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMyPhotos = async () => {
    try {
      const res = await photosAPI.myPhotos();
      setPhotos(res.data);
    } catch {
      toast.error("Failed to load your photos");
    } finally {
      setLoadingPhotos(false);
    }
  };

  useEffect(() => {
    fetchMyPhotos();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB");
      return;
    }
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      await photosAPI.upload(formData);
      toast.success("Photo uploaded! 🎉");
      setPreview(null);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchMyPhotos();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this photo?")) return;
    try {
      await photosAPI.delete(id);
      toast.success("Photo deleted");
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="pt-20 pb-12 px-4 max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-white mb-8">
          Upload{" "}
          <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            Your Photo
          </span>
        </h1>

        {/* Upload area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
            preview
              ? "border-pink-500/50 bg-pink-500/5"
              : "border-gray-700 hover:border-pink-500/50 bg-gray-900/50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {preview ? (
            <div className="space-y-4">
              <div className="relative w-48 h-48 mx-auto rounded-xl overflow-hidden">
                <Image src={preview} alt="Preview" fill className="object-cover" />
              </div>
              <p className="text-sm text-gray-400">{selectedFile?.name}</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreview(null);
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm flex items-center gap-2"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpload();
                  }}
                  disabled={uploading}
                  className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all"
                >
                  <Upload className="w-4 h-4" />
                  {uploading ? "Uploading..." : "Upload Photo"}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <ImageIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 font-medium">Click to select a photo</p>
              <p className="text-gray-600 text-sm mt-1">JPG, PNG, WebP — max 10MB</p>
            </div>
          )}
        </div>

        {/* My photos */}
        <div className="mt-10">
          <h2 className="text-xl font-bold text-white mb-4">
            My Photos ({photos.length})
          </h2>
          {loadingPhotos ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full" />
            </div>
          ) : photos.length === 0 ? (
            <p className="text-gray-500 text-center py-10">
              You haven't uploaded any photos yet.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <AnimatePresence>
                {photos.map((photo) => (
                  <motion.div
                    key={photo.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative group rounded-xl overflow-hidden bg-gray-900 border border-gray-800"
                  >
                    <div className="aspect-square relative">
                      <Image
                        src={photo.image_url}
                        alt="My photo"
                        fill
                        className="object-cover"
                        sizes="200px"
                      />
                    </div>
                    <div className="p-2">
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>⚡ {Math.round(photo.elo_rating)}</span>
                        <span>{photo.wins}W / {photo.losses}L</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(photo.id)}
                      className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-white" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}