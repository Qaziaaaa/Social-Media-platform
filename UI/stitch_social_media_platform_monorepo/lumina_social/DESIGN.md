---
name: Lumina Social
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#464555'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#95002b'
  on-tertiary: '#ffffff'
  tertiary-container: '#bf0f3c'
  on-tertiary-container: '#ffd0d2'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdadb'
  tertiary-fixed-dim: '#ffb2b7'
  on-tertiary-fixed: '#40000d'
  on-tertiary-fixed-variant: '#92002a'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.01em
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
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 24px
  max-width: 1280px
---

## Brand & Style

The design system is engineered for a premium social networking experience that prioritizes content clarity and user connection. The brand personality is professional yet approachable, characterized by an "airy" and modern aesthetic that avoids visual clutter. 

The design style follows a **Corporate / Modern** approach with hints of **Minimalism**. It utilizes expansive whitespace, a refined color palette, and a sophisticated layering system to create a sense of breathability. The emotional response should be one of calm focus, reliability, and effortless navigation, ensuring that the platform feels like a high-quality utility rather than a chaotic feed.

## Colors

This design system utilizes a structured light-themed palette designed for high legibility and subtle depth. 

- **Primary (Indigo):** Used for primary actions, active states, and brand-critical elements.
- **Accents:** Emerald is reserved for success states and "Follow" actions; Rose is dedicated to "Like" interactions and emotional engagement; Amber is used strictly for warnings.
- **Neutrals:** The background uses a subtle off-white to allow pure white surface cards to pop, creating a natural hierarchy without heavy shadows.

## Typography

The typographic strategy balances the expressive, modern curves of **Plus Jakarta Sans** for headlines with the utilitarian precision of **Inter** for body text. 

Headlines should use tight tracking and bold weights to establish a strong visual anchor. Body copy prioritizes readability with generous line heights. For mobile views, display and large headline sizes must scale down to prevent awkward line breaks while maintaining their weight and personality.

## Layout & Spacing

The design system employs a **Fluid Grid** model based on an 8px spacing rhythm. 

- **Desktop:** 12-column grid with a maximum content width of 1280px. Gutters are fixed at 16px to maintain a tight, professional feel between content modules.
- **Tablet:** 8-column grid with 24px side margins.
- **Mobile:** 4-column grid with 16px side margins. 

Layouts should favor vertical stacking for feed items, while navigation is handled through a fixed sidebar on desktop and a bottom tab bar on mobile. Padding within cards should be generous (typically 24px) to reinforce the "airy" brand value.

## Elevation & Depth

This design system relies on **Tonal Layers** supplemented by **Ambient Shadows**. 

Depth is primarily created by placing `surface` (white) elements on top of the `background` (light gray). To further separate interactive content, use extra-diffused, low-opacity shadows. Shadows should have a large blur radius (12px to 20px) but very low opacity (5-10%) and a slight tint of the neutral text color (#0F172A) to appear natural.

Avoid heavy borders; instead, use 1px subtle outlines (#E2E8F0) only when multiple white surfaces are adjacent to each other.

## Shapes

The shape language is consistently **Rounded**. 

The base radius of 0.5rem (8px) is used for small components like inputs and buttons. Large containers, such as post cards or profile headers, should use `rounded-lg` (16px) to create a friendly and inviting aesthetic. Avatars must always be circular (full radius) to distinguish people from content boxes.

## Components

- **Buttons:** 
  - *Primary:* Solid Indigo with white text. 
  - *Secondary:* Outlined with Primary color and subtle background hover state.
  - *Ghost:* No background or border, Indigo text; used for tertiary actions.
- **Inputs:** White background, 1px border (#E2E8F0), 12px horizontal padding. On focus, the border transitions to Primary Indigo with a soft 3px outer glow.
- **Cards:** White surface, 16px corner radius, and a "low-profile" ambient shadow. Padding should be 24px for desktop and 16px for mobile.
- **Chips:** Used for tags or categories. Small height (28px), light gray background (#F1F5F9), and semi-bold label text.
- **Avatars:** Strictly circular. Include a 2px white border when overlapping or placed on colored backgrounds. Status indicators (online/away) should be 25% of the avatar's size, positioned in the bottom-right.
- **Lists:** Clean separation using the subtle border color (#E2E8F0) between items, with interactive hover states that use a very light tint of the primary color.