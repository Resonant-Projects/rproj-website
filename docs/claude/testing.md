# Testing

Test commands and validation scripts for this codebase.

## Test Commands

```bash
# Full suite
bun run test:complete               # All tests: contrast, CSS, visual, a11y

# Accessibility
bun run test:accessibility          # Puppeteer + axe-core (WCAG 2.1 AA)
bun run test:accessibility:headed   # Same but with visible browser

# Validation
bun run validate:css                # Validate CSS variable usage
bun run validate:notion             # Verify Notion env config
```

## Test Scripts

Custom testing scripts in `scripts/`:

| Script                      | Purpose                                                                |
| --------------------------- | ---------------------------------------------------------------------- |
| `accessibility-test.js`     | Puppeteer + axe-core WCAG testing                                      |
| `contrast-checker.js`       | Color contrast validation. Use `--palette` flag for full palette check |
| `css-variable-validator.js` | Validates CSS variable definitions and usage                           |
| `visual-verification.js`    | Visual regression testing                                              |
| `content-analyzer.js`       | Readability and content quality analysis                               |

## Running Individual Scripts

```bash
# Contrast check with full palette
node scripts/contrast-checker.js --palette

# CSS variable validation
node scripts/css-variable-validator.js

# Visual verification
node scripts/visual-verification.js
```
