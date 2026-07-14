import { describe, it, expect } from 'vitest'
import {
    getReportSchema,
    getRequiredDocuments,
    getSectionFields,
    type ReportSchema,
} from '../schemas'

// The `situation` schema was removed from this package in 79c9224 (report
// rendering moved into the host app), so these helpers are now generic: they
// operate on whatever schema the HOST passes in. The fixture below stands in
// for such a host schema — it is deliberately NOT loaded from the registry.
const hostSchema: ReportSchema = {
    id: 'host-report',
    label: 'Host Report',
    description: 'Stand-in for a host-owned schema',
    required_documents: {
        per_person: ['cedula-identidad', 'liquidaciones-sueldo'],
        optional_per_person: ['certificado-matrimonio'],
        shared: ['informe-deuda'],
    },
    sections: {
        personales: {
            label: 'Datos Personales',
            applies_to: ['person'],
            fields: {
                nombres_apellidos: { label: 'Nombres' },
                cedula_identidad: { label: 'Cédula' },
            },
            subsections: {
                domicilio: {
                    label: 'Domicilio',
                    fields: {
                        direccion: { label: 'Dirección' },
                        comuna: { label: 'Comuna' },
                    },
                },
                estado_civil: {
                    label: 'Estado Civil',
                    fields: { estado_civil: { label: 'Estado civil' } },
                },
            },
        },
        vehiculos: {
            label: 'Vehículos',
            applies_to: ['shared'],
            source_doctypes: ['padron'],
            fields: { patente: { label: 'Patente' } },
        },
    },
} as unknown as ReportSchema

describe('getReportSchema', () => {
    it('returns the renta schema', () => {
        const schema = getReportSchema('renta')
        expect(schema).not.toBeNull()
        expect(schema!.id).toBe('renta')
        expect(schema!.label).toBe('Informe de Renta')
    })

    it('returns null for a schema this package no longer bundles', () => {
        // Guards the 79c9224 removal: `situation` lives in the host now.
        expect(getReportSchema('situation')).toBeNull()
    })

    it('returns null for unknown schema', () => {
        expect(getReportSchema('nonexistent')).toBeNull()
    })
})

describe('getRequiredDocuments', () => {
    it('returns declared per-person and shared documents', () => {
        const docs = getRequiredDocuments(hostSchema)

        expect(docs.perPerson).toContain('cedula-identidad')
        expect(docs.perPerson).toContain('liquidaciones-sueldo')
        expect(docs.shared).toContain('informe-deuda')
    })

    it('folds optional per-person documents into perPerson', () => {
        expect(getRequiredDocuments(hostSchema).perPerson).toContain('certificado-matrimonio')
    })

    it('picks up source_doctypes from sections, routed by applies_to', () => {
        // `vehiculos` is applies_to: ['shared'], so padron lands in shared.
        expect(getRequiredDocuments(hostSchema).shared).toContain('padron')
    })

    it('tolerates a schema with no required_documents block', () => {
        // The bundled `renta` schema declares no `required_documents` and no
        // `applies_to`. Both used to throw (`Cannot read properties of undefined`);
        // now the docs are derived from section field sources alone.
        const renta = getReportSchema('renta')!
        expect(() => getRequiredDocuments(renta)).not.toThrow()
        expect(getRequiredDocuments(renta).perPerson).toContain('liquidaciones-sueldo')
        expect(getRequiredDocuments(renta).shared).toEqual([])
    })
})

describe('getSectionFields', () => {
    it('returns top-level fields', () => {
        const fields = getSectionFields(hostSchema.sections['personales'])

        expect(fields).toHaveProperty('nombres_apellidos')
        expect(fields).toHaveProperty('cedula_identidad')
    })

    it('hoists subsection fields', () => {
        const fields = getSectionFields(hostSchema.sections['personales'])

        expect(fields).toHaveProperty('direccion')
        expect(fields).toHaveProperty('comuna')
        expect(fields).toHaveProperty('estado_civil')
    })

    it('includes card_fields and detail_fields', () => {
        const schema = getReportSchema('renta')!
        const fields = getSectionFields(schema.sections['solicitantes'])

        expect(fields).toHaveProperty('name')
        expect(fields).toHaveProperty('rut')
        expect(fields).toHaveProperty('nacionalidad')
    })
})
