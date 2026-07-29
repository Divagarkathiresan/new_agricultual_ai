import React, { createContext, useContext, useMemo, useRef, useState } from "react";
import { Animated, Platform, StatusBar, Text, View } from "react-native";

type ToastType = "success" | "error";

type ToastContextType = {
  show: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const animatedValue = useMemo(() => new Animated.Value(-120), []);
  const opacityValue = useMemo(() => new Animated.Value(0), []);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const show = (message: string, type: ToastType = "success") => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setToast({ message, type });

    animatedValue.setValue(-120);
    opacityValue.setValue(0);

    Animated.parallel([
      Animated.timing(animatedValue, {
        toValue: 8,
        duration: 320,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start();

    timeoutRef.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(animatedValue, {
          toValue: -120,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start(() => setToast(null));
    }, 3000);
  };

  const statusBarHeight = StatusBar.currentHeight || (Platform.OS === "ios" ? 44 : 0);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast ? (
        <Animated.View
          accessible={false}
          accessibilityElementsHidden={true}
          style={[
            styles.container,
            {
              transform: [{ translateY: animatedValue }],
              opacity: opacityValue,
              top: statusBarHeight + 10,
            },
          ]}
        >
          <View style={[styles.iconContainer, toast.type === "success" ? styles.successIcon : styles.errorIcon]}>
            <Text style={styles.iconText}>{toast.type === "success" ? "✓" : "!"}</Text>
          </View>
          <Text style={[styles.message, toast.type === "error" && styles.errorMessage]}>{toast.message}</Text>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

const styles = {
  container: {
    position: "absolute" as const,
    left: 16,
    right: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 10,
    zIndex: 9999,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: 12,
  },
  successIcon: {
    backgroundColor: "#2E7D32",
  },
  errorIcon: {
    backgroundColor: "#C62828",
  },
  iconText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700" as const,
  },
  message: {
    flex: 1,
    color: "#1F321D",
    fontSize: 15,
    fontWeight: "600" as const,
  },
  errorMessage: {
    color: "#B71C1C",
  },
};
