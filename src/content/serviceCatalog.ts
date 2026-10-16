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
  clinica: [
    s("Consulta general", "General check-up", 25000, 80000, 80),
    s("Sesión de kinesiología", "Physio session", 22000, 70000, 70),
    s("Nutricionista", "Nutritionist", 28000, 90000, 90),
    s("Sesión de psicología", "Therapy session", 35000, 120000, 120),
    s("Control pediátrico", "Pediatric check-up", 25000, 80000, 90),
    s("Examen preventivo", "Preventive exam", 30000, 100000, 100),
  ],
  taller: [
    s("Mantención 10.000 km", "10,000 km service", 85000, 350000, 160),
    s("Cambio de aceite", "Oil change", 45000, 180000, 80),
    s("Revisión de frenos", "Brake check", 20000, 80000, 35),
    s("Cambio de pastillas de freno", "Brake pad replacement", 60000, 250000, 150),
    s("Alineación y balanceo", "Alignment and balancing", 30000, 120000, 55),
    s("Diagnóstico con escáner", "Scanner diagnosis", 25000, 90000, 60),
  ],
  tecnico: [
    s("Mantención de aire acondicionado", "AC service", 35000, 150000, 90),
    s("Instalación de aire 12.000 BTU", "12,000 BTU AC installation", 120000, 450000, 350),
    s("Visita de diagnóstico", "Diagnostic visit", 20000, 60000, 60),
    s("Carga de gas", "Gas refill", 45000, 180000, 120),
    s("Punto eléctrico", "Electrical outlet", 25000, 80000, 80),
    s("Visita de gasfitería", "Plumbing visit", 25000, 80000, 90),
  ],
  entrenamiento: [
    s("Plan mensual", "Monthly plan", 45000, 150000, 60),
    s("Clase suelta", "Drop-in class", 8000, 25000, 15),
    s("Entrenamiento personal", "Personal training", 20000, 70000, 50),
    s("Clase de yoga", "Yoga class", 10000, 30000, 20),
    s("Plan trimestral", "Quarterly plan", 120000, 400000, 160),
    s("Evaluación física", "Fitness assessment", 15000, 50000, 40),
  ],
  tatuajes: [
    s("Tatuaje pequeño", "Small tattoo", 40000, 150000, 100),
    s("Tatuaje mediano", "Medium tattoo", 80000, 300000, 200),
    s("Sesión de 3 horas", "3-hour session", 150000, 550000, 350),
    s("Piercing", "Piercing", 20000, 70000, 50),
    s("Retoque", "Touch-up", 25000, 80000, 60),
    s("Diseño personalizado", "Custom design", 30000, 100000, 80),
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
