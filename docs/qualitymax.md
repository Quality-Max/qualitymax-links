# QualityMax Links

A branded link hub for campaign links, social profiles, and sticker QR codes.
The app is a public fork of
[LittleLink-Server](https://github.com/timothystewart6/littlelink-server), with
the upstream MIT license preserved. It uses QualityMax's official wordmark,
DM Sans and Space Grotesk fonts, and dark Zinc, Indigo, and Violet colors.

## Page content

Edit `src/config/qualitymax.ts` to change the default labels, destinations, or
button order. Keep button identifiers stable so analytics remain comparable.

| Button | Destination | Click event |
| --- | --- | --- |
| Book a demo | [Calendar](https://calendar.app.google/66H2NEs2MoATZ93i6) | `demo-button` |
| See a verified code fix | [Example](https://qualitymax.io/verified-patch-sample) | `proof-button` |
| Explore QualityMax | [Website](https://qualitymax.io/) | `platform-button` |
| Get 9lives for Playwright | [9lives](https://9lives.run/) | `9lives-button` |
| Meet qmax-code | [qmax-code](https://qualitymax.io/qmax-code) | `qmax-code-button` |
| Read the documentation | [Docs](https://docs.qualitymax.io/) | `docs-button` |

The container enables `QUALITYMAX_BRANDING=true`. For local development:

```bash
yarn install --frozen-lockfile
QUALITYMAX_BRANDING=true yarn dev
```

Supported upstream environment variables override the defaults at runtime.
An empty value clears a default. Keep `THEME=Dark` with the white wordmark.
The hub defaults to `noindex,follow` to keep search traffic on the main site.

## Railway deployment

Deploy this fork's Dockerfile; Railway detects it automatically. In service
Settings, set the Healthcheck Path to `/healthcheck`, leave the restart policy
on On Failure, and set Max restart retries to `3`. New services use the dashboard
settings because Railway has deprecated `railway.json` configuration.
The app is stateless and needs no database or volume. Public traffic targets
port `3000`; the server listens on `0.0.0.0`.

For GitHub automatic deployments, connect
`Quality-Max/qualitymax-links`, branch `main`, in the Railway service's
Settings → Source. This requires the Railway GitHub app to have access to
the Quality-Max repository. Otherwise deploy from a clean checkout with:

```bash
railway link
railway up --detach --service qualitymax-links
```

Generate a Railway domain in Settings → Networking. For a branded address,
add `links.qualitymax.io` as a custom domain and copy Railway's exact DNS records
into the DNS provider. Wait for domain verification and HTTPS before printing
QR codes. Set `OG_URL` to the final HTTPS address after DNS is ready.

Configuration changes require a redeploy or restart. Confirm `/healthcheck`
returns HTTP 200 and check the page on mobile after each release. Roll back
using Railway's deployment history if a release fails.

## Umami analytics

The app serves the links; the analytics dashboard lives in Umami. Tracking is
disabled until a real website ID and script URL are configured. Button links
continue working when analytics is blocked or unavailable.

1. Create an account at [Umami Cloud](https://cloud.umami.is).
2. Add a website for the final link-hub hostname.
3. Copy its generated tracking code. Use only the public website ID and script
   URL; the app does not need an Umami API key or account password.
4. Add these public settings in Railway's service Variables:

   | Setting | Value |
   | --- | --- |
   | `UMAMI_WEBSITE_ID` | The website's public UUID |
   | `UMAMI_APP_URL` | The origin from the generated script URL |
   | `UMAMI_SCRIPT_NAME` | The script filename, normally `script.js` |

   For the standard `https://cloud.umami.is/script.js` snippet, the origin is
   `https://cloud.umami.is` and the filename is `script.js`. Copy the actual
   generated values if Umami provides a different URL. Set the filename
   explicitly because upstream's default is `umami.js`.
5. Redeploy, open the hub without a tracker blocker, and click each button.
   Confirm pageviews and the six events above in Umami's dashboard.

Umami Cloud's free tier currently includes 100,000 events/month, one website,
and six months of retention. Pageviews and custom events both count toward
the limit. Check [current pricing](https://umami.is/pricing) before choosing a
paid tier.

Use campaign URLs such as `?utm_source=sticker&utm_medium=qr&utm_campaign=launch`
to distinguish incoming traffic. The hub does not automatically append those
parameters to outbound destinations. A demo-button event counts a click,
not a completed booking; repeated clicks are possible. Booking conversions
need measurement in the booking flow itself.

Upstream also supports Google Analytics and Matomo; their dashboards live in
those services. This fork's launch path uses Umami. Matomo event behavior has
not been validated for this deployment. See
[upstream analytics documentation](https://github.com/timothystewart6/littlelink-server/blob/main/docs/analytics.md).

Self-hosting Umami on Railway would require an additional Umami service and
database, with backups, upgrades, and extra usage charges. Umami Cloud keeps
those tasks separate from this small link hub.

## Railway versus Vercel

Prices below were checked on 12 October 2026 and can change.

| Option | Benefits | Costs and limitations |
| --- | --- | --- |
| Railway | Runs the existing Docker image; runtime configuration; health checks; straightforward custom domains and rollback | Paid production hosting; resource usage and outbound traffic are metered; an always-running Node service uses memory even with few visits |
| Vercel Hobby | Managed Next.js hosting and previews with no subscription charge | Restricted to personal, non-commercial use, so unsuitable for QualityMax's business hub |
| Vercel Pro | Managed Next.js hosting, previews, and commercial use | Starts at $20/month with one deploying seat and $20 of usage credit; metered overage; this fork's Docker deployment would need a separate native Vercel setup and validation |

Railway Hobby has a $5/month minimum including $5 of usage; Pro has a $20/month
minimum including $20 of usage. Higher usage adds charges. Existing workspace
credits may cover this small service, but actual billing depends on the plan
and total resource consumption. Railway's limited free allowance is not the
recommended production setup here.

This app now uses Next.js; Vercel is technically possible. Railway is the
chosen host because it preserves the upstream container deployment and runtime
configuration with fewer changes. See [Railway pricing](https://railway.com/pricing),
[Vercel Hobby limits](https://vercel.com/docs/plans/hobby), and
[Vercel Pro pricing](https://vercel.com/docs/plans/pro-plan).

## Maintaining the fork

Keep content changes in `src/config/qualitymax.ts`, brand assets in
`public/qualitymax/`, and styling in `public/css/qualitymax.css`. Avoid publishing
internal GTM material or credentials in this public repository.

Before merging an upstream update:

```bash
git remote add upstream https://github.com/timothystewart6/littlelink-server.git
git fetch upstream
git switch -c maintenance/upstream-update
git merge upstream/main
yarn install --frozen-lockfile
yarn ci
yarn build
```

Skip `git remote add` if the remote already exists. Review conflicts, analytics
events, Docker configuration, and the branded page. Open a PR into this fork's
`main` branch after browser verification. Upstream container publishing is
restricted to the original repository; the fork deploys through Railway.

### Railway Docker cache compatibility

The QualityMax Dockerfile uses standard Docker layer caching. Upstream BuildKit
cache mounts were removed because Railway requires service-specific mount IDs.
This keeps the fork portable across Railway projects and other Docker hosts.
