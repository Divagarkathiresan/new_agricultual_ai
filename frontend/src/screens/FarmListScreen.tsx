import React, { useState } from "react";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { RefreshControl, StyleSheet, Text, View } from "react-native";

import { AppScreen } from "@/components/screen";
import { AgricultureIllustration, AnimatedCard, AppButton, Card, SectionHeader } from "@/components/ui";
import { useAppStore } from "@/store/appStore";
import { palette } from "@/theme/agriculture";
import type { Farm } from "@/types/domain";

export function FarmListScreen() {
  const savedFarms = useAppStore((state) => state.farms);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = async () => {
    setRefreshing(true);
    setRefreshing(false);
  };

  return (
    <AppScreen withNav scroll={false}>
      <SectionHeader title="Farm List" caption="Your saved farm profiles and crop plans." />
      {savedFarms.length === 0 ? (
        <View style={styles.empty}>
          <AgricultureIllustration variant={2} />
          <Text style={styles.emptyTitle}>No Farms Added Yet</Text>
          <Text style={styles.emptyText}>Add your first farm to start monitoring crop decisions in one place.</Text>
          <AppButton title="Add Farm" icon={<Text style={styles.addIcon}>+</Text>} onPress={() => router.push("/add-farm" as never)} />
        </View>
      ) : (
        <FlashList
          data={savedFarms}
          keyExtractor={(item, index) => item._id || item.id || `${item.farm_name}-${index}`}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => <FarmCard farm={item} index={index} />}
        />
      )}
    </AppScreen>
  );
}

function FarmCard({ farm, index }: { farm: Farm; index: number }) {
  return (
    <AnimatedCard delay={index * 70} style={styles.cardWrap}>
      <Card style={styles.farmCard}>
        <View style={styles.cardTop}>
          <View style={styles.iconBox}>
            <Text style={styles.cardIconText}>F</Text>
          </View>
          <View style={styles.cardTitleWrap}>
            <Text style={styles.farmName}>{farm.farm_name}</Text>
            <Text style={styles.cropName}>{farm.crop_name || "Crop pending"}</Text>
          </View>
          <Text style={styles.badge}>{farm.status || "Active"}</Text>
        </View>
        <View style={styles.metaGrid}>
          <Meta label="Area" value={`${farm.area?.value || 0} ${farm.area?.unit || "acre"}`} />
          <Meta label="Soil Type" value={farm.soil_type || "Not set"} />
          <Meta label="Planting Date" value={farm.planting_date || "Not set"} />
        </View>
        <View style={styles.locationRow}>
          <Text style={styles.locationIcon}>GPS</Text>
          <Text style={styles.location}>
            {farm.location?.latitude?.toFixed?.(4) || "0.0000"}, {farm.location?.longitude?.toFixed?.(4) || "0.0000"}
          </Text>
        </View>
      </Card>
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
    borderRadius: 17,
    backgroundColor: palette.surfaceGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  cardIconText: {
    color: palette.primary,
    fontWeight: "900",
    fontSize: 18,
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
    gap: 6,
  },
  locationIcon: {
    color: palette.primary,
    fontSize: 11,
    fontWeight: "900",
  },
  location: {
    color: palette.muted,
    fontWeight: "700",
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
  addIcon: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
});
