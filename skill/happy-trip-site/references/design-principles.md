# Design Principles — Destination-Aware Reasoning

This document teaches the agent *how to reason about a destination's design*, not what values to fill in. Generated trip sites must be visibly destination-distinct: a Kyoto site and a Bali site should feel unmistakably different before a single word is read. Reason from the destination through the axes below; never reach for a generic safe template.

The quality benchmark is `kansai-no-tabi.vercel.app`: destination identity there is expressed across four stacked layers (material texture, ambient animation, cultural glyph, typography), not a color swap. Aim for that depth.

---

## 1. Destination Reading (Four Axes)

**Where the inputs come from (no new schema fields):** the agent derives the four axes from data already in the Trip Brief — per-day `city` and `trip_title` give **region → culture + climate**; day `date` values give **season**; the mix of itinerary item types (hikes, museums, restaurants, nightlife) gives **trip tone**. When `city` is only a country, or no `date` exists (season unknown), the agent MUST ASK in the step-4 follow-up gate before deriving design — it never silently guesses the climate or season.

Then derive design values by reasoning, not lookup:

- **Climate** → color temperature and saturation level (tropical = warm / high saturation; nordic = cool / low saturation).
- **Culture layer** → typography and ornamentation (traditional = serif display + restraint; contemporary = geometric sans + density).
- **Trip tone** → visual energy (adventure = high contrast / bold; relaxation = muted / airy; food-focused = warm / precise).
- **Season** → tint direction (spring = pink/green; summer = bright/saturated; autumn = amber/rust; winter = blue-grey/minimal).

---

## 2. Anchor Color Rule

Every destination gets exactly **one** anchor color. Its origin must be expressible in one sentence tied to the place:

- Kyoto → navy `#2C4A7C` (traditional textile dyeing, noren indigo)
- Bali → terracotta `#B45309` (temple brick, sunset stone)
- Iceland → aurora blue `#1D4ED8` (glacial ice, midnight sky)
- Chiang Mai → moss green `#437040` (rainforest, temple copper patina)

**Forbidden:** generic safe-blue (`#007AFF`), unanchored grays, any color with no cultural or geographic rationale.

From the anchor color, derive **three palette seeds** (warm, cool, neutral variants) — one for each of the three UI options.

### WCAG AA Contrast Requirement (mandatory)

**Every palette color used for text or interactive elements** must achieve at least **4.5:1** contrast ratio (WCAG AA) against the **chosen `palette.background`** — not the template default `#f2f2ef`, but the actual background you pick for this trip. Check all of:

| Palette key | Role | Must pass against |
|-------------|------|-------------------|
| `ink` | body text | `palette.background` and `palette.surface` |
| `muted` | secondary text, captions | `palette.background` and `palette.surface` |
| `accent` (`anchorColor`) | links, buttons, interactive | `palette.background` and `palette.surface` |
| `accent2` (= `accentWarm` in the `aesthetic` block) | eyebrow labels | `palette.background` and `palette.surface` |

> **Naming note:** `accent2` is the key name inside `palette {}`. The same color is set as `accentWarm` inside the `aesthetic {}` block. Both must be provided; they serve different purposes (`palette.accent2` drives CSS tokens, `aesthetic.accentWarm` drives the `--color-accent-2` CSS var via `buildAesthetic`).

**Practical constraint:** the anchor color's relative luminance must be ≤ 0.16 (roughly CIELAB L* ≤ 47 — mid-tone or darker). Colors above this threshold fail on warm off-white backgrounds even if they look dark enough on screen.

> **Do not skip `muted` — it is the most common failure point.** Designers instinctively lighten secondary text for visual softness without checking the ratio. Verify `muted` last, independently, even if `accent` passes easily. A `muted` that fails is a silent degradation: it passes every other check and only shows up as unreadable text on a real phone.

Quick check: all four anchor examples above pass (Kyoto 7.9:1 · Bali 4.5:1 · Iceland 6.0:1 · Chiang Mai 5.2:1). These ratios are computed against `#f2f2ef` (the template default) — if your chosen `palette.background` differs, recompute against your actual background. When in doubt, choose the darker variant of a hue family — for both accent and muted.

**Verify the full palette before writing the confirmed option.** Compute relative luminance per channel: let `n = c/255`; if `n > 0.04045` use `((n + 0.055) / 1.055) ^ 2.4`, else `n / 12.92`. Then `L = 0.2126×R_lin + 0.7152×G_lin + 0.0722×B_lin`. Contrast = `(L_lighter + 0.05) / (L_darker + 0.05)`. Any pair below 4.5:1 must be replaced before generation. `verify-preview.mjs` enforces this check automatically and will FAIL if any text-role color falls below the threshold.

### Runtime Mobile Target Requirement (mandatory)

Core travel-day controls must remain visible and at least **44x44px after CSS cascade** in a real mobile browser viewport. This applies to `.menu-btn`, `.it-check`, `.quick-link`, `.map-route-link`, `.route-pin-link`, and enabled `.nav-btn`.

Do not rely on source inspection, screenshots, or a base `travel.css` rule to prove this. Layout styles load after the base stylesheet and may legally override dimensions, so every preview and final generated site must pass:

```bash
node SKILL_DIR/scripts/verify-mobile-runtime.mjs <preview-or-index>.html
```

For final generated sites, write the report with:

```bash
node SKILL_DIR/scripts/verify-mobile-runtime.mjs --report <output-folder>/mobile-usability-result.json <output-folder>/index.html
```

`mobile-usability-result.json` must contain `"mobile_usability_passed": true` before a site is treated as shareable.

### Wiring into the aesthetic block

Set both fields as full 6-digit hex strings. The runtime (`buildAesthetic`) injects them as CSS variables so they take effect globally across the generated site:

```json
"aesthetic": {
  "anchorColor": "#2C4A7C",
  "accentWarm": "#8B5C3A",
  ...
}
```

Omitting these fields leaves the template default colors in place — always provide them.

---

## 3. Three-Option Distinctiveness Formula

Three options must differ on **narrative mode**, not just color. Each has a fixed role:

- **Option A — Sensory**: photography dominates, large hero, content reveals on scroll. For users who want to *feel* the place.
- **Option B — Editorial**: typography leads, images are accents, higher content density. For users who want to *control* the plan.
- **Option C — Navigation-first**: map prominent above the fold, cards are compact checklists. For users who *navigate on foot*.

Same anchor color family across all three. **Layout structure, density, and visual hierarchy** are what differentiate them.

---

## 4. Typography Selection

- Traditional / cultural destination → serif as display font, sans for body.
- Urban / contemporary → geometric sans throughout.
- Nature / adventure → humanist sans, slightly condensed.
- Beach / tropical → rounded sans or a playful display.
- Mixed city → pair the dominant cultural axis with a contrasting body.

---

## 5. Motif Language (non-mandatory)

Dividers, borders, and micro-decorations may carry destination geometry — Japanese mon patterns, Islamic tilework, Scandinavian minimal line work. Rules: **never photographic, never clipart-style, always CSS** (SVG or border patterns), and **always subservient to the content grid**.

---

## 6. Fallback

When the destination is ambiguous or unrecognized: use a warm neutral travel palette, keep all three option roles (Sensory / Editorial / Navigation), and still derive three distinct palette seeds. **Never collapse to a single safe design.**

---

## 7. Cultural Aesthetic Layer — Four Stacked Layers

Every destination gets four layers on top of the CSS token system. These are **not a lookup table** — they are questions the agent must answer by reasoning about the *specific* destination. The kansai-no-tabi site is the reference execution: washi `feTurbulence` noise, a sakura canvas, a 関西 ink seal, and Shippori Mincho + Klee One — each derived by asking the four questions below.

There is **NO BGM layer** — ambient sound is removed from the design system.

**Deployed vs. preview.** The deployed template wires four of these layers automatically from the chosen option's `aesthetic` block: **texture, motif, glyph, and typography**. The **ambient-animation canvas (Layer 2) stays preview-only / optional** — it needs bespoke per-destination JS, and a bare background is always an acceptable result. For the concrete, copy-tunable CSS for these layers, see `design-reference.css`.

### Layer 1 — Material Texture

**The question:** What physical material is most at home in this destination — what would a local artisan reach for?

Implement as SVG `feTurbulence` in the page `background-image`. The texture should be subtle but genuinely perceptible — on a phone, values below ~10% vanish entirely, so target **opacity 10–16% on light backgrounds** (lower end on darker ones, where the motif can otherwise read as noise). Restrained, not invisible. Tune three parameters to match the material:

- `baseFrequency`: grain fineness. Fine paper = 0.8–1.1. Cloth weave = 0.5–0.7. Stone/earth = 0.3–0.5.
- `numOctaves`: layering. Paper = 2. Cloth = 3. Stone = 4.
- `feColorMatrix` tint: match the material's natural hue — amber for plant-fiber paper, ochre for clay/earth, near-neutral for mineral stone, cool grey for ice.

*Kansai reasoning:* Japan → washi (hand-made plant-fiber paper) → fine, warm, even grain → `baseFrequency="0.85" numOctaves="2"`, amber tint.

**If the destination has no strong material association** → use a very light neutral linen (baseFrequency 1.0, near-white tint, ~10% opacity).

### Layer 2 — Ambient Animation — **[NOT WIRED IN DEPLOYED RUNTIME — skip for generated sites]**

> **Do not include this layer in the `aesthetic` block of `travel-data.js`.** The deployed runtime (`travel.js`) does not wire up a canvas animation. Specifying it in the aesthetic block has no effect. This layer is documented for completeness and for bespoke preview-only builds only. Skip it entirely when generating a standard trip site.

**The question (for preview-only builds):** What moves in the air at this destination, at this season? If nothing distinctive and non-kitsch comes to mind, use no animation.

Implement as a full-viewport `<canvas>` element rendered behind all content. Keep each particle at opacity 0.12–0.35. The animation must never obscure text and must pause when the user scrolls fast (performance). Identify the destination's most atmospheric natural phenomenon for the trip's season, then simplify it to its minimal geometric form (a petal = a rotated ellipse; a firefly = a small circle with a radial glow; aurora = a slow horizontal gradient sweep). Avoid anything that reads as a cartoon or icon.

**If no clean natural phenomenon exists for this destination or season → no canvas element.** A bare background is better than a forced or distracting animation. This layer is not wired into the deployed template.

### Layer 3 — Cultural Glyph

**The question:** Is there one object — not a landmark, not a flag, but a cultural *tool* or *mark* — that a local would recognise as belonging to this place?

Render it in CSS/SVG line art (never raster), placed in the topbar or sidebar header. It should be small (32–44px), restrained, and feel like something the traveler might see stamped on packaging or carved above a door — not a tourist souvenir illustration. Think of objects used in daily cultural practice (ink seals, woven cloth marks, ceramic stamps, architectural keystones, calligraphic flourishes). Avoid world-famous landmarks — those are for hero images. The glyph is intimate, not monumental.

*Kansai reasoning:* Japan → hanko (personal ink seal) → rectangular CSS border + kanji + slight rotation → feels like the trip has been officially stamped.

**If no clean glyph concept emerges → omit.** An empty space is better than a kitsch icon.

### Layer 4 — Typography Personality

**The question:** What is the most prestigious or expressive writing instrument of this culture, and what does the type it produces look like?

Choose a display font that echoes that instrument's output. Pair it with a neutral, readable body font that doesn't compete. Load via Google Fonts or specify a safe system fallback.

- Brush / calligraphic cultures (East Asia, Arabic script regions) → a serif with visible stroke contrast and brush-like terminals for the display font.
- Stone-inscription cultures (Classical Europe, Mediterranean) → high-contrast serif with epigraphic proportions, small caps available.
- Craft / print cultures (Northern Europe, Bauhaus, Swiss) → geometric or humanist sans, optical precision.
- Oral / textile cultures (many tropical regions) → warm, rounded sans or a friendly serif that feels handmade rather than mechanical.
- Contemporary urban destinations with no dominant historical script → a confident geometric sans.

Always specify: a `display font name` (the cultural reasoning in one phrase) + a `body font name` (neutral, high legibility). A third accent font is optional only when a handwriting or script style is genuinely warranted (e.g. Klee One for Japanese casual signage).

*Kansai reasoning:* Japan → brush calligraphy → Shippori Mincho (formal, high stroke contrast) for display + Klee One (handwriting) as the casual accent.

---

For the concrete, copy-tunable CSS for all four layers, see `design-reference.css`.
