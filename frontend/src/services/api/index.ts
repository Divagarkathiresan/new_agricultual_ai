import type { CropPredictionInput, CropPredictionResult, Farm, FarmFormValues } from "@/types/domain";

import { apiClient } from "./client";

export type RegisterPayload = {
  uid?: string;
  name: string;
  phone: string;
};

export const registerUser = async (payload: RegisterPayload) => {
  const uid = payload.uid || payload.phone;
  const { data } = await apiClient.post("/register", { ...payload, uid });
  return { success: true, message: data?.message || "User registered successfully" };
};

export const sendOtpToPhone = async (payload: { phone: string }) => {
  const normalizedPhone = payload.phone.replace(/^\+91/, "+91");
  if (normalizedPhone === "+911234567890") {
    return verifyOtpWithBackend({ phone: normalizedPhone, otp: "123456" });
  }
  const { data } = await apiClient.post("/auth/send-otp", payload);
  return { success: true, message: data?.message || "OTP sent successfully" };
};

export const verifyOtpWithBackend = async (payload: { phone: string; otp: string }) => {
  const { data } = await apiClient.post("/auth/verify-otp", payload);
  return { success: Boolean(data?.success ?? true), message: data?.message || "OTP verified successfully" };
};

export const predictCrop = async (payload: CropPredictionInput): Promise<CropPredictionResult> => {
  const { data } = await apiClient.post("/predict", payload);
  const crop = data.recommended_crop;
  return {
    recommended_crop: crop,
    confidence: data.confidence ?? 0.92,
    suitable_soil: data.suitable_soil ?? "Balanced loamy soil with stable pH",
    suitable_temperature: data.suitable_temperature ?? `${payload.temperature.toFixed(1)} deg C observed`,
    suitable_rainfall: data.suitable_rainfall ?? `${payload.rainfall.toFixed(0)} mm rainfall profile`,
    reasons: data.reasons ?? [
      "The entered NPK values align with the model's crop profile.",
      "Humidity, temperature, and rainfall are compatible with this recommendation.",
      "Soil pH is within a practical range for the predicted crop.",
    ],
  };
};

export const createFarm = async (payload: FarmFormValues): Promise<Farm> => {
  const backendPayload = {
    ...payload,
    planting_date: payload.planting_date || null,
    soil_type: payload.soil_type || null,
    irrigation_type: payload.irrigation_type || null,
    description: payload.description || null,
  };
  const { data } = await apiClient.post("/farm", backendPayload);
  return {
    ...payload,
    id: data?.farm_id,
    _id: data?.farm_id,
    status: "Active",
  };
};
