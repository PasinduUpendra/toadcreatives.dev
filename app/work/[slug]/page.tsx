import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { displayFont } from "@/app/fonts";
import CaseStudyBody from "@/components/work/CaseStudyBody";
import CustomCursor from "@/components/ui/CustomCursor";
import { projects, projectBySlug } from "@/content/projects";

const SITE_URL = "https://toadcreatives.dev";

/** Prerenders every case study at build time, so each has a static HTML page. */
export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) return {};

  const title = `${project.name} — ${project.title}`;
  const url = `${SITE_URL}/work/${project.slug}`;

  return {
    title,
    description: project.summary,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      type: "article",
      url,
      title,
      description: project.summary,
      images: [{ url: project.cover, alt: `${project.name} — ${project.title}` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: project.summary,
      images: [project.cover],
    },
  };
}

export default async function WorkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) notFound();

  // Per-page schema, including a breadcrumb so search results can show the path.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        "@id": `${SITE_URL}/work/${project.slug}#work`,
        name: `${project.name} — ${project.title}`,
        headline: project.title,
        description: project.summary,
        dateCreated: project.year,
        creator: { "@id": `${SITE_URL}/#person` },
        image: `${SITE_URL}${project.cover}`,
        ...(project.liveUrl ? { url: project.liveUrl } : {}),
        about: project.category,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Work", item: `${SITE_URL}/#work` },
          {
            "@type": "ListItem",
            position: 3,
            name: project.name,
            item: `${SITE_URL}/work/${project.slug}`,
          },
        ],
      },
    ],
  };

  return (
    <main id="main" className="relative z-10 min-h-dvh bg-ink">
      {/* Carries the brand cursor onto deep-linked pages. No WebGL field here:
          these are read from search results and should stay light. */}
      <CustomCursor />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-4xl px-6 pt-24 pb-32 sm:px-10">
        <nav aria-label="Breadcrumb" className="mb-10">
          <Link
            href="/#work"
            data-cursor
            data-cursor-label="Back"
            className="inline-flex items-center gap-2 rounded font-mono text-[0.6rem] tracking-[0.22em] text-neutral-400 uppercase transition-colors hover:text-lime-300 focus-visible:ring-2 focus-visible:ring-lime-300 focus-visible:outline-none"
          >
            <span aria-hidden="true">←</span> All work
          </Link>
        </nav>

        <p className="font-mono text-[0.6rem] tracking-[0.24em] text-lime-300 uppercase">
          Case study · {project.year}
        </p>
        <p
          className={`${displayFont.className} mt-2 text-lg font-semibold text-white`}
        >
          {project.name}
        </p>

        <article className="mt-8">
          <CaseStudyBody project={project} as="h1" />
        </article>

        <div className="mt-20 border-t border-white/10 pt-10">
          <p className="font-mono text-[0.6rem] tracking-[0.24em] text-neutral-400 uppercase">
            More work
          </p>
          <ul className="mt-5 flex flex-wrap gap-3">
            {projects
              .filter((p) => p.slug !== project.slug)
              .map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/work/${p.slug}`}
                    data-cursor
                    data-cursor-label="View"
                    className="inline-flex rounded-full border border-white/15 px-4 py-2 text-sm text-neutral-300 transition-colors hover:border-lime-300/50 hover:text-white focus-visible:ring-2 focus-visible:ring-lime-300 focus-visible:outline-none"
                  >
                    {p.name}
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
