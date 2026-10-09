# Shared design catalog

Derived from gstack lib/design-catalog.ts at `92cfd07a79ed0f27fbcc57f2d61d00ec700eadb4` (MIT), in part from impeccable (Copyright Paul Bakaus, Apache-2.0). Modified for independent bundled references; see [third-party notices](../THIRD_PARTY_NOTICES.md) and [Apache-2.0 license](../licenses/Apache-2.0.txt).

## Contents

- [Font roles](#font-roles)
- [Legacy blacklist](#legacy-blacklist)
- [Detector-known slop](#detector-known-slop)
- [Judgment tells](#judgment-tells)
- [Quality rules](#quality-rules)

Keep the full rendered audit; this catalog does not replace its phases, ten categories or seven litmus tests. Confirm detector hints visually. `impact: polish` is advisory and does not lower the grade. Deduplicate findings on the same element/rule; engine-known IDs do not prove the engine ran. `grep` heuristics are source-inspection hints only for phases that already allow source reads: design-review Phases 1–6 remain rendered-only. Handoff names are follow-up categories, not installed impeccable commands or permission to invoke another skill.

## Font roles

- **Never the display voice:** Inter, Roboto, Arial, Helvetica, Open Sans, Lato, Montserrat, Poppins, Space Grotesk, Space Mono, Fraunces, Playfair Display, Cormorant, Lora, Crimson, Newsreader, Syne, IBM Plex Sans, IBM Plex Serif, DM Sans, DM Serif, Outfit, Plus Jakarta Sans, Instrument Sans, Geist. These are not a blanket ban for every role.
- **Never in any role:** Papyrus, Comic Sans, Lobster, Impact, Jokerman, Bleeding Cowboys, Permanent Marker, Bradley Hand, Brush Script, Hobo, Trajan, Raleway, Clash Display, Courier New.
- **Body/UI exception on Operate or Read:** DM Sans, Instrument Sans, IBM Plex Sans; state the role and product-specific reason.
- **Mono for data and code:** JetBrains Mono, IBM Plex Mono, Fira Code.
- **Previously verified freely available (2026-09-08, not current-session proof):** Fontshare — Satoshi, General Sans, Clash Grotesk, Cabinet Grotesk; Google Fonts — Instrument Serif, Source Sans 3, JetBrains Mono, Fira Code. Reverify official name, required weights, license and loading URL/strategy in-session; offline evidence stays pending.

## Catalog conventions

All 86 source entries are included in source order within their families. `detect` records possible methods, not executed coverage. `confidence` and `tier` retain source prioritization (auto-fix, ask, possible); they do not bypass action approval or authorize pre-audit source inspection.

## Legacy blacklist

### ai-color-palette: Purple gradient palette

Purple/violet/indigo gradient backgrounds or blue-to-purple color schemes

- Category: `color`; kind: `slop`; detect: `engine`, `grep`, `llm`; confidence: `MEDIUM`; tier: `ask`; impact: `medium`; source: `both`. Detector ID: `ai-color-palette`. Handoff: `colorize`. Mockup Never: yes.
- Heuristic: Look for `linear-gradient` with values in the `#6366f1` to `#8b5cf6` range, or CSS custom properties resolving to purple/violet.

### feature-grid-3col: The 3-column feature grid

**The 3-column feature grid:** icon-in-colored-circle + bold title + 2-line description, repeated 3x symmetrically. THE most recognizable AI layout.

- Category: `scaffold`; kind: `slop`; detect: `grep`, `llm`; confidence: `LOW`; tier: `ask`; impact: `medium`; source: `gstack`. Handoff: `layout`.
- Heuristic: Look for a grid/flex container with exactly 3 children that each contain a circular element + heading + paragraph.

### icon-circle-decoration: Icons in colored circles

Icons in colored circles as section decoration (SaaS starter template look)

- Category: `scaffold`; kind: `slop`; detect: `grep`, `llm`; confidence: `LOW`; tier: `ask`; impact: `medium`; source: `gstack`. Handoff: `quieter`.
- Heuristic: Look for elements with `border-radius: 50%` + a background color used as decorative containers for icons.

### centered-everything: Centered everything

Centered everything (`text-align: center` on all headings, descriptions, cards)

- Category: `layout`; kind: `slop`; detect: `grep`, `llm`; confidence: `MEDIUM`; tier: `ask`; impact: `medium`; source: `gstack`. Handoff: `layout`.
- Heuristic: Grep for `text-align: center` density: if more than 60% of text containers center, flag it.

### uniform-radius: Uniform bubbly border-radius

Uniform bubbly border-radius on every element (same large radius on everything)

- Category: `surface`; kind: `slop`; detect: `grep`, `llm`; confidence: `MEDIUM`; tier: `ask`; impact: `medium`; source: `gstack`. Handoff: `polish`.
- Heuristic: Aggregate `border-radius` values: if more than 80% share one value of 16px or more, flag it. Pill radius on everything is the extreme case.

### decorative-blobs: Decorative blobs and dividers

Decorative blobs, floating circles, wavy SVG dividers (if a section feels empty, it needs better content, not decoration)

- Category: `imagery`; kind: `slop`; detect: `llm`; confidence: `LOW`; tier: `ask`; impact: `medium`; source: `gstack`. Handoff: `quieter`.

### emoji-decoration: Emoji as design elements

Emoji as design elements (rockets in headings, emoji as bullet points)

- Category: `imagery`; kind: `slop`; detect: `grep`, `llm`; confidence: `MEDIUM`; tier: `ask`; impact: `medium`; source: `gstack`. Handoff: `polish`.
- Heuristic: Grep headings, list items, and buttons for emoji code points used as icons or bullets.

### side-tab: Colored left-border on cards

Colored left-border on cards (`border-left: 3px solid <accent>`)

- Category: `surface`; kind: `slop`; detect: `engine`, `grep`; confidence: `HIGH`; tier: `ask`; impact: `medium`; source: `both`. Detector ID: `side-tab`. Handoff: `polish`.
- Heuristic: Grep for `border-left: <n>px solid` on card, callout, or list-item selectors.

### generic-hero-copy: Generic hero copy

Generic hero copy ("Welcome to [X]", "Unlock the power of...", "Your all-in-one solution for...")

- Category: `copy`; kind: `slop`; detect: `grep`, `llm`; confidence: `MEDIUM`; tier: `ask`; impact: `medium`; source: `gstack`. Handoff: `clarify`.
- Heuristic: Grep HTML/JSX content for "Welcome to", "Unlock the power of", "Your all-in-one solution", "Revolutionize your", "Streamline your workflow".

### cookie-cutter-rhythm: Cookie-cutter section rhythm

Cookie-cutter section rhythm (hero → 3 features → testimonials → pricing → CTA, every section same height)

- Category: `scaffold`; kind: `slop`; detect: `llm`; confidence: `LOW`; tier: `ask`; impact: `medium`; source: `gstack`. Handoff: `layout`.

### system-font-primary: system-ui as the primary face

system-ui or `-apple-system` as the PRIMARY display/body font — the "I gave up on typography" signal. Pick a real typeface.

- Category: `type`; kind: `slop`; detect: `grep`; confidence: `HIGH`; tier: `ask`; impact: `medium`; source: `gstack`. Handoff: `typeset`.
- Heuristic: Grep `font-family` on body, headings, and base styles for `system-ui` or `-apple-system` as the first face in the stack.

## Detector-known slop

### border-accent-on-rounded: Border accent on a rounded card

A colored edge on a rounded card: the side-tab in a costume. Signal state with a background tint, an icon, or a label.

- Category: `surface`; kind: `slop`; detect: `engine`; confidence: `MEDIUM`; tier: `ask`; impact: `medium`; source: `impeccable`. Detector ID: `border-accent-on-rounded`. Handoff: `polish`.

### overused-font: Overused display font

A training-data default as the display voice means you stopped looking. As body or UI on an Operate or Read surface, several of these are fine. Say which and why.

- Category: `type`; kind: `slop`; detect: `engine`, `grep`, `llm`; confidence: `MEDIUM`; tier: `ask`; impact: `medium`; source: `both`. Detector ID: `overused-font`. Handoff: `typeset`.
- Heuristic: Grep `font-family` for a listed face as the first face on display selectors (h1, h2, .hero, .display).
- Values: Inter, Roboto, Arial, Helvetica, Open Sans, Lato, Montserrat, Poppins, Space Grotesk, Space Mono, Fraunces, Playfair Display, Cormorant, Lora, Crimson, Newsreader, Syne, IBM Plex Sans, IBM Plex Serif, DM Sans, DM Serif, Outfit, Plus Jakarta Sans, Instrument Sans, Geist; roles: display.

### flat-type-hierarchy: Flat type hierarchy

Headings within a step of body size. Pick a scale and let the levels differ by more than a weight.

- Category: `type`; kind: `slop`; detect: `engine`, `llm`; confidence: `MEDIUM`; tier: `ask`; impact: `medium`; source: `impeccable`. Detector ID: `flat-type-hierarchy`. Handoff: `typeset`.

### gradient-text: Gradient text

Emphasis is weight or size. Gradient text is emphasis in a costume.

- Category: `color`; kind: `slop`; detect: `engine`, `grep`; confidence: `HIGH`; tier: `ask`; impact: `medium`; source: `impeccable`. Detector ID: `gradient-text`. Handoff: `colorize`. Mockup Never: yes.
- Heuristic: Grep for `background-clip: text` next to a gradient background.

### cream-palette: Cream default palette

Cream ground, serif display, terracotta accent: look number one. Fine when the brief asked for it; a default when it did not.

- Category: `color`; kind: `slop`; detect: `engine`, `llm`; confidence: `MEDIUM`; tier: `ask`; impact: `medium`; source: `impeccable`. Detector ID: `cream-palette`. Handoff: `colorize`. Mockup Never: yes.

### nested-cards: Nested cards

A card inside a card is always wrong. Cards are the lazy container; nesting them is the lazy container squared.

- Category: `scaffold`; kind: `slop`; detect: `engine`, `llm`; confidence: `MEDIUM`; tier: `ask`; impact: `medium`; source: `impeccable`. Detector ID: `nested-cards`. Handoff: `layout`. Mockup Never: yes.

### monotonous-spacing: Monotonous spacing

One gap value between everything. Rhythm needs a large step and a small step, not a single beat.

- Category: `layout`; kind: `slop`; detect: `engine`, `llm`; confidence: `MEDIUM`; tier: `ask`; impact: `polish`; source: `impeccable`. Detector ID: `monotonous-spacing`. Handoff: `layout`.

### bounce-easing: Bounce easing

Overshoot and bounce curves on UI motion. Exponential ease-out from an already-visible default.

- Category: `motion`; kind: `slop`; detect: `engine`, `grep`; confidence: `HIGH`; tier: `ask`; impact: `polish`; source: `impeccable`. Detector ID: `bounce-easing`. Handoff: `animate`.
- Heuristic: Grep transitions and keyframes for cubic-bezier curves with a control point past 1, or `bounce` in animation names.

### pulsing-dot: Pulsing status dot

A small circle pulsing forever next to "Live" or "Online". Motion that says nothing new after the first loop.

- Category: `motion`; kind: `slop`; detect: `engine`, `grep`; confidence: `MEDIUM`; tier: `ask`; impact: `polish`; source: `impeccable`. Detector ID: `pulsing-dot`. Handoff: `animate`. Mockup Never: yes.
- Heuristic: Grep for infinite keyframe animations on small round elements.

### blinking-cursor: Blinking cursor effect

A fake terminal cursor blinking in marketing copy. Theater, not interface.

- Category: `motion`; kind: `slop`; detect: `engine`; confidence: `MEDIUM`; tier: `ask`; impact: `polish`; source: `impeccable`. Detector ID: `blinking-cursor`. Handoff: `animate`.

### shape-assembled-illustration: Shape-assembled illustration

An illustration built from CSS shapes standing in for an asset. Produce the asset or ship nothing.

- Category: `imagery`; kind: `slop`; detect: `engine`, `llm`; confidence: `MEDIUM`; tier: `ask`; impact: `medium`; source: `impeccable`. Detector ID: `shape-assembled-illustration`. Handoff: `quieter`.

### dark-glow: Dark-mode glow

Glowing edges on dark surfaces: look number two. Depth has an offset; a zero-offset colored halo is decoration.

- Category: `surface`; kind: `slop`; detect: `engine`, `grep`; confidence: `HIGH`; tier: `ask`; impact: `medium`; source: `impeccable`. Detector ID: `dark-glow`. Handoff: `colorize`. Mockup Never: yes.
- Heuristic: Grep `box-shadow` for a zero x/y offset with a large blur and a saturated color.

### radial-halo: Radial halo

A radial gradient halo behind the hero content. Look number two again.

- Category: `surface`; kind: `slop`; detect: `engine`; confidence: `MEDIUM`; tier: `ask`; impact: `medium`; source: `impeccable`. Detector ID: `radial-halo`. Handoff: `quieter`.

### radial-spotlight-glow: Radial spotlight glow

A spotlight glow washing the top of the page. Same family as the halo.

- Category: `surface`; kind: `slop`; detect: `engine`; confidence: `MEDIUM`; tier: `ask`; impact: `medium`; source: `impeccable`. Detector ID: `radial-spotlight-glow`. Handoff: `quieter`.

### marquee: Logo marquee

An infinitely scrolling logo strip. If the logos matter, show them still; if they do not, cut them.

- Category: `motion`; kind: `slop`; detect: `engine`, `llm`; confidence: `MEDIUM`; tier: `ask`; impact: `medium`; source: `impeccable`. Detector ID: `marquee`. Handoff: `animate`.

### icon-tile-stack: Icon tile above every heading

The rounded-square icon above every heading. Try side by side, or drop the container.

- Category: `scaffold`; kind: `slop`; detect: `engine`, `llm`; confidence: `MEDIUM`; tier: `ask`; impact: `medium`; source: `impeccable`. Detector ID: `icon-tile-stack`. Handoff: `layout`. Mockup Never: yes.

### italic-serif-display: Italic serif display

Look three: the italic display serif reaching for editorial credibility. Earn it with the content or set the display upright.

- Category: `type`; kind: `slop`; detect: `engine`, `llm`; confidence: `MEDIUM`; tier: `ask`; impact: `medium`; source: `impeccable`. Detector ID: `italic-serif-display`. Handoff: `typeset`.

### hero-eyebrow-chip: Hero eyebrow chip

A pill-shaped label floating above the hero headline. The headline carries its own weight; cut the chip.

- Category: `scaffold`; kind: `slop`; detect: `engine`, `llm`; confidence: `MEDIUM`; tier: `ask`; impact: `medium`; source: `impeccable`. Detector ID: `hero-eyebrow-chip`. Handoff: `quieter`.

### kicker-above-heading: Kicker above heading

A kicker above a heading is the strongest default there is: the heading carries its own weight, so delete the label. If the user wants it anyway, comply and say the tradeoff once.

- Category: `scaffold`; kind: `slop`; detect: `engine`, `grep`, `llm`; confidence: `MEDIUM`; tier: `ask`; impact: `medium`; source: `impeccable`. Detector ID: `kicker-above-heading`. Handoff: `layout`. Mockup Never: yes.
- Heuristic: Look for a short uppercase, tracked element immediately before an h1 or h2.

### numbered-section-labels: Numbered section labels

01 / 02 / 03 over sections, unless the sequence is information the reader needs.

- Category: `scaffold`; kind: `slop`; detect: `engine`, `llm`; confidence: `MEDIUM`; tier: `ask`; impact: `polish`; source: `impeccable`. Detector ID: `numbered-section-labels`. Handoff: `layout`.

### em-dash-overuse: Em-dash overuse

Em dashes in every other sentence. Advisory: a tell of generated copy, never a blocker on its own.

- Category: `copy`; kind: `slop`; detect: `engine`; confidence: `LOW`; tier: `possible`; impact: `polish`; source: `impeccable`. Detector ID: `em-dash-overuse`. Handoff: `clarify`.

### marketing-buzzword: Marketing buzzwords

"Seamless", "effortless", "supercharge", "streamline": words that describe nothing. Say what the product does.

- Category: `copy`; kind: `slop`; detect: `engine`, `grep`; confidence: `MEDIUM`; tier: `ask`; impact: `medium`; source: `impeccable`. Detector ID: `marketing-buzzword`. Handoff: `clarify`.
- Heuristic: Grep visible copy for seamless, effortless, supercharge, streamline, revolutionize, unlock, empower, elevate.

### aphoristic-cadence: Aphoristic cadence

Short. Punchy. Fragments. Every sentence a slogan. Write like a person explaining something.

- Category: `copy`; kind: `slop`; detect: `engine`, `llm`; confidence: `MEDIUM`; tier: `ask`; impact: `medium`; source: `impeccable`. Detector ID: `aphoristic-cadence`. Handoff: `clarify`.

### oversized-h1: Oversized h1

Display type past 6rem on a page that is not a poster. Size is not hierarchy.

- Category: `type`; kind: `slop`; detect: `engine`, `grep`; confidence: `HIGH`; tier: `ask`; impact: `medium`; source: `impeccable`. Detector ID: `oversized-h1`. Handoff: `typeset`.
- Heuristic: Grep h1 and display selectors for font-size above 6rem or 96px.

### extreme-negative-tracking: Extreme negative tracking

Letter-spacing below -0.04em on display type. Tight tracking is a taste; crushed tracking is a tell.

- Category: `type`; kind: `slop`; detect: `engine`, `grep`; confidence: `HIGH`; tier: `ask`; impact: `polish`; source: `impeccable`. Detector ID: `extreme-negative-tracking`. Handoff: `typeset`.
- Heuristic: Grep `letter-spacing` for values below -0.04em.

### gpt-thin-border-wide-shadow: Thin border plus wide shadow

A hairline border and a wide soft shadow on the same card. Pick one way to lift the surface.

- Category: `surface`; kind: `slop`; detect: `engine`; confidence: `MEDIUM`; tier: `ask`; impact: `polish`; source: `impeccable`. Detector ID: `gpt-thin-border-wide-shadow`. Handoff: `polish`.

### repeating-stripes-gradient: Repeating stripes gradient

Diagonal stripe gradients as background texture. Texture from the brand or none.

- Category: `surface`; kind: `slop`; detect: `engine`; confidence: `MEDIUM`; tier: `ask`; impact: `polish`; source: `impeccable`. Detector ID: `repeating-stripes-gradient`. Handoff: `quieter`.

### codex-grid-background: Grid-paper background

A faint grid behind the hero. The blueprint look every generated dev tool ships.

- Category: `surface`; kind: `slop`; detect: `engine`; confidence: `MEDIUM`; tier: `ask`; impact: `polish`; source: `impeccable`. Detector ID: `codex-grid-background`. Handoff: `quieter`.

### theater-slop-phrase: Theater phrases

"Built for the way you work", "Designed for teams like yours", "Meet your new...": phrases that perform a launch instead of describing one.

- Category: `copy`; kind: `slop`; detect: `engine`, `grep`; confidence: `MEDIUM`; tier: `ask`; impact: `medium`; source: `impeccable`. Detector ID: `theater-slop-phrase`. Handoff: `clarify`.
- Heuristic: Grep copy for "built for", "designed for", "meet your new", "ship faster", "the future of".

### image-hover-transform: Image hover zoom

Scaling an image on hover. Motion with no information in it.

- Category: `motion`; kind: `slop`; detect: `engine`, `grep`; confidence: `MEDIUM`; tier: `ask`; impact: `polish`; source: `impeccable`. Detector ID: `image-hover-transform`. Handoff: `animate`.
- Heuristic: Grep `:hover` rules on images for `transform: scale`.

## Judgment tells

### gradient-cta: Gradient CTA button

Gradient buttons as the primary call to action. One solid color the palette owns.

- Category: `color`; kind: `slop`; detect: `grep`, `llm`; confidence: `MEDIUM`; tier: `ask`; impact: `medium`; source: `gstack`. Handoff: `colorize`.
- Heuristic: Grep button and CTA selectors for gradient backgrounds.

### stock-photo-hero: Stock-photo hero

A generic stock-photo hero, or a gray placeholder div standing in for one. Show the product or show nothing.

- Category: `imagery`; kind: `slop`; detect: `llm`; confidence: `LOW`; tier: `ask`; impact: `medium`; source: `gstack`. Handoff: `quieter`.

### card-default-component: Cards as the default component

Rounded cards with drop shadows as the container for everything. App UI made of stacked cards is not layout.

- Category: `scaffold`; kind: `slop`; detect: `llm`; confidence: `LOW`; tier: `ask`; impact: `medium`; source: `gstack`. Handoff: `layout`.

### generic-testimonials: Generic testimonial section

A testimonial row with avatars, five stars, and quotes nobody said. Real names with real claims, or cut it.

- Category: `scaffold`; kind: `slop`; detect: `llm`; confidence: `LOW`; tier: `ask`; impact: `medium`; source: `gstack`. Handoff: `clarify`.

### split-hero-template: Left-text right-image hero

The cookie-cutter hero: headline left, screenshot right, two buttons. The first template every generator reaches for.

- Category: `scaffold`; kind: `slop`; detect: `llm`; confidence: `LOW`; tier: `ask`; impact: `medium`; source: `gstack`. Handoff: `layout`.

### generic-cta-copy: Generic CTA labels

"Get Started" and "Learn More" as the only calls to action. Name the outcome the click buys.

- Category: `copy`; kind: `slop`; detect: `grep`, `llm`; confidence: `MEDIUM`; tier: `ask`; impact: `medium`; source: `gstack`. Handoff: `clarify`.
- Heuristic: Grep buttons and links for "Get Started" and "Learn More" with no more specific CTA on the page.

### hero-metrics: Hero metric template

Three big numbers with tiny labels under the hero ("10k+ users", "99.9%"). The template counts, not the product.

- Category: `scaffold`; kind: `slop`; detect: `llm`; confidence: `LOW`; tier: `ask`; impact: `medium`; source: `gstack`. Handoff: `clarify`. Mockup Never: yes.

### identical-cards: Identical card grids

A grid of cards with the same shape, the same icon slot, the same two lines. Content of unequal weight given equal boxes.

- Category: `scaffold`; kind: `slop`; detect: `llm`; confidence: `LOW`; tier: `ask`; impact: `medium`; source: `gstack`. Handoff: `layout`. Mockup Never: yes.

### glassmorphism: Glassmorphism

Frosted-glass panels with blurred backdrops as the default surface. One translucent layer where it explains depth, not everywhere.

- Category: `surface`; kind: `slop`; detect: `grep`, `llm`; confidence: `MEDIUM`; tier: `ask`; impact: `medium`; source: `gstack`. Handoff: `quieter`.
- Heuristic: Grep for `backdrop-filter: blur` on more than one container.

### hand-drawn-svg: Hand-drawn SVG illustration

Generated SVG doodles and mascots in place of art direction. Commission or license an asset, or ship none.

- Category: `imagery`; kind: `slop`; detect: `llm`; confidence: `LOW`; tier: `ask`; impact: `medium`; source: `gstack`. Handoff: `quieter`.

### modal-by-default: Modal by default

Every secondary action in a modal. Inline, a side panel, or a new page usually costs the user less.

- Category: `states`; kind: `slop`; detect: `llm`; confidence: `LOW`; tier: `ask`; impact: `medium`; source: `gstack`. Handoff: `harden`.

### monospace-costume: Monospace as costume

Monospace on labels and body copy to look technical. Mono is for code and data columns.

- Category: `type`; kind: `slop`; detect: `grep`, `llm`; confidence: `MEDIUM`; tier: `ask`; impact: `polish`; source: `gstack`. Handoff: `typeset`.
- Heuristic: Grep `font-family` for a monospace stack on non-code, non-tabular selectors.

### content-stand-ins: Content stand-ins

Sparklines, progress rings, and fake avatars filling space where content should be. Real data or an honest empty state.

- Category: `imagery`; kind: `slop`; detect: `llm`; confidence: `LOW`; tier: `ask`; impact: `medium`; source: `gstack`. Handoff: `harden`.

### mode-by-category: Mode picked by category

Dark because it is a dev tool, light because it is health. Light or dark comes from the use scene: who, where, under what light.

- Category: `color`; kind: `slop`; detect: `llm`; confidence: `LOW`; tier: `ask`; impact: `medium`; source: `gstack`. Handoff: `colorize`.

### unthemed-browser-surfaces: Unthemed browser surfaces

Selection color, caret, scrollbars, focus rings, underline offset, tabular numerals left at browser defaults. Theme them from the palette.

- Category: `browser-surface`; kind: `slop`; detect: `grep`, `llm`; confidence: `MEDIUM`; tier: `ask`; impact: `polish`; source: `gstack`. Handoff: `polish`.
- Heuristic: Grep for `::selection`, `caret-color`, `accent-color`, `scrollbar-color`, `text-underline-offset`, `font-variant-numeric`: none present means none themed.

### missing-states: Missing states

Only the happy path is designed. Empty, loading, error, and long-content states are part of the component.

- Category: `states`; kind: `slop`; detect: `llm`; confidence: `LOW`; tier: `ask`; impact: `high`; source: `gstack`. Handoff: `harden`.

## Quality rules

### organic-clip-path: Organic clip-path

A polygon clip-path approximating a photo edge or a blob. An asset with its own edge, or a rectangle.

- Category: `imagery`; kind: `quality`; detect: `engine`; confidence: `MEDIUM`; tier: `ask`; impact: `medium`; source: `impeccable`. Detector ID: `organic-clip-path`. Handoff: `quieter`.

### buried-raster: Buried raster

A photo under a near-opaque wash. If the image cannot be seen, it is not doing anything.

- Category: `imagery`; kind: `quality`; detect: `engine`; confidence: `MEDIUM`; tier: `ask`; impact: `medium`; source: `impeccable`. Detector ID: `buried-raster`. Handoff: `quieter`.

### broken-image: Broken image

An image that fails to load. Nothing on the page is more visible.

- Category: `imagery`; kind: `quality`; detect: `engine`, `render`; confidence: `HIGH`; tier: `ask`; impact: `high`; source: `impeccable`. Detector ID: `broken-image`. Handoff: `harden`.

### script-error: Script error

A JavaScript error in the console on load. The page is not finished.

- Category: `states`; kind: `quality`; detect: `engine`, `render`; confidence: `HIGH`; tier: `ask`; impact: `high`; source: `impeccable`. Detector ID: `script-error`. Handoff: `harden`.

### content-hidden-at-rest: Content hidden at rest

Content at opacity 0 waiting for a scroll animation that may never fire. Content is visible by default.

- Category: `motion`; kind: `quality`; detect: `engine`, `render`; confidence: `HIGH`; tier: `ask`; impact: `high`; source: `impeccable`. Detector ID: `content-hidden-at-rest`. Handoff: `animate`.

### edge-flush-cards: Edge-flush cards

Cards touching the viewport edge. Give the layout a gutter.

- Category: `layout`; kind: `quality`; detect: `engine`, `render`; confidence: `MEDIUM`; tier: `ask`; impact: `medium`; source: `impeccable`. Detector ID: `edge-flush-cards`. Handoff: `layout`.

### text-occlusion: Text occlusion

Text covered by another element. Overlap is a bug until it is a choice.

- Category: `layout`; kind: `quality`; detect: `engine`, `render`; confidence: `HIGH`; tier: `ask`; impact: `high`; source: `impeccable`. Detector ID: `text-occlusion`. Handoff: `harden`.

### first-viewport-column-overflow: First-viewport overflow

A column wider than the first viewport. Horizontal scroll on arrival.

- Category: `layout`; kind: `quality`; detect: `engine`, `render`; confidence: `HIGH`; tier: `ask`; impact: `high`; source: `impeccable`. Detector ID: `first-viewport-column-overflow`. Handoff: `layout`.

### gray-on-color: Gray text on a colored surface

Secondary text on a colored surface is tinted from that hue. Never gray.

- Category: `color`; kind: `quality`; detect: `engine`; confidence: `MEDIUM`; tier: `ask`; impact: `medium`; source: `impeccable`. Detector ID: `gray-on-color`. Handoff: `colorize`.

### low-contrast: Low contrast text

Text below WCAG AA contrast (4.5:1 body, 3:1 large). Fix the pair, not the opacity.

- Category: `color`; kind: `quality`; detect: `engine`, `render`; confidence: `HIGH`; tier: `ask`; impact: `high`; source: `impeccable`. Detector ID: `low-contrast`. Handoff: `colorize`.

### layout-transition: Layout-property transition

`transition: all`, or transitions on width, height, top, left. Animate transform and opacity.

- Category: `motion`; kind: `quality`; detect: `engine`, `grep`; confidence: `HIGH`; tier: `auto-fix`; impact: `polish`; source: `impeccable`. Detector ID: `layout-transition`. Handoff: `animate`.
- Heuristic: Grep `transition` for `all` or layout properties.

### line-length: Line length

Body measure outside 45 to 75 characters. Set a max-width on the text column.

- Category: `type`; kind: `quality`; detect: `engine`, `grep`; confidence: `MEDIUM`; tier: `ask`; impact: `medium`; source: `impeccable`. Detector ID: `line-length`. Handoff: `typeset`.
- Heuristic: Check for `max-width` on body text wrappers.

### cramped-padding: Cramped padding

Padding under 8px on text containers. Text needs room to breathe.

- Category: `layout`; kind: `quality`; detect: `engine`; confidence: `MEDIUM`; tier: `ask`; impact: `medium`; source: `impeccable`. Detector ID: `cramped-padding`. Handoff: `layout`.

### body-text-viewport-edge: Body text at the viewport edge

Body text within a few pixels of the viewport edge on small screens.

- Category: `layout`; kind: `quality`; detect: `engine`, `render`; confidence: `MEDIUM`; tier: `ask`; impact: `medium`; source: `impeccable`. Detector ID: `body-text-viewport-edge`. Handoff: `layout`.

### tight-leading: Tight leading

Body line-height under 1.4. Display type can run tight; paragraphs cannot.

- Category: `type`; kind: `quality`; detect: `engine`, `grep`; confidence: `HIGH`; tier: `ask`; impact: `medium`; source: `impeccable`. Detector ID: `tight-leading`. Handoff: `typeset`.
- Heuristic: Grep body and paragraph `line-height` for values below 1.4.

### skipped-heading: Skipped heading level

h1 followed by h3 with no h2. Screen readers walk the hierarchy.

- Category: `type`; kind: `quality`; detect: `engine`, `grep`; confidence: `HIGH`; tier: `ask`; impact: `medium`; source: `impeccable`. Detector ID: `skipped-heading`. Handoff: `typeset`.
- Heuristic: Check HTML/JSX for heading tags that skip a level within a file or component.

### heading-rhythm: Heading rhythm

More space above a heading than below it. Read the computed values.

- Category: `type`; kind: `quality`; detect: `engine`; confidence: `MEDIUM`; tier: `ask`; impact: `polish`; source: `impeccable`. Detector ID: `heading-rhythm`. Handoff: `typeset`.

### justified-text: Justified text

Justified body text on the web leaves rivers. Left-align.

- Category: `type`; kind: `quality`; detect: `engine`, `grep`; confidence: `HIGH`; tier: `auto-fix`; impact: `polish`; source: `impeccable`. Detector ID: `justified-text`. Handoff: `typeset`.
- Heuristic: Grep for `text-align: justify`.

### tiny-text: Tiny text

Body text under 16px. Bump to 16px.

- Category: `type`; kind: `quality`; detect: `engine`, `grep`; confidence: `HIGH`; tier: `auto-fix`; impact: `medium`; source: `impeccable`. Detector ID: `tiny-text`. Handoff: `typeset`.
- Heuristic: Grep `font-size` on body, p, and base styles for values under 16px (1rem at a 16px base).

### undersized-ui-text: Undersized UI text

Labels and controls under 12px. Nobody reads 10px.

- Category: `type`; kind: `quality`; detect: `engine`; confidence: `HIGH`; tier: `ask`; impact: `medium`; source: `impeccable`. Detector ID: `undersized-ui-text`. Handoff: `typeset`.

### all-caps-body: All-caps body text

Uppercase paragraphs. Caps are for short labels.

- Category: `type`; kind: `quality`; detect: `engine`, `grep`; confidence: `HIGH`; tier: `auto-fix`; impact: `medium`; source: `impeccable`. Detector ID: `all-caps-body`. Handoff: `typeset`.
- Heuristic: Grep `text-transform: uppercase` on body and paragraph selectors.

### wide-tracking: Wide tracking on body

Letter-spacing above 0.05em on body text. Tracked type is for small-caps labels.

- Category: `type`; kind: `quality`; detect: `engine`, `grep`; confidence: `MEDIUM`; tier: `ask`; impact: `polish`; source: `impeccable`. Detector ID: `wide-tracking`. Handoff: `typeset`.
- Heuristic: Grep body `letter-spacing` for values above 0.05em.

### text-overflow: Text overflow

Text spilling out of its container. Long content is the normal case.

- Category: `states`; kind: `quality`; detect: `engine`, `render`; confidence: `HIGH`; tier: `ask`; impact: `high`; source: `impeccable`. Detector ID: `text-overflow`. Handoff: `harden`.

### repeated-container-text: Repeated container text

The same text repeated across sibling containers. Placeholder content that shipped.

- Category: `copy`; kind: `quality`; detect: `engine`; confidence: `MEDIUM`; tier: `ask`; impact: `medium`; source: `impeccable`. Detector ID: `repeated-container-text`. Handoff: `clarify`.

### clipped-overflow-container: Clipped overflow

A container clipping its own content with overflow hidden. Something is cut off.

- Category: `states`; kind: `quality`; detect: `engine`, `render`; confidence: `MEDIUM`; tier: `ask`; impact: `medium`; source: `impeccable`. Detector ID: `clipped-overflow-container`. Handoff: `harden`.

### design-system-font: Off-system font

A face DESIGN.md tokens do not name. Add the token or use one that exists.

- Category: `type`; kind: `quality`; detect: `engine`; confidence: `MEDIUM`; tier: `ask`; impact: `medium`; source: `impeccable`. Detector ID: `design-system-font`. Handoff: `polish`.

### design-system-color: Off-system color

A color DESIGN.md tokens do not name. Add the token or use one that exists.

- Category: `color`; kind: `quality`; detect: `engine`; confidence: `MEDIUM`; tier: `ask`; impact: `medium`; source: `impeccable`. Detector ID: `design-system-color`. Handoff: `polish`.

### design-system-radius: Off-system radius

A radius DESIGN.md tokens do not name. Add the token or use one that exists.

- Category: `surface`; kind: `quality`; detect: `engine`; confidence: `MEDIUM`; tier: `ask`; impact: `medium`; source: `impeccable`. Detector ID: `design-system-radius`. Handoff: `polish`.

### design-system-font-size: Off-system font size

A font size DESIGN.md tokens do not name. Add the token or use one on the scale.

- Category: `type`; kind: `quality`; detect: `engine`; confidence: `MEDIUM`; tier: `ask`; impact: `medium`; source: `impeccable`. Detector ID: `design-system-font-size`. Handoff: `polish`.
