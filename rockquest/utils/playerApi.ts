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

export const playerApi = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // Increased for file uploads
})

playerApi.interceptors.request.use(async (config) => {
  if (!config.headers) config.headers = new AxiosHeaders()
  const user = FIREBASE_AUTH.currentUser
  if (user) {
    const token = await user.getIdToken()
    ;(config.headers as AxiosHeaders).set("Authorization", `Bearer ${token}`)
  }
  
  // Don't set Content-Type for FormData (multipart uploads)
  if (!(config.data instanceof FormData)) {
    ;(config.headers as AxiosHeaders).set("Content-Type", "application/json")
  }
  
  ;(config.headers as AxiosHeaders).set("Accept", "application/json")
  return config
})


// ---- Rock Collection Endpoints ----
export const getMyRocks = () => 
  playerApi.get("/player/rocks").then(r => r.data)

export const addRockToCollection = (data: { rockId: string; imageUrl?: string }) =>
  playerApi.post("/player/add-rock", data).then(r => r.data)

export const deleteRockFromCollection = (rockId: string) =>
  playerApi.delete(`/player/delete-rock/${rockId}`).then(r => r.data)

// ---- Quest Endpoints ----
export const getDailyQuests = () =>
  playerApi.get("/player/daily-quests").then(r => r.data)

// ---- GPS/Location Endpoints ----
export const getNearbyRocks = (lat: number, lng: number, radius: number = 0.01) =>
  playerApi.get("/player/gps-rocks", { 
    params: { lat, lng, radius } 
  }).then(r => r.data)

// ---- Achievement Endpoints ----
export const getAchievements = () =>
  playerApi.get("/player/achievements").then(r => r.data)

// ---- Rock Scanning Endpoints ----
export const scanRock = (imageFile: File | Blob, filename: string = "scan.jpg") => {
  const formData = new FormData()
  formData.append("file", imageFile, filename)
  
  return playerApi.post("/player/scan-rock", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: 60000, // Extended timeout for AI processing
  }).then(r => r.data)
}

// For React Native with image picker
export const scanRockFromUri = (imageUri: string, filename: string = "scan.jpg") => {
  const formData = new FormData()
  formData.append("file", {
    uri: imageUri,
    type: "image/jpeg",
    name: filename,
  } as any)
  
  return playerApi.post("/player/scan-rock", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: 60000,
  }).then(r => r.data)
}

// ---- Type Definitions for TypeScript ----
export interface Rock {
  id: string
  rockName: string
  imageUrl?: string
  savedAt?: string
  lat?: number
  lng?: number
}

export interface DailyQuest {
  questId: string
  title: string
  description?: string
  completed: boolean
  reward?: number
}

export interface Achievement {
  achievementId: string
  title: string
  description?: string
  type: string
  milestone: number
  unlockedAt?: string
}

export interface ScanResult {
  predictedType: "igneous" | "sedimentary" | "metamorphic"
  rawLabel: string
  classId: number | null
  confidenceScore: number
  workflowResult?: any
}

export interface DailyQuestResponse {
  date: string
  dailyQuests: DailyQuest[]
}

export interface RockCollectionResponse {
  rocks: Rock[]
}

export interface AchievementResponse {
  earnedAchievements: Achievement[]
}

export interface ScanStatsDay {
  date: string;
  count: number;
  byType?: Record<string, number>;
}

export interface ScanStatsResponse {
  day: ScanStatsDay;  
  total: number;       
}

export const getScanStats = (dateKey?: string) =>
  playerApi
    .get<ScanStatsResponse>("/player/scan-stats", { params: { date: dateKey } })
    .then(r => r.data);

export interface QuestsSummary {
  today?: { date: string; title: string; description?: string };
  upcoming: { date: string; title: string }[];
}

export const getQuestsSummary = () =>
  playerApi.get<QuestsSummary>("/player/quests-summary").then(r => r.data);