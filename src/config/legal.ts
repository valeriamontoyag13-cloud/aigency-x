import { CONTACT_EMAIL } from "./contact";

// Datos legales de AIgency.X. Deben coincidir EXACTAMENTE con el registro del ABN
// (abr.business.gov.au): Meta compara la web con los documentos al verificar el negocio.
export const LEGAL = {
  brand: "AIgency.X",
  // TODO: nombre completo tal como figura en el ABN.
  legalName: "",
  // TODO: 11 dígitos, con el formato "12 345 678 901".
  abn: "",
  // Confirmar con el estado que muestra el ABN Lookup.
  jurisdiction: "Queensland, Australia",
  email: CONTACT_EMAIL,
  updated: "2026-10-07",
};

export const hasLegalIdentity = Boolean(LEGAL.legalName && LEGAL.abn);
