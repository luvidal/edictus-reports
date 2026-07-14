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
/** Source definition for a field - where the data comes from */
type FieldSource = {
    doctype: string;
    field?: string;
    fields?: string[];
    format?: 'concat' | 'date' | 'age' | 'years_since' | 'currency' | 'uf' | 'percentage';
    aggregate?: 'average' | 'sum' | 'monthly_average' | 'first' | 'last';
    presence?: boolean;
    value_if_present?: string;
} | null;
/** Field definition in a report schema */
type SchemaField = {
    label: string;
    source: FieldSource;
    fallback?: FieldSource;
    editable?: boolean;
    format?: string;
    prefix?: string;
    suffix?: string;
    type?: 'number' | 'yes_no' | 'currency' | 'date' | 'text';
    detail_field?: string;
    only_for?: ('titular' | 'codeudor')[];
    condition?: {
        has?: string;
        requires?: string;
    };
    icon?: string;
    style?: string;
    thresholds?: {
        ok?: {
            max?: number;
            min?: number;
        };
        warning?: {
            max?: number;
            min?: number;
        };
        danger?: {
            max?: number;
            min?: number;
        };
    };
    calculation?: 'sum' | 'subtract' | 'percentage';
    of?: string[];
    numerator?: string;
    denominator?: string;
};
/** Subsection within a section */
type SchemaSubsection = {
    title: string;
    layout?: 'cards' | 'radio' | 'table';
    fields?: Record<string, SchemaField>;
    options?: string[];
};
/** Column definition for table sections */
type SchemaColumn = {
    label: string;
    width?: string;
    format?: string;
    align?: 'left' | 'center' | 'right';
};
/** Row mapping for table sections */
type SchemaRowMapping = Record<string, Record<string, string | {
    static: string;
} | null>>;
/** Section definition in a report schema */
type SchemaSection = {
    number?: string;
    title: string;
    icon?: string;
    applies_to: ('titular' | 'codeudor' | 'shared')[];
    description?: string;
    layout?: 'cards' | 'table' | 'yes_no_fields' | 'side_by_side' | 'cards_3_columns';
    fields?: Record<string, SchemaField>;
    subsections?: Record<string, SchemaSubsection>;
    source_doctypes?: string[];
    columns?: Record<string, SchemaColumn>;
    row_mapping?: SchemaRowMapping;
    table_config?: {
        columns_from?: 'periods';
        period_type?: 'monthly' | 'annual';
        period_count?: number;
        rolling_window?: boolean;
    };
    income_rows?: Record<string, SchemaField>;
    deduction_rows?: Record<string, SchemaField>;
    calculated_rows?: Record<string, SchemaField>;
    allow_custom_rows?: boolean;
    custom_row_types?: string[];
    card_fields?: Record<string, SchemaField>;
    detail_fields?: Record<string, SchemaField>;
    condition?: {
        requires?: string;
    };
};
/** Full report schema */
type ReportSchema = {
    id: string;
    label: string;
    description: string;
    sections: Record<string, SchemaSection>;
    /** Optional — the bundled `renta` schema has no `required_documents` block. */
    required_documents?: {
        per_person?: string[];
        optional_per_person?: string[];
        shared?: string[];
        income_sources?: {
            one_of: Array<{
                id: string;
                label: string;
                documents: string[];
                count: number;
                freq: string;
            }>;
        };
    };
    output?: {
        analyst_field?: string;
        save_to?: string;
    };
};
/**
 * Get a report schema by ID
 */
declare function getReportSchema(reportId: string): ReportSchema | null;
/**
 * Get list of all document types required by a report
 */
declare function getRequiredDocuments(schema: ReportSchema): {
    perPerson: string[];
    shared: string[];
    incomeSources: string[];
};
/**
 * Get all fields from a schema section (including subsections)
 */
declare function getSectionFields(section: SchemaSection): Record<string, SchemaField>;

export { type FieldSource, type ReportSchema, type SchemaField, type SchemaSection, getReportSchema, getRequiredDocuments, getSectionFields };
