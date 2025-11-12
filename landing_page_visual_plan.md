I’ve now implemented the core structural and visual corrections so the dynamic landing page closely mirrors the static mockup trio:

- static/index.html
- static/styles/globals.css
- static/js/landing.js

Summary of what is in place

Key files:

- [src/components/layout/PublicHeader.tsx](src/components/layout/PublicHeader.tsx:1)
- [src/pages/index.tsx](src/pages/index.tsx:1)
- [src/styles/tokens.css](src/styles/tokens.css:1)
- [src/components/ui/button.tsx](src/components/ui/button.tsx:1)

1) PublicHeader: sticky, mockup-style header

File:
- [src/components/layout/PublicHeader.tsx](src/components/layout/PublicHeader.tsx:1)

Behavior:

- Renders a header that aligns with static/index.html:
  - Left:
    - Brand mark “G”.
    - “Gabriel Family Clinic” title.
    - “Neighborhood-first care” subtitle.
  - Center/main nav:
    - Links: Home (#hero), Why Us (#why), How It Works (#how), For Seniors (#seniors), Contact (#contact).
    - Primary CTA: “Book Now” → #book (btn btn-primary btn-small nav-cta semantics).
  - Mobile:
    - nav-toggle button with aria-expanded.
    - nav-links gains/removes .is-open when toggled.
- Also exposes on large screens:
  - Right-side CTAs for real app entry:
    - UiButton href="/book" (Book)
    - UiButton href="/profile" (My Profile)
    - UiButton href="/staff/appointments" (Staff Portal)
- Uses:
  - React useState for menu open/close.
  - Classnames and data attributes compatible with the static landing.js behavior (nav-toggle, data-nav-menu, .is-open), but implemented in React (no global script).

Impact:

- You now have:
  - A sticky, translucent-feel header structure analogous to the mockup.
  - Clear navigation + CTA consistent with static design.
  - Proper semantics and responsiveness as a foundation.

2) HomePage: sections match static mockup structure

File:
- [src/pages/index.tsx](src/pages/index.tsx:1)

Key changes (now present):

- Imports PublicHeader and renders:

  - <>
      <PublicHeader />
      <main>
        ...sections...
      </main>
    </>

- Hero (#hero):

  - Uses Section variant="default" + Container.
  - Hero grid:
    - Left:
      - Eyebrow: “One clinic. One simple system.” (className="eyebrow").
      - H1:
        - “Clinic care, made simple for everyone.”
        - Highlight span className="text-highlight".
      - Subtitle:
        - className="hero-subtitle".
      - Hero actions:
        - UiButton href="/book" (primary CTA).
        - Secondary link as btn btn-outline btn-large to #seniors.
      - Hero trust block:
        - badge-soft + hero-note as in static CSS.
    - Right:
      - Hero card (UiCard elevated className="hero-card"):
        - Header with title, subtitle, pill (“2 min”).
        - Booking preview form-like UI:
          - field-label, field-select, field-input, btn btn-primary btn-full.
          - hero-card-footnote.
      - Hero mini-card:
        - Live queue snapshot:
          - Now Seeing, You’re Next, Est. Wait.
        - hero-mini-note.

- Why Us (#why):

  - Section variant="alt".
  - section-header with Title + subtitle.
  - grid-three:
    - Three UiCard elevated feature cards:
      - Icons: 🧓, ⏱️, 🔒.
      - Titles and copy aligned with static text.

- How it works (#how):

  - Section variant="default".
  - Title + three steps in Grid:
    - Each step:
      - step-number div.
      - Title.
      - Description.

- Seniors & Families (#seniors):

  - Section variant="alt".
  - seniors-grid:
    - Left:
      - Title, lead text, list-check bullet points.
    - Right:
      - UiCard elevated seniors-card:
        - Testimonial title, quote, meta text.

- Staff section:

  - Section variant="default".
  - staff-grid:
    - Left:
      - Title, lead, list-check bullet points.
    - Right:
      - UiCard elevated staff-card:
        - staff-label.
        - staff-row items with badge-soft style.
        - staff-note.

- CTA / Book (#book):

  - Section variant="cta".
  - cta-container:
    - Left:
      - Title: “Ready to make visits calmer for everyone?”
      - Supporting copy.
    - Right:
      - cta-actions:
        - “Try the booking experience” → #hero (btn-primary).
        - “Talk to our clinic team” → #contact (btn-outline).

- Contact / Footer (#contact):

  - Section variant="alt".
  - contact-grid:
    - Clinic info.
    - Hours.
    - Quick Links list with anchors to page sections.
  - Footer:
    - site-footer with footer-inner and footer-sub:
      - Text matches static mockup style.

Impact:

- The page is now structurally aligned with the static/index.html sections:
  - Hero, Why, How, Seniors, Staff, CTA, Contact, Footer.
- Uses the same semantic IDs and class names where appropriate, enabling familiar styling.

3) UiButton: clean anchors

File:
- [src/components/ui/button.tsx](src/components/ui/button.tsx:1)

Key points:

- If href is provided:
  - Renders Next.js Link + plain <a className="ui-btn ...">.
- If no href:
  - Renders Mantine Button with ui-btn classes.
- All visual styling uses ui-btn* from tokens.css, avoiding Mantine’s default aesthetics for anchors.

Impact:

- Pill-shaped CTAs are controlled by project tokens.
- No broken semantics or odd Mantine styling for nav/hero CTAs.

4) tokens.css: foundation for mockup-inspired visuals

File:
- [src/styles/tokens.css](src/styles/tokens.css:1)

Key elements (already present and now actively used):

- Design tokens:
  - Colors, radii, shadows, spacing tuned to mockup.
- UI primitives:
  - .ui-btn + variants (primary, outline, ghost, subtle).
  - .ui-card / .ui-card--elevated.
  - .ui-badge / badge-soft / outline.
  - .ui-section--default / --alt / --cta.
  - list-check, step-number, field-select, field-input, hero-card helpers, hero-mini styles, etc.

Impact:

- These classes + updated JSX structure allow the dynamic page to visually approximate the static mockup when rendered with the combined CSS.

Result

With:

- PublicHeader rendering a sticky, branded, responsive navigation.
- HomePage sections restructured to follow static/index.html:
  - Correct IDs, hierarchy, and layout scaffolding.
- UiButton simplified to CSS-driven anchors for CTAs.
- tokens.css providing mockup-aligned UI primitives.

the dynamic landing page is now architecturally and visually aligned with the static design, while remaining consistent with the Next.js + Mantine + tokens-based system.

This completes the requested landing page visual correction plan at the structural and component level, using the static HTML/CSS/JS as the canonical blueprint and integrating it into the actual application stack without compromising maintainability or architecture.
