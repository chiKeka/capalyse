import axios, { AxiosInstance } from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.example.com";
const AUTH_API_BASE_URL = process.env.NEXT_PUBLIC_BETTER_AUTH_URL;
// Helper to check if the token is expired
// export const isTokenExpired = (): boolean => {
//   const exp = Cookies.get("token_exp"); // expiration stored as UNIX timestamp
//   if (!exp) return true;
//   const now = Math.floor(Date.now() / 1000);
//   return now >= parseInt(exp, 10);
// };

// Refresh token function
// const refreshToken = async (): Promise<string | null> => {
//   try {
//     const refreshToken = Cookies.get("refresh_token");
//     if (!refreshToken) throw new Error("No refresh token");

//     const response = await unauthenticatedAxios.post("/auth/refresh", {
//       refreshToken: refreshToken,
//     });
//     const { token, refreshToken: newRefreshToken, expiresIn } = response.data;
//     Cookies.set("access_token", token);
//     Cookies.set("refresh_token", newRefreshToken);
//     Cookies.set(
//       "token_exp",
//       Math.floor(Date.now() / 1000) + jwtDecode(token)?.exp!.toString()
//     );

//     return token;
//   } catch (error) {
//     Cookies.remove("access_token");
//     Cookies.remove("refresh_token");
//     Cookies.remove("token_exp");
//     window.location.href = "/signin";
//     return null;
//   }
// };

// Authenticated Axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor
// api.interceptors.request.use(
//   async (
//     config: InternalAxiosRequestConfig
//   ): Promise<InternalAxiosRequestConfig> => {
//     if (isTokenExpired()) {
//       const newToken = await refreshToken();

//       if (newToken) {
//         config.headers.Authorization = `Bearer ${newToken}`;
//       }
//     } else {
//       const token = Cookies.get("access_token");
//       if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//       }
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// Response interceptor
// api.interceptors.response.use(
//   (response: AxiosResponse) => response,
//   async (error: AxiosError) => {
//     if (error.response?.status === 401) {
//       const originalRequest = error.config as AxiosRequestConfig & {
//         _retry?: boolean;
//       };
//       if (!originalRequest._retry) {
//         originalRequest._retry = true;
//         const newToken = await refreshToken();
//         if (newToken) {
//           originalRequest.headers = {
//             ...originalRequest.headers,
//             Authorization: `Bearer ${newToken}`,
//           };
//           return api(originalRequest);
//         }
//       }
//     }
//     return Promise.reject(error?.response?.data || error?.message);
//   }
// );

// Unauthenticated Axios instance
// export const unauthenticatedAxios: AxiosInstance = axios.create({
//   baseURL: API_BASE_URL,
// });
// unauthenticatedAxios.interceptors.response.use(
//   (response: AxiosResponse) => response,
//   async (error: AxiosError) => {
//     return Promise.reject(error?.response?.data || error?.message);
//   }
// );

export default api;

export const apiWithAuth = axios.create({
  baseURL: AUTH_API_BASE_URL,
});
