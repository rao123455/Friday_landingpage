# Friday website

The public website for Friday, deployed on Cloudflare Workers.

- `launch/site/` — the pages, fonts and 3D files
- `worker/index.js` — sends `/api/*` requests to the pre-order code
- `functions/api/waitlist.js` — saves pre-orders to Cloudflare KV
- `wrangler.toml` — tells Cloudflare all of the above

Cloudflare builds and deploys this automatically on every push to `main`
(deploy command `npx wrangler deploy`, no build command).
