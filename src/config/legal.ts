import { CONTACT_EMAIL } from "./contact";

// Datos legales de AIgency.X. Deben coincidir EXACTAMENTE con el registro del ABN
// (abr.business.gov.au): Meta compara la web con los documentos al verificar el negocio.
export const LEGAL = {
  brand: "AIgency.X",
  legalName: "Tomas Crovetto",
  abn: "38 465 606 507",
  // Estado del ABN (QLD).
  jurisdiction: "Queensland, Australia",
  email: CONTACT_EMAIL,
  updated: "2026-10-07",
};

export const hasLegalIdentity = Boolean(LEGAL.legalName && LEGAL.abn);
