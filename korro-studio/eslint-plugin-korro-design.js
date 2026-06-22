// eslint-plugin-korro-design — Blind Spot: UI structural integrity linter
// 14 rules. Use with: npx eslint . --config .eslintrc.korro.js
// Auto-fix: npx eslint . --config .eslintrc.korro.js --fix

const PLUGIN_NAME = "korro-design";

// ---- Rule 1: no-div-as-button ----
const noDivAsButton = {
  meta: {
    type: "problem",
    docs: { description: "Disallow div/span with onClick but no button semantics" },
    messages: { replaceWithButton: "<{{tag}}> has onClick but no button semantics. Use <button> or add role=\"button\" tabIndex={0} onKeyDown." },
  },
  create(ctx) {
    return {
      JSXElement(node) {
        const tag = node.openingElement.name.name;
        if (!/^[a-z]+$/.test(tag)) return;
        if (/^(button|a|input|select|textarea)$/.test(tag)) return;
        const attrs = node.openingElement.attributes;
        if (!attrs.some(a => a.name?.name === "onClick")) return;
        const hasRole = attrs.some(a => a.name?.name === "role" && a.value?.value === "button");
        const hasTabIndex = attrs.some(a => a.name?.name === "tabIndex");
        const hasOnKeyDown = attrs.some(a => a.name?.name === "onKeyDown");
        if (hasRole && hasTabIndex && hasOnKeyDown) return;
        ctx.report({ node, messageId: "replaceWithButton", data: { tag } });
      },
    };
  },
};

// ---- Rule 2: require-focus-visible ----
const requireFocusVisible = {
  meta: {
    type: "problem",
    docs: { description: "Interactive elements must have focus-visible styles" },
    messages: { missing: "Interactive <{{tag}}> missing focus-visible style. Add focus-visible:ring-2." },
  },
  create(ctx) {
    const interactive = new Set(["button","a","input","select","textarea","details","summary"]);
    const roles = new Set(["button","link","checkbox","radio","switch","tab","menuitem","option"]);
    return {
      JSXOpeningElement(node) {
        const tag = node.name.name;
        const roleAttr = node.attributes.find(a => a.name?.name === "role");
        if (!interactive.has(tag) && (!roleAttr || !roles.has(roleAttr.value?.value))) return;
        const cn = (node.attributes.find(a => a.name?.name === "className")?.value?.value || "");
        if (!cn.includes("focus")) {
          ctx.report({ node, messageId: "missing", data: { tag } });
        }
      },
    };
  },
};

// ---- Rule 3: no-pure-black ----
const noPureBlack = {
  meta: {
    type: "problem",
    docs: { description: "Disallow pure black #000/#000000" },
    messages: { offBlack: "Pure black {{value}}. Use off-black: zinc-950, #0a0a0a, or stone-950." },
  },
  create(ctx) {
    return {
      Literal(node) {
        if (typeof node.value !== "string") return;
        const m = node.value.match(/#0{3,6}\b/i);
        if (m) ctx.report({ node, messageId: "offBlack", data: { value: m[0] } });
      },
      TemplateElement(node) {
        const m = node.value.raw.match(/#0{3,6}\b/i);
        if (m) ctx.report({ node, messageId: "offBlack", data: { value: m[0] } });
      },
    };
  },
};

// ---- Rule 4: no-generic-fonts ----
const noGenericFonts = {
  meta: {
    type: "problem",
    docs: { description: "Disallow Inter, Arial, Helvetica, system-ui" },
    messages: { banned: "Generic font '{{font}}' found. Use Geist, Cabinet Grotesk, Satoshi, or Switzer." },
  },
  create(ctx) {
    const rx = /\b(Inter|Arial|Helvetica|system-ui)\b/;
    function check(node, text) {
      const m = text.match(rx);
      if (m) ctx.report({ node, messageId: "banned", data: { font: m[1] } });
    }
    return {
      Literal(node) { if (typeof node.value === "string") check(node, node.value); },
      TemplateElement(node) { check(node, node.value.raw); },
      JSXAttribute(node) {
        if (node.name?.name !== "className") return;
        if (typeof node.value?.value === "string") check(node, node.value.value);
      },
    };
  },
};

// ---- Rule 5: no-emoji-in-ui ----
const noEmojiInUi = {
  meta: {
    type: "problem",
    docs: { description: "Disallow emoji in JSX — use Phosphor/Radix icons" },
    messages: { emoji: "Emoji '{{emoji}}' in UI. Use Phosphor or Radix icons instead." },
  },
  create(ctx) {
    const rx = /[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{2764}\u{1F48E}]/u;
    return {
      JSXText(node) { const m = node.value.match(rx); if (m) ctx.report({ node, messageId: "emoji", data: { emoji: m[0] } }); },
      Literal(node) { if (typeof node.value === "string") { const m = node.value.match(rx); if (m) ctx.report({ node, messageId: "emoji", data: { emoji: m[0] } }); } },
    };
  },
};

// ---- Rule 6: no-z-index-chaos ----
const noZIndexChaos = {
  meta: {
    type: "problem",
    docs: { description: "Enforce z-index scale: 0, 10, 20, 30, 40, 50. Flag both Tailwind classes and inline styles." },
    messages: { chaos: "z-index {{value}} outside allowed scale [0,10,20,30,40,50]." },
  },
  create(ctx) {
    const valid = new Set(["0","10","20","30","40","50"]);
    return {
      JSXAttribute(node) {
        if (node.name?.name === "className" && typeof node.value?.value === "string") {
          // Match Tailwind: z-0, z-10, ..., z-50, z-[N]
          for (const m of node.value.value.matchAll(/\bz-\[?(\d+)\]?/g)) {
            if (!valid.has(m[1])) ctx.report({ node, messageId: "chaos", data: { value: m[1] } });
          }
        }
        if (node.name?.name === "style" && node.value?.expression?.type === "ObjectExpression") {
          for (const p of node.value.expression.properties) {
            if (p.key?.name === "zIndex" && p.value?.type === "NumericLiteral" && !valid.has(String(p.value.value))) {
              ctx.report({ node: p, messageId: "chaos", data: { value: String(p.value.value) } });
            }
          }
        }
      },
      Property(node) {
        if (node.key?.name === "zIndex" && node.value?.type === "NumericLiteral" && !valid.has(String(node.value.value))) {
          ctx.report({ node, messageId: "chaos", data: { value: String(node.value.value) } });
        }
      },
    };
  },
};

// ---- Rule 7: spacing-grid-4px ----
const spacingGrid4px = {
  meta: {
    type: "suggestion",
    docs: { description: "Flag Tailwind spacing values off the 4px grid" },
    messages: { offGrid: "Spacing {{value}}px not on 4px grid. Use multiple of 4." },
  },
  create(ctx) {
    // m[t,r,b,l,x,y]?-N, p[t,r,b,l,x,y]?-N, gap-N, space-[xy]-N
    const rx = /\b(?:[mp][trblxy]?|gap[xy]?|space-[xy])-\[(\d+)px\]/g;
    return {
      JSXAttribute(node) {
        if (node.name?.name !== "className") return;
        const v = node.value?.value;
        if (typeof v !== "string") return;
        for (const m of v.matchAll(rx)) {
          if (Number(m[1]) % 4 !== 0) ctx.report({ node, messageId: "offGrid", data: { value: m[1] } });
        }
      },
    };
  },
};

// ---- Rule 8: require-image-outlines ----
const requireImageOutlines = {
  meta: {
    type: "suggestion",
    docs: { description: "<img> must have subtle outline" },
    messages: { missing: "<img> missing outline. Add className=\"outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10\"." },
  },
  create(ctx) {
    return {
      JSXOpeningElement(node) {
        if (node.name.name !== "img") return;
        const cn = (node.attributes.find(a => a.name?.name === "className")?.value?.value || "");
        if (!cn.includes("outline")) ctx.report({ node, messageId: "missing" });
      },
    };
  },
};

// ---- Rule 9: prefer-concentric-radii ----
const preferConcentricRadii = {
  meta: {
    type: "suggestion",
    docs: { description: "Nested rounded containers: outer radius should exceed inner radius" },
    messages: { check: "Nested rounded containers. Ensure outer radius = inner radius + padding (concentric)." },
  },
  create(ctx) {
    return {
      JSXElement(node) {
        const cn = node.openingElement.attributes.find(a => a.name?.name === "className")?.value?.value || "";
        const hasRadius = /\brounded(?:-\w+|\[[\d.]+rem\])/.test(cn);
        if (!hasRadius) return;
        // Check if children also have rounded elements — flag if both have radii
        const children = node.children.filter(c => c.type === "JSXElement");
        for (const child of children) {
          const childCn = child.openingElement.attributes.find(a => a.name?.name === "className")?.value?.value || "";
          if (/\brounded(?:-\w+|\[[\d.]+rem\])/.test(childCn)) {
            ctx.report({ node: child, messageId: "check" });
            return; // one report per parent is enough
          }
        }
      },
    };
  },
};

// ---- Rule 10: no-hardcoded-magic-numbers ----
const noHardcodedMagicNumbers = {
  meta: {
    type: "suggestion",
    docs: { description: "Flag raw numeric values in inline styles — extract as design tokens" },
    messages: { magic: "Magic number {{value}} in inline style. Use CSS variable or Tailwind config token." },
  },
  create(ctx) {
    return {
      JSXAttribute(node) {
        if (node.name?.name !== "style") return;
        const expr = node.value?.expression;
        if (!expr || (expr.type !== "ObjectExpression" && expr.type !== "JSXExpressionContainer")) return;
        const properties = expr.properties || (expr.expression?.properties);
        if (!properties) return;
        for (const p of properties) {
          const val = p.value?.type === "NumericLiteral" || p.value?.type === "Literal"
            ? p.value.value
            : null;
          if (typeof val === "number" && val > 1) {
            ctx.report({ node: p, messageId: "magic", data: { value: String(val) } });
          }
        }
      },
    };
  },
};

// ---- Rule 11: no-duplicate-colors ----
const noDuplicateColors = {
  meta: {
    type: "suggestion",
    docs: { description: "Flag repeated hex color values within the same file — centralize in Tailwind config" },
    messages: { duplicate: "Hex {{hex}} appears multiple times. Define once in tailwind.config theme.colors." },
  },
  create(ctx) {
    const seen = new Map();
    return {
      Literal(node) {
        if (typeof node.value !== "string") return;
        const m = node.value.match(/#[0-9a-fA-F]{6}\b/);
        if (!m) return;
        const h = m[0].toLowerCase();
        if (seen.has(h)) {
          ctx.report({ node, messageId: "duplicate", data: { hex: h } });
        } else {
          seen.set(h, node);
        }
      },
    };
  },
};

// ---- Rule 12: require-loading-state ----
const requireLoadingState = {
  meta: {
    type: "suggestion",
    docs: { description: "Components with async data fetching should have a loading state" },
    messages: { missing: "Component fetches data but no loading state detected. Add Suspense fallback, skeleton, or isLoading check." },
  },
  create(ctx) {
    let hasAsync = false;
    let hasLoading = false;
    // More reliable detection: look for async function components or known data hooks
    return {
      // Async function component
      "FunctionDeclaration[async=true], FunctionExpression[async=true], ArrowFunctionExpression[async=true]"() { hasAsync = true; },
      // Known data-fetching hooks
      "CallExpression[callee.name=/useQuery|useSWR|useFetch|useAsync/]"() { hasAsync = true; },
      "CallExpression > MemberExpression[property.name=/getServerSideProps|getStaticProps/]"() { hasAsync = true; },
      // Detect loading indicators
      "JSXAttribute"(node) {
        if (node.name?.name === "fallback") hasLoading = true;
        const v = node.value?.value;
        if (typeof v === "string" && /\b(loading|skeleton|spinner|fallback|pending)\b/i.test(v)) hasLoading = true;
        if (node.value?.expression?.type === "ConditionalExpression") {
          const src = ctx.sourceCode.getText(node.value.expression);
          if (/\b(loading|isLoading|pending|isPending)\b/.test(src)) hasLoading = true;
        }
      },
      "Program:exit"() {
        if (hasAsync && !hasLoading) {
          ctx.report({ node: ctx.sourceCode.ast, messageId: "missing", loc: { line: 1, column: 0 } });
        }
      },
    };
  },
};

// ---- Rule 13: no-h-screen ----
const noHScreen = {
  meta: {
    type: "problem",
    docs: { description: "Disallow h-screen in favor of min-h-[100dvh]" },
    messages: { dvh: "h-screen breaks on mobile. Use min-h-[100dvh] instead." },
  },
  create(ctx) {
    return {
      JSXAttribute(node) {
        if (node.name?.name !== "className") return;
        const v = node.value?.value;
        if (typeof v === "string" && /(?:\s|^)h-screen(?:\s|$)/.test(v)) {
          ctx.report({ node, messageId: "dvh" });
        }
      },
    };
  },
};

// ---- Rule 14: no-default-tailwind-colors ----
const noDefaultTailwindColors = {
  meta: {
    type: "suggestion",
    docs: { description: "Flag use of default Tailwind color palette — should use custom theme colors" },
    messages: { custom: "Default Tailwind color '{{color}}' used. Define custom palette in tailwind.config.ts." },
  },
  create(ctx) {
    // Flag color-{shade} patterns from the default palette
    const rx = /\b(gray|slate|blue|red|green|yellow|purple|pink|indigo)-(50|100|200|300|400|500|600|700|800|900|950)\b/g;
    return {
      JSXAttribute(node) {
        if (node.name?.name !== "className") return;
        const v = node.value?.value;
        if (typeof v !== "string") return;
        for (const m of v.matchAll(rx)) {
          ctx.report({ node, messageId: "custom", data: { color: m[0] } });
        }
      },
    };
  },
};

// ---- Export ----
module.exports = {
  rules: {
    "no-div-as-button": noDivAsButton,
    "require-focus-visible": requireFocusVisible,
    "no-pure-black": noPureBlack,
    "no-generic-fonts": noGenericFonts,
    "no-emoji-in-ui": noEmojiInUi,
    "no-z-index-chaos": noZIndexChaos,
    "spacing-grid-4px": spacingGrid4px,
    "require-image-outlines": requireImageOutlines,
    "prefer-concentric-radii": preferConcentricRadii,
    "no-hardcoded-magic-numbers": noHardcodedMagicNumbers,
    "no-duplicate-colors": noDuplicateColors,
    "require-loading-state": requireLoadingState,
    "no-h-screen": noHScreen,
    "no-default-tailwind-colors": noDefaultTailwindColors,
  },
  configs: {
    recommended: {
      plugins: [PLUGIN_NAME],
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
    strict: {
      plugins: [PLUGIN_NAME],
      rules: {
        "korro-design/no-div-as-button": "error",
        "korro-design/require-focus-visible": "error",
        "korro-design/no-pure-black": "error",
        "korro-design/no-generic-fonts": "error",
        "korro-design/no-emoji-in-ui": "error",
        "korro-design/no-h-screen": "error",
        "korro-design/no-z-index-chaos": "error",
        "korro-design/spacing-grid-4px": "error",
        "korro-design/require-image-outlines": "error",
        "korro-design/prefer-concentric-radii": "error",
        "korro-design/no-hardcoded-magic-numbers": "error",
        "korro-design/no-duplicate-colors": "error",
        "korro-design/require-loading-state": "error",
        "korro-design/no-default-tailwind-colors": "error",
      },
    },
  },
};
