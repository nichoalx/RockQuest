import { api } from "@/utils/userApi"

export const getBadges = () => api.get("/badges").then(r => r.data)

// local static image map
export const badgeImages = {
  Scan1: require("@/assets/images/badges/Scan1.png"),
  Scan2: require("@/assets/images/badges/Scan2.png"),
  Scan3: require("@/assets/images/badges/Scan3.png"),
  Post1: require("@/assets/images/badges/Post1.png"),
  Post2: require("@/assets/images/badges/Post2.png"),
  Post3: require("@/assets/images/badges/Post3.png"),
} as const