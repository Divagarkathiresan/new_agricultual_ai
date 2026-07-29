import React, { useCallback, useEffect } from "react";
import { router } from "expo-router";
import { Alert, Linking, Platform, StyleSheet, Text, View } from "react-native";

import { AppScreen } from "@/components/screen";
import { AnimatedCard, AppButton, BrandMark, Card, SectionHeader } from "@/components/ui";
import { useAppStore } from "@/store/appStore";
import { palette } from "@/theme/agriculture";

export function HomeScreen() {
  const auth = useAppStore((state) => state.auth);
  const farms = useAppStore((state) => state.farms);

  const showLocationAlert = useCallback((message: string) => {
    if (Platform.OS === "web") return;

    Alert.alert("Enable Location", message, [
      { text: "Not Now", style: "cancel" },
      {
        text: "Open Settings",
        onPress: () => {
          Linking.openSettings().catch(() => undefined);
        },
      },
    ]);
  }, []);

  const requestHomeLocation = useCallback(() => {
    if (Platform.OS === "web") return;

    showLocationAlert(
      "Please enable location access in phone settings so Smart Agriculture AI can personalize your farm dashboard.",
    );
  }, [showLocationAlert]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      requestHomeLocation();
    }, 500);

    return () => clearTimeout(timeout);
  }, [requestHomeLocation]);

  return (
    <AppScreen withNav>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {auth.name || "Farmer"}</Text>
          <Text style={styles.caption}>Here is your field snapshot today</Text>
        </View>
        <BrandMark compact />
      </View>

      <AnimatedCard>
        <Card style={styles.weatherCard}>
          <View style={styles.weatherTop}>
            <View>
          <Text style={styles.weatherLabel}>Today&apos;s Weather</Text>
              <Text style={styles.weatherTemp}>28 deg C</Text>
            </View>
            <Text style={styles.weatherIcon}>T</Text>
          </View>
          <View style={styles.weatherGrid}>
            <WeatherItem icon="H" label="Humidity" value="72%" />
            <WeatherItem icon="R" label="Rainfall" value="18 mm" />
            <WeatherItem icon="W" label="Wind" value="9 km/h" />
          </View>
        </Card>
      </AnimatedCard>

      <SectionHeader title="Quick Actions" />
      <View style={styles.quickGrid}>
        <QuickAction title="Add Farm" caption="Create a GPS farm profile" onPress={() => router.push("/add-farm" as never)} />
        <QuickAction title="Farm List" caption={`${farms.length} saved farms`} onPress={() => router.push("/farms" as never)} />
        <QuickAction title="Profile" caption="Manage session" onPress={() => router.push("/profile" as never)} />
      </View>

      <SectionHeader title="Your Farm Focus" caption="Use AI recommendations before finalizing crop choices." />
      <AnimatedCard delay={130}>
        <Card style={styles.focusCard}>
          <Text style={styles.focusIcon}>AI</Text>
          <View style={styles.focusCopy}>
            <Text style={styles.focusTitle}>Recommendation-ready workflow</Text>
            <Text style={styles.focusText}>
              Start a farm record, suggest a crop from soil and weather metrics, then save the final farm plan.
            </Text>
          </View>
        </Card>
      </AnimatedCard>
    </AppScreen>
  );
}

function WeatherItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.weatherItem}>
      <Text style={styles.weatherMiniIcon}>{icon}</Text>
      <Text style={styles.weatherValue}>{value}</Text>
      <Text style={styles.weatherItemLabel}>{label}</Text>
    </View>
  );
}

function QuickAction({ title, caption, onPress }: { title: string; caption: string; onPress: () => void }) {
  return (
    <AnimatedCard style={styles.quickCard}>
      <Card style={styles.quickInner}>
        <Text style={styles.quickIcon}>+</Text>
        <Text style={styles.quickTitle}>{title}</Text>
        <Text style={styles.quickCaption}>{caption}</Text>
        <AppButton title="Open" variant="secondary" onPress={onPress} />
      </Card>
    </AnimatedCard>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  greeting: {
    color: palette.text,
    fontSize: 27,
    fontWeight: "900",
  },
  caption: {
    color: palette.muted,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
  weatherCard: {
    backgroundColor: palette.primary,
    borderColor: "transparent",
  },
  weatherTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  weatherLabel: {
    color: "#DFF3DA",
    fontSize: 14,
    fontWeight: "800",
  },
  weatherTemp: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "900",
    marginTop: 4,
  },
  weatherIcon: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
  },
  weatherGrid: {
    marginTop: 22,
    flexDirection: "row",
    gap: 10,
  },
  weatherItem: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: 16,
    padding: 12,
    gap: 5,
  },
  weatherValue: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
  weatherMiniIcon: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 15,
  },
  weatherItemLabel: {
    color: "#EAF7E8",
    fontSize: 11,
    fontWeight: "700",
  },
  quickGrid: {
    gap: 12,
  },
  quickCard: {
    flex: 1,
  },
  quickInner: {
    gap: 10,
  },
  quickIcon: {
    color: palette.primary,
    fontSize: 22,
    fontWeight: "900",
  },
  quickTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: "900",
  },
  quickCaption: {
    color: palette.muted,
    fontWeight: "600",
  },
  focusCard: {
    flexDirection: "row",
    gap: 14,
  },
  focusIcon: {
    color: palette.primary,
    fontSize: 22,
    fontWeight: "900",
  },
  focusCopy: {
    flex: 1,
  },
  focusTitle: {
    color: palette.text,
    fontSize: 17,
    fontWeight: "900",
  },
  focusText: {
    color: palette.muted,
    marginTop: 5,
    lineHeight: 20,
    fontWeight: "600",
  },
});
