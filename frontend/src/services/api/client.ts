import Constants from "expo-constants";
import { router } from "expo-router";
import { Platform } from "react-native";
import { create } from "axios";

import { clearAuthSession, getAccessToken } from "@/services/authStorage";

const getApiBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }

  if (Platform.OS === "web") {
    return "http://127.0.0.1:8000";
  }

  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri?.split(":")[0];

  if (host) {
    return `http://${host}:8000`;
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:8000";
  }

  return "http://127.0.0.1:8000";
};

export const API_BASE_URL = getApiBaseUrl();

export const apiClient = create({
  baseURL: API_BASE_URL,
  timeout: 12000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(async (config) => {
  const accessToken = await getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await clearAuthSession();
      router.replace("/login" as never);
      return Promise.reject(new Error("Your session has expired. Please log in again."));
    }

    const config = error.config;
    const status = error.response?.status;
    const shouldRetry = !status || status >= 500;

    if (!shouldRetry || !config || config.__retryCount >= 1) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        `Backend did not respond at ${API_BASE_URL}.`;
      return Promise.reject(new Error(message));
    }

    config.__retryCount = (config.__retryCount || 0) + 1;
    await new Promise((resolve) => setTimeout(resolve, 500));
    return apiClient(config);
  },
);
