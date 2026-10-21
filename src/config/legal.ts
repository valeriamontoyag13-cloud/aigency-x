import { CONTACT_EMAIL } from "./contact";

// Datos legales de AIgency.X. Mientras se constituye la SpA en Chile, el proveedor es Tomás como persona
// natural chilena, igual que en el contrato del kit de cliente nuevo. El RUT no se publica en la web.
export const LEGAL = {
  brand: "AIgency.X",
  legalName: "Tomas Crovetto Monsalves",
  // Socia que opera AIgency.X junto a Tomás; aparece en el pie de página.
  partnerName: "Valeria Montoya Galeano",
  // Ley aplicable y tribunales, como en el contrato.
  jurisdiction: "Chile",
  courts: "Santiago",
  email: CONTACT_EMAIL,
  updated: "2026-10-21",
};

export const hasLegalIdentity = Boolean(LEGAL.legalName);
