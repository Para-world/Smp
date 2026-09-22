---
name: Academic Precision
colors:
  surface: '#f8f9ff'
  surface-dim: '#ccdbf3'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d5e3fc'
  on-surface: '#0d1c2e'
  on-surface-variant: '#47464f'
  inverse-surface: '#233144'
  inverse-on-surface: '#eaf1ff'
  outline: '#787680'
  outline-variant: '#c8c5d0'
  surface-tint: '#5b598c'
  primary: '#070235'
  on-primary: '#ffffff'
  primary-container: '#1e1b4b'
  on-primary-container: '#8683ba'
  inverse-primary: '#c4c1fb'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#000f07'
  on-tertiary: '#ffffff'
  tertiary-container: '#002819'
  on-tertiary-container: '#179c6e'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e3dfff'
  primary-fixed-dim: '#c4c1fb'
  on-primary-fixed: '#181445'
  on-primary-fixed-variant: '#444173'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#85f8c4'
  tertiary-fixed-dim: '#68dba9'
  on-tertiary-fixed: '#002114'
  on-tertiary-fixed-variant: '#005137'
  background: '#f8f9ff'
  on-background: '#0d1c2e'
  surface-variant: '#d5e3fc'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 2.25rem
    fontWeight: '700'
    lineHeight: 2.75rem
    letterSpacing: -0.025em
  display-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.75rem
    fontWeight: '700'
    lineHeight: 2.25rem
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.75rem
    fontWeight: '600'
    lineHeight: 2.25rem
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.375rem
    fontWeight: '600'
    lineHeight: 1.75rem
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.125rem
    fontWeight: '600'
    lineHeight: 1.5rem
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.5rem
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.375rem
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '400'
    lineHeight: 1.125rem
    letterSpacing: 0.005em
  label-md:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '500'
    lineHeight: 1.25rem
    letterSpacing: 0em
  label-sm:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '500'
    lineHeight: 1rem
    letterSpacing: 0.01em
  label-xs:
    fontFamily: Inter
    fontSize: 0.6875rem
    fontWeight: '600'
    lineHeight: 0.875rem
    letterSpacing: 0.025em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  gutter-lg: 2rem
  margin: 1.5rem
  margin-sm: 1rem
  margin-lg: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style

This design system targets higher education administrators, faculty, academic advisors, and students operating within high-density, mission-critical academic workflows. The aesthetic balances the rigorous authority of traditional academic governance with the velocity, fluidity, and visual craftsmanship of top-tier engineering SaaS. 

The emotional response should evoke absolute control, cognitive clarity, and effortless navigation through deep organizational complexity. It borrows the compact information architecture, subtle micro-borders, and tactile interaction design of modern engineering tools, fused with the expansive, crisp polish of premier financial software. Visual elements avoid clutter and frivolous ornament, leaning into razor-sharp typographic alignment, deliberate contrast, and calm, functional slate surfaces.

## Colors

The palette establishes an authoritative, deep foundation punctuated by high-clarity functional accents.

- **Primary (`#1E1B4B` / `#0F172A` / `#312E81`):** Deep Indigo and Midnight Slate anchor structural elements: global navigation sidebars, major brand headers, high-emphasis interactive surfaces, and key action triggers.
- **Secondary (`#2563EB` / `#3B82F6`):** Electric Cobalt Blue acts as the active operational driver, applied to active states, focused form boundaries, selected navigation indices, and immediate functional affordances.
- **Tertiary (`#059669` / `#10B981`):** Deep Emerald and Vibrant Mint indicate positive metrics, enrollment confirmations, GPA progress ribbons, and compliance milestones.
- **Neutral & Canvas Surfaces:**
  - Base App Canvas: `#F8FAFC` (Cool Slate)
  - Card & Container Surface: `#FFFFFF` (Pure White)
  - Sub-surface Wells: `#F1F5F9` (Muted Slate)
  - Hairline Structural Borders: `#E2E8F0` and `#CBD5E1`
  - Primary Typographic Ink: `#0F172A`
  - Secondary Typographic Ink: `#475569`
  - Muted Typographic Ink: `#94A3B8`

Ensure strict WCAG AAA compliance across all body and data-table interactions, with `#0F172A` and `#475569` delivering strong contrast against pure white and `#F8FAFC` slate backgrounds.

## Typography

The type system blends the geometric confidence of Plus Jakarta Sans for titles, summaries, and dashboard KPIs with the utilitarian clarity of Inter for dense student rosters, transcripts, and operational tables.

- **Headlines & Section Anchors:** Plus Jakarta Sans provides crisp modern personality. Tight negative tracking (`-0.015em` to `-0.025em`) ensures large values and section headers remain compact without sacrificing readability.
- **Data & Administrative Reading:** Inter maintains neutral precision across dense schedules and transactional fields. Data grids, tabular figures, and multi-line descriptions utilize tabular numerals (`tnum`) where metric comparisons are necessary.
- **Labels & Micro-copy:** Labels lean on medium and semi-bold weights with slight positive letter spacing to maintain legibility at sub-12px sizes within status badges, column headings, and keyboard shortcut pills.

## Layout & Spacing

The layout is built around a fluid, responsive 12-column grid anchored by an enterprise-grade dual-tier navigation system: a collapsible primary left sidebar (64px collapsed, 240px expanded) paired with an optional contextual sub-rail (200px) for deep departmental or student views.

- **Breakpoints:**
  - **Mobile (< 768px):** Single-column layout. The left rail converts to an off-canvas drawer. Gutters scale to `gutter-sm` (1rem), margins reduce to `margin-sm` (1rem).
  - **Tablet (768px – 1199px):** 8-column layout. Sidebar collapses to icon-only rail (64px). Main content adapts with 1.25rem margins and 1rem gutters.
  - **Desktop (1200px+):** Full 12-column layout. Main container fluidly scales to a maximum canvas width of 1600px with `margin-lg` (2.5rem) and `gutter-lg` (2rem).

The internal spacing rhythm uses an 8pt base unit with 4pt micro-steps (`space-xs` = 4px, `space-sm` = 8px, `space-md` = 12px, `space-lg` = 20px, `space-xl` = 32px), strictly governing component interiors, toolbar button gaps, and metric tile flow.

## Elevation & Depth

Visual hierarchy uses a refined technique combining micro-borders with multi-layer ambient shadow diffusion to create clean, architectural lift:

- **Surface Micro-Borders:** Every floating element, card, dropdown, and modal utilizes a 1px solid border in `#E2E8F0` or `#CBD5E1`. On dark interactive panels or inverted elements, micro-borders transition to `rgba(255, 255, 255, 0.08)`.
- **Level 0 (Flat Canvas):** `#F8FAFC`. Zero elevation, non-interactive ground.
- **Level 1 (Card & Modular Widgets):** `#FFFFFF` surface with micro-border `#E2E8F0` layered over a dual-ring ambient shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.02)`.
- **Level 2 (Interactive Hover & Flyouts):** Used for elevated cards, actionable list items on hover, and active filter panels: `0 4px 6px -1px rgba(15, 23, 42, 0.06), 0 2px 4px -2px rgba(15, 23, 42, 0.04)`.
- **Level 3 (Modals, Slide-overs, & Popovers):** Highest depth tier for focal student files and overlay forms: `0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.03)` with a translucent backdrop blur overlay (`rgba(15, 23, 42, 0.4)` with `backdrop-filter: blur(4px)`).

## Shapes

The design uses balanced, modern enterprise curvature:

- **Cards & Data Panels (`rounded-xl` / `rounded-2xl`):** Primary overview containers, profile shells, and data cards feature 0.75rem (12px) to 1rem (16px) corner radiuses, softening analytical data density.
- **Inputs & Action Controls (`rounded-md`):** Buttons, inputs, dropdown triggers, and interactive table rows use 0.375rem (6px) to 0.5rem (8px), maintaining structured, utilitarian precision.
- **Status Pills, Badges, & Chips (`rounded-full`):** Category indicators, GPA badges, course level chips, and status flags are fully rounded pill shapes to distinguish them from actionable square-cornered buttons.

## Components

### Buttons
- **Primary:** Deep Indigo (`#1E1B4B`) fill with pure white typography, subtle top inset highlight (`box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15)`), and 0.5rem radius. Hover shifts to `#0F172A`. Active state scales subtly (`scale-98`).
- **Secondary / Action Accent:** Electric Cobalt (`#2563EB`) fill for primary calls to action within student records (e.g., "Enroll Student", "Submit Grades"). Hover transitions to `#1D4ED8`.
- **Outline / Neutral:** `#FFFFFF` background, 1px `#E2E8F0` border, `#0F172A` text. Hover applies `#F8FAFC` fill and `#CBD5E1` border.
- **Ghost:** Transparent background, `#475569` text. Hover introduces `#F1F5F9` background and `#0F172A` text.

### Cards & Metric Panels
- Constructed with `#FFFFFF` background, `rounded-xl` (16px), 1px `#E2E8F0` border, and Level 1 elevation.
- **Metric Cards:** Contain an upper metadata label row (`label-xs`, uppercase, `#64748B`), large numeric anchor (`headline-lg`, Plus Jakarta Sans, `#0F172A`), and an inline trending chip (`+4.2%` with `#ECFDF5` background and `#059669` text).

### Chips & Status Badges
- Pill-shaped (`rounded-full`) with a tight padding formula (`py-0.5 px-2.5`).
- **Success (Enrolled, Passing, Paid):** `#ECFDF5` background, `#059669` text, 1px `#A7F3D0` micro-border.
- **Warning (Probation, Incomplete):** `#FFFBEB` background, `#D97706` text, 1px `#FDE68A` micro-border.
- **Error (Suspended, Unpaid):** `#FEF2F2` background, `#DC2626` text, 1px `#FECACA` micro-border.
- **Informational / Neutral:** `#F1F5F9` background, `#475569` text, 1px `#E2E8F0` micro-border.

### Form Inputs & Selectors
- **Input Fields:** `#FFFFFF` background, 1px `#CBD5E1` border, 0.5rem radius, `body-md` typography. Internal padding `px-3.5 py-2.5`. 
- **Focus State:** 1px `#2563EB` ring with an ambient outer glow (`box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12)`).
- **Placeholder:** `#94A3B8`. Error state triggers `#EF4444` border and red focus glow.

### Checkboxes & Radio Controls
- Base control is 16px × 16px with a 1px `#CBD5E1` border and 4px radius (checkbox) or circular form (radio).
- Active state fills with Electric Cobalt (`#2563EB`) and displays a crisp white SVG check icon.

### Data Tables & Roster Lists
- **Container:** Wrapped in a Level 1 card surface with zero interior padding on the table element.
- **Header:** Sticky top row with `#F8FAFC` background, 1px bottom border (`#E2E8F0`), `label-xs` uppercase text in `#64748B`.
- **Rows:** Alternating hover state (`#F8FAFC`), 1px bottom border (`#F1F5F9`), `py-3 px-4`. Primary student identifier styled in `label-md` `#0F172A`, secondary details (e.g., student ID, email) in `body-sm` `#64748B`.

### Navigation Rails & Tabs
- Vertical left rail features an `#0F172A` deep navy canvas with `#94A3B8` icon-and-text links. Active navigation item adopts a high-contrast treatment: `#1E293B` background tile, pure white `#FFFFFF` text, and a 3px electric blue `#3B82F6` left indicator bar.
- Horizontal sub-tabs sit on a borderless slate bed with an active bottom border sliding indicator in `#2563EB`.