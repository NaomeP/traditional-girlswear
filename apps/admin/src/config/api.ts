const configuredApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api/v1";

export const API_BASE_URL = configuredApiBaseUrl.replace(/\/$/, "");

export const ADMIN_PRODUCT_API =
  `${API_BASE_URL}/admin/products`;
