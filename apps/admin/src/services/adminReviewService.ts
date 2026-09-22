import { API_BASE_URL } from "../config/api";

export type AdminReview = { id: string; rating: number; comment: string; guestName: string; status: "PENDING" | "APPROVED" | "HIDDEN"; createdAt: string; product: { name: string; slug: string } };

async function request(path: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE_URL}/admin/reviews${path}`, { credentials: "include", ...options });
  const result = await response.json();
  if (!response.ok || !result.success) throw new Error(result.message || "Review request failed");
  return result;
}

export async function getAdminReviews(): Promise<AdminReview[]> {
  return (await request("/")).data;
}

export async function setAdminReviewStatus(id: string, status: AdminReview["status"]): Promise<AdminReview> {
  return (await request(`/${id}/status`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) })).data;
}

export async function deleteAdminReview(id: string): Promise<void> {
  await request(`/${id}`, { method: "DELETE" });
}
