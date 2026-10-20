# Design System

Both the website and the app follow `DESIGN.md` (the full spec, with tokens in its front matter). It's a take on **catalog-era 1996 enterprise web design**: a literal black page frame, flat colored "ribbon cards", chunky Arial Black titles, Times body text and hand-cut "sticker" elements. It uses **system fonts only**.

![The design language on the landing page](images/landing-features.png)

## Colors

| Token | Hex | Used for |
| --- | --- | --- |
| `primary` | `#e91d2a` | Red CTA block, cert seal, phone callout text |
| `ink` / `frame-ink` | `#000000` | Text, page frame, top banner |
| `canvas` | `#ffffff` | Page background, card titles |
| `yellow-sticker` | `#fcc20f` | "Download it FREE", NEW! bursts, active filters |
| `purple-stripe` | `#6a26a4` | Sticker accent |
| `link` | `#0000ee` | Classic blue links |

Ribbon-card tints (one per card body):

| `tint-olive` | `tint-sage` | `tint-salmon` | `tint-peach` | `tint-lime` | `tint-sky` | `tint-steel` | `tint-periwinkle` |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `#8e8a25` | `#b3bd95` | `#d77a7a` | `#e6915d` | `#c0d4a7` | `#9ab6c8` | `#a5b8c0` | `#8c9ae0` |

Section headers alternate **olive** and **salmon** "eyebrow" bands.

## Typography

| Role | Font | Size / weight |
| --- | --- | --- |
| Display / H1 | Arial Black | 36px / 24px, 900 |
| H2 / H3, buttons, UI labels | Helvetica | 16 / 14 / 12px, 700 |
| Body | Times New Roman | 14px, 400, line-height 1.4 |
| Small / caption | Times New Roman | 12 / 11px |

## Shape and spacing

- **No rounded corners** (`0px`), except round seals (`9999px`).
- Spacing scale: 2, 4, 6, 8, 10, 12, 16, 20, 24 · sections 32 / 40 / 48 px.

## Components

| Component | Description |
| --- | --- |
| **Page frame** | 8px black border around the viewport |
| **Top banner** | Black bar: logo, tagline, sticker, phone-style callout |
| **Eyebrow** | Full-width tinted band with a display-size title |
| **Ribbon card** | White title strip over a tinted body, black 1px border. Can hold a monospace "notch" |
| **CTA block (red)** | Red panel with white text and a button |
| **Sticker / NEW! burst** | Yellow, slightly rotated label |
| **Cert seal** | Round red badge ("100% OFFLINE") |
| **Icon-label nav** | Grid of icon + uppercase label tiles (rail, footer) |
| **Data table** | Black header row, plain cells |

When you add UI, reuse these tokens and components rather than inventing new styles.
