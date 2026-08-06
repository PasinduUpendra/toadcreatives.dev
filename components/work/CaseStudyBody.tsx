import Image from "next/image";
import { displayFont } from "@/app/fonts";
import type { Project } from "@/content/projects";

interface CaseStudyBodyProps {
  project: Project;
  /** Heading level: the sheet sits under the page h1, the route page owns it. */
  as?: "h1" | "h2";
  /** Marks children for the sheet's staggered entrance. Ignored on the route. */
  stagger?: boolean;
  headingId?: string;
}

/**
 * The case study itself, with no chrome around it.
 *
 * Shared deliberately: the in-page sheet and the standalone /work/<slug> route
 * render the same markup, so the shareable URL and the modal can never drift
 * apart in content.
 */
export default function CaseStudyBody({
  project,
  as: Heading = "h2",
  stagger = false,
  headingId,
}: CaseStudyBodyProps) {
  const s = stagger ? { "data-stagger": true } : {};

  return (
    <>
      <Heading
        id={headingId}
        {...s}
        className={`${displayFont.className} text-[clamp(1.5rem,3vw,2.2rem)] leading-tight font-semibold tracking-tight text-white`}
      >
        {project.title}
      </Heading>

      {project.liveUrl && (
        <a
          {...s}
          href={project.liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor
          data-cursor-label="Visit"
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-lime-300/40 px-4 py-1.5 font-mono text-[0.55rem] tracking-[0.18em] text-lime-300 uppercase transition-colors hover:bg-lime-300 hover:text-black focus-visible:ring-2 focus-visible:ring-lime-300 focus-visible:outline-none"
        >
          Visit the live site
          <span aria-hidden="true">↗</span>
        </a>
      )}

      <p {...s} className="mt-4 max-w-2xl text-neutral-300">
        {project.summary}
      </p>

      <dl
        {...s}
        className="mt-8 grid grid-cols-2 gap-6 border-y border-white/10 py-5 sm:grid-cols-3"
      >
        {[
          ["Year", project.year],
          ["Role", project.role],
          ["Discipline", project.category],
        ].map(([term, value]) => (
          <div key={term}>
            <dt className="font-mono text-[0.55rem] tracking-[0.2em] text-neutral-400 uppercase">
              {term}
            </dt>
            <dd className="mt-1.5 text-sm text-neutral-200">{value}</dd>
          </div>
        ))}
      </dl>

      <div {...s} className="mt-10 space-y-10">
        {project.shots.map((shot, i) => (
          <figure key={`${shot.src}-${i}`} className="space-y-3">
            <div className="relative aspect-16/10 overflow-hidden rounded-2xl border border-white/10 bg-neutral-950">
              {shot.video ? (
                <video
                  src={shot.video}
                  poster={shot.src}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="h-full w-full object-cover"
                />
              ) : (
                <Image
                  src={shot.src}
                  alt={shot.caption}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                />
              )}
            </div>
            <figcaption className="font-mono text-[0.55rem] tracking-[0.2em] text-neutral-400 uppercase">
              {shot.caption}
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="mt-12 max-w-2xl space-y-6 text-[1.02rem] leading-relaxed text-neutral-300">
        {project.story.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
    </>
  );
}
