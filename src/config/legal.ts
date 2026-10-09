import { CONTACT_EMAIL } from "./contact";

// Datos legales de AIgency.X. Meta compara la web con los documentos al verificar el negocio.
// Nombre legal usado en la verificación de Meta: calza exacto con la factura de teléfono (Felix) y está contenido
// en el estado de cuenta de CommBank ("TOMAS ALFREDO CROVETTO MONSALVES"). El ABN lo registra como "CROVETTO, TOMAS".
export const LEGAL = {
  brand: "AIgency.X",
  legalName: "Tomas Crovetto Monsalves",
  abn: "38 465 606 507",
  // Estado del ABN (QLD).
  jurisdiction: "Queensland, Australia",
  email: CONTACT_EMAIL,
  updated: "2026-10-09",
};

export const hasLegalIdentity = Boolean(LEGAL.legalName && LEGAL.abn);
