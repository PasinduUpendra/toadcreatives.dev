import { NextResponse } from "next/server";
import { Resend } from "resend";

/** Generous for a real enquiry, small enough to bound abuse. */
const LIMITS = { name: 120, email: 254, projectType: 160, message: 5000 } as const;
const MAX_PER_WINDOW = 5;
const WINDOW_MS = 10 * 60 * 1000;

/**
 * In-memory throttle, keyed by client IP.
 *
 * Deliberately simple: this is a single contact form on a personal site, not a
 * platform. It resets when the serverless instance recycles, so it is a speed
 * bump against scripted abuse rather than a guarantee — a shared store would be
 * the answer if this ever needed to be one.
 */
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);

  // Opportunistic cleanup so the map cannot grow without bound.
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (!times.some((t) => now - t < WINDOW_MS)) hits.delete(key);
    }
  }
  return recent.length > MAX_PER_WINDOW;
}

/** Strips CR/LF so user input can never inject extra email headers. */
const singleLine = (value: unknown, max: number): string =>
  typeof value === "string" ? value.replace(/[\r\n]+/g, " ").trim().slice(0, max) : "";

const multiLine = (value: unknown, max: number): string =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

// Deliberately permissive: the job is to reject nonsense, not to police the
// long tail of valid addresses.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (rateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many messages. Please try again shortly." },
        { status: 429, headers: { "Retry-After": String(WINDOW_MS / 1000) } },
      );
    }

    const raw = await req.json().catch(() => null);
    if (!raw || typeof raw !== "object") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const body = raw as Record<string, unknown>;
    const name = singleLine(body.name, LIMITS.name);
    const email = singleLine(body.email, LIMITS.email);
    const projectType = singleLine(body.projectType, LIMITS.projectType);
    const message = multiLine(body.message, LIMITS.message);

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "That email address looks wrong" }, { status: 400 });
    }

    const { RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL } = process.env;
    if (!RESEND_API_KEY || !CONTACT_TO_EMAIL || !CONTACT_FROM_EMAIL) {
      console.error("Contact form is not configured (missing env vars)");
      // Never tell the caller which piece of configuration is absent.
      return NextResponse.json({ error: "Email configuration error" }, { status: 500 });
    }

    const resend = new Resend(RESEND_API_KEY);
    await resend.emails.send({
      from: CONTACT_FROM_EMAIL,
      to: CONTACT_TO_EMAIL,
      replyTo: email,
      subject: `New project enquiry from ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        projectType ? `Project type: ${projectType}` : "",
        "",
        "Message:",
        message,
      ]
        .filter(Boolean)
        .join("\n"),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json(
      { error: "Something went wrong sending your message." },
      { status: 500 },
    );
  }
}
