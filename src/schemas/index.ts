/**
 * Report Schema Types and Loader
 *
 * This module provides types and utilities for loading report schemas
 * from JSON files.
 *
 * The schema defines:
 * - Report sections and their fields
 * - Field sources (which document type + AI field provides the data)
 * - Field formatting and display options
 * - Whether fields are editable
 */

import reportRenta from './report_renta.json'

// ============================================================================
// Types
// ============================================================================

/** Source definition for a field - where the data comes from */
export type FieldSource = {
    doctype: string
    field?: string
    fields?: string[]  // For concatenating multiple fields
    format?: 'concat' | 'date' | 'age' | 'years_since' | 'currency' | 'uf' | 'percentage'
    aggregate?: 'average' | 'sum' | 'monthly_average' | 'first' | 'last'
    presence?: boolean  // Just check if document exists
    value_if_present?: string  // Value to show if document exists
} | null

/** Field definition in a report schema */
export type SchemaField = {
    label: string
    source: FieldSource
    fallback?: FieldSource
    editable?: boolean
    format?: string
    prefix?: string
    suffix?: string
    type?: 'number' | 'yes_no' | 'currency' | 'date' | 'text'
    detail_field?: string  // For yes_no fields, the detail text field
    only_for?: ('titular' | 'codeudor')[]
    condition?: { has?: string; requires?: string }
    icon?: string
    style?: string
    thresholds?: {
        ok?: { max?: number; min?: number }
        warning?: { max?: number; min?: number }
        danger?: { max?: number; min?: number }
    }
    calculation?: 'sum' | 'subtract' | 'percentage'
    of?: string[]
    numerator?: string
    denominator?: string
}

/** Subsection within a section */
type SchemaSubsection = {
    title: string
    layout?: 'cards' | 'radio' | 'table'
    fields?: Record<string, SchemaField>
    options?: string[]  // For radio layout
}

/** Column definition for table sections */
type SchemaColumn = {
    label: string
    width?: string
    format?: string
    align?: 'left' | 'center' | 'right'
}

/** Row mapping for table sections */
type SchemaRowMapping = Record<string, Record<string, string | { static: string } | null>>

/** Section definition in a report schema */
export type SchemaSection = {
    number?: string
    title: string
    icon?: string
    applies_to: ('titular' | 'codeudor' | 'shared')[]
    description?: string
    layout?: 'cards' | 'table' | 'yes_no_fields' | 'side_by_side' | 'cards_3_columns'
    fields?: Record<string, SchemaField>
    subsections?: Record<string, SchemaSubsection>
    // Table-specific
    source_doctypes?: string[]
    columns?: Record<string, SchemaColumn>
    row_mapping?: SchemaRowMapping
    table_config?: {
        columns_from?: 'periods'
        period_type?: 'monthly' | 'annual'
        period_count?: number
        rolling_window?: boolean
    }
    // Income table specific
    income_rows?: Record<string, SchemaField>
    deduction_rows?: Record<string, SchemaField>
    calculated_rows?: Record<string, SchemaField>
    allow_custom_rows?: boolean
    custom_row_types?: string[]
    // Card layout specific
    card_fields?: Record<string, SchemaField>
    detail_fields?: Record<string, SchemaField>
    // Condition
    condition?: { requires?: string }
}

/** Full report schema */
export type ReportSchema = {
    id: string
    label: string
    description: string
    sections: Record<string, SchemaSection>
    /** Optional — the bundled `renta` schema has no `required_documents` block. */
    required_documents?: {
        per_person?: string[]
        optional_per_person?: string[]
        shared?: string[]
        income_sources?: {
            one_of: Array<{
                id: string
                label: string
                documents: string[]
                count: number
                freq: string
            }>
        }
    }
    output?: {
        analyst_field?: string
        save_to?: string
    }
}

// ============================================================================
// Schema Registry
// ============================================================================

const schemas: Record<string, ReportSchema> = {
    'renta': reportRenta as unknown as ReportSchema,
}

// ============================================================================
// Loader Functions
// ============================================================================

/**
 * Get a report schema by ID
 */
export function getReportSchema(reportId: string): ReportSchema | null {
    return schemas[reportId] || null
}

/**
 * Get list of all document types required by a report
 */
export function getRequiredDocuments(schema: ReportSchema): {
    perPerson: string[]
    shared: string[]
    incomeSources: string[]
} {
    // `required_documents` is optional in practice — the bundled `renta` schema
    // omits it entirely, and a host schema may too. Treat absent as empty rather
    // than throwing; sections are still scanned below.
    const required = schema.required_documents ?? {}

    const perPerson = new Set<string>(required.per_person || [])
    const shared = new Set<string>(required.shared || [])
    const incomeSources = new Set<string>()

    // Add optional per-person docs
    if (required.optional_per_person) {
        required.optional_per_person.forEach(d => perPerson.add(d))
    }

    // Add income source docs
    if (required.income_sources?.one_of) {
        required.income_sources.one_of.forEach(source => {
            source.documents.forEach(d => incomeSources.add(d))
        })
    }

    // Scan sections for additional document types
    for (const section of Object.values(schema.sections)) {
        if (section.source_doctypes) {
            section.source_doctypes.forEach(d => {
                if (section.applies_to?.includes('shared')) {
                    shared.add(d)
                } else {
                    perPerson.add(d)
                }
            })
        }

        // Scan field sources
        const allFields = {
            ...section.fields,
            ...section.card_fields,
            ...section.detail_fields,
            ...section.income_rows,
            ...section.deduction_rows,
        }

        for (const field of Object.values(allFields || {})) {
            if (field.source?.doctype) {
                if (section.applies_to?.includes('shared')) {
                    shared.add(field.source.doctype)
                } else {
                    perPerson.add(field.source.doctype)
                }
            }
            if (field.fallback?.doctype) {
                if (section.applies_to?.includes('shared')) {
                    shared.add(field.fallback.doctype)
                } else {
                    perPerson.add(field.fallback.doctype)
                }
            }
        }

        // Scan subsections
        if (section.subsections) {
            for (const subsection of Object.values(section.subsections)) {
                for (const field of Object.values(subsection.fields || {})) {
                    if (field.source?.doctype) {
                        if (section.applies_to?.includes('shared')) {
                            shared.add(field.source.doctype)
                        } else {
                            perPerson.add(field.source.doctype)
                        }
                    }
                }
            }
        }
    }

    return {
        perPerson: Array.from(perPerson),
        shared: Array.from(shared),
        incomeSources: Array.from(incomeSources),
    }
}

/**
 * Get all fields from a schema section (including subsections)
 */
export function getSectionFields(section: SchemaSection): Record<string, SchemaField> {
    const fields: Record<string, SchemaField> = { ...section.fields }

    if (section.subsections) {
        for (const subsection of Object.values(section.subsections)) {
            if (subsection.fields) {
                Object.assign(fields, subsection.fields)
            }
        }
    }

    if (section.income_rows) Object.assign(fields, section.income_rows)
    if (section.deduction_rows) Object.assign(fields, section.deduction_rows)
    if (section.card_fields) Object.assign(fields, section.card_fields)
    if (section.detail_fields) Object.assign(fields, section.detail_fields)

    return fields
}
