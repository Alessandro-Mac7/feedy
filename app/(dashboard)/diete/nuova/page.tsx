"use client";

import { DietBuilder } from "@/components/diet-builder";

export default function NuovaDietaPage() {
  return (
    <DietBuilder
      apiEndpoint="/api/diets"
      backHref="/diete"
      title="Nuova dieta"
    />
  );
}
