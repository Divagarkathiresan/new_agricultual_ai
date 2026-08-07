import React, { useCallback, useEffect, useMemo } from "react";
import { router } from "expo-router";
import { Alert, Animated, ImageBackground, Linking, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { CloudSun, Leaf, MapPinned, Sprout, UserRound } from "lucide-react-native";

import { AppScreen } from "@/components/screen";
import { AnimatedCard, AppButton, BrandMark, Card, SectionHeader } from "@/components/ui";
import { useAppStore } from "@/store/appStore";
import { palette } from "@/theme/agriculture";

export function HomeScreen() {
  const auth = useAppStore((state) => state.auth);
  const farms = useAppStore((state) => state.farms);
  const heroOpacity = useMemo(() => new Animated.Value(0), []);
  const heroTranslate = useMemo(() => new Animated.Value(18), []);
  const heroScale = useMemo(() => new Animated.Value(1.04), []);

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

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroOpacity, { toValue: 1, duration: 520, useNativeDriver: true }),
      Animated.spring(heroTranslate, { toValue: 0, damping: 16, stiffness: 100, useNativeDriver: true }),
      Animated.spring(heroScale, { toValue: 1, damping: 18, stiffness: 80, useNativeDriver: true }),
    ]).start();
  }, [heroOpacity, heroScale, heroTranslate]);

  return (
    <AppScreen withNav>
      <Animated.View style={{ opacity: heroOpacity, transform: [{ translateY: heroTranslate }, { scale: heroScale }] }}>
        <ImageBackground source={require("../../assets/images/paddy-login.png")} style={styles.hero} imageStyle={styles.heroImage} resizeMode="cover">
          <View style={styles.heroShade}>
            <View style={styles.header}>
              <View style={styles.headerText}>
                <Text style={styles.greeting}>Hello, {auth.name || "Farmer"}</Text>
                <Text style={styles.caption}>Your farm dashboard is ready</Text>
              </View>
              {/* <BrandMark compact /> */}
            </View>
            <View style={styles.heroBottom}>
              <View>
                <Text style={styles.heroLabel}>Active fields</Text>
                <Text style={styles.heroValue}>{farms.length}</Text>
              </View>
              <Pressable style={styles.heroAction} onPress={() => router.push("/add-farm" as never)}>
                <Text style={styles.heroActionText}>Add Farm</Text>
              </Pressable>
            </View>
          </View>
        </ImageBackground>
      </Animated.View>

      <AnimatedCard delay={80}>
        <ImageBackground source={require("../../assets/images/paddy-register.png")} style={styles.weatherCard} imageStyle={styles.weatherImage} resizeMode="cover">
          <View style={styles.weatherShade}>
          <View style={styles.weatherTop}>
            <View>
              <Text style={styles.weatherLabel}>Today&apos;s Weather</Text>
              <Text style={styles.weatherTemp}>28 deg C</Text>
            </View>
            <CloudSun size={34} color="#FFFFFF" />
          </View>
          <View style={styles.weatherGrid}>
            <WeatherItem icon="H" label="Humidity" value="72%" />
            <WeatherItem icon="R" label="Rainfall" value="18 mm" />
            <WeatherItem icon="W" label="Wind" value="9 km/h" />
          </View>
          </View>
        </ImageBackground>
      </AnimatedCard>

      <SectionHeader title="Quick Actions" />
      <View style={styles.quickGrid}>
        <QuickAction icon={<Sprout size={21} color={palette.primary} />} title="Add Farm" caption="Create a GPS farm profile" onPress={() => router.push("/add-farm" as never)} />
        <QuickAction icon={<MapPinned size={21} color={palette.primary} />} title="Farm List" caption={`${farms.length} saved farms`} onPress={() => router.push("/farms" as never)} />
        <QuickAction icon={<UserRound size={21} color={palette.primary} />} title="Profile" caption="Manage session" onPress={() => router.push("/profile" as never)} />
      </View>

      <SectionHeader title="Your Farm Focus" caption="Use AI recommendations before finalizing crop choices." />
      <AnimatedCard delay={180}>
        <Card style={styles.focusCard}>
          <View style={styles.focusIcon}>
            <Leaf size={22} color="#FFFFFF" />
          </View>
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

function QuickAction({ icon, title, caption, onPress }: { icon: React.ReactNode; title: string; caption: string; onPress: () => void }) {
  const scale = useMemo(() => new Animated.Value(1), []);

  return (
    <AnimatedCard style={styles.quickCard}>
      <Pressable
        onPress={onPress}
        onPressIn={() => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}
      >
        <Animated.View style={[styles.quickInner, { transform: [{ scale }] }]}>
        <View style={styles.quickIcon}>{icon}</View>
        <Text style={styles.quickTitle}>{title}</Text>
        <Text style={styles.quickCaption}>{caption}</Text>
        <AppButton title="Open" variant="secondary" onPress={onPress} />
        </Animated.View>
      </Pressable>
    </AnimatedCard>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerText: {
    flex: 1,
    paddingRight: 14,
  },
  hero: {
    minHeight: 245,
    width: "100%",
    overflow: "hidden",
    borderRadius: 24,
  },
  heroImage: {
    borderRadius: 24,
  },
  heroShade: {
    flex: 1,
    justifyContent: "space-between",
    padding: 18,
    backgroundColor: "rgba(9, 36, 16, 0.43)",
  },
  greeting: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "900",
  },
  caption: {
    color: "#E7F4E1",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
  heroBottom: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  heroLabel: {
    color: "#DBF4D2",
    fontSize: 13,
    fontWeight: "800",
  },
  heroValue: {
    color: "#FFFFFF",
    fontSize: 48,
    fontWeight: "900",
    lineHeight: 54,
  },
  heroAction: {
    minHeight: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.22)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  heroActionText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
  weatherCard: {
    minHeight: 190,
    width: "100%",
    borderRadius: 22,
    overflow: "hidden",
  },
  weatherImage: {
    borderRadius: 22,
  },
  weatherShade: {
    flex: 1,
    padding: 18,
    backgroundColor: "rgba(21, 86, 35, 0.68)",
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
    backgroundColor: "rgba(255, 255, 255, 0.66)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.74)",
    padding: 16,
    gap: 10,
  },
  quickIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(234, 246, 231, 0.72)",
    alignItems: "center",
    justifyContent: "center",
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
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: palette.primary,
    alignItems: "center",
    justifyContent: "center",
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
