// app/page.tsx
import ToadField from "@/components/visuals/ToadField";
import Hero from "@/components/sections/Hero";

export default function HomePage() {
  return (
    <main className="relative min-h-screen">
      <ToadField />
      <Hero />
    </main>
  );
}