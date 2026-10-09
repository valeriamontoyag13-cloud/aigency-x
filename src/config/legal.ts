import { CONTACT_EMAIL } from "./contact";

// Datos legales de AIgency.X. Meta compara la web con los documentos al verificar el negocio.
// El nombre legal es el nombre completo tal como aparece en el estado de cuenta de CommBank, que es el
// documento que acepta Meta (el ABN lo registra abreviado como "CROVETTO, TOMAS").
export const LEGAL = {
  brand: "AIgency.X",
  legalName: "Tomas Alfredo Crovetto Monsalves",
  abn: "38 465 606 507",
  // Estado del ABN (QLD).
  jurisdiction: "Queensland, Australia",
  email: CONTACT_EMAIL,
  updated: "2026-10-09",
};

export const hasLegalIdentity = Boolean(LEGAL.legalName && LEGAL.abn);
