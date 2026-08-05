import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import type { AuthSession } from "@/types/domain";

export const AUTH_KEY = "smart-agriculture-auth";

const canUseSecureStore = Platform.OS !== "web";

export const saveAuthSession = async (auth: AuthSession) => {
  const serialized = JSON.stringify(auth);
  if (canUseSecureStore) {
    await SecureStore.setItemAsync(AUTH_KEY, serialized);
    await AsyncStorage.removeItem(AUTH_KEY);
    return;
  }
  await AsyncStorage.setItem(AUTH_KEY, serialized);
};

export const getAuthSession = async (): Promise<AuthSession | null> => {
  const saved = canUseSecureStore
    ? await SecureStore.getItemAsync(AUTH_KEY)
    : await AsyncStorage.getItem(AUTH_KEY);

  if (!saved) {
    return null;
  }

  try {
    return JSON.parse(saved) as AuthSession;
  } catch {
    await clearAuthSession();
    return null;
  }
};

export const getAccessToken = async () => {
  const session = await getAuthSession();
  return session?.accessToken || "";
};

export const clearAuthSession = async () => {
  if (canUseSecureStore) {
    await SecureStore.deleteItemAsync(AUTH_KEY);
  }
  await AsyncStorage.removeItem(AUTH_KEY);
};
