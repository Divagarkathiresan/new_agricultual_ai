export type AreaUnit = "acre" | "hectare";

export type FarmLocation = {
  latitude: number;
  longitude: number;
};

export type FarmArea = {
  value: number;
  unit: AreaUnit;
};

export type FarmFormValues = {
  user_id: string;
  farm_name: string;
  crop_name: string;
  area: FarmArea;
  location: FarmLocation;
  soil_type?: string;
  irrigation_type?: string;
  planting_date?: string;
  description?: string;
};

export type Farm = FarmFormValues & {
  _id?: string;
  id?: string;
  status?: string;
  created_at?: string;
};

export type CropPredictionInput = {
  phone: string;
  N: number;
  P: number;
  K: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
};

export type CropPredictionResult = {
  recommended_crop: string;
  confidence?: number;
  suitable_soil?: string;
  suitable_temperature?: string;
  suitable_rainfall?: string;
  reasons?: string[];
};

export type AuthSession = {
  isAuthenticated: boolean;
  phone: string;
  name?: string;
  userId: string;
};
