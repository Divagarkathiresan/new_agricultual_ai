import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";
import { z } from "zod";

import { AppScreen } from "@/components/screen";
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

const fields: { key: keyof Omit<CropPredictionInput, "phone">; label: string; unit: string }[] = [
  { key: "N", label: "Nitrogen", unit: "kg/ha" },
  { key: "P", label: "Phosphorus", unit: "kg/ha" },
  { key: "K", label: "Potassium", unit: "kg/ha" },
  { key: "temperature", label: "Temperature", unit: "deg C" },
  { key: "humidity", label: "Humidity", unit: "%" },
  { key: "ph", label: "Soil pH", unit: "pH" },
  { key: "rainfall", label: "Rainfall", unit: "mm" },
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
    defaultValues: {
      N: 90,
      P: 42,
      K: 43,
      temperature: 20.8797,
      humidity: 82.0027,
      ph: 6.5029,
      rainfall: 202.9355,
    },
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
      <Card style={styles.formCard}>
        {fields.map((field) => (
          <Controller
            key={field.key}
            control={control}
            name={field.key}
            render={({ field: controllerField, fieldState }) => (
              <FieldInput
                label={`${field.label} (${field.unit})`}
                value={String(controllerField.value ?? "")}
                onChangeText={controllerField.onChange}
                keyboardType="decimal-pad"
                error={fieldState.error?.message}
              />
            )}
          />
        ))}
        <AppButton
          title="Predict Crop"
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
          <Text style={styles.resultLabel}>Predicted Crop</Text>
          <Text style={styles.cropName}>{result.recommended_crop}</Text>
          <Info label="Confidence" value={`${Math.round((result.confidence ?? 0.92) * 100)}%`} />
          <Info label="Suitable Soil" value={result.suitable_soil || "Loamy, balanced soil"} />
          <Info label="Suitable Temperature" value={result.suitable_temperature || "Model-compatible range"} />
          <Info label="Suitable Rainfall" value={result.suitable_rainfall || "Model-compatible rainfall"} />
          <View style={styles.reasons}>
            <Text style={styles.infoLabel}>Reasons</Text>
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
    backgroundColor: palette.surfaceGreen,
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
  },
  action: {
    flex: 1,
  },
});
