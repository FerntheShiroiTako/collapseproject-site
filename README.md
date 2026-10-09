# Collapse website

A static site with no build step. Serve the folder and open it in a browser (links and assets use paths from the
site root, so opening the files directly with `file://` won't work):

```bash
python -m http.server 8000      # then visit http://localhost:8000
```

Any static host that serves `folder/index.html` for `/folder/` works (Nginx, GitHub Pages, Cloudflare, Netlify).
Each page is its own file: `/`, `/docs/`, `/team/`, `/support/`, `/terms/` and `/privacy/`. The header and footer
are copied into each one, so change all six when you edit them. Old one-page links such as `/#terms` or
`/#docs-setup` are sent on to the right page by `js/theme.js`.

```
index.html          home page, with the app's structured data
docs/index.html     guide and FAQ, with the FAQ structured data
team/, support/, terms/, privacy/   one index.html each
                    every page has its own title, description, canonical link and social tags
css/styles.css      styles; the palette mirrors bot/banbot/brand.py
js/theme.js         applies the saved light/dark theme before first paint, redirects old #page links
js/app.js           smooth scrolling, scroll reveals, docs contents marker, copy buttons
assets/brand/       logo, banner, and the placeholder Roblox headshot used in the case example
assets/team/        team photos
robots.txt          allows everything and points at the sitemap
sitemap.xml         all six pages
```

## Before going live

The search and social tags use `https://collapseproject.uk/`: the canonical link, `og:url`, `og:image`,
`twitter:image` and the structured data in every page's `index.html`, plus `robots.txt` and `sitemap.xml`. If the address ever
changes, replace it in those files, keeping the trailing slash.

The invite link on the home and support pages asks for only the permissions Collapse uses: View Channels, Send
Messages, Embed Links, Read Message History and Ban Members (`permissions=84996`). Keep it in step with
`bot/README.md` if the bot ever needs more.

Put the full addresses of the terms and privacy pages, `https://collapseproject.uk/terms/` and
`https://collapseproject.uk/privacy/`, in the Discord Developer Portal under General Information.

Fonts come from Google Fonts and smooth scrolling from the Lenis library on jsDelivr, so the page needs internet
access for those. Without them it falls back to system fonts and normal scrolling.
