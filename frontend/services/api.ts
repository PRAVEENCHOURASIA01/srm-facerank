import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ---- Auth ----
export const authAPI = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post("/auth/register", data),
  login: (data: { username: string; password: string }) =>
    api.post("/auth/login", data),
  me: () => api.get("/auth/me"),
};

// ---- Photos ----
export const photosAPI = {
  upload: (formData: FormData) =>
    api.post("/photos/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id: number) => api.delete(`/photos/${id}`),
  getRandomPair: () => api.get("/photos/random-pair"),
  myPhotos: () => api.get("/photos/my"),
};

// ---- Vote ----
export const voteAPI = {
  cast: (winner_photo_id: number, loser_photo_id: number) =>
    api.post("/vote", { winner_photo_id, loser_photo_id }),
};

// ---- Leaderboard ----
export const leaderboardAPI = {
  get: (limit = 20, offset = 0) =>
    api.get(`/leaderboard?limit=${limit}&offset=${offset}`),
};

// ---- Admin ----
export const adminAPI = {
  deletePhoto: (id: number) => api.delete(`/admin/photo/${id}`),
  banUser: (id: number) => api.post(`/admin/ban-user/${id}`),
  unbanUser: (id: number) => api.post(`/admin/unban-user/${id}`),
  listUsers: () => api.get("/admin/users"),
};

export default api;