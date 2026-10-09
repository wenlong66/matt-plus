---
# gstack: design-md-format=spec
# Scaffold adapted from gstack Phase 6 at 92cfd07a79ed0f27fbcc57f2d61d00ec700eadb4.
# Google LLC DESIGN.md format (Apache-2.0); see THIRD_PARTY_NOTICES.md.
name: "[Project Name]"
description: "[one sentence: mood, material, energy]"
colors:
  primary: "#..."          # descriptive slugs; hex, or the project's canonical color space
  on-primary: "#..."
  surface: "#..."
  text: "#..."
  text-muted: "#..."
  accent: "#..."
  success: "#..."
  warning: "#..."
  error: "#..."
typography:
  display:
    fontFamily: "[face]"
    fontWeight: "[weight]"
    fontSize: "[clamp() or rem]"
    letterSpacing: "[em]"
  body:
    fontFamily: "[face]"
    fontSize: 1rem
    lineHeight: 1.5
  label:
    fontFamily: "[face]"
    fontSize: 0.75rem
    letterSpacing: 0.04em
  mono:
    fontFamily: "[face]"
    fontFeature: tnum
rounded:
  sm: 4px
  md: 8px
  lg: 12px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
  button-primary-hover:
    backgroundColor: "#..."
  input:
    borderColor: "{colors.text-muted}"
    rounded: "{rounded.sm}"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
  nav-link:
    textColor: "{colors.text}"
---

# [Project Name]

## Overview

**Creative North Star:** [one sentence: aesthetic + why it fits these users]
**Product context:** [product, users, category/peers, project type]
**Mode per surface:** [one line each: Persuade / Operate / Read / Experience]
**Reference sites:** [URLs, if research was done]
**Key characteristics:** [3-5 bullets: first-five-second impressions]

## Colors

**Strategy:** [Restrained / Committed / Full palette / Drenched] — [why]
**Light or dark:** [decided by the use scene: who, where, under what light]
[Explain which tokens signal interaction or emphasis, how neutrals derive from the palette, and how dark-mode surfaces preserve hierarchy rather than merely inverting lightness.]

## Typography

[Faces' source world, mode/register, roles and display boundaries; loading, scale rationale, justified overused-list exceptions]

## Layout

[Breakpoint grids, max width, density, large/small spacing rhythm, intentional grid breaks]

## Elevation & Depth

[Depth: offset + soft-blur shadows, tints, borders; no zero-offset glow]

## Shapes

[Radius hierarchy/uses; nested inner radius = outer radius − gap]

## Components

[Per component: hover/focus-visible/active/disabled states, invariants and adaptations]

## Do's and Don'ts

- Do: [3-5 specific, checkable rules]
- Don't: [3-5 system-specific anti-patterns, including this category's tempting catalog entries]

## Motion

- **Approach:** [minimal-functional / intentional / expressive]
- **Easing:** enter(ease-out) exit(ease-in) move(ease-in-out)
- **Duration:** micro(50-100ms) short(150-250ms) medium(250-400ms) long(400-700ms)
- **The one authored moment:** [what it is]

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| [today] | Initial design system created | Created by /design-consultation based on [product context / research] |
