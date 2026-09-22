const configuredApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api/v1";

// Remove a trailing slash so every endpoint below has exactly one separator.
export const API_BASE_URL = configuredApiBaseUrl.replace(/\/$/, "");

export const API_ENDPOINTS = {
  products: `${API_BASE_URL}/products`,

  productBySlug: (slug: string) =>
    `${API_BASE_URL}/products/${slug}`,

  orders: `${API_BASE_URL}/orders`,

  applyCoupon: `${API_BASE_URL}/orders/apply-coupon`,

  paymentsCreate: (orderId: string) =>
    `${API_BASE_URL}/payments/create/${orderId}`,

  paymentsVerify: `${API_BASE_URL}/payments/verify`,

  paymentsAbandon: (orderId: string) =>
    `${API_BASE_URL}/payments/abandon/${orderId}`,

  returns: `${API_BASE_URL}/returns`,

  returnById: (id: string) =>
    `${API_BASE_URL}/returns/${id}`,

  cancelReturn: (id: string) =>
    `${API_BASE_URL}/returns/${id}/cancel`,
};
