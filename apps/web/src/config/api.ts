export const API_BASE_URL =
  "https://traditional-girlswear-api.onrender.com/api/v1";

export const API_ENDPOINTS = {
  products: `${API_BASE_URL}/products`,

  productBySlug: (slug: string) =>
    `${API_BASE_URL}/products/${slug}`,

  orders: `${API_BASE_URL}/orders`,

  applyCoupon: `${API_BASE_URL}/orders/apply-coupon`,

  paymentsCreate: (orderId: string) =>
    `${API_BASE_URL}/payments/create/${orderId}`,

  paymentsVerify: `${API_BASE_URL}/payments/verify`,

  returns: `${API_BASE_URL}/returns`,

  returnById: (id: string) =>
    `${API_BASE_URL}/returns/${id}`,

  cancelReturn: (id: string) =>
    `${API_BASE_URL}/returns/${id}/cancel`,
};