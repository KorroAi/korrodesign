# I Built a Design Copilot That Actually Enforces Design Quality — Here's the Before/After

**TL;DR:** AI code generators all produce the same generic slop. I built a Claude Code skill with *two enforcement layers* — a Taste Guardian that guides during generation, and a 14-rule ESLint plugin that catches UI architectural violations no other tool detects. The difference is night and day. [GitHub](https://github.com/KorroAi/korrodesign) · [Live Before/After](#demo)

---

## The Problem Nobody Talks About

Every AI website builder — v0, Bolt, Lovable, Claude alone — generates the same visual language:

- Purple-to-pink gradients on everything
- Inter font (always Inter)
- Centered hero sections with white text on colored backgrounds
- Emoji-decorated CTAs ("Start Your Journey 🚀")
- Generic 3-column card grids with zero creative treatment
- AI slop copy: "revolutionize", "elevate", "seamless", "next-gen"

The problem isn't that AI can't generate code. It's that **AI has no taste.** There's no enforcement layer. Claude doesn't know that `#000` is visually harsh and should be off-black. It doesn't know that `<div onClick>` without `role="button"` is an accessibility time bomb. It doesn't know that `h-screen` breaks on mobile Safari.

**I built the enforcement layer that's been missing.**

---

## What I Built: Korrodesign v3

It's a **Design Copilot** with two independent enforcement layers:

### Layer 1: Taste Guardian (during generation)
A 509-line SKILL.md file that becomes part of Claude's system prompt. It encodes design taste from 6 different design philosophies — Emil Kowalski's animation framework, YC's web strategy, UI/UX Pro Max's creative arsenal, and more.

Claude reads these rules and generates code that follows them. No API keys needed. Works entirely within Claude Code.

### Layer 2: Blind Spot (post-generation)
A **14-rule ESLint plugin** that checks what NO other tool checks. Not "is it beautiful" — "is this even maintainable as UI?"

Rules like:
- `no-div-as-button` — catches `<div onClick>` without button semantics
- `require-focus-visible` — interactive elements missing focus styles
- `no-pure-black` — flags `#000` in code
- `no-h-screen` — `h-screen` that breaks on mobile Safari
- `no-z-index-chaos` — z-index outside the [0,10,20,30,40,50] scale
- `no-default-tailwind-colors` — bans `blue-500`, `gray-100`, etc.

All 14 rules tested and working on ESLint v10.

---

## The Before/After

I generated the same prompt twice — once with vanilla Claude (typical AI output), once with Korrodesign enforcing every rule.

### ❌ BEFORE: Typical AI Output
[View raw HTML](https://github.com/KorroAi/korrodesign/blob/master/demo/before-typical-ai.html)

The "before" has every AI design cliché:
- Purple gradient hero with centered white text
- Inter font throughout
- Emoji CTAs ("Start Free Trial 🚀")
- 3-column feature grid with emoji icons
- Purple-to-pink gradient footer CTA
- AI slop copy: "Revolutionize", "Seamlessly integrate", "Unprecedented levels"
- Fake testimonials from "Sarah Chen" and "John Smith" with round numbers
- `bg-gray-950`, `border-gray-700`, `bg-purple-600` (default Tailwind palette)

### ✅ AFTER: Korrodesign Output
[View raw HTML](https://github.com/KorroAi/korrodesign/blob/master/demo/after-korro-design.html)

The "after" follows every Korrodesign rule:
- Custom color palette: warm off-white ink on dark surface (`#e8e6e1` on `#141311`)
- Emerald accent at `<80%` saturation instead of purple
- Cabinet Grotesk (display) + Satoshi (body) — premium font pairing
- Grain texture overlay (CSS SVG noise, `opacity: 0.035`, fixed, `pointer-events: none`)
- Asymmetric hero layout (text left, visual right — never centered)
- Shadow-as-border on cards instead of solid borders
- Concentric border radii throughout (`rounded-2xl` container = inner radius + padding)
- `min-h-[100dvh]` — never `h-screen`
- `@media (prefers-reduced-motion)` for accessibility
- `@media (hover: hover) and (pointer: fine)` for touch safety
- Spring-like easing curves (`cubic-bezier(0.23, 1, 0.32, 1)`)
- Button: `transform: scale(0.97)` on `:active` — tactile feedback
- Tabular nums on metrics, text-wrap: balance on headings
- Concrete copy: "Tools that feel like an extension of your hand" — specific, not vague
- Real data: "12,847 designers", "3.2× faster", "47.8ms latency" — organic numbers
- No emoji anywhere. No AI slop. No purple.

---

## How It Works (30 seconds)

```bash
# Install the skill
git clone https://github.com/KorroAi/korrodesign.git
cp korrodesign/SKILL.md ~/.claude/skills/korrodesign/SKILL.md

# Reload Claude Code
/claude reload

# Start designing
/korrodesign
```

Claude becomes your Creative Director. 7 phases: Asset Gen → Brief → Config → Council → Plan → Generate → Blind Spot Audit.

**Optional:** Add the ESLint plugin for post-generation checks:
```bash
cp korrodesign/korro-studio/eslint-plugin-korro-design.js your-project/
npx eslint . --config eslint.config.korro.js
```

---

## Why This Matters

**Category ownership.** ESLint checks JS syntax. Stylelint checks CSS properties. Lighthouse checks runtime performance. Nobody checks *UI structural integrity at the source level.* Korrodesign owns this category.

**AI-generated code is exploding.** LLMs emit `div onClick` without aria, hallucinate hex values, ignore focus management. A checking layer for AI-generated code *must* exist — the only question is who builds it.

**Zero friction.** The ESLint plugin piggybacks on ESLint's distribution channel. Every team already has ESLint in CI. Adding Korrodesign is one config line.

---

## Try It

- **GitHub**: https://github.com/KorroAi/korrodesign
- **Demo Before**: `demo/before-typical-ai.html`
- **Demo After**: `demo/after-korro-design.html`
- **Works standalone** — no API keys, no backend, just Claude Code

Open an issue if you find a rule that should exist but doesn't. Contributing guide in README.

---

*Built with Claude Code. The 14 ESLint rules were tested on ESLint v10. The Taste Guardian absorbed knowledge from Emil Kowalski, YC, UI/UX Pro Max, Awesome DESIGN.md, and Make Interfaces Feel Better.*
