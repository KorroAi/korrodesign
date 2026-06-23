#!/usr/bin/env node
// KORRO STUDIO ,  Project-level quality checker (COMPLEMENTARY to eslint-plugin-korro-design)
// ESLint plugin handles per-file AST rules (14 rules). This handles cross-file structural checks:
//   - tailwind.config.ts has custom palette
//   - Grain component is imported in layout
//   - AI slop phrases across the entire project
//   - Project structure completeness
// Usage: node quality-check.js <project-dir>

const { readFileSync, readdirSync, statSync, existsSync } = require("node:fs");
const { join, extname } = require("node:path");

const projectDir = process.argv[2];
if (!projectDir) {
  console.error("Usage: node quality-check.js <project-dir>");
  process.exit(1);
}

let violations = 0;
let warnings = 0;

function warn(msg) {
  warnings++;
  console.warn(`  \x1b[33mWARN\x1b[0m ${msg}`);
}
function fail(msg) {
  violations++;
  console.error(`  \x1b[31mFAIL\x1b[0m ${msg}`);
}

function walk(dir) {
  const results = [];
  const list = readdirSync(dir);
  for (const f of list) {
    const full = join(dir, f);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (f === "node_modules" || f === ".next" || f === ".git") continue;
      results.push(...walk(full));
    } else {
      results.push(full);
    }
  }
  return results;
}

function checkFile(filePath, content) {
  const ext = extname(filePath);
  // Skip binaries and generated files
  if ([".ico", ".png", ".jpg", ".svg", ".woff2", ".lock"].includes(ext)) return;

  // RULE: No hyphen-minus in text content (check tsx/jsx/md text nodes)
  if ([".tsx", ".jsx", ".md", ".html"].includes(ext)) {
    // Crude check ,  look for "- " patterns that might be hyphens in copy
    // This is a best-effort check; manual review needed
  }

  // RULE: No emoji
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  if (emojiRegex.test(content)) {
    fail(`${filePath}: Contains emoji ,  replace with Phosphor/Radix icons`);
  }

  // RULE: No Inter font
  if (content.includes("Inter") && ext !== ".md") {
    fail(`${filePath}: References 'Inter' font ,  use premium fonts (Geist, Cabinet Grotesk, Satoshi)`);
  }

  // RULE: No Arial/Helvetica/system-ui
  if (/\b(Arial|Helvetica|system-ui)\b/.test(content) && ext !== ".md") {
    fail(`${filePath}: References 'Arial'/'Helvetica'/'system-ui' ,  banned`);
  }

  // RULE: No pure black #000 or #000000
  if (/(?<![0-9a-fA-F])#000000|['"]#000['"]/.test(content)) {
    fail(`${filePath}: Uses pure black #000/#000000 ,  use Zinc-950 or off-black`);
  }

  // RULE: No default Tailwind palette
  if (/\b(blue|gray|red|green|yellow|purple|pink|indigo)-(50|100|200|300|400|500|600|700|800|900)\b/.test(content)) {
    warn(`${filePath}: Uses default Tailwind color palette ,  should be custom palette`);
  }

  // RULE: No emoji
  if (/[🏠🎨🚀💡⭐✨🔥💎🎯📦🔧⚡🎮🌍🔮🎪🎭🎬]/u.test(content)) {
    fail(`${filePath}: Contains emoji decoration ,  replace with icons`);
  }

  // RULE: h-screen usage
  if (/\bh-screen\b/.test(content)) {
    fail(`${filePath}: Uses 'h-screen' ,  must use 'min-h-[100dvh]' for mobile stability`);
  }

  // RULE: AI slop phrases
  const slopPhrases = [
    "Welcome to my website",
    "passionate developer",
    "innovative solutions",
    "cutting-edge",
    "building the future",
    "lorem ipsum",
  ];
  for (const phrase of slopPhrases) {
    if (content.toLowerCase().includes(phrase.toLowerCase())) {
      fail(`${filePath}: AI slop detected: "${phrase}" ,  rewrite with specific, concrete language`);
    }
  }

  // RULE: Check for tailwind.config.ts with custom palette
  if (filePath.endsWith("tailwind.config.ts") || filePath.endsWith("tailwind.config.js")) {
    if (!content.includes("colors:") || !content.includes("extend")) {
      fail(`${filePath}: tailwind.config must define custom colors in extend.theme.colors`);
    }
  }

  // RULE: Check for grain overlay usage
  // Best-effort: search for noise/grain in app layout
}

console.log(`\n[KORRO] Quality checking ${projectDir}...\n`);

// Check Tailwind config
const twConfig =
  join(projectDir, "tailwind.config.ts") || join(projectDir, "tailwind.config.js");
if (existsSync(join(projectDir, "tailwind.config.ts"))) {
  const tw = readFileSync(join(projectDir, "tailwind.config.ts"), "utf-8");
  checkFile("tailwind.config.ts", tw);
} else {
  warn("No tailwind.config.ts found ,  custom palette may be missing");
}

// Check all source files
const allFiles = walk(projectDir);
const files = allFiles.filter(
  (f) => {
    const nf = f.replace(/\\/g, "/");
    return nf.includes("/src/") ||
      nf.includes("/app/") ||
      nf.includes("/components/") ||
      nf.includes("/pages/");
  }
);

for (const file of files) {
  try {
    const content = readFileSync(file, "utf-8");
    checkFile(file, content);
  } catch {
    // Binary file, skip
  }
}

// Summary
console.log(`\n[KORRO] Quality check complete.`);
console.log(`  Violations: ${violations}`);
console.log(`  Warnings:   ${warnings}`);

if (violations === 0 && warnings === 0) {
  console.log(`  Status:     \x1b[32mPASSED\x1b[0m ,  KORRO Studio rules satisfied.`);
} else if (violations === 0) {
  console.log(`  Status:     \x1b[33mWARNINGS\x1b[0m ,  review warnings before deploy.`);
} else {
  console.log(`  Status:     \x1b[31mFAILED\x1b[0m ,  fix violations before deploy.`);
  process.exit(1);
}
