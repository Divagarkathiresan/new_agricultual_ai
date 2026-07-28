import Constants from "expo-constants";
import { Platform } from "react-native";

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

type RegisterPayload = {
  name: string;
  phone: string;
};

type RegisterResponse = {
  success: boolean;
  message: string;
};

type SendOtpPayload = {
  phone: string;
};

type SendOtpResponse = {
  success: boolean;
  message: string;
};

type VerifyOtpPayload = {
  phone: string;
  otp: string;
};

type VerifyOtpResponse = {
  success: boolean;
  message: string;
};

type PredictCropPayload = {
  N: number;
  P: number;
  K: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
  phone?: string;
};

type PredictCropResponse = {
  recommended_crop: string;
};

export const registerUser = async (
  payload: RegisterPayload
): Promise<RegisterResponse> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.detail || "Unable to register. Please try again.");
    }

    return data;
  } catch (error: any) {
    if (error?.name === "AbortError") {
      throw new Error(
        `Backend did not respond at ${API_BASE_URL}. Make sure FastAPI is running and reachable.`
      );
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

export const sendOtpToPhone = async (
  payload: SendOtpPayload
): Promise<SendOtpResponse> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.detail || "Unable to send OTP. Please try again.");
    }

    return data;
  } catch (error: any) {
    if (error?.name === "AbortError") {
      throw new Error(
        `Backend did not respond at ${API_BASE_URL}. Make sure FastAPI is running and reachable.`
      );
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

export const verifyOtpWithBackend = async (
  payload: VerifyOtpPayload
): Promise<VerifyOtpResponse> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.detail || "OTP verification failed.");
    }

    return data;
  } catch (error: any) {
    if (error?.name === "AbortError") {
      throw new Error(
        `Backend did not respond at ${API_BASE_URL}. Make sure FastAPI is running and reachable.`
      );
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

export const predictCrop = async (
  payload: PredictCropPayload
): Promise<PredictCropResponse> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.detail || "Unable to predict crop. Please try again.");
    }

    return data;
  } catch (error: any) {
    if (error?.name === "AbortError") {
      throw new Error(
        `Backend did not respond at ${API_BASE_URL}. Make sure FastAPI is running and reachable.`
      );
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
};
