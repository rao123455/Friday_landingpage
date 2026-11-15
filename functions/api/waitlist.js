/*
 * functions/api/waitlist.js — the Friday website's waitlist (Cloudflare Pages Function).
 *
 * Stores exactly what launch/site/privacy.html says it stores: the email address, which
 * option it pre-ordered (trial, monthly or forever) and the time. Nothing else: no IP, no
 * user agent, no referrer. Nothing is charged; a pre-order is a reservation.
 *
 *   POST /api/waitlist   {email, consent, plan, windows, cli}   JSON (from the page's script) or a plain form post
 *
 * `windows` and `cli` are the two preview questions; both optional and from a fixed list, so
 * nothing free-text about a person is ever stored. `plan` is the price they say they might pick.
 *
 * Needs a Workers KV namespace bound as WAITLIST (see launch/DEPLOY.md). Without it the
 * function says so and stores nothing, rather than pretending to succeed.
 *
 * Deliberate choices:
 * - Same-origin only: another site cannot post into the list on a visitor's behalf.
 * - A hidden "website" field catches simple bots; a filled one gets a normal-looking
 *   success and nothing is stored, so the bot learns nothing.
 * - Joining twice answers exactly like joining once, so the endpoint cannot be used to
 *   find out whether someone is on the list.
 * - No rate limiting here: KV is the wrong tool for it. Add a Cloudflare rate-limiting
 *   rule on /api/waitlist if spam appears.
 */

const MAX_LEN = 254;
const PLANS = ["trial", "monthly", "forever"];
const WINDOWS = ["11", "10", "other"];
const CLIS = ["claude", "codex", "gemini", "none"];
const pick = (value, allowed) => { const v = value === undefined ? "" : String(value); return v === "" || allowed.includes(v) ? v : null; };
const EMAIL = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/;

export async function onRequestPost({ request, env }) {
  const self = new URL(request.url).origin;
  const origin = request.headers.get("Origin");
  if (origin && origin !== self) {
    return reply(request, 403, "This form only accepts entries from the Friday site.");
  }
  if (!env || !env.WAITLIST) {
    return reply(request, 503, "The waitlist isn't connected yet, so nothing was stored. Please try again later.");
  }

  let data;
  try {
    const type = request.headers.get("Content-Type") || "";
    data = type.includes("application/json")
      ? await request.json()
      : Object.fromEntries(await request.formData());
  } catch {
    return reply(request, 400, "That didn't arrive in a form we can read, so nothing was stored.");
  }
  if (!data || typeof data !== "object") {
    return reply(request, 400, "That didn't arrive in a form we can read, so nothing was stored.");
  }

  if (data.website) return reply(request, 200, OK);           // honeypot: say yes, store nothing

  const email = String(data.email || "").trim().toLowerCase();
  if (!email || email.length > MAX_LEN || !EMAIL.test(email)) {
    return reply(request, 400, "That doesn't look like an email address. Check it and try again.");
  }
  const consent = data.consent === true || data.consent === "on" || data.consent === "true";
  if (!consent) {
    return reply(request, 400, "Tick the box to confirm you're 18 or older and agree to the emails.");
  }

  const plan = data.plan === undefined || data.plan === "" ? "trial" : String(data.plan);
  if (!PLANS.includes(plan)) {
    return reply(request, 400, "Pick one of the price options, or not sure.");
  }

  const windows = pick(data.windows, WINDOWS), cli = pick(data.cli, CLIS);
  if (windows === null || cli === null) {
    return reply(request, 400, "One of the answers wasn't one of the choices, so nothing was stored.");
  }

  const key = "email:" + email;
  try {
    const was = await env.WAITLIST.get(key);
    const before = was ? JSON.parse(was) : null;
    const next = { joined: before ? before.joined : new Date().toISOString(), plan, windows, cli };
    if (!before || before.plan !== plan || before.windows !== windows || before.cli !== cli) {
      // a second request only updates the answers; the original join time is kept
      await env.WAITLIST.put(key, JSON.stringify(next));
    }
  } catch {
    // Free Workers KV allows 1,000 writes a day; past that, or in an outage, say so plainly.
    return reply(request, 503, "We're busy right now and nothing was stored. Please try again later.");
  }
  return reply(request, 200, OK);
}

export function onRequestGet() {
  return new Response("Use the form on the Friday site to join the waitlist.", {
    status: 405, headers: { "Allow": "POST", "Content-Type": "text/plain; charset=utf-8" },
  });
}

const OK = "You're on the list. If you're picked, the invite comes to this address. Nothing to pay.";

function reply(request, status, message) {
  const wantsJson = (request.headers.get("Accept") || "").includes("application/json");
  if (wantsJson) {
    return new Response(JSON.stringify({ ok: status === 200, message }), {
      status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  }
  // A plain form post (script off): answer with a small page and a way back.
  const page = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Friday waitlist</title><body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#0A0B0C;color:#ECEBE7;font:300 18px/1.6 system-ui,sans-serif;padding:24px">
<main style="max-width:36rem"><p>${message}</p><p><a href="/#preview" style="color:#ECEBE7">Back to Friday</a></p></main></body></html>`;
  return new Response(page, {
    status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}
