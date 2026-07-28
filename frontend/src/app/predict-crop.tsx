import React, { useMemo, useState } from "react";
import { router, usePathname } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { predictCrop } from "./services/api";

type FieldKey =
  | "nitrogen"
  | "phosphorus"
  | "potassium"
  | "temperature"
  | "humidity"
  | "ph"
  | "rainfall";

const fields: {
  key: FieldKey;
  label: string;
  unit: string;
  placeholder: string;
}[] = [
  { key: "nitrogen", label: "Nitrogen (N)", unit: "kg/ha", placeholder: "0" },
  { key: "phosphorus", label: "Phosphorus (P)", unit: "kg/ha", placeholder: "42" },
  { key: "potassium", label: "Potassium (K)", unit: "kg/ha", placeholder: "43" },
  {
    key: "temperature",
    label: "Temperature",
    unit: "deg C",
    placeholder: "20.87974371",
  },
  {
    key: "humidity",
    label: "Humidity",
    unit: "%",
    placeholder: "82.00274423",
  },
  { key: "ph", label: "Soil pH", unit: "pH", placeholder: "6.502985292000001" },
  {
    key: "rainfall",
    label: "Rainfall",
    unit: "mm",
    placeholder: "202.9355362",
  },
];

const defaultValues: Record<FieldKey, string> = {
  nitrogen: "90",
  phosphorus: "42",
  potassium: "43",
  temperature: "20.87974371",
  humidity: "82.00274423",
  ph: "6.502985292000001",
  rainfall: "202.9355362",
};

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

export default function PredictCropScreen() {
  const [values, setValues] =
    useState<Record<FieldKey, string>>(defaultValues);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const filledCount = useMemo(
    () => fields.filter((field) => values[field.key].trim()).length,
    [values],
  );

  const updateValue = (key: FieldKey, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handlePredict = async () => {
    const hasEmptyField = fields.some((field) => !values[field.key].trim());

    if (hasEmptyField) {
      alert("Please fill all crop prediction inputs.");
      return;
    }

    const numericValues = Object.fromEntries(
      fields.map((field) => [field.key, Number(values[field.key])]),
    ) as Record<FieldKey, number>;

    const hasInvalidNumber = fields.some(
      (field) => !Number.isFinite(numericValues[field.key]),
    );

    if (hasInvalidNumber) {
      alert("Please enter valid numbers for all crop prediction inputs.");
      return;
    }

    setLoading(true);
    setResult("");

    try {
      const response = await predictCrop({
        phone: "unknown",
        N: numericValues.nitrogen,
        P: numericValues.phosphorus,
        K: numericValues.potassium,
        temperature: numericValues.temperature,
        humidity: numericValues.humidity,
        ph: numericValues.ph,
        rainfall: numericValues.rainfall,
      });

      setResult(response.recommended_crop);
    } catch (error: any) {
      console.error(error);
      alert(error?.message || "Unable to predict crop. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <DashboardNav />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.kicker}>Crop Prediction</Text>
          <Text style={styles.title}>Enter field conditions</Text>
          <Text style={styles.subtitle}>
            Add soil nutrients and climate values to estimate a suitable crop
            for the current field profile.
          </Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.progressRow}>
            <Text style={styles.progressText}>{filledCount}/7 inputs ready</Text>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                setValues(defaultValues);
                setResult("");
              }}
            >
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGrid}>
            {fields.map((field) => (
              <View key={field.key} style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>{field.label}</Text>
                  <Text style={styles.unit}>{field.unit}</Text>
                </View>
                <TextInput
                  style={styles.input}
                  value={values[field.key]}
                  placeholder={field.placeholder}
                  placeholderTextColor="#8A9384"
                  keyboardType="decimal-pad"
                  onChangeText={(value) => updateValue(field.key, value)}
                />
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handlePredict}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Predict Crop</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>Recommendation</Text>
          <Text style={styles.resultTitle}>
            {result || "Submit the form to view a crop suggestion"}
          </Text>
          <Text style={styles.resultText}>
            {result
              ? `The backend model recommends ${result} for these field conditions.`
              : "Your crop recommendation will appear here after the backend model processes the values."}
          </Text>
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
  header: {
    backgroundColor: "#1F6B2A",
    borderRadius: 8,
    padding: 20,
  },
  kicker: {
    color: "#CFECC6",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 8,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    color: "#EAF7E4",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  formCard: {
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: "#DDEAD9",
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  progressText: {
    color: "#44523F",
    fontSize: 14,
    fontWeight: "800",
  },
  resetButton: {
    minHeight: 34,
    justifyContent: "center",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#EFF7EC",
  },
  resetText: {
    color: "#2E7D32",
    fontSize: 13,
    fontWeight: "800",
  },
  inputGrid: {
    gap: 12,
  },
  inputGroup: {
    gap: 7,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    color: "#263322",
    fontSize: 14,
    fontWeight: "800",
  },
  unit: {
    color: "#6D7868",
    fontSize: 12,
    fontWeight: "700",
  },
  input: {
    minHeight: 52,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CFE0CA",
    backgroundColor: "#F8FBF6",
    paddingHorizontal: 14,
    color: "#1F321D",
    fontSize: 16,
  },
  button: {
    marginTop: 18,
    minHeight: 54,
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#2E7D32",
  },
  buttonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 17,
    fontWeight: "800",
  },
  resultCard: {
    marginTop: 16,
    backgroundColor: "#EAF6E5",
    borderRadius: 8,
    padding: 18,
    borderWidth: 1,
    borderColor: "#CFE0CA",
  },
  resultLabel: {
    color: "#2E7D32",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 6,
  },
  resultTitle: {
    color: "#1F321D",
    fontSize: 22,
    fontWeight: "800",
  },
  resultText: {
    color: "#52604D",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
});
