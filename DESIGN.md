---
version: 1
name: Halftone Window
description: The Local Transcriber design system, shared by the app and this site. Every box is a framed window — 2px ink frame, black title bar with three dots, hard offset ink shadow — set on a white desk with a dot grid. A pink brand field carries halftone dot textures; one hot accent marks the primary action. Archivo Black for display, JetBrains Mono for everything else.

colors:
  pink: "#f48ca8"       # brand field: hero, download, page heads, open rows. Text on it is ink only (9.2:1)
  pink-deep: "#d6336c"  # halftone dots on pink fields only — never text
  pink-wash: "#fff3f6"  # hover rows, focused fields, the theme preview
  hot: "#ff4e7e"        # the one accent: primary action, REC lamp, focus ring, active tab underline. Text on it is ink (6.6:1)
  berry: "#c2185b"      # accent as TEXT on paper (5.9:1): links, timestamps. Fails on pink
  ink: "#000000"        # frames, title bars, primary buttons, text
  paper: "#ffffff"      # window bodies, the desk
  panel: "#eeedef"      # grey window areas, table heads, the tour player bar
  mute: "#5c5a60"       # secondary text on paper and panel only
  faint: "#8a8790"      # placeholders, comments in code blocks, loading lamp
  rule: "#d6d3d9"       # row dividers inside windows; the desk's dot grid
  ink-soft: "#d8d6db"   # secondary text on ink

typography:
  display: { fontFamily: "Archivo Black", weight: 400, case: uppercase }
  mono: { fontFamily: "JetBrains Mono", weights: [400, 500, 600, 700, 800] }
  mega: { family: display, size: "clamp(52px, 9.6vw, 150px)", lineHeight: 0.84, letterSpacing: -0.03em }
  h2: { family: display, size: "clamp(40px, 5.6vw, 84px)", lineHeight: 0.88, letterSpacing: -0.02em }
  card-title: { family: display, size: "clamp(24px, 2.6vw, 36px)", lineHeight: 0.95 }
  h3: { family: mono, size: 16px, weight: 800 }
  body: { family: mono, size: 14px, weight: 500, lineHeight: 1.6 }
  intro: { family: mono, size: 16px, weight: 500, lineHeight: 1.6 }
  label: { family: mono, size: 13px, weight: 700 }
  caption: { family: mono, size: 12.5px, weight: 800 }

shadows:   # hard offset ink, never blurred. Pressing moves the element into its shadow. On ink fields the shadow is hot or paper.
  sh-sm: "4px 4px 0 #000"
  sh-md: "5px 5px 0 #000"
  sh-lg: "7px 7px 0 #000"
  sh-xl: "9px 9px 0 #000"

lines:
  frame-line: "2px solid #000"     # windows, buttons, inputs, nav cells
  rule-line: "1.5px solid #d6d3d9" # rows inside a window

radius: 0   # everything is square, except the title-bar dots and the REC lamp (50%)
---

# Halftone Window

The landing page (`styles.css`, `legal.css`) implements this system; the app uses the same tokens and class names. Tokens are CSS custom properties on `:root` in `styles.css`.

## Principles

- **Everything is a window.** A content box is `.win` (2px ink frame on paper) with a `.bar` title bar: ink background, three paper dots (`.dots`), a lower-case mono label. A hot bar (`.bar.hot`) or pink bar (`.bar.pnk`) marks the one emphasised window in a group.
- **Hard shadows only.** `sh-sm` → `sh-xl` by importance; the hero's front window and the download panel get `sh-xl`. Buttons press *into* their shadow (`:active` translates by the shadow offset).
- **One accent.** `hot` is used for exactly one primary action per view, the REC lamp, the focus ring and active-tab underlines. Text on `hot` and `pink` is always ink.
- **Halftone texture.** Pink and ink fields carry a dot pattern (`.ht`: `radial-gradient` dots in `pink-deep`, or `hot` on ink) masked to one corner. The hero draws an animated canvas version that drifts and follows the pointer, kept calm behind the copy. Never put dots behind body text.
- **Mono everywhere.** Archivo Black is only for uppercase display type (headlines, step numbers, big figures). All other text is JetBrains Mono. Text marks are ASCII: `[x]`, `[ ]`, `[!]`, `→`, `↓`, `▶`.
- **Square.** 0 radius. The dots and the REC lamp are the only round shapes.

## Sections

Full-width bands separated by a 2px ink rule, `clamp(72px, 9vw, 120px)` vertical padding, content in `.wrap` (max 1320px, gutter `clamp(16px, 3vw, 32px)`). Bands alternate: pink (`.sec.pink`), white with the dot grid (`.sec.dotted`), plain white, ink (`.sec.ink`). Each opens with an `.h2` and an `.intro` paragraph.

## Components

| Component | Class | Notes |
| --- | --- | --- |
| Nav window | `.nav` / `.navwin` | Sticky, 52px, framed; ink brand cell with dots, link cells (`.nl`), a dotted filler (`.topbar-fill`), the Theme button and the hot `Download · free` cell (`.ncta`). Links collapse below 980px. |
| Big button | `.go`, `.go.light` | 58px, ink (or paper) with `sh-md`; hover turns hot. |
| Button | `.btn`, `.btn-sm` | 40 / 34px, paper with ink frame; hover pink; `.ok` after a copy. |
| Tag | `.tag`, `.tag.k`, `.tag.p`, `.tag.h` | 2px framed chip; ink, pink and hot variants. |
| Level meter | `.lvl` | Animated bars; hot for "Me", ink/paper for "Others". |
| Step module | `.mod` | Ink number cell, display title + text, grey visual cell. |
| Feature window | `.feat .win` | Window with a `.mini` grey readout at the bottom; lifts on hover. |
| Tabs | `.plat`, `.filter`, `.lang` | Framed segmented control; the selected cell is ink with a hot inset underline. |
| File row | `.file` | Name + meta, Download and Copy SHA-256 buttons, ruled between rows. |
| FAQ / release row | `.faq details`, `.release` | Framed rows with a `+`/`−` box; open rows turn pink. |
| Legal section | `.sect` (legal.css) | Window whose heading has an ink number cell; `.basis` grey callout; `.kv` key/value grid. |
| Toast | `.toast` | Paper, ink frame, 12px ink left edge, `sh-lg`. |

## Theme picker

Brand and accent swatches (`site.js`) change `--pink` and `--hot`; `--pink-deep` and `--pink-wash` are derived from the brand (38% toward black, 90% toward white). On the site the choice lasts only for the current page — nothing is stored on the visitor's device. The app has the same control in Settings → Appearance.

## Motion

Short and mechanical: windows rise in (`rise`, .6s), the hero windows float, meters pulse, the ticker scrolls. All animation stops under `prefers-reduced-motion`, and the halftone canvas pauses off-screen.

## Accessibility

Contrast pairs above are checked (ink on pink 9.2:1, ink on hot 6.6:1, berry on paper 5.9:1). Focus is a 3px hot outline. Touch targets are ≥44px on phones. Decorative windows in the hero are `aria-hidden`.
