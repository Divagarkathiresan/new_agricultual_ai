import React, { useEffect, useMemo } from "react";
import { router } from "expo-router";
import { Animated, ImageBackground, StyleSheet, Text, View } from "react-native";
import { LogOut, MapPinned, Phone, ShieldCheck, Sparkles } from "lucide-react-native";

import { AppScreen } from "@/components/screen";
import { AppButton, BrandMark, Card } from "@/components/ui";
import { useAppStore } from "@/store/appStore";
import { palette } from "@/theme/agriculture";

export function ProfileScreen() {
  const auth = useAppStore((state) => state.auth);
  const farms = useAppStore((state) => state.farms);
  const logout = useAppStore((state) => state.logout);
  const profileOpacity = useMemo(() => new Animated.Value(0), []);
  const profileTranslate = useMemo(() => new Animated.Value(22), []);

  const handleLogout = async () => {
    await logout();
    router.replace("/login" as never);
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(profileOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(profileTranslate, { toValue: 0, damping: 16, stiffness: 95, useNativeDriver: true }),
    ]).start();
  }, [profileOpacity, profileTranslate]);

  return (
    <AppScreen withNav>
      <Animated.View style={{ opacity: profileOpacity, transform: [{ translateY: profileTranslate }] }}>
        <ImageBackground source={require("../../assets/images/paddy-register.png")} style={styles.cover} imageStyle={styles.coverImage} resizeMode="cover">
          <View style={styles.coverShade}>
            <View style={styles.coverTop}>
              <Text style={styles.screenTitle}>Profile</Text>
              <View style={styles.securePill}>
                <ShieldCheck size={15} color="#FFFFFF" />
                <Text style={styles.secureText}>OTP Secure</Text>
              </View>
            </View>
            <View style={styles.identity}>
              <BrandMark />
              <View style={styles.identityText}>
                <Text style={styles.name}>{auth.name || "Smart Farmer"}</Text>
                <View style={styles.infoRow}>
                  <Phone size={15} color="#E9F8E5" />
                  <Text style={styles.info}>{auth.phone || "No phone saved"}</Text>
                </View>
              </View>
            </View>
          </View>
        </ImageBackground>
      </Animated.View>

      <Card style={styles.statsCard}>
        <ProfileStat icon={<MapPinned size={20} color={palette.primary} />} value={`${farms.length}`} label="Farms" />
        <ProfileStat icon={<Sparkles size={20} color={palette.primary} />} value="AI" label="Advisor" />
        <ProfileStat icon={<ShieldCheck size={20} color={palette.primary} />} value="GPS" label="Enabled" />
      </Card>

      <Card style={styles.farmImageCard}>
        <ImageBackground source={require("../../assets/images/paddy-login.png")} style={styles.farmImage} imageStyle={styles.farmImageRadius} resizeMode="cover">
          <View style={styles.farmImageShade}>
            <Text style={styles.farmImageTitle}>Farm workspace</Text>
            <Text style={styles.farmImageText}>Keep your crop plans, fields, and recommendations close together.</Text>
          </View>
        </ImageBackground>
      </Card>

      <AppButton title="Logout" variant="secondary" icon={<LogOut size={18} color={palette.primary} />} onPress={handleLogout} />
    </AppScreen>
  );
}

function ProfileStat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  const scale = useMemo(() => new Animated.Value(0.96), []);

  useEffect(() => {
    Animated.spring(scale, { toValue: 1, damping: 12, stiffness: 100, useNativeDriver: true }).start();
  }, [scale]);

  return (
    <Animated.View style={[styles.stat, { transform: [{ scale }] }]}>
      <View style={styles.statIcon}>{icon}</View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cover: {
    minHeight: 280,
    width: "100%",
    borderRadius: 26,
    overflow: "hidden",
  },
  coverImage: {
    borderRadius: 26,
  },
  coverShade: {
    flex: 1,
    justifyContent: "space-between",
    padding: 18,
    backgroundColor: "rgba(9, 36, 16, 0.42)",
  },
  coverTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  screenTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
  },
  securePill: {
    minHeight: 34,
    borderRadius: 13,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.26)",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  secureText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  identity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flexWrap: "wrap",
  },
  identityText: {
    flex: 1,
  },
  name: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "900",
  },
  infoRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    marginTop: 7,
  },
  info: {
    color: "#E9F8E5",
    fontWeight: "800",
  },
  statsCard: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  stat: {
    flex: 1,
    alignItems: "center",
    gap: 5,
  },
  statIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: palette.surfaceGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    color: palette.primary,
    fontSize: 22,
    fontWeight: "900",
  },
  statLabel: {
    color: palette.muted,
    fontWeight: "800",
    fontSize: 12,
  },
  farmImageCard: {
    padding: 0,
    overflow: "hidden",
  },
  farmImage: {
    minHeight: 170,
    width: "100%",
  },
  farmImageRadius: {
    borderRadius: 20,
  },
  farmImageShade: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 18,
    backgroundColor: "rgba(16, 54, 18, 0.42)",
  },
  farmImageTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
  },
  farmImageText: {
    color: "#EEF8EA",
    marginTop: 6,
    fontWeight: "700",
    lineHeight: 20,
  },
});
