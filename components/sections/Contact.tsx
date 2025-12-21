// components/sections/Contact.tsx
"use client";

import React from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useScrollSteps } from "../system/ScrollProgressProvider";
import { displayFont } from "@/app/fonts";

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 80, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: [0.19, 1, 0.22, 1],
      when: "beforeChildren",
      staggerChildren: 0.06,
    },
  },
  exit: {
    opacity: 0,
    y: -60,
    scale: 1.02,
    transition: { duration: 0.55, ease: [0.19, 1, 0.22, 1] },
  },
};

const Contact: React.FC = () => {
  const { step } = useScrollSteps();
  const isActive = step === "contact_intro"; // only show at final step

  const [status, setStatus] = React.useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = React.useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);

    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      projectType: formData.get("projectType"),
      message: formData.get("message"),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      setStatus("success");
      e.currentTarget.reset();
    } catch (err) {
      console.error(err);
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again or email me directly.");
    }
  }

  return (
    <AnimatePresence>
      {isActive && (
        <motion.section
          key="contact-section"
          data-section="contact"
          className="fixed inset-0 flex items-center justify-center px-6 md:px-10 lg:px-16 pointer-events-none"
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div className="max-w-6xl w-full mx-auto pointer-events-auto grid gap-12 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)] items-center">
            {/* LEFT SIDE — Title + Text */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
            >
              <p className="text-[0.7rem] tracking-[0.28em] uppercase text-neutral-500">
                Tell us about your project
              </p>

              <h2
                className={`${displayFont.className} text-[clamp(2.8rem,5vw,4.5rem)] leading-none font-semibold`}
              >
                SAY HI<span className="text-lime-300">!</span>
              </h2>

              <p className="text-sm md:text-base text-neutral-300 max-w-md">
                Let&apos;s collaborate and make something premium, fast, and
                alive. Share a bit about what you&apos;re building and we&apos;ll
                get back to you with ideas, scope, and timeline.
              </p>

              <div className="space-y-1 text-sm text-neutral-400">
                <p>
                  Email:{" "}
                  <a
                    href="mailto:hello@toadcreatives.dev"
                    className="text-neutral-100 hover:text-lime-300 transition-colors"
                  >
                    hello@toadcreatives.dev
                  </a>
                </p>
              </div>
            </motion.div>

            {/* RIGHT SIDE — Form */}
            <motion.div
              className="rounded-[32px] bg-neutral-950/80 border border-neutral-800/80 backdrop-blur-xl shadow-[0_26px_80px_rgba(0,0,0,0.85)] p-6 md:p-7 lg:p-8"
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                ease: [0.19, 1, 0.22, 1],
                delay: 0.08,
              }}
              data-allow-scroll="true"
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* NAME + EMAIL */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="name"
                      className="text-xs uppercase tracking-[0.18em] text-neutral-400"
                    >
                      Your name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      className="rounded-2xl bg-neutral-900/70 border border-neutral-700/80 px-3.5 py-2.5 text-sm text-neutral-50 outline-none focus:border-lime-300 focus:ring-1 focus:ring-lime-300/80 transition"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="email"
                      className="text-xs uppercase tracking-[0.18em] text-neutral-400"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="rounded-2xl bg-neutral-900/70 border border-neutral-700/80 px-3.5 py-2.5 text-sm text-neutral-50 outline-none focus:border-lime-300 focus:ring-1 focus:ring-lime-300/80 transition"
                    />
                  </div>
                </div>

                {/* PROJECT TYPE ONLY */}
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="projectType"
                    className="text-xs uppercase tracking-[0.18em] text-neutral-400"
                  >
                    Project type
                  </label>
                  <input
                    id="projectType"
                    name="projectType"
                    placeholder="Hotel website, portfolio, e-commerce, app…"
                    className="rounded-2xl bg-neutral-900/70 border border-neutral-700/80 px-3.5 py-2.5 text-sm text-neutral-50 outline-none focus:border-lime-300 focus:ring-1 focus:ring-lime-300/80 transition"
                  />
                </div>

                {/* MESSAGE */}
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="message"
                    className="text-xs uppercase tracking-[0.18em] text-neutral-400"
                  >
                    Project details
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    required
                    placeholder="What are you building? Timeline, references, features, anything helps."
                    className="rounded-2xl bg-neutral-900/70 border border-neutral-700/80 px-3.5 py-2.5 text-sm text-neutral-50 outline-none focus:border-lime-300 focus:ring-1 focus:ring-lime-300/80 transition resize-none"
                  />
                </div>

                {/* SUBMIT */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-medium bg-lime-300 text-black shadow-[0_16px_40px_rgba(190,242,100,0.35)] hover:shadow-[0_18px_50px_rgba(190,242,100,0.45)] hover:-translate-y-[1px] active:translate-y-0 transition-transform transition-shadow duration-200 disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    {status === "loading" ? "Sending…" : "Send message"}
                  </button>

                  <div className="space-y-1">
                    <p className="hidden md:block text-[0.7rem] text-neutral-500">
                      You’ll hear directly from me.
                    </p>

                    {status === "success" && (
                      <p className="text-[0.7rem] text-lime-300">
                        Message sent — I&apos;ll get back to you soon.
                      </p>
                    )}

                    {status === "error" && (
                      <p className="text-[0.7rem] text-red-400">
                        {errorMsg}
                      </p>
                    )}
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </motion.section>
      )}
    </AnimatePresence>
  );
};

export default Contact;
