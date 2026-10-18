# MX Astro — Cloudflare production activation

## Why activation is necessary

As checked 2026-10-18, public GET /api/sync and GET /api/push both returned
configured:false. Web source, user interfaces, Chromium/WebKit QA and Qwen3
are deployed. However **closed-app Web Push and live cross-device sync will
not work** until Cloudflare database/keys/cron are provisioned in your account.

## 1. D1 (Pages + scheduled Worker)

Cloudflare Dashboard → Storage & databases → D1 → Create database, suggested
name: mx-astro-private. Open its Console and execute workers/schema.sql.
Read database ID from its overview.

Cloudflare Dashboard → Workers & Pages → mxastro → Settings → Functions →
D1 database bindings. Bind the exact name MX_SYNC_DB to mx-astro-private for
the production environment, then redeploy Pages.

Check https://mxastro.pages.dev/api/sync
Expected response includes configured:true and storage:cloudflare-d1.

The database contains only an AES-GCM encrypted profile payload, a SHA-256
capability verifier and version metadata for sync. There is no username or
birth date stored in the sync table in plaintext.

## 2. VAPID key generation (on your own secure computer)

With Node 22+, run:

    node scripts/generate-vapid.mjs

It prints MX_VAPID_PUBLIC_KEY and a PRIVATE JWK.
Keep the private JWK SECRET. NEVER commit or share it in chat.

Add the public key to Cloudflare Pages production variables under exact name
MX_VAPID_PUBLIC_KEY. Add the private key to Pages secret variables under
MX_VAPID_PRIVATE_JWK. Set corresponding public variable and private secret
on the scheduled Worker below. Rotating VAPID keys requires resubscription.

## 3. Deploy 15-minute cron worker

Copy workers/wrangler.eye.template.toml to a private local
workers/wrangler.eye.toml and add the following binding to the local file:

    [[d1_databases]]
    binding = "MX_SYNC_DB"
    database_name = "mx-astro-private"
    database_id = "YOUR_DATABASE_ID_FROM_CLOUDFLARE"

This local config must not be committed. From the repository directory run:

    npx wrangler deploy --config workers/wrangler.eye.toml
    npx wrangler secret put MX_VAPID_PRIVATE_JWK --config workers/wrangler.eye.toml

In Cloudflare Worker settings add MX_VAPID_PUBLIC_KEY as a variable. Confirm
the D1 binding and cron trigger are active. When confirmed, set Pages
environment variable MX_PUSH_READY=true and redeploy Pages. Do not set it
before the cron is actually live.

Check https://mxastro.pages.dev/api/push
Expected response: configured:true, schedulerEnabled:true and a public key.

## 4. Verify on real Apple and desktop devices

On iPhone Safari: Share → Add to Home Screen → launch MX Astro from the icon.
Then Settings → MX Eye → Enable / update background push. Allow notifications.
Desktop Safari/Chrome/Edge can subscribe using browser notification permission.
Use Send test push and verify an actual OS notification while the page is closed.

A 15-minute cron gives approximate delivery, not minute-exact guarantees.
iOS or providers can delay/disable alerts for battery/network reasons. The
app uploads a rolling list of Swiss-ephemeris Moon ingress/VOC timestamps
without name, birth date or private relationship details. Reopen periodically
to refresh that list. Timezone and opt-in preferences are uploaded.

## 5. Verify encrypted transfer between devices

Device A: Settings → Encrypted Sync → Create code. Keep the sharing code private.
Enter your own 12+ character passphrase and upload encrypted.
Device B: paste code, enter same passphrase, download and merge. Inspect
the transferred profiles and journal. Download recent version before uploading
from the second device; 409 conflicts intentionally protect against data loss.

The remote sync is opt-in and manual. The separate Settings local vault can
encrypt device profiles and journal in browser storage; it requires a password
every launch. Neither passphrase is uploaded to Cloudflare.

## Real limitations

- Browser QA in Linux WebKit tests Safari engine but not a physical iPhone.
- Actual delivery must be checked on a device after configuring D1 and cron.
- Apple Watch and native iOS widgets are separate native app development.
- Do not put Cloudflare API tokens, VAPID private JWK, sync code, vault
  password or decrypted backups into GitHub or chat.
