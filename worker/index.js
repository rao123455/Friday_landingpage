/*
 * worker/index.js — the Friday website on Cloudflare Workers.
 *
 * Static files in launch/site are served by Workers Static Assets before this code runs.
 * Only /api/* reaches it (`run_worker_first` in wrangler.toml), and the one route there is
 * the pre-order list, whose logic lives in functions/api/waitlist.js and is tested by
 * tests/test_waitlist_function.py. Everything else falls through to the static files.
 */

import { onRequestPost, onRequestGet } from "../functions/api/waitlist.js";

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === "/api/waitlist") {
      if (request.method === "POST") return onRequestPost({ request, env });
      return onRequestGet();
    }
    if (pathname.startsWith("/api/")) {
      return new Response("Not found.", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }
    return env.ASSETS.fetch(request);
  },
};
