import { api } from "./api" 


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