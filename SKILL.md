---
name: korrodesign
description: Design Copilot with two enforcement layers (Taste Guardian + Blind Spot ESLint plugin, 14 rules). Works standalone with zero dependencies. 7-phase design pipeline. Produces Awwwards-level websites with automated UI hygiene enforcement.
version: 3.0.0
author: Korrocorp
license: MIT
repository: https://github.com/Korrocorp/korrodesign
---

# Korrocorp Design: Design Copilot

**Works standalone. Zero dependencies.** Just install the skill, Claude does the rest. Two enforcement layers no other design skill has. Optional OpenRouter backend for automated one-click generation.

---

## HOW IT WORKS (no backend needed)

Korrodesign is a **Claude Code skill** ,  drop `SKILL.md` into `.claude/skills/korrodesign/` and invoke `/korrodesign`. Claude becomes your Creative Director, guiding you through the 7-phase design process. The entire Taste Guardian runs within Claude. The ESLint plugin (`eslint-plugin-korro-design.js`) and `quality-check.js` are standalone Node scripts for post-generation auditing ,  no API keys required.

**What you get without any backend:**
- Full 7-phase design conversation (Claude asks, you answer, Claude guides)
- All design knowledge: typography, colors, animation, micro-details, creative arsenal
- ESLint plugin: 14 rules, just `npx eslint . --config eslint.config.korro.js`
- Quality checker: `node quality-check.js <project>`

**What the optional OpenRouter backend adds** (`OPENROUTER_API_KEY`):
- Automated code generation via `node generate.js` (GLM 5.2 architecture → Kimi K2.7 code)
- One-command scaffolding via `node scaffold.js` (Next.js 15 + fonts + grain + Lenis)

---

## DESIGN COPILOT ,  Two-Layer Architecture

### Layer 1: TASTE GUARDIAN (during generation ,  works in Claude)
The SKILL.md rules guide Claude DURING code generation. This is the "pair programmer with taste" ,  catching design mistakes before they're written. Zero dependencies.

### Layer 2: BLIND SPOT (post-generation ,  standalone ESLint plugin)
`eslint-plugin-korro-design.js` ,  14 AST-level rules. Not "is it beautiful" ,  "is this even maintainable as UI?" No API keys. Just ESLint.

Core rules (error): `no-div-as-button`, `require-focus-visible`, `no-pure-black`, `no-generic-fonts`, `no-emoji-in-ui`, `no-h-screen`. Supporting rules (warn): `no-z-index-chaos`, `spacing-grid-4px`, `require-image-outlines`, `prefer-concentric-radii`, `no-hardcoded-magic-numbers`, `no-duplicate-colors`, `require-loading-state`, `no-default-tailwind-colors`.

See Phase 6 for usage. No other tool checks UI structural integrity at the AST level.

## AUTO-HOOK (run Blind Spot on every generation)

Add to `.claude/settings.local.json`:
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [{
          "type": "command",
          "command": "npx eslint ${CLAUDE_PROJECT_DIR} --config eslint.config.korro.js --max-warnings 0 || true"
        }]
      }
    ]
  }
}
```

## PHASE 0 ,  ASSET GENERATION (before design)

Before any design work, ask if the user needs assets generated:

1. **3D Models** ,  Meshy.ai (image→3D, text→3D, 200 credits free). Best for characters, products, icons.
2. **Images** ,  Pollinations.ai (unlimited free, URL-based). `https://pollinations.ai/p/{prompt}?width=1024&height=1024&model=flux&nologo=true`
3. **Sound Effects** ,  ElevenLabs SFX API (free tier)
4. **Voice/TTS** ,  Edge TTS (unlimited free) or ElevenLabs TTS (quality)

Generate all assets FIRST, then design around them. Don't design with placeholders.

---

## PHASE 1 ,  CREATIVE BRIEF

First, detect the project stage. This determines everything:

| Stage | Approach | Signals |
|-------|----------|---------|
| **Pre-launch** | Mystery, waitlist, single-page, buildable in a day | No public product, pre-revenue |
| **Growth** | Brand recognition, detailed features, multiple CTAs | Live product, active users |
| **Mature** | Information depth, security pages, enterprise tiers | Established market |

Then ask ONE question at a time:

1. **Identity** ,  "Describe the soul of the project in one sentence."
2. **Personality** ,  "Pick 3 words: Luxe · Brutalist · Playful · Editorial · Underground · Sci-Fi · Organic · Minimalist · Maximalist · Retro-futuristic · Artisan · Cyberpunk · Pro · Innovative"
3. **3D Level** ,  "Level of immersion? A) Subtle B) Present C) Total"
4. **Reference** ,  "Name ONE website, film, game, or album whose aesthetic inspires you."
5. **Five-Second Filter** ,  "If someone looks at this for 5 seconds, what must they understand?" (What is it? Who is it for? Why care?)
6. **Content** ,  "What sections? Hero / Features / About / Contact / Other?"

Store as `DESIGN_BRIEF`.

---

## PHASE 2 ,  CONFIGURATION

Deduce from brief. Present:

```
DESIGN_VARIANCE:   1 (Safe/Symmetric) → 10 (Asymmetric/Artistic)
MOTION_INTENSITY:  1 (Static) → 10 (Cinematic/Magical)
VISUAL_DENSITY:    1 (Airy/Gallery) → 10 (Dense/Cockpit)
```

### Detailed Definitions

**DESIGN_VARIANCE**:
- 1-3: flexbox center, 12-column symmetry, equal paddings.
- 4-7: overlapping (`margin-top: -2rem`), varied aspect ratios, left-aligned headers.
- 8-10: masonry, `grid-template-columns: 2fr 1fr 1fr`, massive empty zones, `padding-left: 20vw`.
- MOBILE: ≥4 must collapse to single-column on `<768px`.

**MOTION_INTENSITY**:
- 1-3: CSS `:hover`/`:active` only. No automatic animations.
- 4-7: `transition: all 0.3s cubic-bezier(0.16,1,0.3,1)`, animation-delay cascades, transform+opacity only.
- 8-10: scroll-triggered reveals, parallax, Framer Motion hooks, spring physics. NEVER `window.addEventListener('scroll')`.

**VISUAL_DENSITY**:
- 1-3: lots of whitespace, huge section gaps, expensive/clean feel.
- 4-7: normal spacing, standard web apps.
- 8-10: tiny paddings, no card boxes (1px dividers), monospace numbers, cockpit mode.

Present: "I propose this config. OK or adjust?"

---

## PHASE 3 ,  COUNCIL (Design Debate)

Present 3 contrasting directions:

### A ,  SAFE
Clean, established conventions. Effective but not surprising.
### B ,  BOLD
Visual rupture, asymmetry, risk-taking. Memorable, polarizing.
### C ,  HYBRID
Solid foundation + creative twists. Accessible yet distinctive.

For each: Concept (1 sentence), Palette (3 hex), Typography (display + body), Signature Animation, Strengths+Weaknesses.

### Inspiration Library
Offer reference palettes from 69+ companies: "Want the vibe of Stripe? Apple? Linear?" Load palette + typography + spacing from the corresponding DESIGN.md as a starting point.

User picks (or mixes). This becomes `CREATIVE_DIRECTION`.

---

## PHASE 4 ,  EXECUTION PLAN

3 steps max:
1. **Foundations** ,  Structure, routing, palette, typography, global layout
2. **Signature** ,  The wow element (3D scene, scroll-driven narrative, distinctive effect)
3. **Polish** ,  Micro-interactions, responsive, transitions, QA

User validates or adjusts.

---

## PHASE 5 ,  GENERATION

### Step 1: Write Brief
Save the complete prompt to `BRIEF_CURRENT.md` in the skill directory.

### Step 2: Scaffold
```
node korrodesign/scaffold.js <project-dir>
```
Creates Next.js 15 + Tailwind v4 + TypeScript project with fonts, palette, grain overlay pre-configured.

### Step 3: Generate
```
node korrodesign/generate.js --prompt-file BRIEF_CURRENT.md --output-dir <project-dir>
```
Pipeline: GLM 5.2 → architecture/design spec → Kimi K2.7 → code generation → Quality check → npm install → next dev.

### Step 4: Present
Live at `http://localhost:3100`. Offer deploy: `npx vercel --prod`.

---

## PHASE 6 ,  BLIND SPOT AUDIT

### Step 0: Setup (one-time)
```bash
cp korrodesign/eslint-plugin-korro-design.js ./
# Then create eslint.config.korro.js ,  scaffold.js does this automatically
```

### Step 1: Run the linter
```
cd <project-dir> && npx eslint . --config eslint.config.korro.js
```

### Step 2: Auto-fix
```
npx eslint . --config eslint.config.korro.js --fix
```
Auto-fixable rules: `no-pure-black` (flags for manual fix), `no-emoji-in-ui`, `no-z-index-chaos`.

### Step 3: Pre-commit gate
Add to `.husky/pre-commit`:
```bash
npx eslint . --config eslint.config.korro.js --max-warnings 0
```

---

## STUDIO RULES

### STRICTLY FORBIDDEN
- `-` (hyphen-minus) banned in prose: use commas or colons, never dashes of any kind
- Inter, Arial, Helvetica, system-ui, sans-serif
- Default Tailwind palette (blue-500, gray-100, etc.)
- Emoji as icons or decoration
- AI slop: "Welcome to my website", "passionate developer", "innovative solutions", "cutting-edge", "building the future", "elevate", "seamless", "unleash", "next-gen", lorem ipsum
- Centered white text on colored background
- Boxy 3-column card grids without creative treatment
- Gradient text on flat backgrounds
- Pure black (#000) → Zinc-950 or off-black
- AI purple/blue glow aesthetic
- Purple gradients and default drop shadows (the #1 "AI slop" signal)
- Generic bento grids (3×2 simple icons, no product context)
- Google-style fake dashboards with red/yellow/green/blue callouts
- Floating cubes or abstract 3D shapes with no product evidence
- Every Word Capitalized In Testimonials
- Vague social proof: "Great tool!" → use "Saved 500 hours on manual QA"
- Generic names: "John Doe", "Sarah Chan" → use creative, realistic names
- Broken Unsplash links → use `https://picsum.photos/seed/{slug}/800/600`
- Fake numbers like 99.99%, 50% → use organic data: 47.2%, 83.7%
- Startup slop names: "Acme", "Nexus", "SmartFlow" → invent premium, contextual names
- Scroll-jacking
- Loop background animations (meteors, flickering cards, constant motion)
- Info hidden behind hover states
- "Link salad" in hero → don't stack Discord+GitHub+Twitter+ Docs links simultaneously

### MANDATORY per project
- 2+ premium fonts (display + body) via next/font/google
- Custom named color palette in tailwind.config.ts
- Grain/texture overlay (CSS noise, fixed, pointer-events-none, opacity < 0.05)
- GSAP ScrollTrigger on ≥1 section
- Lenis smooth scroll
- Micro-interactions on hover/focus for ALL interactive elements
- Dark mode with smooth transitions
- min-h-[100dvh] (NEVER h-screen)
- Concentric border radius: `outerRadius = innerRadius + padding`
- text-wrap: balance on headings
- tabular-nums on dynamic numbers
- font-smoothing: antialiased on :root
- Loading, empty, and error states for EVERY interactive component
- Skeletal loaders (not generic spinners) sized to match content
- Full interaction cycles: loading → empty → error → success states
- Button press feedback: `scale-[0.97]` on `:active` (never below 0.95)
- Shadow-as-border for cards/containers (not solid borders)
- Image outlines: `outline-1 outline-black/10 dark:outline-white/10`
- Min hit area 44×44px (WCAG) or 40×40px minimum
- `max-w-7xl mx-auto` for page layouts
- Optical alignment over geometric centering (play buttons, icon+text)

### TYPOGRAPHY
**Display**: Cabinet Grotesk, Clash Display, DM Serif Display, Playfair Display, Boska, Chillax, General Sans, Space Grotesk, Instrument Serif, Abril Fatface
**Body**: Satoshi, Switzer, Geist Sans, General Sans, DM Sans
**Mono**: Geist Mono, JetBrains Mono, Fira Code
**Rules**: Serif ONLY for creative/editorial. NEVER serif on dashboards. Control hierarchy with weight+color, not just size.

### COLORS
- Max 1 accent, saturation < 80%
- Neutral base: Zinc or Slate (never gray)
- One palette, start to finish
- Accent: Emerald, Electric Blue, Deep Rose, Amber, Teal
- Shadow tints match background hue

### COMPONENTS
- Icons: Phosphor or Radix only (strokeWidth 1.5 or 2)
- Cards ONLY when elevation is functional → otherwise borders/spacing
- Dense dashboards (VISUAL_DENSITY > 7): no cards → `border-t`, `divide-y`, or negative space
- Forms: label ABOVE input, `gap-2`, helper text optional, error text below
- Hit area: 40×40px minimum, extend with pseudo-elements for small elements
- shadcn/ui OK but MUST customize radii, colors, shadows

---

## ANIMATION FRAMEWORK (from Emil Kowalski)

### The 4 Questions (answer before ANY animation)

**1. Should this animate at all?**
- 100+ times/day → NEVER animate (keyboard shortcuts, command palette)
- Tens/day → remove or drastically reduce
- Occasional (modals, toasts) → standard animation
- Rare/first-time → can add delight

**2. What is the purpose?**
- Spatial consistency, state indication, feedback, preventing jarring changes
- "It looks cool" + user sees it often → don't animate

**3. What easing?**
- Entering/exiting → ease-out (starts fast, feels responsive)
- Moving/morphing on screen → ease-in-out
- Hover/color change → ease
- Constant motion (marquee, progress) → linear
- NEVER ease-in for UI → it feels sluggish

**4. How fast?**
- Button press: 100-160ms
- Tooltips, small popovers: 125-200ms
- Dropdowns, selects: 150-250ms
- Modals, drawers: 200-500ms
- UI animations stay under 300ms

### Springs
```js
{ type: "spring", stiffness: 100, damping: 20 }  // premium weighty feel
{ type: "spring", duration: 0.5, bounce: 0.2 }   // Apple approach
```
Springs maintain velocity when interrupted. CSS keyframes restart from zero.

### Duration Refinements
- Enter slow, exit fast: enter 2s linear, exit 200ms ease-out (asymmetric hold-to-delete pattern)
- Faster spinner → app feels faster (perceived performance)

### Never
- Animate from `scale(0)` → start from `scale(0.95)` with `opacity: 0`
- Use `ease-in` on UI elements
- Animate `top`, `left`, `width`, `height` → transform + opacity only
- Mix GSAP/Three.js with Framer Motion in the same component tree

---

## CSS MASTERY

### clip-path for Animation
- Tab color transitions: duplicate tab list, clip the copy to active tab, animate clip
- Hold-to-delete: `clip-path: inset(0 100% 0 0)` → `inset(0 0 0 0)` over 2s linear
- Image reveals on scroll: `inset(0 0 100% 0)` → `inset(0 0 0 0)`
- Comparison sliders: overlay, clip top with `inset(0 50% 0 0)`, adjust on drag

### Transform Rules
- `translateY(100%)` = move by element's own height. No hardcoded px.
- `scale()` scales children too (feature, not bug)
- `transform-origin: var(--radix-popover-content-transform-origin)` for popovers (not center)
- Modals keep `transform-origin: center` (not anchored to trigger)
- `@starting-style` modern enter animation (no JS needed)
- CSS transitions > keyframes for interruptible UI (rapid triggers)

### Blur Bridge
When crossfade between states feels off: add `filter: blur(2px)` during transition. Bridges visual gap. Keep < 20px. Expensive in Safari.

### Performance
- `will-change: transform` (never "all")
- Framer Motion `x`/`y` props NOT hardware accelerated → use `transform: "translateX()"` under load
- CSS animations > JS under load (off main thread)
- Grain filter on fixed pseudo-element, not scrolling container
- CSS variables on parent recalc all children → update `transform` directly
- `prefers-reduced-motion`: remove movement, keep opacity/color transitions

---

## CREATIVE ARSENAL (25+ premium UI concepts)

### Hero & Navigation
- **Asymmetric Hero**: Left/right aligned content, image background with stylistic fade
- **Mac OS Dock Magnification**: icons scale fluidly on hover
- **Magnetic Button**: pulls toward cursor (useMotionValue, not useState)
- **Dynamic Island**: pill-shaped component morphing to show status/alerts
- **Split Screen Scroll**: two halves sliding opposite directions
- **Curtain Reveal**: hero parting in middle on scroll

### Layout & Grids
- **Bento Grid**: asymmetric tile-based grouping (Apple Control Center style)
- **Masonry Layout**: staggered grid, no fixed row heights
- **Sticky Scroll Stack**: cards stick and stack on scroll
- **Horizontal Scroll Hijack**: vertical scroll → horizontal gallery
- **Zoom Parallax**: central image zooming on scroll

### Cards & Surfaces
- **Parallax Tilt Card**: 3D-tilting tracking cursor
- **Spotlight Border Card**: borders illuminate under cursor
- **Glassmorphism Panel**: `backdrop-blur` + `border-white/10` + `shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]`
- **Holographic Foil**: iridescent light shifting on hover

### Typography & Scrolling
- **Kinetic Marquee**: endless text bands reversing on scroll
- **Text Mask Reveal**: typography as transparent window to video
- **Text Scramble Effect**: Matrix-style character decoding
- **Scroll Progress Path**: SVG lines drawing on scroll

### Micro-Interactions
- **Directional Hover Button**: fill enters from mouse-entry side
- **Ripple Click Effect**: waves from click coordinates
- **Animated SVG Line Drawing**: vectors drawing own contours
- **Mesh Gradient Background**: animated color blobs
- **Particle Explosion Button**: CTA shattering on success

### Bento 2.0 Motion Engine
- Spring physics on ALL cards (`stiffness: 100, damping: 20`)
- `layout` / `layoutId` for smooth re-ordering
- Perpetual micro-animations: pulse, typewriter, float, shimmer, carousel
- Isolate perpetual motion in Client Component + React.memo
- Staggered reveals: `staggerChildren` with parent+children in same Client Component

---

## MICRO-DETAILS (the invisible layer)

### Shadow as Border
Replace solid borders on cards/buttons/containers with layered shadows:
```css
--shadow-border: 0px 0px 0px 1px rgba(0,0,0,0.06), 0px 1px 2px -1px rgba(0,0,0,0.06), 0px 2px 4px rgba(0,0,0,0.04);
--shadow-border-hover: 0px 0px 0px 1px rgba(0,0,0,0.08), 0px 1px 2px -1px rgba(0,0,0,0.08), 0px 2px 4px rgba(0,0,0,0.06);
/* Dark mode: single white ring */
--shadow-border: 0 0 0 1px rgba(255,255,255,0.08);
```

### Image Outlines
```css
img { outline: 1px solid rgba(0,0,0,0.1); outline-offset: -1px; }
/* Dark mode: rgba(255,255,255,0.1) */
/* NEVER use tinted outline (slate/zinc/neutral) */
```

### Optical Alignment
- Buttons: icon-side padding = text-side padding - 2px
- Play buttons: `margin-left: 2px` (triangle visual center)
- Fix asymmetric icons directly in SVG viewBox

### Gate Hover Behind Media Query
```css
@media (hover: hover) and (pointer: fine) {
  .element:hover { transform: scale(1.05); }
}
```

---

## STAGE-AWARE DESIGN (from YC strategy)

### Pyramid of Clarity
1. **Apex** ,  Sharp, jargon-aligned value prop (hero)
2. **Expanding context** ,  Features with visual proof as user scrolls
3. **Functional depth** ,  Technical docs, pricing, security (separate pages for mature)

### Stage-Appropriate Design
- **Pre-launch**: Build mystery. Faded screenshots. Waitlist. Single page buildable in a day.
- **Growth**: Brand recognition. Signature accent. High-res screenshots. Multiple CTAs.
- **Mature**: Depth. Sub-sections, roadmaps, enterprise tiers. Restrained authoritative palette.

### Anti-Slop for Copy
- Use specific jargon as high-value filter ("Issue Tracking" attracts engineers)
- Don't assume users know what "Deep Eval" or "MCP" means
- Concrete verbs > filler words
- Specific social proof > vague praise

---

## OPTIONAL: AUTOMATED BACKEND (OpenRouter)

For one-click generation, add `OPENROUTER_API_KEY` to `.env`. The skill works fully without this.

| Model | Role | Provider |
|-------|------|----------|
| GLM 5.2 | Architecture, design | OpenRouter `z-ai/glm-5.2` |
| Kimi K2.7 | Code generation | OpenRouter `moonshotai/kimi-k2.7-code` |

Commands:
```
node korrodesign/scaffold.js <project-dir>
node korrodesign/generate.js --prompt-file <path> --output-dir <dir>
node korrodesign/quality-check.js <project-dir>
npx eslint . --config eslint.config.korro.js          # Blind Spot audit
npx eslint . --config eslint.config.korro.js --fix    # Auto-fix violations
```

---

## ADAPTATION

**The system ADAPTS. Not every project needs 3D.**

| Project Type | 3D Level | Focus |
|-------------|----------|-------|
| Corporate, SaaS, blog, docs | None | Typography, whitespace, micro-interactions |
| Creative portfolio, agency | Subtle | Animated 3D background, particles |
| Artist, gaming, experience | Total | R3F universe, characters, narrative |

**Before every generation, ask**: Purpose? Audience? Right 3D level?

---

## FINAL PRE-FLIGHT CHECK

- [ ] Uses min-h-[100dvh] (not h-screen)?
- [ ] Concentric border radii?
- [ ] Shadows > borders for depth?
- [ ] Image outlines applied?
- [ ] No emoji, no AI slop copy?
- [ ] Custom palette (not Tailwind defaults)?
- [ ] 2+ premium fonts?
- [ ] Grain overlay present?
- [ ] Loading, empty, error states?
- [ ] Perpetual motion isolated + memoized?
- [ ] useEffect cleanup for GSAP/Three.js?
- [ ] Mobile collapse for high-variance designs?
- [ ] Anti-slop: no purple glow, no Inter, no generic cards?
- [ ] Spring physics on interactive elements?
- [ ] No ease-in on UI elements?
- [ ] No eslint-plugin-korro-design violations? (BLIND SPOT)
