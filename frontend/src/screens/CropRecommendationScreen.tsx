import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";
import { z } from "zod";

import { AppScreen } from "@/components/screen";
import { Illustration } from "@/components/illustrations";
import { AppButton, Card, FieldInput, RotatingSquareLoader, SectionHeader } from "@/components/ui";
import { useToast } from "@/components/toast";
import { predictCrop } from "@/services/api";
import { useAppStore } from "@/store/appStore";
import { palette } from "@/theme/agriculture";
import type { CropPredictionInput } from "@/types/domain";

const recommendationSchema = z.object({
  N: z.coerce.number().nonnegative("Required"),
  P: z.coerce.number().nonnegative("Required"),
  K: z.coerce.number().nonnegative("Required"),
  temperature: z.coerce.number(),
  humidity: z.coerce.number().min(0).max(100),
  ph: z.coerce.number().min(0).max(14),
  rainfall: z.coerce.number().nonnegative("Required"),
});

const fields: { key: keyof Omit<CropPredictionInput, "phone">; label: string; unit: string; placeholder: string }[] = [
  { key: "N", label: "Nitrogen", unit: "kg/ha", placeholder: "90" },
  { key: "P", label: "Phosphorus", unit: "kg/ha", placeholder: "42" },
  { key: "K", label: "Potassium", unit: "kg/ha", placeholder: "43" },
  { key: "temperature", label: "Temperature", unit: "deg C", placeholder: "20.8" },
  { key: "humidity", label: "Humidity", unit: "%", placeholder: "82" },
  { key: "ph", label: "Soil pH", unit: "pH", placeholder: "6.5" },
  { key: "rainfall", label: "Rainfall", unit: "mm", placeholder: "202" },
];

type RecommendationForm = z.infer<typeof recommendationSchema>;

export function CropRecommendationScreen() {
  const toast = useToast();
  const auth = useAppStore((state) => state.auth);
  const result = useAppStore((state) => state.predictionResult);
  const setResult = useAppStore((state) => state.setPredictionResult);
  const updateDraft = useAppStore((state) => state.updateFarmDraft);
  const [submitted, setSubmitted] = useState(false);
  const { control, handleSubmit, formState } = useForm<RecommendationForm>({
    resolver: zodResolver(recommendationSchema) as never,
    defaultValues: {},
  });

  const mutation = useMutation({
    mutationFn: (values: RecommendationForm) =>
      predictCrop({
        ...values,
        phone: auth.phone || "unknown",
      }),
    onSuccess: (data) => {
      setSubmitted(true);
      setResult(data);
    },
    onError: (error: Error) => toast.show(error.message || "Unable to predict crop.", "error"),
  });

  const accept = () => {
    if (result?.recommended_crop) {
      updateDraft({ crop_name: result.recommended_crop });
    }
    router.replace("/add-farm" as never);
  };

  const reject = () => {
    setResult(null);
    router.replace("/add-farm" as never);
  };

  return (
    <AppScreen withNav>
      <SectionHeader title="Crop Recommendation" caption="Enter soil, weather, and environmental values for the AI crop model." />
      <Card style={styles.heroCard}>
        <Illustration name="crop-recommendation" height={190} />
        <Text style={styles.cropHeroTitle}>AI-Powered Crop Recommendations</Text>
        <Text style={styles.cropHeroText}>Get the best crop suggestions based on your soil, weather & environment.</Text>
      </Card>
      <Card style={styles.formCard}>
        <Text style={styles.groupTitle}>Soil Nutrients</Text>
        {fields.slice(0, 3).map((field) => (
          <Controller
            key={field.key}
            control={control}
            name={field.key}
            render={({ field: controllerField, fieldState }) => (
              <FieldInput
                label={`${field.label} (${field.unit})`}
                value={String(controllerField.value ?? "")}
                onChangeText={(value) => controllerField.onChange(value === "" ? undefined : value)}
                placeholder={field.placeholder}
                keyboardType="decimal-pad"
                error={fieldState.error?.message}
              />
            )}
          />
        ))}
        <Text style={styles.groupTitle}>Environmental Factors</Text>
        {fields.slice(3).map((field) => (
          <Controller
            key={field.key}
            control={control}
            name={field.key}
            render={({ field: controllerField, fieldState }) => (
              <FieldInput
                label={`${field.label} (${field.unit})`}
                value={String(controllerField.value ?? "")}
                onChangeText={(value) => controllerField.onChange(value === "" ? undefined : value)}
                placeholder={field.placeholder}
                keyboardType="decimal-pad"
                error={fieldState.error?.message}
              />
            )}
          />
        ))}
        <AppButton
          title="Get Recommendation"
          loading={mutation.isPending || formState.isSubmitting}
          onPress={handleSubmit((values) => mutation.mutate(values as RecommendationForm))}
        />
      </Card>

      {mutation.isPending ? (
        <Card style={styles.loadingCard}>
          <RotatingSquareLoader />
          <Text style={styles.loadingText}>Running crop intelligence</Text>
        </Card>
      ) : null}

      {submitted && result ? (
        <Card style={styles.resultCard}>
          <Illustration name="smart-advisory" height={160} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Best Match</Text>
          </View>
          <Text style={styles.resultLabel}>Predicted Crop</Text>
          <Text style={styles.cropName}>{result.recommended_crop}</Text>
          <Info label="Confidence" value={`${Math.round((result.confidence ?? 0.92) * 100)}%`} />
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.round((result.confidence ?? 0.92) * 100)}%` }]} />
          </View>
          <Info label="Suitable Soil" value={result.suitable_soil || "Loamy, balanced soil"} />
          <Info label="Suitable Temperature" value={result.suitable_temperature || "Model-compatible range"} />
          <Info label="Suitable Rainfall" value={result.suitable_rainfall || "Model-compatible rainfall"} />
          <View style={styles.reasons}>
            <Text style={styles.infoLabel}>Why this crop?</Text>
            {(result.reasons || []).map((reason) => (
              <Text key={reason} style={styles.reasonText}>• {reason}</Text>
            ))}
          </View>
          <View style={styles.actions}>
            <AppButton title="I am OK" onPress={accept} style={styles.action} />
            <AppButton title="No" variant="secondary" onPress={reject} style={styles.action} />
          </View>
        </Card>
      ) : null}
    </AppScreen>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    gap: 8,
    backgroundColor: palette.mint,
  },
  cropHeroTitle: {
    color: palette.text,
    fontSize: 24,
    fontWeight: "900",
  },
  cropHeroText: {
    color: palette.muted,
    marginTop: 6,
    fontWeight: "700",
    lineHeight: 20,
  },
  formCard: {
    gap: 14,
  },
  loadingCard: {
    minHeight: 190,
    alignItems: "center",
    justifyContent: "center",
    gap: 22,
  },
  loadingText: {
    color: palette.muted,
    fontWeight: "800",
  },
  resultCard: {
    gap: 13,
  },
  groupTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: "900",
    marginTop: 2,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: palette.lightGreen,
  },
  badgeText: {
    color: palette.primary,
    fontWeight: "900",
    fontSize: 12,
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "#E4EFE1",
  },
  progressFill: {
    height: 10,
    borderRadius: 999,
    backgroundColor: palette.primary,
  },
  resultLabel: {
    color: palette.secondary,
    fontWeight: "900",
    textTransform: "uppercase",
    fontSize: 12,
  },
  cropName: {
    color: palette.primary,
    fontSize: 32,
    fontWeight: "900",
    textTransform: "capitalize",
  },
  infoRow: {
    borderRadius: 14,
    backgroundColor: "rgba(234, 246, 231, 0.62)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.66)",
    padding: 12,
    gap: 4,
  },
  infoLabel: {
    color: palette.text,
    fontWeight: "900",
    fontSize: 13,
  },
  infoValue: {
    color: palette.muted,
    fontWeight: "700",
  },
  reasons: {
    gap: 6,
  },
  reasonText: {
    color: palette.muted,
    lineHeight: 20,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  action: {
    flex: 1,
  },
});
