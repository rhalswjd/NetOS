# Project Engineering Rules

## Mission
Maintain a polished static OS/Network knowledge archive with visualization-first navigation and Markdown-first content.

## Design
- Follow `.agent/skills/apple-design/SKILL.md` when available.
- Use the reference images for spatial guidance; no generic blog homepage.
- Network uses an interactive cylindrical OSI stack in a Sierra Blue family.
- OS uses an interactive architecture explorer.
- Subtle motion, immediate feedback, reduced-motion support.
- Maintain visual consistency across custom and Starlight pages.

## Architecture
- Astro + Starlight + strict TypeScript; static only, no backend or database.
- One metadata registry, stable topic IDs, automatic bidirectional relationships.
- Never duplicate content, classification logic, topic counts or document cards.

## Content
- Validated Markdown/MDX frontmatter; every referenced topic must exist.
- All four document types share the registry and auto-update on builds.
- Never invent completed lab measurements or findings.

## Engineering
- Semantic HTML, accessible SVG, lightweight CSS, base-safe links.
- Keyboard, touch, mobile and reduced-motion support.
- Validate relationships before builds; run meaningful checks and tests.

## Completion
- Working pages and navigation, not mockups.
- Adding Markdown must not require editing UI code.
- Build and tests must pass; document deployment and remaining steps honestly.
