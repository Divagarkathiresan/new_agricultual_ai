import React, { useEffect, useMemo, useRef, useState } from "react";
import { router } from "expo-router";
import {
  Animated,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AgricultureIllustration, AppButton } from "@/components/ui";
import { useAppStore } from "@/store/appStore";
import { palette } from "@/theme/agriculture";

const { width } = Dimensions.get("window");

const pages = [
  {
    title: "Grow Better.\nFarm Smarter.\nLive Better.",
    description: "AI powered farming guidance for modern farmers.",
  },
  {
    title: "AI Crop\nRecommendation",
    description: "Predict the best crop based on soil, weather and environmental conditions.",
  },
  {
    title: "Monitor\nYour Farms",
    description: "Manage farms, receive AI recommendations and monitor crops in one place.",
  },
];

export function OnboardingScreen() {
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const setHasSeenOnboarding = useAppStore((state) => state.setHasSeenOnboarding);
  const titleOffset = useMemo(() => new Animated.Value(18), []);
  const titleOpacity = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    titleOffset.setValue(18);
    titleOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(titleOffset, { toValue: 0, damping: 14, stiffness: 120, useNativeDriver: true }),
      Animated.timing(titleOpacity, { toValue: 1, duration: 420, useNativeDriver: true }),
    ]).start();
  }, [index, titleOffset, titleOpacity]);

  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    let cleanup: undefined | (() => void);

    import("animejs")
      .then(({ animate, splitText, stagger }) => {
        const splitter = splitText("p", {
          lines: { wrap: "clip" },
        }).addEffect(({ lines }) =>
          animate(lines, {
            y: [
              { to: ["100%", "0%"] },
              { to: "-100%", delay: 750, ease: "in(3)" },
            ],
            duration: 750,
            ease: "out(3)",
            delay: stagger(200),
            loop: true,
            loopDelay: 500,
          }),
        );
        cleanup = () => splitter.revert();
      })
      .catch(() => undefined);

    return () => cleanup?.();
  }, []);

  const finish = () => {
    setHasSeenOnboarding(true);
    router.replace("/login" as never);
  };

  const next = () => {
    if (index === pages.length - 1) {
      finish();
      return;
    }
    scrollRef.current?.scrollTo({ x: width * (index + 1), animated: true });
  };

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(event.nativeEvent.contentOffset.x / width));
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        scrollEventThrottle={16}
      >
        {pages.map((page, pageIndex) => (
          <View key={page.title} style={[styles.page, { width }]}>
            <AgricultureIllustration variant={pageIndex} />
            <Animated.View style={{ opacity: titleOpacity, transform: [{ translateY: titleOffset }] }}>
              <Text style={styles.title}>{page.title}</Text>
            </Animated.View>
            <Text style={styles.description}>{page.description}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {pages.map((page, dotIndex) => (
            <View key={page.title} style={[styles.dot, dotIndex === index && styles.activeDot]} />
          ))}
        </View>
        <View style={styles.actions}>
          <AppButton title="Skip" variant="ghost" onPress={finish} style={styles.actionButton} />
          <AppButton title={index === pages.length - 1 ? "Get Started" : "Next"} onPress={next} style={styles.actionButton} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  page: {
    paddingHorizontal: 24,
    paddingTop: 76,
    gap: 22,
  },
  title: {
    color: palette.text,
    fontSize: 36,
    lineHeight: 43,
    fontWeight: "900",
  },
  description: {
    color: palette.muted,
    fontSize: 17,
    lineHeight: 25,
    fontWeight: "600",
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 28,
    gap: 20,
  },
  dots: {
    flexDirection: "row",
    gap: 8,
    alignSelf: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#C8D9C1",
  },
  activeDot: {
    width: 26,
    backgroundColor: palette.primary,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});
