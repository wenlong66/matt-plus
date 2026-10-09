# Design Audit Methodology

## Contents
- [Modes](#modes)
- [Phase 1: First Impression](#phase-1-first-impression)
- [Phase 2: Design System Extraction](#phase-2-design-system-extraction)
- [Phase 3: Page-by-Page Visual Audit](#phase-3-page-by-page-visual-audit)
- [Phase 4: Interaction Flow Review](#phase-4-interaction-flow-review)
- [Phase 5: Cross-Page Consistency](#phase-5-cross-page-consistency)
- [Phase 6: Compile Report](#phase-6-compile-report)
- [Design Critique Format](#design-critique-format)
- [Important Rules](#important-rules)
- [Reusable output-format association](#reusable-output-format-association)

## Modes

### Full (default)
Systematic review of all pages reachable from homepage. Visit 5-8 pages. Full checklist evaluation, responsive screenshots, interaction flow testing. Produces complete design audit report with letter grades.

### Quick (`--quick`)
Homepage + 2 key pages only. First Impression + Design System Extraction + abbreviated checklist. Fastest path to a design score.

### Deep (`--deep`)
Comprehensive review: 10-15 pages, every interaction flow, exhaustive checklist. For pre-launch audits or major redesigns.

### Diff-aware (automatic when on a feature branch with no URL)
When on a feature branch, scope to pages affected by the branch changes:
1. Analyze the branch diff: `git diff main...HEAD --name-only`
2. Map changed files to affected pages/routes
3. Resolve the running app URL through the approved URL/discovery association in [tool/path mapping](tool-mapping.md)
4. Audit only affected pages, compare design quality before/after

### Regression (`--regression` or previous `design-baseline.json` found)
Run full audit, then load previous `design-baseline.json`. Compare: per-category grade deltas, new findings, resolved findings. Output regression table in report.

---

## Phase 1: First Impression

The most uniquely designer-like output. Form a gut reaction before analyzing anything.

1. Navigate to the target URL. Inspect the current URL first: an authentication redirect is not the intended target design. Resolve it only with the approved isolated test-session association, then return to the intended page; blocked access remains `UNVERIFIED` rather than a grade of the login wall.
2. Take a full-page desktop screenshot: `REPORT_DIR/screenshots/first-impression.png`
3. Write the **First Impression** using this structured critique format:
   - "The site communicates **[what]**." (what it says at a glance — competence? playfulness? confusion?)
   - "I notice **[observation]**." (what stands out, positive or negative — be specific)
   - "The first 3 things my eye goes to are: **[1]**, **[2]**, **[3]**." (hierarchy check — are these the 3 things the designer intended? If not, the visual hierarchy is lying.)
   - "If I had to describe this in one word: **[word]**." (gut verdict)

**Narration mode:** Write this section in first person, as if you are a user scanning the page for the first time. "I'm looking at this page... my eye goes to the logo, then a wall of text I skip entirely, then... wait, is that a button?" Name the specific element, its position, its visual weight. If you can't name it specifically, you're not actually scanning, you're generating platitudes.

**Page Area Test:** Point at each clearly defined area of the page. Can you instantly name its purpose? ("Things I can buy," "Today's deals," "How to search.") Areas you can't name in 2 seconds are poorly defined. List them.

This is the section users read first. Be opinionated. A designer doesn't hedge — they react.

---

## Phase 2: Design System Extraction

Extract the actual design system the site uses (not what a DESIGN.md says, but what's rendered):

Use the installed browser's supported read-only evaluation for these original observations; [the local observation resource](../scripts/design-observations.js) supplies the same DOM expressions.

```javascript
// Fonts in use (capped at 500 elements to avoid timeout)
JSON.stringify([...new Set([...document.querySelectorAll('*')].slice(0,500).map(e => getComputedStyle(e).fontFamily))])

// Color palette in use
JSON.stringify([...new Set([...document.querySelectorAll('*')].slice(0,500).flatMap(e => [getComputedStyle(e).color, getComputedStyle(e).backgroundColor]).filter(c => c !== 'rgba(0, 0, 0, 0)'))])

// Heading hierarchy
JSON.stringify([...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h => ({tag:h.tagName, text:h.textContent.trim().slice(0,50), size:getComputedStyle(h).fontSize, weight:getComputedStyle(h).fontWeight})))

// Touch target audit (find undersized interactive elements)
JSON.stringify([...document.querySelectorAll('a,button,input,[role=button]')].filter(e => {const r=e.getBoundingClientRect(); return r.width>0 && (r.width<44||r.height<44)}).map(e => ({tag:e.tagName, text:(e.textContent||'').trim().slice(0,30), w:Math.round(e.getBoundingClientRect().width), h:Math.round(e.getBoundingClientRect().height)})).slice(0,20))
```

**Performance baseline:** Use the supported performance association in [tool/path mapping](tool-mapping.md); unsupported measurements are `UNVERIFIED`. Serialize PerformanceEntry fields inside the page (for example, `JSON.stringify(performance.getEntriesByType('navigation').map(entry => entry.toJSON()))`); a browser tool may otherwise flatten them to `{}`. Navigation timings are not automatically LCP/CLS measurements: record the actual method and evidence for each metric.

Structure findings as an **Inferred Design System**:
- **Fonts:** list with usage counts. Flag if >3 distinct font families.
- **Colors:** palette extracted. Flag if >12 unique non-gray colors. Note warm/cool/mixed.
- **Heading Scale:** h1-h6 sizes. Flag skipped levels, non-systematic size jumps.
- **Spacing Patterns:** sample padding/margin values. Flag non-scale values.

After extraction, offer: *"Want me to save this as your DESIGN.md? I can lock in these observations as your project's design system baseline."*

---

## Phase 3: Page-by-Page Visual Audit

For each page in scope:

```
Navigate → page URL
Snapshot/DOM inspection + annotated screenshot → REPORT_DIR/screenshots/{page}-annotated.png
Responsive screenshots → REPORT_DIR/screenshots/{page}-{mobile,tablet,desktop}.png
Console → errors
Performance → supported observations
```

### Auth Detection

After the first navigation, check if the URL changed to a login-like path using the installed browser's current-URL observation.

If URL contains `/login`, `/signin`, `/auth`, or `/sso`: the site requires authentication. AskUserQuestion for an approved isolated test account/session through the shared browser adapter; personal cookie import is not an available association.

### Trunk Test (run on every page)

Imagine being dropped on this page with no context. Can you immediately answer:
1. What site is this? (Site ID visible and identifiable)
2. What page am I on? (Page name prominent, matches what I clicked)
3. What are the major sections? (Primary nav visible and clear)
4. What are my options at this level? (Local nav or content choices obvious)
5. Where am I in the scheme of things? ("You are here" indicator, breadcrumbs)
6. How can I search? (Search box findable without hunting)

Score: PASS (all 6 clear) / PARTIAL (4-5 clear) / FAIL (3 or fewer clear).
A FAIL on the trunk test is a HIGH-impact finding regardless of how polished the visual design is.

Read [Design Audit Checklist](audit-checklist.md) and [Design Hard Rules](design-hard-rules.md) for the original per-page evaluation.

---

## Phase 4: Interaction Flow Review

Walk 2-3 key user flows and evaluate the *feel*, not just the function:

```
Snapshot → current interactive elements
Click → approved action using a current element reference
Snapshot/DOM diff → what changed
```

Evaluate:
- **Response feel:** Does clicking feel responsive? Any delays or missing loading states?
- **Transition quality:** Are transitions intentional or generic/absent?
- **Feedback clarity:** Did the action clearly succeed or fail? Is the feedback immediate?
- **Form polish:** Focus states visible? Validation timing correct? Errors near the source?

**Narration mode:** Narrate the flow in first person. "I click 'Sign Up'... spinner appears... 3 seconds pass... still spinning... I'm getting nervous. Finally the dashboard loads, but where am I? The nav doesn't highlight anything." Name the specific element, its position, its visual weight. If you can't name it specifically, you're not actually experiencing the flow, you're generating platitudes.

### Goodwill Reservoir (track across the flow)

As you walk the user flow, maintain a mental goodwill meter (starts at 70/100).
These scores are heuristic, not measured. The value is in identifying specific
drains and fills, not in the final number.

Subtract points for:
- Hidden information the user would want (pricing, contact, shipping): subtract 15
- Format punishment (rejecting valid input like dashes in phone numbers): subtract 10
- Unnecessary information requests: subtract 10
- Interstitials, splash screens, forced tours blocking the task: subtract 15
- Sloppy or unprofessional appearance: subtract 10
- Ambiguous choices that require thinking: subtract 5 each

Add points for:
- Top user tasks are obvious and prominent: add 10
- Upfront about costs and limitations: add 5
- Saves steps (direct links, smart defaults, autofill): add 5 each
- Graceful error recovery with specific fix instructions: add 10
- Apologizes when things go wrong: add 5

Report the final goodwill score with a visual dashboard:

```
Goodwill: 70 ████████████████████░░░░░░░░░░
  Step 1: Login page        70 → 75  (+5 obvious primary action)
  Step 2: Dashboard          75 → 60  (-15 interstitial tour popup)
  Step 3: Settings           60 → 50  (-10 format punishment on phone)
  Step 4: Billing            50 → 35  (-15 hidden pricing info)
  FINAL: 35/100 ⚠️ CRITICAL UX DEBT
```

Below 30 = critical UX debt. 30-60 = needs work. Above 60 = healthy.
Include the biggest drains and fills as specific findings.

---

## Phase 5: Cross-Page Consistency

Compare screenshots and observations across pages for:
- Navigation bar consistent across all pages?
- Footer consistent?
- Component reuse vs one-off designs (same button styled differently on different pages?)
- Tone consistency (one page playful while another is corporate?)
- Spacing rhythm carries across pages?

---

## Phase 6: Compile Report

### Output Locations

**Local:** `REPORT_DIR/design-audit-{domain}.md` in the approved output directory.

**Baseline:** Write `design-baseline.json` for regression mode using [the schemaVersion 2 baseline template](../assets/design-baseline-template.json). Save through a same-directory temporary file and atomic rename only under approved write scope, and retain a per-run `design-baseline.<runId>.json` copy. Preserve the previous evidence before replacing the current baseline. Populate all 10 grades, actual findings, date, URL and the unique run id established at Setup; template grades are illustrative, not observations.

The `detector` object records actual `mode` (`dom`, `source` or `none`), `engine` identity/version (never a path), source-only base commit, target-set hash, counted total, `byRule` and DOM `byPage` counts. Follow [the detector evidence association](detector.md#baseline-evidence) for target hashing and coverage. Use `mode: "none"` and null unavailable fields when no detector completed; never turn missing/partial coverage into a zero-finding scan.

### Scoring System

**Dual headline scores:**
- **Design Score: {A-F}** — weighted average of all 10 categories
- **AI Slop Score: {A-F}** — standalone grade with pithy verdict

**Per-category grades:**
- **A:** Intentional, polished, delightful. Shows design thinking.
- **B:** Solid fundamentals, minor inconsistencies. Looks professional.
- **C:** Functional but generic. No major problems, no design point of view.
- **D:** Noticeable problems. Feels unfinished or careless.
- **F:** Actively hurting user experience. Needs significant rework.

**Grade computation:** Each category starts at A. Each High-impact finding drops one letter grade. Each Medium-impact finding drops half a letter grade. Polish findings are noted but do not affect grade. Minimum is F.

**Category weights for Design Score:**
| Category | Weight |
|----------|--------|
| Visual Hierarchy | 15% |
| Typography | 15% |
| Spacing & Layout | 15% |
| Color & Contrast | 10% |
| Interaction States | 10% |
| Responsive | 10% |
| Content Quality | 10% |
| AI Slop | 5% |
| Motion | 5% |
| Performance Feel | 5% |

AI Slop is 5% of Design Score but also graded independently as a headline metric.

### Regression Output

When previous `design-baseline.json` exists or `--regression` flag is used:
- Select the newest readable baseline older than this run within the approved local report/baseline scope, never search a global home/state directory. An unreadable previous baseline is "previous baseline unreadable (first scan)".
- Load baseline grades; compare per-category deltas, new findings and resolved findings.
- Detector delta only when both completed scans have matching `detector.mode` and `targetSet`: report rule ids appeared/disappeared, totals and per-page changes. Otherwise say "detector modes differ, no delta" or "target set changed, no delta". A different `engine` prints the comparable delta with "engine changed X → Y; rule set may differ". No previous `detector` field means "no detector baseline (first scan)", never `+N`; incomplete coverage or null target/count fields cannot establish comparability. Live pages jitter, so counts are advisory and id appear/disappear is the signal.
- Append the regression table to the report.

---

## Design Critique Format

Use structured feedback, not opinions:
- "I notice..." — observation (e.g., "I notice the primary CTA competes with the secondary action")
- "I wonder..." — question (e.g., "I wonder if users will understand what 'Process' means here")
- "What if..." — suggestion (e.g., "What if we moved search to a more prominent position?")
- "I think... because..." — reasoned opinion (e.g., "I think the spacing between sections is too uniform because it doesn't create hierarchy")

Tie everything to user goals and product objectives. Always suggest specific improvements alongside problems.

---

## Important Rules

1. **Think like a designer, not a QA engineer.** You care whether things feel right, look intentional, and respect the user. You do NOT just care whether things "work."
2. **Screenshots are evidence.** Every finding needs at least one screenshot. Use annotated screenshots (mapped snapshot annotation) to highlight elements.
3. **Be specific and actionable.** "Change X to Y because Z" — not "the spacing feels off."
4. **Never read source code.** Evaluate the rendered site, not the implementation. (Exception: offer to write DESIGN.md from extracted observations.)
5. **AI Slop detection is your superpower.** Most developers can't evaluate whether their site looks AI-generated. You can. Be direct about it.
6. **Quick wins matter.** Always include a "Quick Wins" section — the 3-5 highest-impact fixes that take <30 minutes each.
7. **Use the mapped clickable-element DOM inspection for tricky UIs.** Finds clickable divs that the accessibility tree misses.
8. **Responsive is design, not just "not broken."** A stacked desktop layout on mobile is not responsive design — it's lazy. Evaluate whether the mobile layout makes *design* sense.
9. **Document incrementally.** Write each finding to the report as you find it. Don't batch.
10. **Depth over breadth.** 5-10 well-documented findings with screenshots and specific suggestions > 20 vague observations.
11. **Show screenshots to the user.** After every mapped screenshot, annotated screenshot, or responsive command, use the Read tool on the output file(s) so the user can see them inline. For responsive (3 files), Read all three. This is critical — without it, screenshots are invisible to the user.

### Reusable output-format association

This fenced example supplies the original report sections and Phase 10 per-finding additions locally; it is a reusable format, not an executed audit report. Replace placeholders with actual evidence. No separate report-template file is required.

```markdown
# Design Audit — [domain]

## Summary
- Total findings: [N]
- Fixes applied: verified [X], best-effort [Y], reverted [Z]
- Deferred findings: [N]
- Design score delta: [baseline] → [final]
- AI slop score delta: [baseline] → [final]

## First Impression
- The site communicates **[what]**.
- I notice **[observation]**.
- The first 3 things my eye goes to are: **[1]**, **[2]**, **[3]**.
- If I had to describe this in one word: **[word]**.
- Page Area Test: [areas and purpose]

## Inferred Design System
- Fonts: [names and usage counts]
- Colors: [palette; warm/cool/mixed]
- Heading Scale: [h1-h6]
- Spacing Patterns: [sample values]

## Per-Category Grades
[All 10 categories and the original weights above; grades with evidence]

## Findings
### FINDING-001 — [title]
- Impact: high / medium / polish
- Category: [audit category]
- I notice: [observation]
- I wonder: [question]
- What if: [specific suggestion]
- I think: [opinion] because [reason]
- Screenshot: [evidence]
- Specific improvement: Change [X] to [Y] because [Z]
- Fix Status: verified / best-effort / reverted / deferred
- Commit SHA: [if fixed/committed]
- Files Changed: [if fixed]
- Before/After screenshots: [if fixed]

## Interaction Flow Review
[2-3 flows, first-person narration, trunk-test answers, heuristic goodwill drains/fills]

## Cross-Page Consistency
[Navigation, footer, component reuse, tone, spacing rhythm]

## Quick Wins
[3-5 highest-impact specific fixes taking <30 minutes each]

## Regression
[Per-category grade deltas, new findings, resolved findings; warn if worse]

## PR Summary
Design review found [N] issues, fixed [M]. Design score [X] → [Y], AI slop score [X] → [Y].
```
