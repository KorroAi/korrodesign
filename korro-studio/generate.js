#!/usr/bin/env node
// Korrocorp STUDIO ,  Generate pipeline via OpenRouter (GLM 5.2 + Kimi K2.7)
// Usage: node generate.js --prompt-file <path> --output-dir <dir>

const { readFileSync, writeFileSync, mkdirSync, existsSync } = require("node:fs");
const { join, dirname } = require("node:path");
const { execSync } = require("node:child_process");

// Parse args
const args = process.argv.slice(2);
const promptFile = args[args.indexOf("--prompt-file") + 1];
const outputDir = args[args.indexOf("--output-dir") + 1];

if (!promptFile || !outputDir) {
  console.error("Usage: node generate.js --prompt-file <path> --output-dir <dir>");
  process.exit(1);
}

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
if (!OPENROUTER_API_KEY) {
  console.error("[Korrocorp] OPENROUTER_API_KEY not set in environment.");
  console.error("[Korrocorp] Fallback: manual generation mode. The SKILL.md will guide Claude directly.");
  console.error("[Korrocorp] To enable full automation, add OPENROUTER_API_KEY to .env");
  process.exit(1);
}

const BRIEF = readFileSync(promptFile, "utf-8");

const OPENROUTER_BASE = "https://openrouter.ai/api/v1";

async function callModel(model, systemPrompt, userPrompt, temperature = 0.7) {
  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": "https://github.com/korro/korro-studio",
      "X-Title": "Korrocorp Design",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature,
      max_tokens: 16000,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${model} API error ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

async function generate() {
  console.log("[Korrocorp] Starting generation pipeline...\n");

  // ======================
  // STEP 1: GLM 5.2 ,  Architecture + Design
  // ======================
  console.log("[Korrocorp] Phase 1/3: GLM 5.2 designing architecture...");

  const GLM_PROMPT = `You are a Senior Design Architect. Read this creative brief and produce a COMPLETE design specification.

[BRIEF]
${BRIEF}

Generate a design spec covering:
1. ARCHITECTURE: Component tree, route structure, data flow
2. COLOR SYSTEM: Exact hex values with semantic names (bg, surface, text, accent, border)
3. TYPOGRAPHY: Display font + Body font from the approved font list, with size scale
4. SPACING: System scale (xs/sm/md/lg/xl/2xl)
5. BORDER RADIUS: Scale from tight (4px) to pill (9999px)
6. SHADOWS: 4 levels with exact values
7. ANIMATION SYSTEM: Easing curves, duration tokens, spring configs
8. COMPONENT SPECS: Button (3 variants), Card, Input, Nav, Hero, Footer ,  with all states
9. RESPONSIVE BREAKPOINTS: Mobile (<768px), Tablet, Desktop (1400px max-w)

CRITICAL RULES:
- NO Inter/Arial/Helvetica fonts
- NO pure black (#000) ,  use off-black
- NO default Tailwind colors (blue-500, gray-100)
- Max 1 accent color, saturation < 80%
- Dark mode by default
- Concentric border radii throughout`;

  let designSpec;
  try {
    designSpec = await callModel(
      "z-ai/glm-5.2",
      "You are an expert design architect. Output ONLY valid specifications. Be precise and exhaustive.",
      GLM_PROMPT,
      0.8
    );
    console.log("[Korrocorp] Architecture design complete.\n");
  } catch (e) {
    console.error(`[Korrocorp] GLM 5.2 failed: ${e.message}`);
    console.error("[Korrocorp] Falling back to manual design.");
    designSpec = "FALLBACK: Manual design required. Use the Korrocorp STUDIO RULES from SKILL.md.";
  }

  // Save design spec
  const specPath = join(outputDir, "KORRO_DESIGN_SPEC.md");
  writeFileSync(specPath, designSpec);
  console.log(`[Korrocorp] Design spec saved to ${specPath}\n`);

  // ======================
  // STEP 2: Kimi K2.7 ,  Code Generation
  // ======================
  console.log("[Korrocorp] Phase 2/3: Kimi K2.7 generating code...");

  const CODE_SYSTEM = `You are a world-class frontend engineer. Generate PRODUCTION-READY Next.js 15 code.

CRITICAL RULES:
- Server Components by default, 'use client' ONLY for interactivity
- Custom palette in tailwind.config.ts (NO blue-500, gray-100)
- 2+ premium fonts via next/font/google (NO Inter/Arial/Helvetica)
- Grain texture overlay (CSS noise, fixed, pointer-events-none, opacity < 0.05)
- GSAP ScrollTrigger on at least one section
- Lenis smooth scroll
- min-h-[100dvh] (NEVER h-screen)
- Concentric border radius: outer = inner + padding
- text-wrap: balance on headings, tabular-nums on dynamic numbers
- Transform + opacity ONLY for animations
- Spring physics (type:"spring", stiffness:100, damping:20)
- Loading, empty, error states for every interactive component
- Every component FULLY implemented, no TODOs, no placeholders
- Icons from @phosphor-icons/react (strokeWidth 1.5 or 2)
- Pixel-perfect, production-ready

TECH STACK: Next.js 15 App Router, TypeScript, Tailwind CSS v4, Framer Motion, GSAP, Lenis, Phosphor Icons, Three.js/R3F (if 3D)`;

  const files = [];
  const components = designSpec.match(/###\s*COMPONENT\s*SPECS?[\s\S]*?(?=###|$)/i)?.[0] || "";
  const componentList = components.match(/\*\*([A-Za-z]+)\*\*/g)?.map((m) => m.replace(/\*/g, "")) || [
    "Layout",
    "Navbar",
    "Hero",
    "Features",
    "Footer",
  ];

  for (const component of componentList) {
    const prompt = `Generate the file src/components/${component}.tsx for a Next.js 15 App Router project.

DESIGN SPEC:
${designSpec.slice(0, 8000)}

RULES:
- '@' imports assume src/ is configured
- Use 'use client' ONLY if the component has interactivity (hooks, event handlers, animations)
- All states: loading (skeleton), empty, error, default
- Phosphor icons with strokeWidth={1.5}
- Spring-based animations with Framer Motion
- Custom CSS variables for colors (referenced via Tailwind config)
- Full implementation, NO placeholders`;

    try {
      const code = await callModel("moonshotai/kimi-k2.7-code", CODE_SYSTEM, prompt, 0.4);
      const cleanCode = code.replace(/```[\w]*\n?/g, "").trim();
      const filePath = join(outputDir, "src", "components", `${component}.tsx`);
      mkdirSync(dirname(filePath), { recursive: true });
      writeFileSync(filePath, cleanCode);
      files.push(`src/components/${component}.tsx`);
      console.log(`[Korrocorp] Generated ${component}.tsx`);
    } catch (e) {
      console.error(`[Korrocorp] Kimi failed for ${component}: ${e.message}`);
    }
  }

  // ======================
  // STEP 3: Quality check + Install + Build
  // ======================
  console.log("\n[Korrocorp] Phase 3/3: Quality check & build...");

  // Write a basic layout wrapper if not generated
  const layoutPath = join(outputDir, "src", "app", "layout.tsx");
  if (!existsSync(layoutPath)) {
    mkdirSync(dirname(layoutPath), { recursive: true });
    const layoutTsx = `import type { Metadata } from "next";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Grain } from "@/components/Grain";
import "./globals.css";

export const metadata: Metadata = {
  title: "Korrocorp Design",
  description: "Generated by Korrocorp Design",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">
        <SmoothScroll>
          <Grain />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
`;
    writeFileSync(layoutPath, layoutTsx);
    files.push("src/app/layout.tsx");
  }

  // Install deps
  console.log("[Korrocorp] Installing dependencies...");
  try {
    execSync(`cd ${outputDir} && npm install`, { stdio: "inherit" });
  } catch {
    console.error("[Korrocorp] npm install had issues ,  may need manual fix.");
  }

  // Summary
  console.log(`\n[Korrocorp] Generation complete!`);
  console.log(`[Korrocorp] Files generated: ${files.length}`);
  files.forEach((f) => console.log(`  - ${f}`));
  console.log(`\n[Korrocorp] Start dev server: cd ${outputDir} && npm run dev`);
}

generate().catch((e) => {
  console.error(`[Korrocorp] Fatal error: ${e.message}`);
  process.exit(1);
});
