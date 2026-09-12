---
layout: ../../layouts/PostLayout.astro
title: "Can You Inject Code Into a Car With Radio Waves?"
description: "A thread-pull from CAN bus fundamentals to RF injection attacks and automotive bug bounty research."
pubDate: 2026-09-11
tags: ["threat-intel", "tooling"]
---

I was studying for PenTest+ and went through a section on CAN bus. One thought led to another, and I ended up somewhere interesting: **can you transmit arbitrary code over radio waves and inject it into a device? Like let's say a vehicle?**

Apparently the answer is yes under the right conditions.

## The chain of thought

CAN bus was designed in the 1980s with one goal: let microcontrollers inside a vehicle talk to each other efficiently. Security was not on the requirements list. No authentication. No encryption. Any node on the bus can talk to any other node.

That's fine when the bus is physically isolated inside a car. The problem is that modern vehicles aren't isolated anymore. They have:

- Bluetooth (infotainment, hands-free)
- WiFi (hotspot, OTA updates)
- Cellular telematics (remote start apps, fleet tracking)
- Keyless entry (315/433 MHz RF)
- TPMS sensors (tire pressure, also RF)

Each one of those is a radio receiver. And every radio receiver is a potential path from the outside world into the vehicle's internal network.

## What "RF code injection" actually requires

The concept is sound -- radio waves carry binary data, binary data can be code, code can execute. But it's not as simple as beaming a Python script at a car door.

For RF-delivered code to execute, the target needs three things:

1. **A radio receiver** -- something listening on that frequency
2. **A decoder** -- software parsing the signal back into bytes
3. **An executor** -- something that acts on those bytes

In most cases you need all three by design, or you need to exploit a vulnerability that collapses them together. The second path is where it gets interesting.

## Where the real attacks live

**Signal injection** -- GPS spoofing is the cleanest example. You transmit fake satellite signals, the receiver believes them, and navigation goes wherever you point it. No exploit needed -- the receiver is doing exactly what it was designed to do.

**Malformed packet attacks** -- Broadpwn (CVE-2017-9417) is the case study here. Researchers found a flaw in Broadcom WiFi chip firmware that could be triggered by a crafted 802.11 beacon frame. No association required. You send a malformed radio packet, the chip's firmware mishandles it, and you get remote code execution. The radio receiver *was* the vulnerability.

**Keyless entry replay/relay attacks** -- Low-tech but effective. Capture the RF signal from a key fob, replay it later. Or use relay boxes to extend the range of a passive entry system, tricking the car into thinking the key is nearby when it's inside your house.

**Telematics as pivot point** -- The 2015 Jeep Cherokee hack by Charlie Miller and Chris Valasek went: cellular network -> Sprint's network -> vehicle telematics unit -> CAN bus -> physical control (steering, brakes, engine). The radio receiver was cellular. The path to CAN bus was through the head unit. One unauthenticated service running on the telematics stack was the door.

## Thinking bigger -- the overlooked receivers

Cars are the obvious target. But the same three-part model (receiver, decoder, executor) shows up in places nobody is looking. The most interesting attack surfaces share a common profile: old protocol, new connectivity, physical consequence, and no security community attention because everyone assumes it's safe.

Here's where that pattern shows up.

**Medical devices** -- Implanted pacemakers, insulin pumps, and neurostimulators receive programming commands via RF (often the 400MHz MICS band). The decoder runs with full hardware trust and zero user interaction. This space has seen some research but the attack surface keeps expanding as devices move toward Bluetooth LE. More connectivity means more exposure, and the consequences of a successful attack are as physical as it gets.

**Smart utility meters** -- Every house has one. They broadcast constantly on 900MHz or similar frequencies, and the RF mesh networks utilities use to collect readings often have write-back capability -- meters can receive commands to cut power. The individual meter level is largely unresearched.

**Agricultural equipment** -- Modern tractors run CAN bus, GPS, cellular, and proprietary RF protocols for communication between tractor and implement. The RF layer between equipment is poorly documented and nobody is pentesting combine harvesters. John Deere's ecosystem is locked down at the software level, but that RF surface is a different story.

**Aviation datalink** -- ADS-B has been researched. ACARS -- the messaging system aircraft use -- transmits in plaintext over VHF and is largely unencrypted. Electronic flight bags that receive weather data via datalink are another angle. Ground equipment that responds to RF commands (jet bridges, fueling systems) sits even further outside the research community's view.

**Rail control systems** -- Train control uses RF (ATCS, ETCS, PTC) to deliver speed and routing commands to moving trains. PTC was mandated in the US but implementation security varies significantly by operator. Almost no public security research exists in this space.

**Industrial sensors** -- Wireless HART sensors deployed in chemical plants and refineries receive calibration commands over RF. A manipulated sensor reading doesn't just corrupt data -- it can trigger a physical response. Valve opens. Pump activates. The decoder here is running inside critical infrastructure.

**Emergency dispatch infrastructure** -- P25 digital radio has known encryption weaknesses. Less examined is the dispatch infrastructure that receives those signals and routes them, and the CAD systems with RF-facing components that sit behind it.

**Access and parking infrastructure** -- Garage doors, parking gates, toll systems. Receivers that trigger physical actions. Some still use fixed codes or weak rolling code implementations that haven't been revisited in years.

## The pattern worth hunting

The most unresearched targets share these traits:

- **Old protocol, new connectivity** -- designed before security mattered, wireless added later
- **Physical consequence** -- the payload isn't data theft, it's a real-world action
- **No security community attention** -- no CVEs, no DEF CON talks is a signal, not reassurance
- **Assumed air gap** -- operators believe "it's not on the internet" and stop thinking about it

The next significant RF vulnerability probably isn't in a car. It's in something everyone assumes is safe because it doesn't look like a computer.

---

*Posts on this blog are sanitized, generalized, and never tied to any specific employer or environment. No internal tooling names, no real alert data, no org-specific configurations. Giving attackers a free OSINT read on your security posture isn't a write-up, it's a liability.*