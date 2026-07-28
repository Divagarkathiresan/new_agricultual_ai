import React from "react";
import { router, usePathname } from "expo-router";
import {
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const advisoryCards = [
  {
    title: "Soil Health",
    text: "Track NPK values and pH before fertilizer planning for better crop response.",
  },
  {
    title: "Water Planning",
    text: "Use rainfall and humidity trends to decide irrigation timing and avoid overwatering.",
  },
  {
    title: "Crop Choice",
    text: "Match temperature, soil nutrients, and rainfall with crops that suit your field.",
  },
];

const navItems = [
  { label: "Home", path: "/homepage" },
  { label: "Predict Crop", path: "/predict-crop" },
];

function DashboardNav() {
  const pathname = usePathname();

  return (
    <View style={styles.nav}>
      <Text style={styles.brand}>Smart Agri</Text>

      <View style={styles.links}>
        {navItems.map((item) => {
          const isActive = pathname === item.path;

          return (
            <TouchableOpacity
              key={item.path}
              style={[styles.navButton, isActive && styles.activeButton]}
              onPress={() => router.push(item.path as any)}
            >
              <Text style={[styles.navText, isActive && styles.activeText]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function Homepage() {
  return (
    <SafeAreaView style={styles.container}>
      <DashboardNav />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ImageBackground
          source={require("../../assets/images/paddy-login.png")}
          style={styles.hero}
          imageStyle={styles.heroImage}
          resizeMode="cover"
        >
          <View style={styles.heroOverlay}>
            <Text style={styles.kicker}>Smart Agriculture Advisor</Text>
            <Text style={styles.title}>Plan better decisions for every field</Text>
            <Text style={styles.subtitle}>
              View field insights, check crop conditions, and predict suitable
              crops from soil and weather inputs.
            </Text>
          </View>
        </ImageBackground>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>7</Text>
            <Text style={styles.statLabel}>Crop Inputs</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>24/7</Text>
            <Text style={styles.statLabel}>Advisory</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>AI</Text>
            <Text style={styles.statLabel}>Prediction</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today&apos;s Field Focus</Text>
          <Text style={styles.sectionText}>
            Keep nutrient balance, moisture, and rainfall in view before
            choosing the next crop cycle.
          </Text>
        </View>

        <View style={styles.cardGrid}>
          {advisoryCards.map((card) => (
            <View key={card.title} style={styles.card}>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardText}>{card.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.imageFeature}>
          <Image
            source={require("../../assets/images/paddy-register.png")}
            style={styles.featureImage}
            resizeMode="cover"
          />
          <View style={styles.featureCopy}>
            <Text style={styles.featureTitle}>Field-ready predictions</Text>
            <Text style={styles.featureText}>
              Enter nitrogen, phosphorus, potassium, temperature, humidity, pH,
              and rainfall to prepare a crop recommendation from field
              conditions.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F8F0",
  },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#DDEAD9",
  },
  brand: {
    color: "#1F6B2A",
    fontSize: 20,
    fontWeight: "800",
  },
  links: {
    flexDirection: "row",
    gap: 8,
  },
  navButton: {
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "#EFF7EC",
  },
  activeButton: {
    backgroundColor: "#2E7D32",
  },
  navText: {
    color: "#2E7D32",
    fontSize: 14,
    fontWeight: "700",
  },
  activeText: {
    color: "#FFFFFF",
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 32,
  },
  hero: {
    minHeight: 290,
    overflow: "hidden",
    borderRadius: 8,
    justifyContent: "flex-end",
  },
  heroImage: {
    borderRadius: 8,
  },
  heroOverlay: {
    padding: 22,
    backgroundColor: "rgba(10, 35, 14, 0.42)",
  },
  kicker: {
    color: "#DDF4D5",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 8,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 29,
    fontWeight: "800",
    lineHeight: 36,
  },
  subtitle: {
    color: "#EFFBEA",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: "#DDEAD9",
  },
  statValue: {
    color: "#1F6B2A",
    fontSize: 24,
    fontWeight: "800",
  },
  statLabel: {
    color: "#5B6757",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#1F321D",
    fontSize: 21,
    fontWeight: "800",
  },
  sectionText: {
    color: "#5C6658",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
  },
  cardGrid: {
    gap: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#DDEAD9",
  },
  cardTitle: {
    color: "#2E7D32",
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 6,
  },
  cardText: {
    color: "#5C6658",
    fontSize: 14,
    lineHeight: 20,
  },
  imageFeature: {
    marginTop: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#DDEAD9",
  },
  featureImage: {
    width: "100%",
    height: 180,
  },
  featureCopy: {
    padding: 16,
  },
  featureTitle: {
    color: "#1F321D",
    fontSize: 18,
    fontWeight: "800",
  },
  featureText: {
    color: "#5C6658",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
  },
});
