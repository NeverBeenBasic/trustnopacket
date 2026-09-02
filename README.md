# trustnopacket.com

Portfolio + blog site built with Astro, deployed on Cloudflare Pages.

## Local dev

```bash
npm install
npm run dev
# → http://localhost:4321
```

## Writing a post

Add a `.md` file to `src/pages/blog/`:

```md
---
layout: ../../layouts/PostLayout.astro
title: "Detecting LSASS Dumping with KQL"
description: "A hunting query for credential access via MiniDumpWriteDump."
pubDate: 2026-09-10
tags: ["kql", "detection"]
---

Your content here.
```

The blog index at `/blog` auto-sorts by `pubDate`. Filename = URL slug.

## Cloudflare Pages settings

- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Node version env var:** `NODE_VERSION = 18`
