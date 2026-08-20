import React, { useEffect, useMemo, useState } from "react";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CloudRain, Droplets, Gauge, MapPin, Satellite, Thermometer, Wind } from "lucide-react-native";
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { AppScreen } from "@/components/screen";
import { Illustration } from "@/components/illustrations";
import { AnimatedCard, AppButton, Card, SectionHeader } from "@/components/ui";
import { API_BASE_URL } from "@/services/api/client";
import { fetchFarmIrrigationReport } from "@/services/api";
import { useAppStore } from "@/store/appStore";
import { palette } from "@/theme/agriculture";

const placeholder = "--";

export function FarmDetailsScreen() {
  const params = useLocalSearchParams<{ farmId?: string }>();
  const selectedFarm = useAppStore((state) => state.selectedFarm);
  const farmId = Array.isArray(params.farmId) ? params.farmId[0] : params.farmId;
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["farm-irrigation", farmId],
    queryFn: () => fetchFarmIrrigationReport(farmId || ""),
    enabled: Boolean(farmId),
  });

  const satelliteUrl = useMemo(() => {
    const raw = data?.satellite?.ndvi_image_url || data?.satellite?.satellite_image_url || "";
    if (!raw) return "";
    return raw.startsWith("http") ? raw : `${API_BASE_URL}${raw.startsWith("/") ? "" : "/"}${raw}`;
  }, [data]);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/farms" as never);
  };

  if (!farmId) {
    return (
      <AppScreen>
        <Text style={styles.title}>Farm not found</Text>
        <AppButton title="Back to Farms" onPress={() => router.replace("/farms" as never)} />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={goBack}>
          <ArrowLeft size={20} color={palette.text} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title}>Farm Details</Text>
          <Text style={styles.subtitle}>{selectedFarm?.farm_name || data?.crop_name || "Monitoring report"}</Text>
        </View>
      </View>

      {isLoading ? <DetailsSkeleton /> : error ? (
        <Card style={styles.centerCard}>
          <Text style={styles.errorTitle}>Unable to Load Report</Text>
          <Text style={styles.errorText}>{error.message || "Please try again in a moment."}</Text>
          <AppButton title="Retry" onPress={() => refetch()} />
        </Card>
      ) : (
        <>
          <AnimatedCard>
            <Card style={styles.card}>
              <SectionHeader title="Farm Details" />
              <InfoRow label="Farm Area" value={formatNumber(data?.water_requirement?.farm_area ?? selectedFarm?.area?.value)} />
              <InfoRow label="Farm Unit" value={data?.water_requirement?.unit || selectedFarm?.area?.unit || placeholder} />
              <InfoRow label="Crop Name" value={data?.crop_name || selectedFarm?.crop_name || placeholder} />
              <InfoRow label="Location" value={formatLocation(selectedFarm?.location, data?.location)} icon={<MapPin size={16} color={palette.primary} />} />
            </Card>
          </AnimatedCard>

          <AnimatedCard delay={140}>
            <Card style={styles.card}>
              <SectionHeader title="Satellite Image" caption="Pinch to zoom on supported devices." />
              {satelliteUrl ? (
                <ScrollView maximumZoomScale={3} minimumZoomScale={1} style={styles.imageZoom} contentContainerStyle={styles.imageZoomContent}>
                  <Image source={{ uri: satelliteUrl }} style={styles.satelliteImage} contentFit="cover" />
                </ScrollView>
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Satellite size={28} color={palette.caption} />
                  <Text style={styles.placeholderText}>Satellite image unavailable</Text>
                </View>
              )}
            </Card>
          </AnimatedCard>

          <AnimatedCard delay={70}>
            <Card style={styles.healthCard}>
              <SectionHeader title="Crop Health" caption="NDVI and moisture, simplified for quick decisions." />
              <Illustration name="satellite-ndvi" height={145} />
              <View style={styles.ndviHero}>
                <Metric label="NDVI" value={formatNumber(data?.satellite?.average_ndvi, 2)} icon={<Gauge size={18} color={palette.primary} />} />
                <Metric label="Status" value={healthStatus(data?.satellite?.health_score, data?.satellite?.status)} />
              </View>
              <ProgressMetric label="Health Score" value={data?.satellite?.health_score} color={palette.primary} />
              <ProgressMetric label="Soil Moisture Score" value={data?.soil_moisture?.soil_moisture_score} color="#1E88E5" />
              <View style={styles.twoCol}>
                <Metric label="Average NDVI" value={formatNumber(data?.satellite?.average_ndvi, 2)} icon={<Gauge size={18} color={palette.primary} />} />
                <Metric label="Crop Status" value={data?.satellite?.status || placeholder} />
                <Metric label="Soil Moisture Level" value={data?.soil_moisture?.soil_moisture_level || placeholder} icon={<Droplets size={18} color="#1E88E5" />} />
              </View>
            </Card>
          </AnimatedCard>
          
          <AnimatedCard delay={220}>
            <Card style={styles.card}>
              <SectionHeader title="Irrigation & Water Requirement" />
              <StatusPill status={data?.recommendation?.irrigation_status} />
              <InfoRow label="Water Required" value={formatUnit(data?.water_requirement?.water_required_liters ?? data?.recommendation?.estimated_water_required_liters, "liters")} />
              <InfoRow label="Best Irrigation Time" value={data?.recommendation?.best_irrigation_time || placeholder} />
              <InfoRow label="Estimated Water Saved" value={formatUnit(data?.recommendation?.estimated_water_saved_liters, "liters")} />
            </Card>
          </AnimatedCard>

          <AnimatedCard delay={110}>
            <Card style={styles.recommendationCard}>
              <Text style={styles.recommendationLabel}>AI Recommendation</Text>
              <Text style={styles.recommendationText}>{data?.recommendation?.recommendation || data?.satellite?.recommendation || "No recommendation available yet."}</Text>
            </Card>
          </AnimatedCard>

          <AnimatedCard delay={180}>
            <Card style={styles.card}>
              <SectionHeader title="Weather" />
              <View style={styles.twoCol}>
                <Metric label="Temperature" value={formatUnit(data?.weather?.temperature, "C")} icon={<Thermometer size={18} color={palette.danger} />} />
                <Metric label="Humidity" value={formatUnit(data?.weather?.humidity, "%")} icon={<Droplets size={18} color="#1E88E5" />} />
                <Metric label="Rainfall" value={formatUnit(data?.weather?.rainfall, "mm")} icon={<CloudRain size={18} color="#4569B0" />} />
                <Metric label="Rain Probability" value={formatUnit(data?.weather?.rain_probability, "%")} icon={<CloudRain size={18} color="#4569B0" />} />
                <Metric label="Wind Speed" value={formatUnit(data?.weather?.wind_speed, "km/h")} icon={<Wind size={18} color={palette.muted} />} />
              </View>
            </Card>
          </AnimatedCard>

          <AnimatedCard delay={250}>
            <Card style={styles.card}>
              <SectionHeader title="Crop Lifecycle" caption="Current growth progress for the saved crop plan." />
              <Illustration name="crop-lifecycle" height={150} />
              <ProgressMetric label="Lifecycle Progress" value={selectedFarm?.planting_date ? 42 : 12} color={palette.primary} />
            </Card>
          </AnimatedCard>
        </>
      )}
    </AppScreen>
  );
}

function DetailsSkeleton() {
  return (
    <View style={styles.skeletonStack}>
      {[0, 1, 2, 3].map((item) => (
        <Card key={item} style={styles.skeletonCard}>
          <View style={[styles.skeleton, styles.skeletonTitle]} />
          <View style={[styles.skeleton, styles.skeletonLine]} />
          <View style={[styles.skeleton, styles.skeletonLineShort]} />
        </Card>
      ))}
    </View>
  );
}

function ProgressMetric({ label, value, color }: { label: string; value?: number | null; color: string }) {
  const progress = Math.max(0, Math.min(100, Number(value ?? 0)));
  const [width] = useState(() => new Animated.Value(0));
  const animatedWidth = useMemo(
    () => width.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] }),
    [width],
  );

  useEffect(() => {
    Animated.timing(width, {
      toValue: progress,
      duration: 850,
      useNativeDriver: false,
    }).start();
  }, [progress, width]);

  return (
    <View style={styles.progressWrap}>
      <View style={styles.progressTop}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={styles.progressValue}>{Number.isFinite(value as number) ? `${progress}%` : placeholder}</Text>
      </View>
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, { backgroundColor: color, width: animatedWidth }]} />
      </View>
    </View>
  );
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <View style={styles.infoValueWrap}>
        {icon}
        <Text style={styles.infoValue} numberOfLines={2}>{value}</Text>
      </View>
    </View>
  );
}

function Metric({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <View style={styles.metric}>
      <View style={styles.metricIcon}>{icon}</View>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

function StatusPill({ status }: { status?: string | null }) {
  const normalized = (status || "").toLowerCase();
  const color = normalized.includes("recommended") ? palette.primary : normalized.includes("later") ? palette.warning : palette.danger;
  return (
    <View style={[styles.statusPill, { backgroundColor: `${color}18`, borderColor: color }]}>
      <View style={[styles.statusDot, { backgroundColor: color }]} />
      <Text style={[styles.statusText, { color }]}>{status || "No Irrigation Required"}</Text>
    </View>
  );
}

const formatNumber = (value?: number | null, digits = 1) =>
  typeof value === "number" && Number.isFinite(value) ? value.toFixed(digits).replace(/\.0$/, "") : placeholder;

const formatUnit = (value?: number | null, unit = "") => {
  const formatted = formatNumber(value);
  return formatted === placeholder ? placeholder : `${formatted} ${unit}`;
};

const formatLocation = (farmLocation?: { latitude: number; longitude: number }, reportLocation?: Record<string, unknown>) => {
  if (farmLocation && typeof farmLocation.latitude === "number" && typeof farmLocation.longitude === "number") {
    return `${farmLocation.latitude.toFixed(4)}, ${farmLocation.longitude.toFixed(4)}`;
  }
  if (reportLocation && typeof reportLocation.latitude === "number" && typeof reportLocation.longitude === "number") {
    return `${reportLocation.latitude.toFixed(4)}, ${reportLocation.longitude.toFixed(4)}`;
  }
  return placeholder;
};

const healthStatus = (score?: number | null, fallback?: string | null) => {
  if (typeof score === "number") {
    if (score >= 75) return "Healthy";
    if (score >= 45) return "Moderate";
    return "Poor";
  }
  return fallback || placeholder;
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.66)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.74)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: palette.text,
    fontSize: 24,
    fontWeight: "900",
  },
  subtitle: {
    color: palette.muted,
    fontWeight: "700",
    marginTop: 2,
  },
  card: {
    gap: 12,
  },
  healthCard: {
    gap: 14,
  },
  ndviHero: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  centerCard: {
    gap: 14,
    alignItems: "center",
  },
  errorTitle: {
    color: palette.text,
    fontSize: 20,
    fontWeight: "900",
  },
  errorText: {
    color: palette.muted,
    textAlign: "center",
    lineHeight: 21,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.54)",
    paddingBottom: 10,
  },
  infoLabel: {
    color: palette.caption,
    fontWeight: "800",
    flex: 0.9,
  },
  infoValueWrap: {
    flex: 1.3,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 6,
  },
  infoValue: {
    color: palette.text,
    fontWeight: "900",
    textAlign: "right",
    flexShrink: 1,
  },
  progressWrap: {
    gap: 8,
  },
  progressTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressValue: {
    color: palette.text,
    fontWeight: "900",
  },
  progressTrack: {
    height: 12,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.48)",
    overflow: "hidden",
  },
  progressFill: {
    height: 12,
    borderRadius: 999,
  },
  twoCol: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metric: {
    flex: 1,
    minWidth: 140,
    minHeight: 92,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.46)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.62)",
    padding: 12,
    gap: 5,
  },
  metricIcon: {
    minHeight: 18,
  },
  metricLabel: {
    color: palette.caption,
    fontSize: 12,
    fontWeight: "800",
  },
  metricValue: {
    color: palette.text,
    fontSize: 16,
    fontWeight: "900",
  },
  recommendationCard: {
    gap: 8,
    backgroundColor: "#FFF9E8",
    borderColor: "#F0D89B",
  },
  recommendationLabel: {
    color: palette.warning,
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  recommendationText: {
    color: palette.text,
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "900",
  },
  imageZoom: {
    height: 230,
    borderRadius: 16,
    backgroundColor: "#EDF4EA",
    minWidth: "100%",
  },
  imageZoomContent: {
    minHeight: 230,
  },
  satelliteImage: {
    width: "100%",
    height: 230,
    borderRadius: 16,
  },
  imagePlaceholder: {
    height: 190,
    borderRadius: 16,
    backgroundColor: "#EDF4EA",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  placeholderText: {
    color: palette.caption,
    fontWeight: "800",
  },
  statusPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
  },
  statusText: {
    fontWeight: "900",
  },
  skeletonStack: {
    gap: 14,
  },
  skeletonCard: {
    gap: 14,
  },
  skeleton: {
    backgroundColor: "#E6EFE1",
    borderRadius: 10,
  },
  skeletonTitle: {
    width: "52%",
    height: 20,
  },
  skeletonLine: {
    width: "90%",
    height: 15,
  },
  skeletonLineShort: {
    width: "62%",
    height: 15,
  },
});
