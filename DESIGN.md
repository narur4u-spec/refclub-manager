# Design Brief

## Concept
Professional business referral club admin dashboard. Teal-primary design system with warm amber accents for referral/deal outcomes. Card-based member profiles, chapter-filtered view, attendance timeline, broadcast messaging panel. Refined minimalism for productivity.

## Tone & Differentiation
Confident, trustworthy, modern. Not corporate-sterile. Minimal, focused on clarity and information density. Surfaces elevated via subtle borders and layering, not shadows. Direct visual feedback for actions (attendance, referrals, messages).

## Color Palette

| Token | Light | Dark | Usage |
|---|---|---|---|
| **Primary** | L:0.50 C:0.18 H:260 (Teal) | L:0.62 C:0.16 H:260 | Primary actions, chapter filters, navigation |
| **Secondary** | L:0.88 C:0.03 H:255 (Slate) | L:0.30 C:0.03 H:260 | Secondary actions, toggles |
| **Accent** | L:0.70 C:0.17 H:60 (Amber) | L:0.75 C:0.15 H:60 | Referrals given, deal status, highlights |
| **Destructive** | L:0.55 C:0.22 H:25 (Red) | L:0.65 C:0.19 H:22 | Delete, remove, negative actions |
| **Background** | L:0.98 C:0.01 H:240 | L:0.12 C:0.01 H:250 | Page background, neutral surface |
| **Card** | L:1.0 C:0 H:0 (White) | L:0.17 C:0.02 H:260 | Member profiles, data sections |
| **Muted** | L:0.92 C:0.02 H:240 | L:0.25 C:0.02 H:255 | Dividers, disabled states, metadata |
| **Border** | L:0.88 C:0.02 H:255 | L:0.25 C:0.02 H:260 | Card borders, section dividers |

## Typography
| Layer | Font | Scale | Usage |
|---|---|---|---|
| **Display** | Figtree 700 | 28px–40px | Page titles, member names, section headers |
| **Body** | DM Sans 400–600 | 14px–16px | Content, descriptions, form labels, UI text |
| **Mono** | JetBrains Mono 400 | 12px–14px | Data tables, chapter codes, referral IDs |

## Shape Language
- Card border-radius: `rounded-md` (6px) — professional, not harsh
- Input border-radius: `rounded-sm` (2px) — subtle, technical
- No heavy decorative radii. Sharp corners on data tables.

## Structural Zones

| Zone | Treatment | Details |
|---|---|---|
| **Header/Nav** | `bg-card` + `border-b` + `border-border` | Teal primary buttons, member count badge, chapter switcher |
| **Main Content** | `bg-background` | Grid of member cards, each with `bg-card` `border` `elevation-subtle` |
| **Sidebar/Chapters** | `bg-sidebar` + `border-r` + `border-sidebar-border` | 5 chapter filter pills, `primary` when active |
| **Data Table** | `bg-card` with `border-collapse` | Attendance grid, referrals log — sharp corners, monospace data |
| **Footer/Messaging** | `bg-muted/20` + `border-t` | Broadcast message compose area, limited scope |

## Spacing & Rhythm
- Gutters: 16px (sm), 20px (md), 24px (lg)
- Component padding: 12px (compact), 16px (default), 20px (spacious)
- Vertical rhythm: 4px baseline, multiples of 8px for sections
- Card-to-card gap: 12px (tight grid for 200 members at a glance)

## Component Patterns
- **Member Card**: Image placeholder + name (Figtree 700) + business title (DM Sans 500) + chapter tag (badge, secondary) + referral count (accent badge) + edit action (primary button)
- **Attendance Marker**: Circle (teal=present, muted=absent, amber=pending) + date in monospace
- **Referral Badge**: Amber background, small pill shape, count number
- **Broadcast Panel**: Textarea (input bg), chapter selector (dropdown), send button (primary + amber accent on hover for "broadcast sent")

## Motion & Interaction
- Hover: `brightness(1.05)` on cards, `scale(1.02)` on buttons
- Transition: `transition-smooth` (0.3s cubic) on all interactive elements
- No entrance animations — load with full opacity
- Skeleton loaders for async member data

## Constraints
- Max 3 semantic colors on any one screen (primary, accent, destructive)
- No arbitrary color swatches; all colors are OKLCH tokens
- No opacity-based emphasis; use lightness/chroma shifts in OKLCH instead
- No box-shadow layering; use `elevation-subtle` or `elevation-base` only
- Avoid blur effects — clarity is paramount for data-heavy view

## Signature Detail
**Teal-to-amber gradient underline** on section titles (e.g., "Active Referrals"). A single-pixel line under each major section title that fades from teal (primary) to amber (accent) left-to-right. This visual motif ties the color story and adds intentionality without clutter.
