---
layout: ../../layouts/PostLayout.astro
title: "Map Their Moves -- How TTP Gap Analysis Keeps Your Controls Honest"
description: "When a new threat actor or ATP surfaces, the real question isn't who they are -- it's whether your current controls would actually stop them."
pubDate: 2026-10-03
tags: ["threat-intel", "detection"]
---

> Posts on this blog are sanitized, generalized, and never tied to any specific employer or environment. No internal tooling names, no real alert data, no org-specific configurations. Giving attackers a free OSINT read on your security posture isn't a write-up, it's a liability.

---

Threat intelligence reports drop constantly. A new group gets named, a CISA advisory goes out, a vendor publishes a splashy PDF with an ominous codename and a kill chain diagram. Most teams skim it, forward it to a Slack channel, and move on.

That's a missed opportunity.

The real value of an emerging threat actor profile isn't knowing they exist -- it's using their documented TTPs as a free audit of your control gaps.

---

## What TTP Gap Analysis Actually Is

The idea is simple: take a documented set of adversary techniques (usually mapped to MITRE ATT&CK) and walk them against your current detection and prevention stack. For each technique, you're asking three questions:

1. **Would we block it?** (prevention control -- EDR policy, WDAC, firewall rule, etc.)
2. **Would we detect it?** (detection rule, alert, behavioral analytic)
3. **Would we know what to do with it?** (runbook, playbook, documented response)

If the answer to all three is yes, you've validated a control. If the answer to any is no, you've found a gap -- before an attacker does.

---

## Why Use a Rising ATP or New Group as the Anchor

Established groups like APT28 or Lazarus have been profiled to death. Their TTPs are well-documented, but so are the defenses. The detection rules exist, the YARA signatures are in your feed, and your vendor probably already covers them.

A **rising or newly public group** is more interesting precisely because:

- The TTPs are current -- they reflect what's working *right now*, against real targets, with modern defenses in place
- The techniques often represent evolution -- a new living-off-the-land binary, a novel LOLDriver, a freshly abused API endpoint
- Your vendor coverage may lag -- signatures and detections take time to ship

Using a fresh threat actor profile forces you to engage with the techniques on their merits rather than relying on stale indicator matching.

---

## A Practical Walkthrough

Here's the process I actually use when a new group surfaces:

### 1. Pull the primary source

Don't start with blog aggregators. Go to the actual report -- CISA advisory, vendor threat research (CrowdStrike, Mandiant, SentinelOne), or the ATT&CK group page if it's already mapped. You want the raw technique list, not a summary.

### 2. Build a simple matrix

A spreadsheet works fine. Columns:

| Technique | ATT&CK ID | Prevention Control | Detection Rule | Coverage Gap? | Priority |
|---|---|---|---|---|---|
| Spearphishing Link | T1566.002 | Mail filtering, Safe Links | Alert on first-time sender + URL detonation | Partial -- no sandbox | Medium |
| LSASS Memory Dump | T1003.001 | EDR block policy | Rule on lsass access by non-system process | Covered | -- |
| Scheduled Task Persistence | T1053.005 | WDAC policy restricts schtasks abuse | Alert on new tasks created by user-space processes | Gap -- no alert | High |

The point isn't perfection on the first pass. It's surfacing the gaps you didn't know you had.

### 3. Verify coverage -- don't assume

This is where most teams fail. They see "EDR deployed" and mark a technique as covered. That's not analysis, that's wishful thinking.

For each technique, actually check:
- Is the relevant EDR policy enabled and enforced, or just in audit mode?
- Is the detection rule active and tuned, or sitting disabled because of alert volume?
- When did that rule last fire? Has it ever fired in your environment?

A control you haven't verified is a control you don't have.

### 4. Triage and prioritize gaps

Not every gap is equal. Run them through a quick risk lens:

- **Likelihood:** Does this group target your sector? Are their initial access techniques relevant to your environment?
- **Impact:** If this technique landed, what's the blast radius?
- **Effort to close:** Can you write a detection rule in an afternoon, or does this require a platform change?

High likelihood + high impact + low effort to close = fix it this week.

### 5. Build or tune, then re-validate

Once you've closed a gap -- written the rule, tightened the policy, added the playbook step -- go back to the matrix and verify it. Run an emulation if you can, even a basic one. **Detection rules that have never been tested are hypotheses, not controls.**

---

## The Posture Improvement You're Actually Getting

Done consistently, this process gives you a few things that a standard vuln scan or pen test doesn't:

**Control validation against current adversary behavior.** You're not testing against a generic benchmark -- you're testing against real techniques that are actively being used to breach organizations similar to yours.

**A forcing function for documentation.** Half the gaps you'll find aren't technical -- they're "we have the tool but no one wrote the runbook." The matrix surfaces that.

**A living record.** Run this every time a significant new group surfaces, and over time you build a historical map of your control evolution. That's useful for communicating posture to leadership, and it's useful for you when you're trying to remember why you built a particular detection rule six months ago.

**Reduced mean time to detect on day-zero activity.** When a group you've already mapped against starts showing up in the wild, you're not starting from scratch. You know which techniques you cover and which you don't. That's operational time you get back when it matters.

---

## Tools and Resources

A few things that make this process faster:

- **MITRE ATT&CK Navigator** -- layer files for specific groups are often published alongside advisories; drop them into Navigator and you have an instant visual of their technique coverage
- **CISA Known Exploited Vulnerabilities catalog** -- if the group exploits specific CVEs, cross-reference against your vuln management data
- **Atomic Red Team** -- open-source test library mapped to ATT&CK; good for quick emulation of individual techniques to validate detection
- **MITRE ATT&CK Group pages** -- not always current, but useful for established groups with prior reporting

---

## Closing Thought

The threat landscape isn't going to slow down and wait for your quarterly security review. New groups surface, techniques evolve, and the tools that worked against defenders last year get refined against this year's defenses.

TTP gap analysis isn't a one-time project. It's a habit. When a new group surfaces, the question to ask isn't "should we be worried?" -- it's "would we catch them?"

Build the answer before you need it.
