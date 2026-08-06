"use client";

import { useEffect, useRef, useState } from "react";
import { displayFont } from "@/app/fonts";
import BlurLines from "@/components/motion/BlurLines";
import { gsap, prefersReducedMotion } from "@/components/motion/gsap";
import { contact } from "@/content/site";

type Status = "idle" | "loading" | "success" | "error";

const FIELD =
  "rounded-2xl border border-neutral-700/80 bg-neutral-900/70 px-3.5 py-2.5 text-sm text-neutral-50 outline-none transition focus:border-lime-300 focus:ring-1 focus:ring-lime-300/80";
const LABEL = "text-xs uppercase tracking-[0.18em] text-neutral-400";

export default function Contact() {
  const formRef = useRef<HTMLFormElement>(null);
  const section = useRef<HTMLElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // The closing beat, matching the old site exactly: the two columns fade up
  // from below over the bare field. No panel, no background, no scrub — it plays
  // once, on arrival, so a single scroll past the work brings it up.
  useEffect(() => {
    const el = section.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-rise]",
        { y: (i: number) => (i === 0 ? 24 : 32), autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.08,
          // Fires as the section arrives rather than scrubbing across it, which
          // is what made it feel like a long scroll rather than a reveal.
          scrollTrigger: { trigger: el, start: "top 78%" },
        },
      );
    }, el);

    return () => ctx.revert();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    // Captured before the first await. React nulls `currentTarget` as soon as
    // the handler yields, so reaching for it afterwards threw a TypeError into
    // the catch below — every successful send reported failure.
    const form = formRef.current;
    const data = new FormData(event.currentTarget);
    const payload = {
      name: data.get("name"),
      email: data.get("email"),
      projectType: data.get("projectType"),
      message: data.get("message"),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      setStatus("success");
      form?.reset();
    } catch {
      setStatus("error");
      setErrorMsg(
        `Something went wrong. Please try again, or email me directly at ${contact.email}.`,
      );
    }
  }

  return (
    <section
      ref={section}
      id="contact"
      data-tube-mode="contact"
      className="relative z-20 min-h-dvh"
    >
      {/* No background. The old section sat transparent over the light field and
          only the form card carried a surface — adding a panel here was wrong. */}
      <div className="flex min-h-dvh items-center px-6 sm:px-10 lg:px-16">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-14 py-[10vh] lg:grid-cols-2">
          <div data-rise>
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-lime-300">
              {contact.eyebrow}
            </p>

            <h2
              className={`${displayFont.className} mt-6 text-[clamp(2.6rem,6vw,4.5rem)] leading-none font-semibold`}
            >
              {contact.headline}
              <span className="text-lime-300">.</span>
            </h2>

            {/* Blur-settle, not a scrubbed sweep. This is the last thing on the
                page, so there is no scroll left beneath it for a scrub to run
                against — half the sentence would stay permanently unlit. */}
            <BlurLines
              start="top 80%"
              className="mt-8 max-w-md text-[1.02rem] leading-relaxed text-neutral-300"
            >
              {contact.body}
            </BlurLines>

            <p className="mt-8 text-sm text-neutral-400">
              Or email{" "}
              <a
                href={`mailto:${contact.email}`}
                data-cursor
                data-cursor-label="Email"
                className="text-neutral-100 underline decoration-lime-300/40 underline-offset-4 transition-colors hover:text-lime-300"
              >
                {contact.email}
              </a>
            </p>
          </div>

          {/* The card is the only surface in this section, exactly as before. */}
          <form
            ref={formRef}
            data-rise
            onSubmit={handleSubmit}
            className="space-y-4 rounded-[28px] border border-neutral-800/80 bg-neutral-950/80 p-6 shadow-[0_26px_80px_rgba(0,0,0,0.85)] backdrop-blur-xl md:p-8"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="name" className={LABEL}>
                  Your name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className={FIELD}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className={LABEL}>
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={FIELD}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="projectType" className={LABEL}>
                Project type
              </label>
              <input
                id="projectType"
                name="projectType"
                placeholder="Hotel site, storefront, app, automation…"
                className={FIELD}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="message" className={LABEL}>
                Project details
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                required
                placeholder="Where it is now, where it needs to get to, roughly when."
                className={`${FIELD} resize-none`}
              />
            </div>

            <div className="flex flex-col gap-3 pt-1 md:flex-row md:items-center md:justify-between">
              <button
                type="submit"
                disabled={status === "loading"}
                data-cursor
                data-cursor-label="Send"
                className="inline-flex items-center justify-center rounded-full bg-lime-300 px-6 py-2.5 text-sm font-medium text-black shadow-[0_16px_40px_rgba(190,242,100,0.35)] transition hover:-translate-y-px hover:shadow-[0_18px_50px_rgba(190,242,100,0.45)] active:translate-y-0 disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-lime-300 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none"
              >
                {status === "loading" ? "Sending…" : "Send message"}
              </button>

              {/* Announced to screen readers, which the old silent swap was not. */}
              <p role="status" aria-live="polite" className="text-[0.72rem]">
                {status === "success" && (
                  <span className="text-lime-300">
                    Sent — I&rsquo;ll come back to you.
                  </span>
                )}
                {status === "error" && (
                  <span className="text-red-400">{errorMsg}</span>
                )}
                {status === "idle" && (
                  <span className="hidden text-neutral-400 md:inline">
                    This goes straight to me.
                  </span>
                )}
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
