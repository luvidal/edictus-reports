> **Archived.** Kept for reference; no longer maintained.

# @edictus/reports

**English** · [Español](README.es.md)

Formatting helpers and report schemas shared by the credit-analysis packages
([`informe`](https://github.com/luvidal/edictus-informe) and the income math in
[`edictus-document-ai`](https://github.com/luvidal/edictus-document-ai)).

## What's inside

- **Chilean formatting**: `displayCurrency`, `displayCurrencyCompact`,
  `displayUF`, `displayDate`, `calculateAge`, `toTitleCase`, `displayValue`.
- **Shared table class tokens** (`T`) so every report table looks the same.
- **Report schemas** (`@edictus/reports/schemas`) describe each report as
  declarative JSON: which sections it has, which fields go in each section, and
  which document and AI field each value comes from. The helpers are
  `getReportSchema`, `getRequiredDocuments` and `getSectionFields`.
- **31 tests** (Vitest).

## Usage

```ts
import { displayCurrency, displayUF } from '@edictus/reports'
import { getReportSchema, getRequiredDocuments } from '@edictus/reports/schemas'

displayCurrency(1250000)                 // CLP formatting
const schema = getReportSchema('renta')  // declarative report definition
```

## Development

```bash
npm test        # Vitest
npm run build   # tsup → dist/ (ESM + CJS + type declarations)
```
