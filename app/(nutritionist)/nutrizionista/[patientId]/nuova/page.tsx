"use client";

import { useState, useEffect, use } from "react";
import { DietBuilder } from "@/components/diet-builder";
import type { NutritionistPatient } from "@/types";

export default function NutritionistNuovaDietaPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = use(params);
  const [patientName, setPatientName] = useState<string | null>(null);

  useEffect(() => {
    async function loadPatient() {
      try {
        const res = await fetch("/api/nutritionist/patients");
        if (res.ok) {
          const patients: NutritionistPatient[] = await res.json();
          const found = patients.find((p) => p.id === patientId);
          if (found) {
            setPatientName(found.patientName || found.patientEmail);
          }
        }
      } catch {
        // fallback to generic title
      }
    }
    loadPatient();
  }, [patientId]);

  return (
    <DietBuilder
      apiEndpoint={`/api/nutritionist/patients/${patientId}/diets`}
      backHref={`/nutrizionista/${patientId}`}
      title={patientName ? `Nuova dieta per ${patientName}` : "Nuova dieta"}
    />
  );
}
