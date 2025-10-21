// src/api/lessonApi.js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "/",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token interceptor if your admin panel uses one
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token"); // adapt to your auth storage
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getLessons = async ({ page = 1, perPage = 10, q = "", status = "" } = {}) => {
  const params = { page, per_page: perPage };
  if (q) params.q = q;
  if (status) params.status = status;
  const res = await api.get("/api/admin/lessons", { params });
  return res.data; // expect { data: [...], meta: { total, current_page, last_page } }
};

export const getLesson = async (id) => {
  const res = await api.get(`/api/admin/lessons/${id}`);
  return res.data; // expect { data: {...} }
};

export const approveLesson = async (id, payload = {}) => {
  const res = await api.post(`/api/admin/lessons/${id}/approve`, payload);
  return res.data;
};

export const rejectLesson = async (id, payload = {}) => {
  const res = await api.post(`/api/admin/lessons/${id}/reject`, payload);
  return res.data;
};

export const deleteLesson = async (id) => {
  const res = await api.delete(`/api/admin/lessons/${id}`);
  return res.data;
};

export default api;
