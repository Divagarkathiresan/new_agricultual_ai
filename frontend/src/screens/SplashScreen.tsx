import React, { useEffect, useMemo, useState } from "react";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronRight, Leaf } from "lucide-react-native";

import { Illustration } from "@/components/illustrations";
import { AppButton, BrandMark, Card } from "@/components/ui";
import { useAppStore } from "@/store/appStore";
import { palette } from "@/theme/agriculture";

const slides = [
  { image: "welcome-farm" as const, title: "Grow Better.\nFarm Smarter.\nLive Better.", copy: "Let AI guide you to better decisions and higher yields." },
  { image: "crop-recommendation" as const, title: "AI-Powered Crop Recommendations", copy: "Get the best crop suggestions based on your soil, weather & environment." },
  { image: "smart-advisory" as const, title: "Smart Advisory for Every Step", copy: "Personalized advice on irrigation, fertilization, pest control & more." },
  { image: "market-prices" as const, title: "Track Prices. Maximize Profit.", copy: "Stay updated with real-time market prices and sell at the best time." },
];

export function SplashScreen() {
  const initializeAuth = useAppStore((state) => state.initializeAuth);
  const auth = useAppStore((state) => state.auth);
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const isLast = index === slides.length - 1;

  useEffect(() => {
    initializeAuth().catch(() => undefined);
  }, [initializeAuth]);

  useEffect(() => {
    if (auth.isAuthenticated) router.replace("/homepage" as never);
  }, [auth.isAuthenticated]);

  const goNext = () => {
    if (isLast) router.replace("/login" as never);
    else setIndex((value) => value + 1);
  };

  const indicators = useMemo(
    () => slides.map((_, item) => <View key={item} style={[styles.dot, item === index && styles.activeDot]} />),
    [index],
  );

  return (
    <View style={styles.container}>
      <View>
        <View style={styles.brandRow}>
          <BrandMark compact />
          <Leaf size={20} color={palette.primary} />
        </View>
        <Text style={styles.appTitle}>Smart Agriculture AI</Text>
        <Text style={styles.appSubtitle}>AI Powered Insights for Smart Farming</Text>
      </View>

      <View style={styles.illustration}>
        <Illustration name={slide.image} height={250} />
      </View>

      <Card style={styles.bottomCard}>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.copy}>{slide.copy}</Text>
        {index === 0 ? (
          <AppButton title="Get Started" icon={<ChevronRight size={18} color="#FFFFFF" />} onPress={goNext} />
        ) : (
          <View style={styles.slideControls}>
            <Pressable onPress={() => router.replace("/login" as never)} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
            <View style={styles.dots}>{indicators}</View>
            <Pressable onPress={goNext} style={[styles.nextButton, isLast && styles.nextWide]}>
              <Text style={styles.nextText}>{isLast ? "Get Started" : "Next"}</Text>
              <ChevronRight size={18} color="#FFFFFF" />
            </Pressable>
          </View>
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
    paddingHorizontal: 22,
    paddingTop: 58,
    justifyContent: "space-between",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  appTitle: {
    color: palette.text,
    fontSize: 27,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 12,
  },
  appSubtitle: {
    color: palette.muted,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 6,
  },
  illustration: {
    flex: 1,
    justifyContent: "center",
  },
  bottomCard: {
    marginBottom: 24,
    gap: 16,
  },
  title: {
    color: palette.text,
    fontSize: 27,
    lineHeight: 34,
    fontWeight: "900",
  },
  copy: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600",
  },
  slideControls: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  skipButton: {
    minHeight: 44,
    justifyContent: "center",
  },
  skipText: {
    color: palette.muted,
    fontWeight: "800",
  },
  dots: {
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D7EAD2",
  },
  activeDot: {
    width: 20,
    backgroundColor: palette.primary,
  },
  nextButton: {
    minHeight: 44,
    minWidth: 44,
    borderRadius: 22,
    paddingHorizontal: 13,
    backgroundColor: palette.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 4,
  },
  nextWide: {
    minWidth: 126,
  },
  nextText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
});
