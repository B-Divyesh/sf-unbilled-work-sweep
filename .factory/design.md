# Visual thesis: the midnight paperwork garden

## Direction and purpose

Unbilled Work Sweep uses surreal editorial scenery. A weekly paper trail becomes a moonlit garden: finished work is a stack of cream paper, invoices are coral envelopes, and missed value glows like small moons. The scene makes invisible work feel findable without pretending the app automates accounting. The working interface keeps the same paper, ink, and stamp language while putting dense reconciliation data first.

## Palette

- `ink` `#17243A`: primary text and deep night sky.
- `paper` `#F5EEDB`: warm page background.
- `paper-bright` `#FFF9EA`: raised surfaces.
- `mist` `#D8E3DD`: quiet field and borders.
- `coral` `#C9473D`: primary action and alert stamp.
- `coral-dark` `#8D2925`: accessible action hover.
- `moss` `#365B43`: completed and matched states.
- `gold` `#B07812`: review-needed accents, paired with text.
- `night` `#101927`: dark treatment background.
- `night-paper` `#1B2940`: dark raised surfaces.

The palette comes from old invoice paper seen under a blue night sky. Coral marks demand attention; moss means a reviewed match. The default light treatment suits a weekly desk task. The install splash and offline page use the dark treatment.

## Type

Display: Georgia, `Times New Roman`, serif. Its high-contrast forms read like an editorial spread and give totals appropriate weight. Body and tables: ui-sans-serif, system-ui, sans-serif. It stays crisp for CSV controls and tabular figures. No font files or third-party font requests are needed.

Scale: 16px body, 18px lead, 22px section label, 32–64px display. Body line-height is 1.55. Tables use tabular figures.

## Spacing and shape

An 8px base scale drives 8, 16, 24, 32, 48, 64, and 96px gaps. The hero uses an offset editorial grid, not a centered template. Panels resemble clipped sheets: 3px ink borders, 0–18px corner cuts, and hard offset shadows. Pills are reserved for statuses. Touch targets are at least 44px.

## Interaction grammar

Actions feel like moving paper across a desk. Import zones accept click, keyboard, or drop. Match suggestions appear beside the original name and must be confirmed. Checklist items receive a coral-to-moss stamp when checked. Undo is available after destructive clearing. The mobile layout converts the table into labelled paper slips and keeps actions in document order.

## Motion policy

One signature motion: newly reconciled rows rise by 8px and settle like placed sheets over 220ms. Hero moons drift once on entry over 700ms. Nothing loops. With `prefers-reduced-motion: reduce`, transforms and smooth scrolling are removed; state changes use an immediate border and color change.

## Asset plan and provenance

The original hero is a wide surreal editorial still life: a cream-paper landscape, an oversized moon as a coin, coral invoice envelopes, a narrow river of ledger lines, and a small green filing sprout. It contains no interface copy, logos, brands, or people. The right side holds the subject while the left stays calm enough for page rhythm.

Prompt sheet:

> Use case: stylized-concept. Asset type: landing page hero and social preview. Primary request: a surreal editorial illustration about finding completed freelance work before invoicing. Scene: a moonlit landscape built from folded cream invoice paper, a giant pale-gold moon shaped like a coin, coral envelopes emerging from a dark blue ledger river, and one small moss-green filing sprout. Style: sophisticated cut-paper editorial collage with subtle screenprint grain, tactile paper edges, no photorealism. Composition: wide 3:2 landscape, calm negative space at upper left, visual weight at lower right, clear silhouette at thumbnail size. Lighting: cool midnight blue with warm paper highlights. Palette: ink navy, warm cream, coral red, moss green, muted gold. Avoid: text, letters, numbers, logos, watermarks, people, hands, currencies, brand marks, gradients, glossy 3D, generic office stock imagery.

Generated with the factory image model (`factory-image`) on 2026-08-28 using `/opt/fleet/lib/gen-image.sh`. The selected original source and prompt sidecar live in `assets/src/`. Shipping WebP and Open Graph crops are derived locally. Generated imagery is disclosed in the footer.

All UI symbols are hand-authored geometric SVG or text characters. They are original and use no external icon library.
