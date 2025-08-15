import axios, { AxiosHeaders } from "axios"
import Constants from "expo-constants"
import { Platform } from "react-native"
import { FIREBASE_AUTH } from "./firebase"

const getDevBaseUrl = () => {
  // Try to infer your dev machine's IP from Expo
  const host =
    // SDK 50+:
    (Constants?.expoConfig as any)?.hostUri?.split(":")?.[0] ||
    // older manifests:
    (Constants as any)?.manifest?.debuggerHost?.split(":")?.[0]

  if (host) return `http://${host}:8000`

  // Fallbacks
  if (Platform.OS === "android") return "http://10.0.2.2:8000"
  return "http://localhost:8000"
}

const BASE_URL = __DEV__ ? getDevBaseUrl() : "https://your-prod-domain"

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
})

api.interceptors.request.use(async (config) => {
  if (!config.headers) config.headers = new AxiosHeaders()
  const user = FIREBASE_AUTH.currentUser
  if (user) {
    const token = await user.getIdToken()
    ;(config.headers as AxiosHeaders).set("Authorization", `Bearer ${token}`)
  }
  ;(config.headers as AxiosHeaders).set("Content-Type", "application/json")
  ;(config.headers as AxiosHeaders).set("Accept", "application/json")
  return config
})

// ---- Endpoints ----
export const getProfile = () => api.get("/profile").then(r => r.data)
export const updateProfile = (data: Partial<{
  username: string
  type: string
  description: string
  dob: string
  avatarId: number
  isActive: boolean
  email: string
}>) => api.put("/update-profile", data).then(r => r.data)

export const completeProfile = (data: {
  username: string
  type: string
  description?: string
  dob?: string
  avatarId?: number
  emailAddress?: string
}) => api.post("/complete-profile", data).then(r => r.data)

export const getMyPosts = () => api.get("/my-posts").then(r => r.data)
export const getAllPosts = () => api.get("/all-posts").then(r => r.data)
export const addPost = (data: Record<string, any>) => api.post("/add-post", data).then(r => r.data)
export const editPost = (postId: string, data: Record<string, any>) =>
  api.put(`/edit-post/${postId}`, data).then(r => r.data)
export const deletePost = (postId: string) =>
  api.delete(`/delete-post/${postId}`).then(r => r.data)
export const getFacts = () => api.get("/facts").then(r => r.data)
export const getAnnouncements = () => api.get("/announcements").then(r => r.data)

// Fixed reportPost function to match your backend API (query parameters)
export const reportPost = (postId: string, reason: string) =>
  api.post("/report-post", {}, { params: { post_id: postId, reason } }).then(r => r.data)

export const deleteAccount = () => api.delete("/delete-account").then(r => r.data)