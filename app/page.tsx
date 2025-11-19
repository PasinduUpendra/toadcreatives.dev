import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Works from "@/components/sections/Works";
// import Narrative from "@/components/sections/Narrative"; // optional

export default function HomePage() {
  return (
    <>
      <section
        id="hero"
        className="min-h-screen flex items-center justify-center bg-black"
      >
        <Hero />
      </section>
      <section
        id="hero-about-transition"
        className="bg-[#1b1b1d] py-20 px-6 flex items-center justify-center"
      >
        {/* Optionally use <Narrative /> or simple text */}
        <div className="text-white text-lg font-semibold text-center">
          Scroll to discover more about us
        </div>
      </section>
      <section
        id="about"
        className="bg-white px-6 py-32"
      >
        <About />
      </section>
      <section
        id="about-work-transition"
        className="bg-[#1b1b1d] py-20 px-6 flex items-center justify-center"
      >
        <div className="text-white text-lg font-semibold text-center">
          Morph into work
        </div>
      </section>
      <section
        id="work"
        className="bg-black px-6 py-32"
      >
        <Works />
      </section>
    </>
  );
}
