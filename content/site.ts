/**
 * All site copy in one place. Sections import from here rather than embedding
 * strings, so the voice can be reviewed as a whole instead of hunting through
 * five components.
 */

export const FIRST_YEAR = 2014;
export const SITES_SHIPPED = "60+";
export const BASED_IN = "Ireland";

/** Kept as a function so the number never goes stale in the copy or the schema. */
export const yearsBuilding = () => new Date().getFullYear() - FIRST_YEAR;

export const hero = {
  headline: "I build websites, apps, and the systems behind them.",
  sub: `Building for the web since ${FIRST_YEAR}. ${SITES_SHIPPED} sites shipped, now based in ${BASED_IN}. One person from first sketch to production.`,
};

export const about = {
  eyebrow: "About",
  lead: "I started building websites in 2014 and never stopped.",
  paragraphs: [
    {
      id: "who",
      label: "Who I am",
      body: `Sixty-odd sites later I'm in ${BASED_IN}, working with founders who need someone to take an idea from a rough sketch to something live, without a chain of handoffs in between.`,
    },
    {
      id: "how",
      label: "How I work",
      body: "I write the spec before I write the code — what it does, what it doesn't, where it will break. Slower on day one and much faster by week three, and you always know what you are getting before I build it.",
    },
    {
      id: "who-with",
      label: "Who I work with",
      body: "Hotels, shop owners, founders and studios. A lot of the work arrives already in trouble — a build that stalled, a site nobody can maintain, a design the client has gone off. I am comfortable walking into that.",
    },
  ],
};

export const services = {
  eyebrow: "What I do",
  lead: "Most people come to me with a site that needs building, or one that needs saving.",
  items: [
    {
      id: "hospitality",
      label: "Hotels & hospitality",
      body: "Boutique properties, from brand new builds to full redesigns of sites that stopped working. Rooms, restaurant, gallery and a booking engine that has to keep taking reservations the whole time.",
    },
    {
      id: "ecommerce",
      label: "E-commerce, from scratch",
      body: "Storefronts built up rather than dropped in — Shopify, WooCommerce, custom. Product structure, PDP and checkout designed around getting people through it, not around the theme demo.",
    },
    {
      id: "rescue",
      label: "Debugging & performance",
      body: "The work I get called in for most: something is broken, slow, or nobody left knows how it works. I find the actual cause, fix it, and tell you plainly what it was.",
    },
    {
      id: "custom",
      label: "Custom builds",
      body: "The things that do not come off a shelf — internal tools, browser extensions, WordPress plugins, automation pipelines and AI workflows that run a job you currently do by hand.",
    },
  ],
};

export const work = {
  eyebrow: "Selected work",
  lead: "Three builds, start to ship.",
};

export const contact = {
  eyebrow: "Start a project",
  headline: "Say hi",
  body: "Tell me what you are building — where it is now, where it needs to get to, and roughly when. This goes straight to my inbox.",
  email: "hello@toadcreatives.dev",
};
