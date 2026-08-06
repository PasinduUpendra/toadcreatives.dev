"use client";

import NarrativeSection from "./NarrativeSection";
import { services } from "@/content/site";

export default function WhatWeDo() {
  return (
    <NarrativeSection
      id="services"
      tubeMode="what"
      eyebrow={services.eyebrow}
      lead={services.lead}
      items={services.items}
      align="right"
    />
  );
}
