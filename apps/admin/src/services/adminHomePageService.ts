import { API_BASE_URL } from "../config/api";

export type HomePageContent = any;

async function request(path: string, options?: RequestInit): Promise<HomePageContent> {
  const response = await fetch(`${API_BASE_URL}/admin/homepage${path}`, { credentials: "include", ...options });
  const result = await response.json().catch(() => null) as { success?: boolean; data?: HomePageContent; message?: string } | null;
  if (!response.ok || !result?.success) throw new Error(result?.message || "Could not update homepage content");
  return result.data;
}
export const getAdminHomePageContent = () => request("/");
export const updateAdminHomePageContent = (content: HomePageContent) => request("/", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content }) });
