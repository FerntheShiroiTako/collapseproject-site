# Collapse website

A static site with no build step: open `index.html` in a browser, or serve the folder.

```bash
python -m http.server 8000      # then visit http://localhost:8000
```

Any static host works (Nginx, GitHub Pages, Cloudflare Pages, Netlify). The pages are `#home`, `#docs`, `#team`,
`#support`, `#terms` and `#privacy`, switched in the browser, so no server-side routing is needed. Every page is
in `index.html`, so with JavaScript off they simply read one after another.

```
index.html          all six pages, the page title, search and social tags, and structured data
css/styles.css      styles; the palette mirrors bot/banbot/brand.py
js/theme.js         applies the saved light/dark theme and picks the first page before first paint
js/app.js           page transitions, scroll reveals, copy buttons
assets/brand/       logo, banner, and the placeholder Roblox headshot used in the case example
assets/team/        team photos
robots.txt          allows everything and points at the sitemap
sitemap.xml         the home page
```

## Before going live

The search and social tags use `https://collapseproject.uk/`: the canonical link, `og:url`, `og:image`,
`twitter:image` and the structured data in `index.html`, plus `robots.txt` and `sitemap.xml`. If the address ever
changes, replace it in those files, keeping the trailing slash.

The invite link on the home and support pages asks for only the permissions Collapse uses: View Channels, Send
Messages, Embed Links, Read Message History and Ban Members (`permissions=84996`). Keep it in step with
`bot/README.md` if the bot ever needs more.

Put the full addresses of the terms and privacy pages, `https://collapseproject.uk/#terms` and
`https://collapseproject.uk/#privacy`, in the Discord Developer Portal under General Information.

Fonts come from Google Fonts and smooth scrolling from the Lenis library on jsDelivr, so the page needs internet
access for those. Without them it falls back to system fonts and normal scrolling.
