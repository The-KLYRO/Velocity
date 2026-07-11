---
name: Lumina Velocity
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#ddb7ff'
  on-secondary: '#490080'
  secondary-container: '#6f00be'
  on-secondary-container: '#d6a9ff'
  tertiary: '#ffb786'
  on-tertiary: '#502400'
  tertiary-container: '#df7412'
  on-tertiary-container: '#461f00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#f0dbff'
  secondary-fixed-dim: '#ddb7ff'
  on-secondary-fixed: '#2c0051'
  on-secondary-fixed-variant: '#6900b3'
  tertiary-fixed: '#ffdcc6'
  tertiary-fixed-dim: '#ffb786'
  on-tertiary-fixed: '#311400'
  on-tertiary-fixed-variant: '#723600'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
  surface-charcoal: '#121212'
  surface-elevated: '#1e1e1e'
  glass-stroke: rgba(255, 255, 255, 0.08)
  neon-glow: rgba(59, 130, 246, 0.3)
typography:
  display-lg:
    fontFamily: Sora
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-padding: 2rem
  gutter: 1.5rem
  sidebar-width: 280px
  stack-gap: 1rem
---

## Brand & Style

The design system is engineered for **Lumina Velocity**, a premium, high-speed SaaS environment for bulk email management. The brand persona is high-performance, precise, and sophisticated—mirroring the efficiency of professional developer tools like Linear.

The visual style is a fusion of **Glassmorphism** and **Minimalism**. It utilizes deep, multi-layered dark surfaces with translucent overlays to create a sense of depth and focus. The atmosphere is intentionally atmospheric, using vibrant neon accents to highlight critical data points and actions against a void-like charcoal backdrop. 

The aesthetic goals are:
- **Depth through Translucency:** Using backdrop blurs to signify hierarchy.
- **Precision:** Thin, high-contrast borders and surgical typography.
- **Kinetic Energy:** Subtle gradients that suggest movement and speed.

## Colors

The palette centers on a **Deep Dark** foundation. The primary background uses a near-black charcoal (`#0a0a0a`), while containers use slightly lighter tiers (`#121212` and `#1e1e1e`) to establish a physical hierarchy without relying on heavy shadows.

- **Primary Neon Blue (#3b82f6):** Reserved for primary actions, progress indicators, and active states. It should feel like a light source in the dark.
- **Highlight Purple (#a855f7):** Used for secondary accents, data visualization peaks, and "Pro" tier features.
- **Functional Glass:** Borders are never solid; they use `glass-stroke` to define edges while maintaining a soft, integrated look. 
- **Gradients:** Use linear gradients from Primary to Secondary (45-degree angle) for high-impact elements like stat trends or empty-state illustrations.

## Typography

This design system uses **Sora** for headlines to provide a distinct, high-tech geometric character, and **Inter** for all functional and body text to ensure maximum legibility at high speeds.

- **Display & Headlines:** Use Sora with tighter letter spacing to create a compact, "engineered" look.
- **Body & Data:** Use Inter. For data tables and numerical values, ensure `tabular-nums` is enabled to keep columns aligned.
- **Labels:** Use `label-sm` for sidebar categories and table headers, typically paired with a 60% opacity for better visual grouping.

## Layout & Spacing

The layout follows a **Fixed Sidebar + Fluid Content** model. The interface is divided into functional zones using clear structural boundaries.

- **Grid:** A 12-column grid is used for the main dashboard content area.
- **Margins:** High-density content is balanced by generous 32px (`2rem`) outer margins to prevent the UI from feeling claustrophobic.
- **Responsiveness:** On smaller desktop widths, the 12-column grid collapses to 8, and the sidebar can be toggled into a collapsed icon-only state (80px).
- **Alignment:** All elements must align to a 4px baseline grid to maintain the "precision-tool" aesthetic.

## Elevation & Depth

Hierarchy is established through **Backdrop Blur** and **Tonal Layering** rather than traditional drop shadows.

- **Level 0 (Background):** `#0a0a0a` - The base canvas.
- **Level 1 (Cards/Sidebar):** `#121212` with a 1px `glass-stroke` border.
- **Level 2 (Floating Dialogs/Toasts):** Semi-transparent surfaces (80% opacity) with a `blur(12px)` backdrop. These elements use a subtle `neon-glow` outer shadow to simulate light emission.
- **Hover States:** Elements should lift visually by increasing the brightness of the background color and the opacity of the border stroke.

## Shapes

The design system utilizes **Large, Generous Radii** to soften the technical edge of the dark theme and provide a premium, modern feel.

- **Standard Elements:** 0.5rem (8px) for buttons, inputs, and small chips.
- **Large Components (Cards, Sidebar):** 1rem (16px) to 1.25rem (20px).
- **Interactive Rows:** Table rows use 0.5rem (8px) on hover to create a "pill-row" effect.
- **Pill Shapes:** Always used for status indicators (Sent, Draft, Error) and the "Send" button in the editor.

## Components

### Sidebar
The sidebar is the primary navigation anchor. It features a semi-transparent background with a subtle right-border. Active items use a ghost-fill of the Primary Neon Blue (10% opacity) with a vertical 2px indicator line.

### Glassmorphic Stat Cards
Cards should have no solid background; instead, use a 5% white overlay with a heavy backdrop blur. Include a subtle "glow" in the top-left corner using a radial gradient of the Primary or Secondary color at 5% opacity.

### Rich Text Editor
Based on the Gmail composition layout, but redesigned for dark mode:
- **Header:** Dark charcoal background with "New Message" in Sora.
- **Body:** True black (`#000000`) for the text area to maximize contrast.
- **Toolbar:** Floating at the bottom, detached from the text area, using a glassmorphic pill container.
- **Icons:** Thin-stroke (1.5pt) monochrome icons that turn Primary Blue on hover.

### Data Tables
Rows are detached with 8px vertical spacing between them. 
- **Default State:** Transparent background, subtle bottom border.
- **Hover State:** Background shifts to `#1e1e1e` and all four corners round to 8px, creating a floating effect.

### Floating Dialogs & Toasts
Toasts appear in the bottom-right corner with a `blur(16px)` background and a 1px colored border matching the status (e.g., Green for success, Blue for info). Dialogs should dim the background using a 40% black overlay.