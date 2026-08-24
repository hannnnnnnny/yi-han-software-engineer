# Eucalyptus Light Theme Design

## Goal

Replace the current dark portfolio theme with a calm, professional light theme while preserving the site's content, layout, navigation, project links, Ctrl+K palette, PR workflow, filters, and responsive behaviour.

## Visual Direction

- Warm white page background: `#f7f8f3`
- Deep eucalyptus primary: `#245746`
- Pale sage surfaces: `#e4ece5`
- Dark green-grey text: `#24312c`
- Restrained blossom pink accent: `#d97898`
- White content surfaces with green-tinted borders and shadows
- Editorial developer-portfolio character, without dark cyberpunk styling, neon glow, or heavy gradients

## Scope

The implementation will update `styles.css`, the browser theme colour in `index.html`, and the SVG favicon/social preview assets. It will not change visible copy, project ordering, page structure, or JavaScript behaviour.

## Accessibility And Responsive Requirements

- Preserve visible keyboard focus indicators.
- Maintain readable text and control contrast.
- Support 375px mobile width without horizontal overflow or overlap.
- Preserve reduced-motion behaviour already present in the site.

## Verification

- Run structural checks for local assets and stale dark-theme metadata.
- Test desktop and 375px mobile layouts in Playwright.
- Verify Ctrl+K, project filters, process tabs, and the PR workflow control.
- Confirm zero browser console errors and successful asset requests.

## Delivery And Rollback

- Feature branch: `feat/eucalyptus-light-theme`
- Pull request into `main`, followed by merge after checks pass
- Dark-theme rollback commit: `6da88ebdf9951c1da166a6ba7e8cc87fbbcc5a87`
- A future rollback will use a normal revert commit so repository history remains intact.
