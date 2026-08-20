import React, { memo, useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  Animated,
  GestureResponderEvent,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";

import { Illustration } from "@/components/illustrations";
import { palette, radius, shadow } from "@/theme/agriculture";

type ButtonProps = {
  title: string;
  onPress?: (event: GestureResponderEvent) => void;
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const AppButton = memo(function AppButton({
  title,
  onPress,
  variant = "primary",
  loading,
  icon,
  style,
}: ButtonProps) {
  const scale = useMemo(() => new Animated.Value(1), []);

  const handlePress = (event: GestureResponderEvent) => {
    import("expo-haptics")
      .then((Haptics) => Haptics.selectionAsync())
      .catch(() => undefined);
    onPress?.(event);
  };

  return (
    <Pressable
      disabled={loading}
      onPress={handlePress}
      onPressIn={() => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}
    >
      <Animated.View style={[styles.button, styles[`${variant}Button`], style, { transform: [{ scale }] }]}>
        {loading ? <ActivityIndicator color={variant === "primary" ? "#FFFFFF" : palette.primary} /> : icon}
        {!loading && <Text style={[styles.buttonText, styles[`${variant}ButtonText`]]}>{title}</Text>}
      </Animated.View>
    </Pressable>
  );
});

type InputProps = TextInputProps & {
  label: string;
  error?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
};

export function FieldInput({ label, error, left, right, style, ...props }: InputProps) {
  return (
    <View style={styles.inputWrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputShell, error && styles.inputError]}>
        {left}
        <TextInput
          {...props}
          placeholderTextColor="#8C9685"
          style={[styles.input, style]}
        />
        {right}
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

export function SectionHeader({ title, caption }: { title: string; caption?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {caption ? <Text style={styles.sectionCaption}>{caption}</Text> : null}
    </View>
  );
}

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function AnimatedCard({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const opacity = useMemo(() => new Animated.Value(0), []);
  const translateY = useMemo(() => new Animated.Value(18), []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 420,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        delay,
        damping: 16,
        stiffness: 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, opacity, translateY]);

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <View style={[styles.brandMark, compact && styles.compactBrand]}>
      <Text style={[styles.brandText, compact && styles.compactBrandText]}>SA</Text>
    </View>
  );
}

export function RotatingSquareLoader() {
  const spin = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [spin]);

  return (
    <Animated.View
      style={[
        styles.loaderSquare,
        {
          transform: [
            {
              rotate: spin.interpolate({
                inputRange: [0, 1],
                outputRange: ["0deg", "360deg"],
              }),
            },
          ],
        },
      ]}
    />
  );
}

export function AgricultureIllustration({ variant = 0 }: { variant?: number }) {
  return <Illustration name={variant === 1 ? "crop-recommendation" : variant === 2 ? "empty-farm" : "welcome-farm"} />;
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 18,
    flexShrink: 1,
  },
  primaryButton: {
    backgroundColor: palette.primary,
    ...shadow,
  },
  secondaryButton: {
    backgroundColor: palette.lightGreen,
    borderWidth: 1,
    borderColor: "#D8ECD6",
  },
  ghostButton: {
    backgroundColor: "transparent",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "800",
  },
  primaryButtonText: {
    color: "#FFFFFF",
  },
  secondaryButtonText: {
    color: palette.primary,
  },
  ghostButtonText: {
    color: palette.primary,
  },
  inputWrap: {
    gap: 7,
  },
  label: {
    color: palette.text,
    fontWeight: "700",
    fontSize: 14,
  },
  inputShell: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.lg,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  input: {
    flex: 1,
    minHeight: 52,
    color: palette.text,
    fontSize: 15,
    paddingHorizontal: 14,
    minWidth: 0,
  },
  inputError: {
    borderColor: palette.danger,
  },
  errorText: {
    color: palette.danger,
    fontSize: 12,
    fontWeight: "600",
  },
  sectionHeader: {
    gap: 4,
    marginBottom: 12,
  },
  sectionTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: "900",
  },
  sectionCaption: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    backgroundColor: palette.card,
    borderRadius: radius.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: palette.border,
    ...shadow,
  },
  brandMark: {
    width: 60,
    height: 60,
    borderRadius: 22,
    backgroundColor: palette.primary,
    alignItems: "center",
    justifyContent: "center",
    ...shadow,
  },
  compactBrand: {
    width: 44,
    height: 44,
    borderRadius: 17,
  },
  brandText: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "900",
  },
  compactBrandText: {
    fontSize: 15,
  },
  loaderSquare: {
    width: 100,
    height: 100,
    borderRadius: 10,
    backgroundColor: palette.secondary,
  },
  illustration: {
    height: 245,
    borderRadius: radius.xl,
    backgroundColor: "#DFF2F0",
    overflow: "hidden",
    justifyContent: "flex-end",
    padding: 18,
  },
  illustrationSky: {
    backgroundColor: "#E9F4FF",
  },
  sun: {
    position: "absolute",
    top: 22,
    right: 30,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#FFD166",
  },
  hills: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  cropRow: {
    position: "absolute",
    height: 64,
    borderTopLeftRadius: 70,
    borderTopRightRadius: 70,
    alignSelf: "center",
  },
  phonePanel: {
    width: 95,
    minHeight: 132,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.68)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.72)",
    alignSelf: "flex-start",
    padding: 15,
    gap: 12,
  },
  panelIcon: {
    color: palette.primary,
    fontSize: 18,
    fontWeight: "900",
  },
  panelLine: {
    width: 56,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D9EBDC",
  },
});
