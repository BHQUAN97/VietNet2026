# Design System Document

## 1. Overview & Creative North Star: "The Curated Atelier"

This design system is built to reflect the meticulous craft of premium interior design. Moving away from the "standard" corporate grid, our Creative North Star is **The Curated Atelier**. The goal is to make every digital touchpoint feel like a high-end editorial spread—intentional, sophisticated, and deeply tactile. 

We break the "template" look by utilizing the **intentional asymmetry** of architectural layouts. High-contrast typography scales (pairing an authoritative serif with a modern sans-serif) create a dialogue between tradition and innovation. The UI should feel like a physical space: deep, layered, and filled with "breathing room" (generous whitespace) that allows high-quality interior imagery to serve as the primary structural element.

---

## 2. Colors: Tonal Depth & Warmth

The palette is rooted in earthiness and prestige, moving beyond flat aesthetics into a world of rich, tonal transitions.

### Core Palette
- **Primary (#553722):** Used for authoritative moments, high-level headers, and key brand signals.
- **Primary Container (#6F4E37):** The "VietNet Brown." Use this for hero CTAs and primary interaction surfaces.
- **Surface / Background (#FCF9F7):** A warm, crisp "gallery white" that prevents the clinical feel of pure hex #FFFFFF.

### The "No-Line" Rule
To maintain a premium, editorial feel, **1px solid borders are prohibited for sectioning.** Boundaries must be defined solely through background color shifts. For example, a content block using `surface-container-low` should sit directly on a `surface` background. The shift in tone provides a sophisticated "edge" that a line never could.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of fine linen paper. Use the hierarchy below to create "nested" depth:
- **Surface (Lowest):** Main page background.
- **Surface-Container-Low:** For secondary sections or large content blocks.
- **Surface-Container-Highest:** For prominent cards or floating navigation elements.

### Glass & Gradient Rule
Floating elements (like the navigation bar seen in the reference) should utilize **Glassmorphism**. Use a semi-transparent `surface` color with a `backdrop-blur` of 12px-20px. For main CTAs, apply a subtle linear gradient from `primary` to `primary-container` to add a sense of "soul" and three-dimensional polish.

---

## 3. Typography: The Editorial Voice

Our typography is a study in contrast: the heritage of a serif and the precision of a sans-serif.

| Level | Token | Font Family | Size | Character |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | `display-lg` | Noto Serif | 3.5rem | Architectural, bold, and commanding. |
| **Headline**| `headline-md` | Noto Serif | 1.75rem | Used for section titles; elegant and airy. |
| **Title**   | `title-lg` | Manrope | 1.375rem | Clean, modern, and highly legible. |
| **Body**    | `body-lg` | Manrope | 1.0rem | The workhorse; professional and steady. |
| **Label**   | `label-md` | Manrope | 0.75rem | Utility text; always uppercase with light tracking. |

**The Identity Gap:** We use wide letter-spacing on `label` tokens and tight tracking on `display` tokens to create a signature "high-fashion" typographic rhythm.

---

## 4. Elevation & Depth: Tonal Layering

We convey importance through light and layering, not structural rigidity.

- **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` section. This creates a soft, natural "lift" that mimics how light hits different materials in an interior space.
- **Ambient Shadows:** Shadows must be extra-diffused. Use a blur value of `24px` or higher with an opacity between `4%-8%`. The shadow color should be a tinted version of the `on-surface` (brown-tinted) rather than grey, mimicking natural ambient light.
- **The "Ghost Border" Fallback:** If a border is required for accessibility, use the `outline-variant` token at **10% opacity**. 100% opaque borders are strictly forbidden as they break the "Atelier" softness.
- **Glassmorphism:** Use semi-transparent surfaces for mobile menus and sticky headers. This allows the photography to "bleed" through, making the layout feel integrated and fluid.

---

## 5. Components: Tactile & Refined

### Buttons
- **Primary:** Rounded (`xl`: 0.75rem), `primary-container` background, white text. No shadow on rest; subtle `surface-tint` glow on hover.
- **Secondary:** Transparent background with a "Ghost Border" (20% opacity `outline`). 

### Cards & Lists
**Forbid the use of divider lines.** To separate project items or list entries, use vertical white space (from the Spacing Scale: `spacing-8` or `spacing-10`) or subtle tonal shifts in the background. As seen in the "Dự Án Tiêu Biểu" section, project cards should use high-quality imagery that fills the container to the rounded edge (`lg`: 0.5rem).

### Input Fields
Inputs should feel like architectural sketches. Use a `surface-container-lowest` fill with a subtle `outline-variant` ghost border. On focus, the border transitions to `primary` at 50% opacity.

### Featured Component: The Project Overlay
In the "Dự Án" (Featured Projects) section, text labels should sit inside the image container using a semi-transparent `primary-container` overlay. This ensures text legibility while keeping the focus on the interior design work.

---

## 6. Do's and Don'ts

### Do
- **Do use "The Breathing Rule":** When in doubt, add more whitespace. High-end design thrives on the luxury of space.
- **Do use Asymmetric Alignment:** Align a headline to the left and the sub-description to the right of a 12-column grid to create visual interest.
- **Do prioritize Image Quality:** This system fails without professional-grade photography. Images should be the "hero" of every page.

### Don't
- **Don't use pure Black (#000000):** Use `on-background` (#1B1C1B) to keep the "warmth" of the brand intact.
- **Don't use harsh corners:** Avoid the `none` roundedness scale. Even the most "modern" element needs a `sm` or `md` radius to feel premium and touchable.
- **Don't use standard Shadows:** Avoid the "drop shadow" presets in design tools. Always manually craft the "Ambient Shadow" with brown tints and high diffusion.