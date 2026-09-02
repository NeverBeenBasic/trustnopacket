---
layout: ../../layouts/PostLayout.astro
title: "Trust No Packet -- First Post"
description: "Why I started this blog, what to expect, and the principle behind the name."
pubDate: 2026-09-02
tags: ["meta"]
---

## Why this exists

I've been writing detection rules, chasing alerts, and building security programs in the background of a day job for years. Most of that work lives in tickets, Slack threads, and internal wikis that nobody outside the team ever sees.

This blog is the public version of those notes -- sanitized, generalized, and never tied to any specific employer or environment. No internal tooling names, no real alert data, no org-specific configurations. Giving attackers a free OSINT read on your security posture isn't a write-up, it's a liability.

## What you'll find here

Expect posts on:

- **KQL** -- Sentinel detection rules, hunting queries, tuning logic
- **Incident response** -- Generalized playbooks and technique breakdowns
- **Threat research** -- CVE analysis, attack technique breakdowns, vendor advisories
- **Security tooling** -- Whatever I'm building or evaluating

## The name

The zero trust principle applied to network traffic: don't assume a packet is legitimate because it came from inside the perimeter, has the right headers, or carries a trusted source IP.

Verify everything. Trust no packet.

---

More soon.
