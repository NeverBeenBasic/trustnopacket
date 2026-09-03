---
layout: ../../layouts/PostLayout.astro
title: "How I Triage Patch Tuesday Without Losing My Mind"
description: "A practical workflow for cutting hundreds of CVEs down to what actually matters in your environment."
pubDate: 2026-09-02
tags: ["vuln-mgmt", "process"]
---

## The problem with scanner output

Your vulnerability scanner finds a CVE. It shows up on a host. The severity says critical.

That is not the same as being vulnerable.

Scanners are pattern matchers, and how they match depends heavily on whether you are running network scans or agent-based scans.

**Network scans** are the noisier of the two. They probe from the outside -- banner grabbing, service fingerprinting, port responses -- and infer what is running based on what the host advertises. This means they can be confidently wrong. A service banner reporting an old version does not tell you whether a vendor backported a patch, whether the vulnerable module is loaded, or whether the service is even functional. Network scans also miss anything not exposed on a listening port, which on a modern endpoint is most of the attack surface.

**Agent-based scans** have far better visibility. The agent sits on the host, reads installed software inventory, file versions, and registry state directly. This produces more accurate detection and catches vulnerabilities in software that never opens a socket. But agents still primarily compare version numbers against vendor advisories. They generally do not know whether the affected service is running, whether the vulnerable feature is enabled, or whether the exploit path requires a configuration you do not have.

Both approaches have the same fundamental limitation: they tell you a vulnerable version is present, not that an exploitable condition exists. That gap between "detected" and "exploitable" is where the majority of Patch Tuesday work either gets wasted or gets efficient.

It is also worth noting that scanner coverage of newly disclosed CVEs is not instantaneous. Depending on the platform and how frequently plugin or feed updates are pushed, there can be a meaningful lag between a CVE being published and your scanner being able to detect it in your environment. This is especially relevant in the days immediately following Patch Tuesday or a major disclosure. If a CVE is getting significant attention and your scanner is not flagging anything, that is not necessarily a clean bill of health -- it may mean the detection logic has not been pushed yet. In those cases, manual verification against the advisory is the right call. Check the affected versions, check whether the component is present, and do not let scanner silence substitute for confirmation.

A single Patch Tuesday can generate hundreds of findings across a fleet. If you treat every finding as equally real, you will burn credibility with the teams you are assigning work to and you will miss the ones that actually matter.

## Step one: verify before you assign

Every CVE gets a ticket. That is not the question.

The ticket exists for tracking, audit, and compliance evidence -- you need a record that the finding was seen, evaluated, and dispositioned. What changes based on verification is whether that ticket becomes remediation work for another team, or gets closed with documented justification.

Before I assign a CVE to an owner, I check three things:

**Is the affected component actually present and running?** A vulnerability in a service that is installed but disabled is not the same risk as one in a service that is running and exposed. Verify on the host, not in the scanner console.

**Does the exploit require a configuration we do not have?** Read the actual advisory, not the summary. Many CVEs require a specific feature to be enabled, a particular authentication mode, or a non-default setting. If the exploit prerequisites do not match the environment, the risk profile changes significantly.

**Is it reachable?** An internal-only service behind segmentation has a different exposure profile than something internet-facing. Same CVE, very different urgency.

This takes time on the front end and saves an enormous amount on the back end. Every finding you can accurately downgrade or close with documented justification is a ticket that does not consume someone else's week -- and you still have the record showing why.

## Step two: prioritize on real signals

Once you know what is actually exploitable in your environment, prioritization gets simpler.

The signals that matter most:

- **Known exploited status.** If it is on CISA's KEV catalog, it moves to the top regardless of CVSS score. Active exploitation in the wild is the strongest possible signal.
- **Exposure.** Internet-facing beats internal. Internal beats isolated.
- **Asset criticality.** A domain controller and a conference room display do not carry the same weight.
- **Exploit maturity.** Proof of concept published versus theoretical makes a real difference to timeline.

### Read the vector string, not the score

The CVSS base score is a single number that collapses a lot of useful detail. The vector string underneath it is where the actual decision-making information lives.

A vector like this tells you far more than "9.8 critical":

    AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H/E:U/RL:O/RC:C

Breaking down what matters most for triage:

**AV -- Attack Vector.** Network means remotely reachable. Adjacent means same network segment. Local means the attacker already needs code execution or a session on the host. Physical means they need hands on the device. An AV:L finding on a hardened server is a very different conversation than AV:N on something internet-facing.

**AC -- Attack Complexity.** Low means the exploit works reliably with no special conditions. High means the attacker needs to win a race condition, know environment-specific information, or rely on a configuration they cannot control. AC:L findings get exploited at scale. AC:H findings usually stay theoretical outside of targeted attacks.

**PR -- Privileges Required.** None means anyone can trigger it. Low means an authenticated user. High means an administrator. PR:N combined with AV:N is the combination that turns into mass exploitation.

**UI -- User Interaction.** None means it fires without anyone doing anything. Required means someone has to click, open, or visit something. UI:N removes the human variable entirely and makes automated exploitation viable.

**S -- Scope.** Changed means the vulnerability can affect resources beyond the vulnerable component -- think container escape or hypervisor breakout. This one is easy to overlook and materially changes blast radius.

**E, RL, RC -- Temporal metrics.** Exploit Code Maturity, Remediation Level, and Report Confidence. These change over time and are the ones people forget to re-check. E:U (unproven) today can become E:H (high) next week when a working exploit lands on GitHub. RL:O means an official fix exists. RC:C means the vulnerability is confirmed, not just reported.

The practical shortcut: **AV:N plus AC:L plus PR:N plus UI:N is the profile of something that gets mass-scanned and exploited automatically.** That combination should move to the front of the queue regardless of what the base score says, because it means an attacker can hit it at scale with no prerequisites and no human cooperation.

Conversely, a 9.8 with AV:L and PR:H on an internal system with restricted admin access is a real vulnerability, but it is not the thing keeping you up tonight.

CVSS alone is a poor prioritization mechanism. It describes the vulnerability in the abstract, not the risk in your environment. The vector string gets you closer.

## Step three: set SLAs and hold to them

Remediation timelines should be defined ahead of time, not negotiated per ticket. A structure that works:

- **Critical, actively exploited or zero-day** -- immediate
- **High** -- 7 days
- **Medium** -- 30 days
- **Low** -- 60 days

The value of a published SLA is not the deadline itself. It is that it removes the argument. When timelines are defined in advance and applied consistently, remediation stops being a negotiation about whether something is urgent and becomes a scheduling question.

### The critical path is different

Critical findings and zero-days do not go through the normal queue. They do not wait for the next sprint or the next maintenance window.

The workflow splits depending on how the finding surfaces.

**If the scanner or EDR fires on a critical or zero-day severity finding** -- the war room comes first. The system owner or platform team is often more familiar with that environment than anyone else, and that expertise belongs in the room from the start. Verification happens collectively, with the right people already on the call and ready to act the moment exposure is confirmed.

**If it comes in through threat intelligence before the scanner has caught up** -- verify first with a targeted scan or manual check. This matters more than it sounds: scanner content pipelines lag behind advisories. A zero-day disclosed this morning may not appear in your scanner's feed for hours or days. If you are reading about it in threat intel, do not wait for the scanner to tell you whether you are affected. Check yourself, then escalate based on what you find.

Compensating controls get applied if a patch is not yet available -- blocking at the perimeter, disabling the affected feature, isolating the host. Whatever buys time.

The ticket still gets created for the record, but it is documentation of what happened, not the mechanism driving the work. When something is actively being exploited, ticket-driven workflows are too slow.

Normal SLAs are for planned work. Critical response is an incident, and it should be run like one.

## Step four: automate the handoff

Manually creating tickets for vulnerability findings is a waste of an analyst's time and introduces transcription errors.

Most modern vulnerability management platforms integrate directly with ticketing systems. Configure the integration so that findings meeting a defined threshold automatically generate tickets in the right queue with the right owner and the right due date.

What this buys you:

- Consistent ticket formatting and required fields
- Automatic due dates derived from the SLA framework
- Closed-loop tracking -- when the scanner confirms remediation, the ticket updates
- Analyst time freed for the verification work in step one, which cannot be automated

The pipeline should be: scanner finds it, integration creates the ticket, owner remediates, next scan validates, ticket closes. Human judgment goes into the exceptions, not the routine cases.

## What this actually looks like

A Patch Tuesday cycle with hundreds of raw findings typically reduces significantly once you apply verification and context. Some findings turn out to be for components that are not enabled. Some require configurations that do not exist in the environment. Some are already remediated and the scan data is stale.

What is left is a much smaller set of findings that are genuinely exploitable, genuinely reachable, and genuinely worth someone's time.

That smaller list gets done. The unfiltered list does not.

## The part nobody talks about

Vulnerability management is largely a communication problem wearing a technical costume.

The technical work -- scanning, patching, validating -- is well understood. The hard part is maintaining credibility with the teams doing remediation work. If you assign findings that turn out to be false positives or non-applicable, the next batch gets treated with less urgency. Trust in the process is the actual asset, and it is spent every time you assign work that did not need to be done.

Verify first. Then assign.
