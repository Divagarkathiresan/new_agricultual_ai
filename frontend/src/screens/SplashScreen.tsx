import React, { useEffect } from "react";
import { router } from "expo-router";
import { Animated, StyleSheet, Text, View } from "react-native";

import { BrandMark } from "@/components/ui";
import { useAppStore } from "@/store/appStore";
import { palette } from "@/theme/agriculture";

export function SplashScreen() {
  const initializeAuth = useAppStore((state) => state.initializeAuth);
  const auth = useAppStore((state) => state.auth);
  const scale = React.useMemo(() => new Animated.Value(0.82), []);
  const opacity = React.useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    initializeAuth().catch(() => undefined);
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, damping: 12, stiffness: 120, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 520, useNativeDriver: true }),
    ]).start();

    const timeout = setTimeout(() => {
      if (auth.isAuthenticated) {
        router.replace("/homepage" as never);
      } else {
        router.replace("/login" as never);
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, [auth.isAuthenticated, initializeAuth, opacity, scale]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity, transform: [{ scale }] }]}>
        <BrandMark />
        <Text style={styles.title}>Smart Agriculture AI</Text>
        <Text style={styles.subtitle}>AI Powered Farming Assistant</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    gap: 14,
  },
  title: {
    color: palette.primary,
    fontSize: 30,
    fontWeight: "900",
  },
  subtitle: {
    color: palette.muted,
    fontSize: 16,
    fontWeight: "600",
  },
});
