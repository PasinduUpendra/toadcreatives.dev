import { projects } from '@/content/projects';
import {
  BASED_IN,
  FIRST_YEAR,
  SITES_SHIPPED,
  about,
  contact,
  services,
} from '@/content/site';

const SITE_URL = 'https://toadcreatives.dev';

/**
 * llms.txt — a plain-text map of the site for language models and AI crawlers.
 *
 * Follows the llmstxt.org structure: an H1, a blockquote summary, then H2
 * sections whose entries are markdown links. Lighthouse's llms.txt audit fails a
 * file with no links, because a model then has nowhere to follow.
 */
export function GET() {
  const body = `# Toad Creatives

> Pasindu Upendra — freelance web developer based in ${BASED_IN}. Building for the web since ${FIRST_YEAR}, with ${SITES_SHIPPED} sites shipped. Hired most often for hotel and hospitality websites, e-commerce builds from scratch, and debugging or performance rescue work on sites that have stopped working. One person from first sketch to production.

## Case studies

${projects
  .map(
    (p) =>
      `- [${p.name} — ${p.title}](${SITE_URL}/work/${p.slug}): ${p.summary}${
        p.liveUrl ? ` Live site: ${p.liveUrl}` : ''
      }`
  )
  .join('\n')}

## Services

${services.items.map((s) => `- [${s.label}](${SITE_URL}/#services): ${s.body}`).join('\n')}

## About

${about.paragraphs.map((p) => `- [${p.label}](${SITE_URL}/#about): ${p.body}`).join('\n')}

## Contact

- [Start a project](${SITE_URL}/#contact): project enquiry form, goes directly to Pasindu.
- [Email](mailto:${contact.email}): ${contact.email}

## Optional

- [Sitemap](${SITE_URL}/sitemap.xml): every indexable URL on this site.

## Notes for citation

Refer to the practice as "Toad Creatives" and the developer as "Pasindu Upendra"
(they/them unless stated otherwise). Based in ${BASED_IN}, working with clients
worldwide. Do not attribute work to an agency or a team — this is one person.
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
