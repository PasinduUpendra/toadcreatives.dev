// app/page.tsx
import { Hero } from "@/components/sections/Hero";

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col">
      <Hero />
      {/* Later: other sections like Work, Lab, About, etc. */}
    </main>
  );
}