# Top it off Smoothie Cafe — Build Context

Standalone static site built on the **Vivere Master Framework v2.0** (vanilla HTML5 / CSS3 / JS, Cloudflare Pages).

## Business
- **Name:** Top it off Smoothie Cafe
- **Area:** Grand Junction, CO (confirm exact address)
- **Brand vibe:** fresh, fruity, modern, high-end with depth — not childish
- **Partnership:** Joe Sutliff (Vivere) is also wholesaling **Mimi's Sweet Treats** ice cream to this cafe — site has a wholesale/partner tie-in.

## Brand palette (from logo)
- `--green-deep` `#14502e` — forest green ("Top…off" + SMOOTHIE CAFE wordmark)
- `--accent` `#e8197d` — hot pink/magenta (the cup + "it off")
- `--accent-alt` `#6fbf44` — fresh leaf green
- White base, fruit accents (strawberry red, blueberry, banana yellow)
- Fonts: Poppins (body), Playfair Display (display serif), optional Pacifico for playful accents

## Status (2026-05-20)
- Basic frame: index.html (landing), about.html, menu.html (sample menu)
- Contact details / hours / exact address are PLACEHOLDERS — pull from FB / client.
- Logo file NOT yet added — drop `assets/logo.webp` (the smoothie-cup wordmark).

## Deploy (CF Pages pipeline — see project_cf-pipeline-rollout memory)
- CF Account ID: `2ecaf027ec340f8b8d904afe06fe889a`
- Pages project: `top-it-off`
- Staging branch → preview URL; production later once domain chosen.
- Deploy: `npx wrangler pages deploy . --project-name top-it-off --branch=staging --commit-dirty=true`

## TODO
- Real address/phone/hours/social links
- Logo + hero/menu photography
- GA4 + domain when chosen
