// src/api/lessonApi.js
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_V1_URL ||
  import.meta.env.VITE_API_URL ||
  "/";


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
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
export const adminGetLessons = async ({ page = 1, perPage = 15, q = '', status = '' } = {}) => {
  const res = await api.get('/admin/lessons', { params: { page, per_page: perPage, q, status } });
  return res.data;
};

export const adminGetLesson = async (id) => {
  const res = await api.get(`/admin/lessons/${id}`);
  return res.data;
};

export const adminApproveLesson = async (id) => {
  const res = await api.post(`/admin/lessons/${id}/approve`);
  return res.data;
};

export const adminRejectLesson = async (id, payload = {}) => {
  const res = await api.post(`/admin/lessons/${id}/reject`, payload);
  return res.data;
};

export const adminDeleteLesson = async (id) => {
  const res = await api.delete(`/admin/lessons/${id}`);
  return res.data;
};
export default api;
