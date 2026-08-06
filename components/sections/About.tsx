"use client";

import NarrativeSection from "./NarrativeSection";
import { about } from "@/content/site";

export default function About() {
  return (
    <NarrativeSection
      id="about"
      tubeMode="about"
      eyebrow={about.eyebrow}
      lead={about.lead}
      items={about.paragraphs}
      align="left"
    />
  );
}
