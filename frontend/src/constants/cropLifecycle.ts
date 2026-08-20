export type CropStage = {
  name: string;
  start: number;
  end: number;
};

export type CropLifecycle = {
  total_days: number;
  stages: CropStage[];
};

export const CROP_LIFECYCLE: Record<string, CropLifecycle> = {
  tomato: {
    total_days: 120,
    stages: [
      { name: "Establishment", start: 0, end: 14 },
      { name: "Vegetative Growth", start: 15, end: 35 },
      { name: "Flowering", start: 36, end: 55 },
      { name: "Fruit Development", start: 56, end: 80 },
      { name: "Fruit Ripening", start: 81, end: 105 },
      { name: "Harvest", start: 106, end: 120 },
    ],
  },
  potato: {
    total_days: 120,
    stages: [
      { name: "Sprouting / Emergence", start: 0, end: 20 },
      { name: "Vegetative Growth", start: 21, end: 40 },
      { name: "Tuber Initiation", start: 41, end: 60 },
      { name: "Tuber Bulking", start: 61, end: 90 },
      { name: "Maturation", start: 91, end: 110 },
      { name: "Harvest", start: 111, end: 120 },
    ],
  },
  pepper: {
    total_days: 120,
    stages: [
      { name: "Establishment", start: 0, end: 15 },
      { name: "Vegetative Growth", start: 16, end: 40 },
      { name: "Flowering", start: 41, end: 60 },
      { name: "Fruit Development", start: 61, end: 85 },
      { name: "Fruit Maturation", start: 86, end: 110 },
      { name: "Harvest", start: 111, end: 120 },
    ],
  },
};

export const getCropLifecycle = (cropName?: string | null) => {
  const key = (cropName || "").trim().toLowerCase();
  return CROP_LIFECYCLE[key] || null;
};

export const getExpectedStageForDay = (cropName?: string | null, cropDay?: number | null) => {
  const lifecycle = getCropLifecycle(cropName);
  if (!lifecycle || typeof cropDay !== "number") return null;
  return lifecycle.stages.find((stage) => cropDay >= stage.start && cropDay <= stage.end) || null;
};

export const formatCropName = (cropName?: string | null) => {
  if (!cropName) return "Crop";
  return cropName.charAt(0).toUpperCase() + cropName.slice(1).toLowerCase();
};
