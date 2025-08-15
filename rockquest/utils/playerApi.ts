// utils/playerApi.ts
import { api, apiForm } from "./api"

// If you want a named instance for clarity:
export const playerApi = api

// ---- Rock Collection ----
export const getMyRocks = () => playerApi.get("/player/rocks").then(r => r.data)
export const addRockToCollection = (data: { rockId: string; imageUrl?: string }) =>
  playerApi.post("/player/add-rock", data).then(r => r.data)
export const deleteRockFromCollection = (rockId: string) =>
  playerApi.delete(`/player/delete-rock/${rockId}`).then(r => r.data)

// ---- Quests ----
export const getDailyQuests = () => playerApi.get("/player/daily-quests").then(r => r.data)

// ---- GPS/Location ----
export const getNearbyRocks = (lat: number, lng: number, radius: number = 0.01) =>
  playerApi.get("/player/gps-rocks", { params: { lat, lng, radius } }).then(r => r.data)

// ---- Achievements ----
export const getAchievements = () => playerApi.get("/player/achievements").then(r => r.data)

// ---- Rock Scanning (multipart) ----
export const scanRock = (imageFile: File | Blob, filename: string = "scan.jpg") => {
  const formData = new FormData()
  formData.append("file", imageFile, (imageFile as any)?.name || filename)
  return apiForm.post("/player/scan-rock", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then(r => r.data)
}

// React Native (URI)
export const scanRockFromUri = (imageUri: string, filename: string = "scan.jpg") => {
  const formData = new FormData()
  formData.append("file", { uri: imageUri, type: "image/jpeg", name: filename } as any)
  return apiForm.post("/player/scan-rock", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then(r => r.data)
}

// ---- Extras you already had ----
export interface ScanStatsDay { date: string; count: number; byType?: Record<string, number> }
export interface ScanStatsResponse { day: ScanStatsDay; total: number }
export const getScanStats = (dateKey?: string) =>
  playerApi.get<ScanStatsResponse>("/player/scan-stats", { params: { date: dateKey } }).then(r => r.data)

export interface QuestsSummary {
  today?: { date: string; title: string; description?: string };
  upcoming: { date: string; title: string }[];
}
export const getQuestsSummary = () =>
  playerApi.get<QuestsSummary>("/player/quests-summary").then(r => r.data)
