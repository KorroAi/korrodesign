#!/usr/bin/env node
// KORRO STUDIO — Scaffold a Next.js 15 + Tailwind v4 + TypeScript project
// Usage: node scaffold.js <project-dir>

const { execSync } = require("node:child_process");
const { writeFileSync, mkdirSync, existsSync } = require("node:fs");
const { join } = require("node:path");

const projectDir = process.argv[2];
if (!projectDir) {
  console.error("Usage: node scaffold.js <project-dir>");
  process.exit(1);
}

if (existsSync(projectDir)) {
  console.error(`Directory ${projectDir} already exists.`);
  process.exit(1);
}

console.log("[KORRO] Scaffolding Next.js 15 + Tailwind v4...");

execSync(
  `npx create-next-app@latest ${projectDir} --typescript --tailwind --eslint --app --src-dir --no-import-alias --turbopack`,
  { stdio: "inherit" }
);

// Install premium defaults
console.log("[KORRO] Installing premium dependencies...");
const deps = [
  "framer-motion",
  "gsap",
  "@studio-freight/lenis",
  "@phosphor-icons/react",
  "three",
  "@react-three/fiber",
  "@react-three/drei",
];
execSync(`cd ${projectDir} && npm install ${deps.join(" ")}`, { stdio: "inherit" });

// Install font packages
const fonts = ["@fontsource/cabinet-grotesk", "@fontsource/satoshi"];
execSync(`cd ${projectDir} && npm install ${fonts.join(" ")}`, { stdio: "inherit" });

// Copy ESLint plugin for Blind Spot audit
const pluginSource = join(__dirname, "eslint-plugin-korro-design.js");
const pluginDest = join(projectDir, "eslint-plugin-korro-design.js");
if (existsSync(pluginSource)) {
  const { copyFileSync } = require("node:fs");
  copyFileSync(pluginSource, pluginDest);
  console.log("[KORRO] Installed eslint-plugin-korro-design (Blind Spot)");
}

// Write eslint.config.korro.js with korro-design plugin
writeFileSync(
  join(projectDir, "eslint.config.korro.js"),
  `// KORRO Design — Blind Spot: UI structural integrity linting (ESLint v10 flat config)
// Run: npx eslint . --config eslint.config.korro.js
// Auto-fix: npx eslint . --config eslint.config.korro.js --fix
const korroDesign = require("./eslint-plugin-korro-design.js");

module.exports = [
  {
    files: ["**/*.tsx", "**/*.jsx"],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: { "korro-design": korroDesign },
    rules: {
      "korro-design/no-div-as-button": "error",
      "korro-design/require-focus-visible": "error",
      "korro-design/no-pure-black": "error",
      "korro-design/no-generic-fonts": "error",
      "korro-design/no-emoji-in-ui": "error",
      "korro-design/no-h-screen": "error",
      "korro-design/no-z-index-chaos": "warn",
      "korro-design/spacing-grid-4px": "warn",
      "korro-design/require-image-outlines": "warn",
      "korro-design/prefer-concentric-radii": "warn",
      "korro-design/no-hardcoded-magic-numbers": "warn",
      "korro-design/no-duplicate-colors": "warn",
      "korro-design/require-loading-state": "warn",
      "korro-design/no-default-tailwind-colors": "warn",
    },
  },
];
`
);

// Write grain overlay component
const componentsDir = join(projectDir, "src", "components");
mkdirSync(componentsDir, { recursive: true });

writeFileSync(
  join(componentsDir, "Grain.tsx"),
  `"use client";

export function Grain() {
  return (
    <div
      className="fixed inset-0 z-50 pointer-events-none opacity-[0.03]"
      style={{
        backgroundImage: \`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")\`,
        backgroundRepeat: "repeat",
        backgroundSize: "256px 256px",
      }}
    />
  );
}
`
);

// Write Lenis provider
writeFileSync(
  join(componentsDir, "SmoothScroll.tsx"),
  `"use client";

import { useEffect, useRef } from "react";
import Lenis from "@studio-freight/lenis";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
`
);

console.log("[KORRO] Scaffold complete.");
console.log(`[KORRO] Next steps:`);
console.log(`  1. Generate: node ../korro-studio/generate.js --prompt-file BRIEF_CURRENT.md --output-dir .`);
console.log(`  2. Audit:    npx eslint . --config eslint.config.korro.js`);
console.log(`  3. Auto-fix: npx eslint . --config eslint.config.korro.js --fix`);
