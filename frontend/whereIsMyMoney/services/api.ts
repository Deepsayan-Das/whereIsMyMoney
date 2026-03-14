import axios from "axios"
import { getToken } from "./authStorage"

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || "http://10.98.206.154:3000/api",
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