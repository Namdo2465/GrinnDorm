// API configuration - centralized endpoint definitions
const API_BASE_URL =
  (import.meta as ImportMeta & { env: { VITE_API_URL: string } }).env
    .VITE_API_URL || "http://localhost:5000";

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH_SIGNUP: `${API_BASE_URL}/api/auth/signup`,
  AUTH_VERIFY: `${API_BASE_URL}/api/auth/verify`,
  AUTH_LOGIN: `${API_BASE_URL}/api/auth/login`,

  // Dorms endpoints
  GET_DORMS: `${API_BASE_URL}/api/dorms`,
  GET_DORM: (dormId: string) => `${API_BASE_URL}/api/dorms/${dormId}`,

  // Reviews endpoints
  POST_REVIEW: `${API_BASE_URL}/api/reviews`,
  VOTE_REVIEW: (reviewId: string) =>
    `${API_BASE_URL}/api/reviews/${reviewId}/vote`,
};

export default API_BASE_URL;
