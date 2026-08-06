"use client";

import { useMemo, useState } from "react";
import { GROUPS, demos } from "./registry";

type Frame = "desktop" | "mobile";

export default function LabShell() {
  const [activeId, setActiveId] = useState(demos[0].id);
  const [frame, setFrame] = useState<Frame>("desktop");
  const [replayKey, setReplayKey] = useState(0);
  const [navOpen, setNavOpen] = useState(false);

  const active = useMemo(() => demos.find((d) => d.id === activeId) ?? demos[0], [activeId]);
  const Demo = active.component;

  const select = (id: string) => {
    const next = demos.find((d) => d.id === id);
    setActiveId(id);
    setFrame(next?.prefersMobile ? "mobile" : "desktop");
    setReplayKey((k) => k + 1);
    setNavOpen(false);
  };

  return (
    <div data-lab-root className="min-h-screen bg-[#050505] text-neutral-200">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <aside
          className={`${
            navOpen ? "block" : "hidden"
          } shrink-0 border-b border-white/10 lg:block lg:w-72 lg:border-r lg:border-b-0`}
        >
          <div className="p-6 lg:sticky lg:top-0 lg:max-h-screen lg:overflow-y-auto">
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.28em] text-lime-300">
              Toad Motion Lab
            </p>
            <p className="mt-2 text-sm text-neutral-500">
              {demos.length} prototypes. Pick the ones you want in the site.
            </p>

            <nav className="mt-8 space-y-7">
              {GROUPS.map((group) => {
                const items = demos.filter((d) => d.group === group);
                if (!items.length) return null;
                return (
                  <div key={group}>
                    <p className="font-mono text-[0.58rem] uppercase tracking-[0.24em] text-neutral-600">
                      {group}
                    </p>
                    <ul className="mt-3 space-y-0.5">
                      {items.map((demo) => {
                        const isActive = demo.id === activeId;
                        return (
                          <li key={demo.id}>
                            <button
                              type="button"
                              onClick={() => select(demo.id)}
                              aria-current={isActive ? "true" : undefined}
                              className={`group flex w-full items-baseline gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                                isActive
                                  ? "bg-lime-300/10 text-white"
                                  : "text-neutral-400 hover:bg-white/5 hover:text-neutral-100"
                              }`}
                            >
                              <span
                                className={`font-mono text-[0.62rem] ${
                                  isActive ? "text-lime-300" : "text-neutral-600"
                                }`}
                              >
                                {demo.code}
                              </span>
                              <span className="text-sm">{demo.name}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <header className="flex flex-wrap items-center gap-4 border-b border-white/10 px-6 py-4">
            <button
              type="button"
              onClick={() => setNavOpen((v) => !v)}
              className="rounded-full border border-white/15 px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-neutral-300 lg:hidden"
            >
              {navOpen ? "Close" : "Demos"}
            </button>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-medium text-white">
                <span className="font-mono text-xs text-lime-300">{active.code}</span>{" "}
                {active.name}
              </h1>
              <p className="font-mono text-[0.58rem] uppercase tracking-[0.2em] text-neutral-600">
                {active.answers}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex rounded-full border border-white/15 p-0.5">
                {(["desktop", "mobile"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFrame(f)}
                    aria-pressed={frame === f}
                    className={`rounded-full px-3 py-1 font-mono text-[0.58rem] uppercase tracking-[0.18em] transition-colors ${
                      frame === f ? "bg-lime-300 text-black" : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setReplayKey((k) => k + 1)}
                className="rounded-full border border-lime-300/40 bg-lime-300/10 px-4 py-1.5 font-mono text-[0.58rem] uppercase tracking-[0.18em] text-lime-200 transition-colors hover:bg-lime-300 hover:text-black"
              >
                Replay
              </button>
            </div>
          </header>

          <div className="flex flex-1 items-start justify-center bg-[#070707] p-4 sm:p-8">
            <div
              className={`w-full overflow-hidden rounded-2xl border border-white/10 bg-[#050505] ${
                frame === "mobile" ? "max-w-[390px]" : "max-w-none"
              }`}
              style={{ height: frame === "mobile" ? 844 : "min(78vh, 900px)" }}
            >
              <div key={`${active.id}-${replayKey}-${frame}`} className="h-full w-full">
                <Demo replayKey={replayKey} />
              </div>
            </div>
          </div>

          <footer className="border-t border-white/10 px-6 py-5">
            <p className="max-w-3xl text-sm leading-relaxed text-neutral-400">{active.note}</p>
          </footer>
        </main>
      </div>
    </div>
  );
}
