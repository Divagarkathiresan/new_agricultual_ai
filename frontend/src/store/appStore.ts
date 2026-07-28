import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { AuthSession, CropPredictionResult, Farm, FarmFormValues } from "@/types/domain";

const AUTH_KEY = "smart-agriculture-auth";

const initialDraft: FarmFormValues = {
  user_id: "",
  farm_name: "",
  crop_name: "",
  area: {
    value: 0,
    unit: "acre",
  },
  location: {
    latitude: 0,
    longitude: 0,
  },
  soil_type: "",
  irrigation_type: "",
  planting_date: "",
  description: "",
};

type AppState = {
  auth: AuthSession;
  addFarmDraft: FarmFormValues;
  predictionResult: CropPredictionResult | null;
  farms: Farm[];
  selectedFarm: Farm | null;
  hasSeenOnboarding: boolean;
  initializeAuth: () => Promise<void>;
  setAuthenticated: (session: Omit<AuthSession, "isAuthenticated">) => Promise<void>;
  logout: () => Promise<void>;
  setHasSeenOnboarding: (seen: boolean) => void;
  updateFarmDraft: (values: Partial<FarmFormValues>) => void;
  resetFarmDraft: (userId?: string) => void;
  setPredictionResult: (result: CropPredictionResult | null) => void;
  addFarm: (farm: Farm) => void;
  setFarms: (farms: Farm[]) => void;
  setSelectedFarm: (farm: Farm | null) => void;
};

const defaultAuth: AuthSession = {
  isAuthenticated: false,
  phone: "",
  userId: "",
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      auth: defaultAuth,
      addFarmDraft: initialDraft,
      predictionResult: null,
      farms: [],
      selectedFarm: null,
      hasSeenOnboarding: false,
      initializeAuth: async () => {
        const saved = await AsyncStorage.getItem(AUTH_KEY);
        if (!saved) return;
        set({ auth: JSON.parse(saved) as AuthSession });
      },
      setAuthenticated: async (session) => {
        const auth = { ...session, isAuthenticated: true };
        await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(auth));
        set((state) => ({
          auth,
          addFarmDraft: {
            ...state.addFarmDraft,
            user_id: session.userId,
          },
        }));
      },
      logout: async () => {
        await AsyncStorage.removeItem(AUTH_KEY);
        set({ auth: defaultAuth, predictionResult: null });
      },
      setHasSeenOnboarding: (seen) => set({ hasSeenOnboarding: seen }),
      updateFarmDraft: (values) =>
        set((state) => ({
          addFarmDraft: {
            ...state.addFarmDraft,
            ...values,
            area: values.area
              ? { ...state.addFarmDraft.area, ...values.area }
              : state.addFarmDraft.area,
            location: values.location
              ? { ...state.addFarmDraft.location, ...values.location }
              : state.addFarmDraft.location,
          },
        })),
      resetFarmDraft: (userId) =>
        set({
          addFarmDraft: {
            ...initialDraft,
            user_id: userId ?? get().auth.userId,
          },
        }),
      setPredictionResult: (result) => set({ predictionResult: result }),
      addFarm: (farm) =>
        set((state) => ({
          farms: [farm, ...state.farms],
        })),
      setFarms: (farms) => set({ farms }),
      setSelectedFarm: (farm) => set({ selectedFarm: farm }),
    }),
    {
      name: "smart-agriculture-state",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        addFarmDraft: state.addFarmDraft,
        predictionResult: state.predictionResult,
        farms: state.farms,
        selectedFarm: state.selectedFarm,
        hasSeenOnboarding: state.hasSeenOnboarding,
      }),
    },
  ),
);
