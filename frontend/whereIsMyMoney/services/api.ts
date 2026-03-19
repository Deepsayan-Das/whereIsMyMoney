import axios from "axios"
import { getToken } from "./authStorage"

console.log("API URL : ", process.env.EXPO_PUBLIC_API_URL)
export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || "https://whereismymoney-l6yc.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use(
  async (config) => {

    const token = await getToken()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Token is invalid or expired
      console.log("401 Unauthorized detected. Clearing token and redirecting...")
      const { removeToken } = await import("./authStorage")
      await removeToken()

      const { router } = await import("expo-router")
      router.replace("/Login")
    }
    return Promise.reject(error)
  }
)
