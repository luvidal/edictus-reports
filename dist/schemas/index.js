'use strict';

// src/schemas/report_renta.json
var report_renta_default = {
  id: "renta",
  label: "Informe de Renta",
  description: "Analisis de ingresos y capacidad de pago del solicitante",
  sections: {
    solicitantes: {
      title: "Solicitante(s)",
      icon: "Users",
      card_fields: {
        name: {
          label: "Nombre"
        },
        rut: {
          label: "RUT"
        }
      },
      detail_fields: {
        nacionalidad: {
          label: "Nacionalidad",
          icon: "Globe"
        },
        sexo: {
          label: "Sexo",
          icon: "User"
        },
        edad: {
          label: "Edad",
          icon: "Cake"
        },
        profesion: {
          label: "Profesi\xF3n",
          icon: "Briefcase"
        },
        empleador: {
          label: "Nombre del Empleador",
          icon: "Building",
          source: { doctype: "liquidaciones-sueldo", field: "empleador" }
        },
        fecha_ingreso: {
          label: "Fecha de Ingreso",
          icon: "Calendar",
          source: { doctype: "liquidaciones-sueldo", field: "fecha_ingreso" }
        }
      }
    },
    ingresos: {
      title: "Ingresos",
      icon: "TrendingUp"
    },
    deudas: {
      title: "Deudas",
      icon: "CreditCard"
    },
    activos: {
      title: "Activos",
      icon: "Wallet"
    },
    resultado: {
      title: "Resultado",
      icon: "ClipboardCheck"
    }
  }
};

// src/schemas/index.ts
var schemas = {
  "renta": report_renta_default
};
function getReportSchema(reportId) {
  return schemas[reportId] || null;
}
function getRequiredDocuments(schema) {
  const required = schema.required_documents ?? {};
  const perPerson = new Set(required.per_person || []);
  const shared = new Set(required.shared || []);
  const incomeSources = /* @__PURE__ */ new Set();
  if (required.optional_per_person) {
    required.optional_per_person.forEach((d) => perPerson.add(d));
  }
  if (required.income_sources?.one_of) {
    required.income_sources.one_of.forEach((source) => {
      source.documents.forEach((d) => incomeSources.add(d));
    });
  }
  for (const section of Object.values(schema.sections)) {
    if (section.source_doctypes) {
      section.source_doctypes.forEach((d) => {
        if (section.applies_to?.includes("shared")) {
          shared.add(d);
        } else {
          perPerson.add(d);
        }
      });
    }
    const allFields = {
      ...section.fields,
      ...section.card_fields,
      ...section.detail_fields,
      ...section.income_rows,
      ...section.deduction_rows
    };
    for (const field of Object.values(allFields || {})) {
      if (field.source?.doctype) {
        if (section.applies_to?.includes("shared")) {
          shared.add(field.source.doctype);
        } else {
          perPerson.add(field.source.doctype);
        }
      }
      if (field.fallback?.doctype) {
        if (section.applies_to?.includes("shared")) {
          shared.add(field.fallback.doctype);
        } else {
          perPerson.add(field.fallback.doctype);
        }
      }
    }
    if (section.subsections) {
      for (const subsection of Object.values(section.subsections)) {
        for (const field of Object.values(subsection.fields || {})) {
          if (field.source?.doctype) {
            if (section.applies_to?.includes("shared")) {
              shared.add(field.source.doctype);
            } else {
              perPerson.add(field.source.doctype);
            }
          }
        }
      }
    }
  }
  return {
    perPerson: Array.from(perPerson),
    shared: Array.from(shared),
    incomeSources: Array.from(incomeSources)
  };
}
function getSectionFields(section) {
  const fields = { ...section.fields };
  if (section.subsections) {
    for (const subsection of Object.values(section.subsections)) {
      if (subsection.fields) {
        Object.assign(fields, subsection.fields);
      }
    }
  }
  if (section.income_rows) Object.assign(fields, section.income_rows);
  if (section.deduction_rows) Object.assign(fields, section.deduction_rows);
  if (section.card_fields) Object.assign(fields, section.card_fields);
  if (section.detail_fields) Object.assign(fields, section.detail_fields);
  return fields;
}

exports.getReportSchema = getReportSchema;
exports.getRequiredDocuments = getRequiredDocuments;
exports.getSectionFields = getSectionFields;
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map