> **Archivado.** Se conserva como referencia; ya no se mantiene.

# @edictus/reports

[English](README.md) · **Español**

Funciones de formato y esquemas de informes que comparten los paquetes de
análisis de crédito ([`informe`](https://github.com/luvidal/edictus-informe) y
la matemática de ingresos de
[`edictus-document-ai`](https://github.com/luvidal/edictus-document-ai)).

## Qué incluye

- **Formatos chilenos**: `displayCurrency`, `displayCurrencyCompact`,
  `displayUF`, `displayDate`, `calculateAge`, `toTitleCase`, `displayValue`.
- **Clases compartidas para tablas** (`T`), para que todas las tablas de los
  informes se vean iguales.
- **Esquemas de informes** (`@edictus/reports/schemas`). Cada informe se
  describe en JSON declarativo:
  - qué secciones tiene;
  - qué campos van en cada sección;
  - de qué documento y de qué campo extraído por la IA sale cada valor.

  Las funciones para leerlos son `getReportSchema`, `getRequiredDocuments` y
  `getSectionFields`.
- **31 tests** (Vitest).

## Uso

```ts
import { displayCurrency, displayUF } from '@edictus/reports'
import { getReportSchema, getRequiredDocuments } from '@edictus/reports/schemas'

displayCurrency(1250000)                 // formato en pesos chilenos
const schema = getReportSchema('renta')  // definición declarativa del informe
```

## Desarrollo

```bash
npm test        # Vitest
npm run build   # tsup → dist/ (ESM + CJS + declaraciones de tipos)
```
