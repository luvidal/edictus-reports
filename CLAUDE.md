# @edictus/reports — Report Generation Library

PDF generation, HTML report templates, formatting utilities, and report schemas.
Extracted from [jogi](../jogi) to isolate report rendering complexity and enable independent testing.

## Compact Instructions

When compacting, preserve: file paths changed, errors found, decisions made, schema changes. Drop: full file contents already read, tool output bodies.

## Communication Style

- **No emotional validation** — never say "I understand your frustration". Results matter, not words.
- **No excessive apologies** — don't apologize repeatedly. Fix the problem.
- **Be direct** — state facts, propose solutions, execute. Skip the fluff.
- **Ask for input** — when stuck or facing multiple approaches, ask rather than guessing.

## Tech Stack

- **Runtime**: Node.js (server-side only, no React)
- **Build**: tsup (ESM + CJS + types)
- **Tests**: vitest

## Project Structure

```
src/
├── index.ts              # Main entry — re-exports pdf, utils, styles, types
├── pdf.ts                # PDF generation (HTML templates, CSS, print utilities)
├── utils.ts              # Formatting (displayValue, displayCurrency, displayDate, etc.)
├── styles.ts             # T object — shared Tailwind-style class tokens
├── types.ts              # All type definitions (ReportSection, CompanyBranding, etc.)
└── schemas/              # Report data schemas (e.g. report_renta.json)
    └── index.ts          # Schema exports
```

## Code Rules

1. **File naming** → lowercase, no hyphens/underscores (e.g., `pdfutils.ts`)
2. **No `@/` imports** → all imports are relative within `src/`
3. **Two entry points**:
   - `@edictus/reports` — main (pdf, utils, styles, types)
   - `@edictus/reports/schemas` — report schemas only
4. **No domain logic** — no hardcoded report content or field names. All structure comes from schemas/props
5. **API stability** — exported function signatures must stay backward-compatible with jogi. Breaking changes require updating jogi's report generation code
6. **README.md maintenance** — update this CLAUDE.md when key behaviors change
7. **Test coverage** — after implementing a feature, check if tests exist. Update or write tests. Never leave a feature without test coverage.
8. **Planning** — for non-trivial changes, write a plan to `docs/plans/` before implementing

## Commands

```bash
npm run build        # Build dist/ (ESM + CJS + types)
npm run dev          # Build in watch mode
npm test             # Run unit tests
npm run test:watch   # Watch mode
```

## Validation

Use `npx tsc --noEmit` for fast type checking. Run `npm run build` to verify bundling. Run `npm test` before committing.

## Consumer Integration

Consumed by jogi via GitHub reference:
```json
"@edictus/reports": "github:luvidal/edictus-reports#<40-char-sha>"
```

Primary consumer: `~/GitHub/jogi` — see its `pages/api/` for usage context.
