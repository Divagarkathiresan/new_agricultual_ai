import React, { useEffect } from "react";
import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Plus, RotateCcw, Sprout } from "lucide-react-native";
import { router } from "expo-router";
import { Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";

import { AppScreen } from "@/components/screen";
import { AgricultureIllustration, AnimatedCard, AppButton, Card, SectionHeader } from "@/components/ui";
import { fetchFarms } from "@/services/api";
import { useAppStore } from "@/store/appStore";
import { palette } from "@/theme/agriculture";
import type { Farm } from "@/types/domain";

export function FarmListScreen() {
  const setFarms = useAppStore((state) => state.setFarms);
  const setSelectedFarm = useAppStore((state) => state.setSelectedFarm);
  const { data = [], error, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ["farms"],
    queryFn: fetchFarms,
  });

  useEffect(() => {
    setFarms(data);
  }, [data, setFarms]);

  const openFarm = (farm: Farm) => {
    const farmId = farm._id || farm.id;
    if (!farmId) return;
    setSelectedFarm(farm);
    router.push({ pathname: "/farm-details" as never, params: { farmId } });
  };

  return (
    <AppScreen withNav scroll={false}>
      <SectionHeader title="Farm List" caption="Your backend-synced farm profiles and crop plans." />
      {isLoading ? (
        <LoadingList />
      ) : error ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Unable to Load Farms</Text>
          <Text style={styles.emptyText}>{error.message || "Please check your connection and try again."}</Text>
          <AppButton title="Retry" icon={<RotateCcw size={18} color="#FFFFFF" />} onPress={() => refetch()} />
        </View>
      ) : data.length === 0 ? (
        <View style={styles.empty}>
          <AgricultureIllustration variant={2} />
          <Text style={styles.emptyTitle}>No Farms Added Yet</Text>
          <Text style={styles.emptyText}>Add your first farm to start monitoring crop decisions in one place.</Text>
          <AppButton title="Add Farm" icon={<Plus size={18} color="#FFFFFF" />} onPress={() => router.push("/add-farm" as never)} />
        </View>
      ) : (
        <FlashList
          data={data}
          keyExtractor={(item, index) => item._id || item.id || `${item.farm_name}-${index}`}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={palette.primary} />}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => <FarmCard farm={item} index={index} onPress={() => openFarm(item)} />}
        />
      )}
    </AppScreen>
  );
}

function LoadingList() {
  return (
    <View style={styles.loadingList}>
      {[0, 1, 2].map((item) => (
        <Card key={item} style={styles.skeletonCard}>
          <View style={styles.skeletonTop}>
            <View style={[styles.skeleton, styles.skeletonIcon]} />
            <View style={styles.skeletonTextWrap}>
              <View style={[styles.skeleton, styles.skeletonTitle]} />
              <View style={[styles.skeleton, styles.skeletonLine]} />
            </View>
          </View>
          <View style={[styles.skeleton, styles.skeletonWide]} />
        </Card>
      ))}
    </View>
  );
}

function FarmCard({ farm, index, onPress }: { farm: Farm; index: number; onPress: () => void }) {
  const area = farm.area?.value ? `${farm.area.value} ${farm.area.unit || "acre"}` : "Area pending";
  const latitude = farm.location?.latitude;
  const longitude = farm.location?.longitude;
  const location =
    typeof latitude === "number" && typeof longitude === "number"
      ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
      : "Location pending";

  return (
    <AnimatedCard delay={index * 70} style={styles.cardWrap}>
      <Pressable onPress={onPress}>
        <Card style={styles.farmCard}>
          <View style={styles.cardTop}>
            <View style={styles.iconBox}>
              <Sprout size={23} color={palette.primary} />
            </View>
            <View style={styles.cardTitleWrap}>
              <Text style={styles.farmName} numberOfLines={1}>{farm.farm_name || "Unnamed Farm"}</Text>
              <Text style={styles.cropName} numberOfLines={1}>{farm.crop_name || "Crop pending"}</Text>
            </View>
            <Text style={styles.badge}>{farm.status || "Active"}</Text>
          </View>
          <View style={styles.metaGrid}>
            <Meta label="Crop" value={farm.crop_name || "Not set"} />
            <Meta label="Area" value={area} />
          </View>
          <View style={styles.locationRow}>
            <MapPin size={15} color={palette.primary} />
            <Text style={styles.location} numberOfLines={1}>{location}</Text>
          </View>
        </Card>
      </Pressable>
    </AnimatedCard>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.meta}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 130,
  },
  loadingList: {
    gap: 14,
  },
  cardWrap: {
    marginBottom: 14,
  },
  farmCard: {
    gap: 14,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: palette.surfaceGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitleWrap: {
    flex: 1,
  },
  farmName: {
    color: palette.text,
    fontSize: 18,
    fontWeight: "900",
  },
  cropName: {
    color: palette.primary,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  badge: {
    color: palette.primary,
    backgroundColor: palette.surfaceGreen,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 11,
    fontWeight: "900",
  },
  metaGrid: {
    flexDirection: "row",
    gap: 8,
  },
  meta: {
    flex: 1,
    backgroundColor: "#F7FBF5",
    borderRadius: 14,
    padding: 10,
  },
  metaLabel: {
    color: palette.caption,
    fontSize: 11,
    fontWeight: "800",
  },
  metaValue: {
    color: palette.text,
    marginTop: 3,
    fontWeight: "900",
    fontSize: 12,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  location: {
    color: palette.muted,
    fontWeight: "700",
    flex: 1,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    gap: 16,
  },
  emptyTitle: {
    color: palette.text,
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
  },
  emptyText: {
    color: palette.muted,
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "600",
  },
  skeletonCard: {
    gap: 18,
  },
  skeletonTop: {
    flexDirection: "row",
    gap: 12,
  },
  skeletonTextWrap: {
    flex: 1,
    gap: 10,
    justifyContent: "center",
  },
  skeleton: {
    backgroundColor: "#E6EFE1",
    borderRadius: 10,
  },
  skeletonIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
  },
  skeletonTitle: {
    width: "62%",
    height: 18,
  },
  skeletonLine: {
    width: "42%",
    height: 14,
  },
  skeletonWide: {
    height: 54,
  },
});
