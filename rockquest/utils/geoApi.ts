import { api } from "@/utils/userApi"

/** ---- Types (mirror your FastAPI models) ---- */
export type AddFactPayload = {
  factId: string
  title: string
  description: string
}

export type UpdateFactPayload = Partial<{
  title: string
  description: string
}>

export type PostVerificationRequest = {
  action: "approve" | "reject"
  reason?: string
}

export type ReportItem = {
  reportId: string
  postId: string
  reason: string
  reportedBy: string
  reportedAt: any
  status: "pending" | "approve" | "reject"
  post?: Record<string, any> | null
}

/** ---- FACT MANAGEMENT ---- */
export async function addFact(payload: AddFactPayload) {
  const { data } = await api.post("/geologist/add-fact", payload)
  return data as { message: string }
}

export async function editFact(factId: string, payload: UpdateFactPayload) {
  const { data } = await api.put(`/geologist/edit-fact/${encodeURIComponent(factId)}`, payload)
  return data as { message: string }
}

export async function deleteFact(factId: string) {
  const { data } = await api.delete(`/geologist/delete-fact/${encodeURIComponent(factId)}`)
  return data as { message: string }
}

/** ---- ROCK VERIFICATION ---- */
export async function reviewPendingRocks() {
  const { data } = await api.get("/geologist/review")
  // returns array of posts pending verification
  return data as Array<Record<string, any>>
}

export async function verifyRock(postId: string, body: PostVerificationRequest) {
  const { data } = await api.post(
    `/geologist/verify-rock/${encodeURIComponent(postId)}`,
    body
  )
  return data as { message: string }
}

/** ---- REPORTS ---- */
export async function getReportsByStatus(status: "pending" | "approve" | "reject" = "pending") {
  const { data } = await api.get("/geologist/reports", { params: { status } })
  // returns array of reports
  return data as Array<Record<string, any>>
}

export async function listReportedPosts(status: "pending"|"approve"|"reject" = "pending") {
  const { data } = await api.get("/geologist/reported", { params: { status } })
  return data
}

export async function decideReport(reportId: string, action: "approve"|"reject") {
  const { data } = await api.post(`/geologist/reports/${encodeURIComponent(reportId)}/decision`, { action })
  return data
}
