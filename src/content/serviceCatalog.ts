import type { BusinessKey } from "@/content/demoBusinesses";
import { fromUsd, type Currency } from "@/lib/money";

/**
 * Services the demo offers to tick for each kind of business, with an
 * approximate price in each currency of the audience. Prices are only a
 * starting point for the demo, not a quote.
 */
type HandSet = "CLP" | "COP" | "USD";
export type CatalogService = { es: string; en: string; price: Record<HandSet, number> };

/** The example price of a service in any currency. */
export function priceIn(service: CatalogService, currency: Currency) {
  return currency in service.price ? service.price[currency as HandSet] : fromUsd(service.price.USD, currency);
}

const s = (es: string, en: string, CLP: number, COP: number, USD: number): CatalogService => ({
  es,
  en,
  price: { CLP, COP, USD },
});

export const serviceCatalog: Record<BusinessKey, CatalogService[]> = {
  salon: [
    s("Manicure semipermanente", "Gel manicure", 18000, 60000, 30),
    s("Pedicure spa", "Spa pedicure", 20000, 70000, 40),
    s("Corte de pelo", "Haircut", 15000, 45000, 45),
    s("Tintura", "Hair color", 35000, 120000, 90),
    s("Limpieza facial", "Facial", 30000, 100000, 70),
    s("Lifting de pestañas", "Lash lift", 25000, 80000, 60),
  ],
  barberia: [
    s("Corte", "Haircut", 12000, 30000, 30),
    s("Corte + barba", "Cut + beard", 18000, 45000, 40),
    s("Perfilado de barba", "Beard trim", 8000, 20000, 20),
    s("Fade", "Fade", 13000, 35000, 35),
    s("Corte niño", "Kids cut", 10000, 25000, 25),
    s("Diseño de cejas", "Eyebrow design", 5000, 15000, 15),
  ],
  unas: [
    s("Manicure semipermanente", "Gel manicure", 15000, 50000, 30),
    s("Uñas acrílicas", "Acrylic nails", 25000, 90000, 50),
    s("Pedicure semipermanente", "Gel pedicure", 18000, 60000, 35),
    s("Polygel", "Polygel", 28000, 100000, 55),
    s("Esmaltado tradicional", "Regular polish", 8000, 25000, 15),
    s("Retiro de acrílico", "Acrylic removal", 7000, 20000, 15),
  ],
  pestanas: [
    s("Extensiones clásicas", "Classic lash extensions", 25000, 90000, 60),
    s("Lifting de pestañas", "Lash lift", 20000, 70000, 50),
    s("Volumen ruso", "Russian volume", 35000, 130000, 85),
    s("Retoque de extensiones", "Lash fill", 15000, 55000, 35),
    s("Diseño de cejas", "Brow shaping", 10000, 35000, 25),
    s("Laminado de cejas", "Brow lamination", 18000, 65000, 45),
  ],
  clinica: [
    s("Consulta general", "General check-up", 25000, 80000, 80),
    s("Sesión de kinesiología", "Physio session", 22000, 70000, 70),
    s("Nutricionista", "Nutritionist", 28000, 90000, 90),
    s("Sesión de psicología", "Therapy session", 35000, 120000, 120),
    s("Control pediátrico", "Pediatric check-up", 25000, 80000, 90),
    s("Limpieza dental", "Dental cleaning", 30000, 100000, 90),
  ],
  veterinaria: [
    s("Consulta veterinaria", "Vet check-up", 25000, 80000, 60),
    s("Vacuna antirrábica", "Rabies vaccine", 15000, 50000, 30),
    s("Control de cachorro", "Puppy check-up", 20000, 65000, 45),
    s("Desparasitación", "Deworming", 10000, 35000, 25),
    s("Baño y peluquería", "Bath and grooming", 18000, 60000, 40),
    s("Limpieza dental", "Dental cleaning", 60000, 200000, 150),
  ],
  otro: [
    s("Primera atención", "First visit", 20000, 60000, 40),
    s("Servicio estándar", "Standard service", 30000, 100000, 60),
    s("Servicio premium", "Premium service", 50000, 180000, 100),
    s("Visita a domicilio", "Home visit", 25000, 80000, 50),
    s("Asesoría", "Consultation", 35000, 120000, 70),
    s("Mantención mensual", "Monthly maintenance", 40000, 150000, 80),
  ],
};
