import AsyncStorage from "@react-native-async-storage/async-storage";

import type { AuthSession } from "@/types/domain";

export const AUTH_KEY = "smart-agriculture-auth";

export const saveAuthSession = async (auth: AuthSession) => {
  await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(auth));
};

export const getAuthSession = async (): Promise<AuthSession | null> => {
  const saved = await AsyncStorage.getItem(AUTH_KEY);

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
  await AsyncStorage.removeItem(AUTH_KEY);
};
