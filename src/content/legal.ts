import { LEGAL } from "@/config/legal";
import type { AppLocale } from "@/i18n/routing";

export type LegalSection = {
  id: string;
  heading: string;
  paragraphs?: string[];
  items?: string[];
  after?: string[];
};

export type LegalDoc = {
  title: string;
  description: string;
  updatedLabel: string;
  intro: string;
  sections: LegalSection[];
};

const pending = "[pendiente]";
const name = LEGAL.legalName || pending;
const abn = LEGAL.abn || pending;
const { brand, email, jurisdiction } = LEGAL;

const privacyEs: LegalDoc = {
  title: "Política de privacidad",
  description: `Cómo ${brand} trata los datos personales de quienes visitan el sitio y de quienes conversan con los negocios que usan nuestros sistemas.`,
  updatedLabel: "Última actualización",
  intro: `En ${brand} ayudamos a negocios basados en citas a responder mensajes, agendar y hacer seguimiento a sus clientes. Esta política explica qué datos tratamos, para qué y cómo puedes ejercer tus derechos.`,
  sections: [
    {
      id: "quienes-somos",
      heading: "1. Quiénes somos",
      paragraphs: [
        `${brand} es un nombre comercial de ${name}, comerciante individual registrado en Australia con ABN ${abn} («${brand}» o «nosotros»). Para cualquier tema de privacidad, escríbenos a ${email}.`,
      ],
    },
    {
      id: "alcance",
      heading: "2. A quién aplica",
      items: [
        "A las personas que visitan aigency-x.com o nos escriben: prospectos y clientes de AIgency.X. En ese caso, nosotros somos los responsables de sus datos.",
        "A las personas que conversan por WhatsApp, Instagram u otros canales con un negocio que usa los sistemas de AIgency.X (por ejemplo, una barbería, una clínica o un spa). En ese caso, el negocio es el responsable de los datos y AIgency.X actúa como encargado: los tratamos solo para prestarle el servicio a ese negocio y según sus instrucciones.",
      ],
    },
    {
      id: "datos",
      heading: "3. Qué datos tratamos",
      paragraphs: ["Si nos visitas o nos escribes:"],
      items: [
        "Nombre, teléfono, correo y las respuestas del formulario sobre tu negocio.",
        "Los mensajes que nos envíes.",
      ],
      after: [
        "Si conversas con un negocio que usa nuestros sistemas: tu nombre y número de WhatsApp o usuario de Instagram; el contenido de los mensajes (texto y, si los envías, audios, imágenes o documentos); los datos de tus citas (servicio, fecha, hora, profesional y estado); tu fecha de cumpleaños, solo si la compartes; tus preferencias de contacto, como haber pedido no recibir más mensajes; y registros técnicos (fecha y hora de cada mensaje, identificadores y estado de entrega).",
        "No pedimos datos sensibles. Si en una conversación compartes información de salud, se usa solo para derivarte a una persona del negocio.",
      ],
    },
    {
      id: "finalidades",
      heading: "4. Para qué los usamos",
      items: [
        "Responder tus consultas y enviarte la información que pediste.",
        "Agendar, confirmar, reprogramar o cancelar citas, y enviarte recordatorios.",
        "Hacer seguimiento de una consulta o de una cita, y pedirte tu opinión después de una atención.",
        "Enviarte mensajes promocionales del negocio solo si lo permitiste. Puedes dejar de recibirlos en cualquier momento respondiendo BAJA.",
        "Darle al negocio un resumen de su actividad, por ejemplo cuántas citas se agendaron.",
        "Detectar y corregir fallas, y proteger la seguridad del servicio.",
        "Cumplir obligaciones legales.",
      ],
      after: ["No vendemos datos personales ni los usamos para publicidad propia."],
    },
    {
      id: "inteligencia-artificial",
      heading: "5. Respuestas automáticas con inteligencia artificial",
      paragraphs: [
        "Algunas respuestas se generan automáticamente con modelos de inteligencia artificial, a partir de la información que configura el negocio (servicios, precios y horarios). Si se lo preguntas, el asistente te dice que es un asistente automático, y te deriva a una persona del negocio cuando hace falta.",
        "Los mensajes se envían al proveedor del modelo solo para generar la respuesta. Según sus condiciones para empresas, ese proveedor no los usa para entrenar sus modelos.",
      ],
    },
    {
      id: "terceros",
      heading: "6. Con quién compartimos datos",
      paragraphs: ["Con proveedores que nos ayudan a prestar el servicio, cada uno con sus propios contratos y medidas de seguridad:"],
      items: [
        "Meta Platforms (WhatsApp Business Platform e Instagram): envío y recepción de mensajes.",
        "OpenAI: generación de respuestas automáticas.",
        "Google (Gmail y Google Calendar): avisos por correo y calendarios de citas.",
        "Airtable: base de datos de clientes, citas y configuración.",
        "Vercel: alojamiento de este sitio web.",
        "El proveedor de servidores en la nube donde funciona nuestra plataforma de automatización.",
      ],
      after: [
        "También compartimos los datos con el negocio con el que conversaste, porque son suyos, y con las autoridades cuando la ley lo exija.",
        "Algunos de estos proveedores están fuera de tu país, por ejemplo en Estados Unidos o en la Unión Europea, así que tus datos pueden transferirse a esos países con las garantías de sus contratos.",
      ],
    },
    {
      id: "conservacion",
      heading: "7. Cuánto tiempo los guardamos",
      items: [
        "Datos de prospectos: hasta 24 meses desde el último contacto.",
        "Datos de los clientes de un negocio: mientras dure nuestro servicio con ese negocio. Al terminar, se eliminan o se le entregan al negocio dentro de 30 días, salvo que la ley obligue a conservarlos.",
        "Registros técnicos: hasta 12 meses.",
      ],
    },
    {
      id: "derechos",
      heading: "8. Tus derechos",
      paragraphs: [
        "Puedes pedir acceso, corrección, eliminación, oposición o portabilidad de tus datos, y retirar tu consentimiento. Respondemos en un máximo de 15 días hábiles. Si tus datos los trata un negocio que usa AIgency.X, puedes pedírselo al negocio o a nosotros, y lo coordinamos con él.",
        "Según dónde vivas, también puedes acudir a la autoridad de protección de datos: en Colombia, la Superintendencia de Industria y Comercio (Ley 1581 de 2012); en Chile, según las leyes 19.628 y 21.719; en Australia, la Office of the Australian Information Commissioner (Privacy Act 1988).",
      ],
    },
    {
      id: "eliminar-datos",
      heading: "9. Cómo eliminar tus datos",
      items: [
        "Para dejar de recibir mensajes de un negocio: responde BAJA en el chat y el sistema deja de escribirte de inmediato.",
        `Para eliminar tus datos: escribe a ${email} con el asunto «Eliminar mis datos», e indica tu número de WhatsApp o tu usuario de Instagram y, si lo sabes, el negocio con el que conversaste. Confirmamos tu identidad (por ejemplo, con un mensaje a ese número), eliminamos los datos dentro de 15 días hábiles y te avisamos cuando esté hecho. Solo conservamos lo mínimo que la ley exija.`,
        "Si conectaste alguna app de AIgency.X a tu cuenta de Facebook o Instagram, también puedes quitarla desde la configuración de tu cuenta, en «Apps y sitios web», y escribirnos para eliminar lo que hayamos recibido.",
      ],
    },
    {
      id: "seguridad",
      heading: "10. Seguridad",
      paragraphs: [
        "Usamos acceso restringido, credenciales protegidas, conexiones cifradas (HTTPS) y registros de errores que revisamos. Ningún sistema es infalible: si ocurre un incidente que afecte tus datos, avisaremos al negocio y a ti cuando corresponda.",
      ],
    },
    {
      id: "menores",
      heading: "11. Menores de edad",
      paragraphs: [
        "El sitio y los servicios de AIgency.X están dirigidos a negocios. No recopilamos a sabiendas datos de menores de 18 años para fines propios. Si un negocio atiende a menores, es responsable de contar con la autorización de sus padres o tutores.",
      ],
    },
    {
      id: "cookies",
      heading: "12. Cookies",
      paragraphs: [
        "Este sitio no usa cookies de publicidad ni de seguimiento. Solo guarda en tu navegador, mientras dura la visita, que ya viste el mensaje de bienvenida, para no repetírtelo.",
      ],
    },
    {
      id: "cambios",
      heading: "13. Cambios",
      paragraphs: [
        "Si cambiamos esta política, publicaremos la nueva versión aquí con su fecha. Si el cambio es importante, se lo avisaremos a los negocios que usan nuestros sistemas.",
      ],
    },
  ],
};

const privacyEn: LegalDoc = {
  title: "Privacy policy",
  description: `How ${brand} handles the personal data of website visitors and of people who chat with businesses that use our systems.`,
  updatedLabel: "Last updated",
  intro: `${brand} helps appointment-based businesses reply to messages, book appointments and follow up with their customers. This policy explains what data we process, why, and how you can exercise your rights.`,
  sections: [
    {
      id: "who-we-are",
      heading: "1. Who we are",
      paragraphs: [
        `${brand} is a trading name of ${name}, a sole trader registered in Australia with ABN ${abn} ("${brand}", "we" or "us"). For any privacy matter, email us at ${email}.`,
      ],
    },
    {
      id: "scope",
      heading: "2. Who this applies to",
      items: [
        "People who visit aigency-x.com or contact us: AIgency.X prospects and clients. We are the controller of their data.",
        "People who chat through WhatsApp, Instagram or other channels with a business that uses AIgency.X systems (for example, a barbershop, a clinic or a spa). The business is the controller of that data and AIgency.X acts as its processor: we process it only to provide the service to that business and on its instructions.",
      ],
    },
    {
      id: "data",
      heading: "3. What data we process",
      paragraphs: ["If you visit us or contact us:"],
      items: [
        "Your name, phone number, email and your form answers about your business.",
        "The messages you send us.",
      ],
      after: [
        "If you chat with a business that uses our systems: your name and WhatsApp number or Instagram username; the content of your messages (text and, if you send them, voice notes, images or documents); your appointment details (service, date, time, staff member and status); your birthday, only if you share it; your contact preferences, such as having asked to stop receiving messages; and technical logs (date and time of each message, message IDs and delivery status).",
        "We do not ask for sensitive data. If you share health information in a conversation, it is used only to hand you over to a person at the business.",
      ],
    },
    {
      id: "purposes",
      heading: "4. What we use it for",
      items: [
        "Answering your questions and sending you the information you asked for.",
        "Booking, confirming, rescheduling or cancelling appointments, and sending you reminders.",
        "Following up on an enquiry or an appointment, and asking for your feedback after a visit.",
        "Sending you the business's promotional messages only if you allowed it. You can stop them at any time by replying STOP.",
        "Giving the business a summary of its activity, such as how many appointments were booked.",
        "Detecting and fixing errors, and keeping the service secure.",
        "Complying with legal obligations.",
      ],
      after: ["We do not sell personal data or use it for our own advertising."],
    },
    {
      id: "artificial-intelligence",
      heading: "5. Automated replies with artificial intelligence",
      paragraphs: [
        "Some replies are generated automatically by artificial intelligence models, based on the information the business sets up (services, prices and opening hours). If you ask, the assistant tells you it is an automated assistant, and it hands you over to a person at the business when needed.",
        "Messages are sent to the model provider only to generate the reply. Under its business terms, that provider does not use them to train its models.",
      ],
    },
    {
      id: "third-parties",
      heading: "6. Who we share data with",
      paragraphs: ["With providers that help us deliver the service, each under its own contracts and security measures:"],
      items: [
        "Meta Platforms (WhatsApp Business Platform and Instagram): sending and receiving messages.",
        "OpenAI: generating automated replies.",
        "Google (Gmail and Google Calendar): email notifications and appointment calendars.",
        "Airtable: database of customers, appointments and settings.",
        "Vercel: hosting of this website.",
        "The cloud server provider that runs our automation platform.",
      ],
      after: [
        "We also share data with the business you chatted with, since it belongs to them, and with authorities when required by law.",
        "Some of these providers are located outside your country, for example in the United States or the European Union, so your data may be transferred there under the safeguards in their contracts.",
      ],
    },
    {
      id: "retention",
      heading: "7. How long we keep it",
      items: [
        "Prospect data: up to 24 months after the last contact.",
        "Data of a business's customers: for as long as our service to that business lasts. When it ends, the data is deleted or returned to the business within 30 days, unless the law requires us to keep it.",
        "Technical logs: up to 12 months.",
      ],
    },
    {
      id: "rights",
      heading: "8. Your rights",
      paragraphs: [
        "You can request access to, correction, deletion or portability of your data, object to its processing, and withdraw your consent. We reply within 15 business days at most. If your data is processed by a business that uses AIgency.X, you can ask the business or us, and we will coordinate with them.",
        "Depending on where you live, you can also contact your data protection authority: in Australia, the Office of the Australian Information Commissioner (Privacy Act 1988); in Colombia, the Superintendencia de Industria y Comercio (Law 1581 of 2012); in Chile, under Laws 19.628 and 21.719.",
      ],
    },
    {
      id: "data-deletion",
      heading: "9. How to delete your data",
      items: [
        "To stop receiving messages from a business: reply STOP (or BAJA) in the chat and the system stops messaging you immediately.",
        `To delete your data: email ${email} with the subject "Delete my data", including your WhatsApp number or Instagram username and, if you know it, the business you chatted with. We verify your identity (for example, with a message to that number), delete the data within 15 business days and let you know when it is done. We only keep the minimum the law requires.`,
        "If you connected an AIgency.X app to your Facebook or Instagram account, you can also remove it from your account settings under \"Apps and websites\", and email us to delete anything we received.",
      ],
    },
    {
      id: "security",
      heading: "10. Security",
      paragraphs: [
        "We use restricted access, protected credentials, encrypted connections (HTTPS) and error logs that we review. No system is infallible: if an incident affects your data, we will notify the business and you where appropriate.",
      ],
    },
    {
      id: "children",
      heading: "11. Children",
      paragraphs: [
        "The AIgency.X website and services are aimed at businesses. We do not knowingly collect data from people under 18 for our own purposes. If a business serves minors, it is responsible for having their parents' or guardians' authorisation.",
      ],
    },
    {
      id: "cookies",
      heading: "12. Cookies",
      paragraphs: [
        "This website does not use advertising or tracking cookies. It only stores in your browser, for the length of your visit, that you have already seen the welcome message, so it is not shown again.",
      ],
    },
    {
      id: "changes",
      heading: "13. Changes",
      paragraphs: [
        "If we change this policy, we will publish the new version here with its date. If the change is significant, we will notify the businesses that use our systems.",
      ],
    },
  ],
};

const termsEs: LegalDoc = {
  title: "Términos del servicio",
  description: `Condiciones con las que ${brand} presta sus servicios de automatización de atención y agenda a negocios.`,
  updatedLabel: "Última actualización",
  intro: `Estos términos regulan el uso de aigency-x.com y los servicios que ${brand} presta a negocios. Las condiciones particulares de cada cliente (alcance, precio y plazos) están en la propuesta que acepta. Si algo de la propuesta contradice estos términos, prevalece la propuesta.`,
  sections: [
    {
      id: "quienes-somos",
      heading: "1. Quiénes somos",
      paragraphs: [
        `${brand} es un nombre comercial de ${name}, comerciante individual registrado en Australia con ABN ${abn}. Contacto: ${email}.`,
      ],
    },
    {
      id: "servicio",
      heading: "2. El servicio",
      paragraphs: [
        `${brand} configura y opera sistemas de atención y agenda para negocios: respuesta automática de mensajes, agendamiento, recordatorios, seguimiento y resúmenes. Para eso usa WhatsApp Business Platform, Instagram y otras herramientas de terceros.`,
      ],
    },
    {
      id: "responsabilidades-cliente",
      heading: "3. Qué le corresponde al negocio",
      items: [
        "Entregar información correcta (servicios, precios y horarios) y avisarnos cuando cambie.",
        "Tener la autorización o la base legal necesaria para escribirles a sus clientes, y respetar a quienes piden no recibir más mensajes.",
        "Cumplir las políticas de WhatsApp Business y de Comercio de Meta, y las leyes de protección de datos de su país.",
        "Ser el titular de su número y de su cuenta de WhatsApp Business, y pagar a Meta las tarifas de los mensajes, que se cobran directamente a su método de pago.",
        "No usar el servicio para enviar spam ni contenido ilegal o engañoso.",
      ],
    },
    {
      id: "inteligencia-artificial",
      heading: "4. Respuestas automáticas y sus límites",
      paragraphs: [
        "El asistente responde solo con la información que configura el negocio y deriva a una persona las quejas, los temas de salud y lo que no puede resolver. Como toda respuesta automática, puede equivocarse. No entrega diagnósticos ni consejos médicos, legales o financieros. El negocio es responsable de revisar su configuración y de atender las conversaciones que se le derivan.",
      ],
    },
    {
      id: "pagos",
      heading: "5. Pagos",
      paragraphs: [
        "Salvo que la propuesta diga otra cosa, la implementación se paga 50% al firmar y 50% al lanzar, y la mensualidad se paga por mes adelantado desde el lanzamiento, con la permanencia mínima indicada en la propuesta. Si un pago se atrasa más de 15 días, podemos suspender el servicio con aviso previo.",
      ],
    },
    {
      id: "disponibilidad",
      heading: "6. Disponibilidad",
      paragraphs: [
        "Hacemos lo razonable para que el servicio funcione todo el día, todos los días, pero depende de terceros como Meta, OpenAI, Google y nuestros proveedores de servidores. No respondemos por caídas o cambios de esos proveedores; si ocurren, te avisaremos y buscaremos una alternativa.",
      ],
    },
    {
      id: "datos",
      heading: "7. Datos personales",
      paragraphs: [
        "El negocio es el responsable de los datos de sus clientes y AIgency.X actúa como encargado, según nuestra Política de privacidad. Al terminar el servicio, eliminamos esos datos o se los entregamos al negocio dentro de 30 días.",
      ],
    },
    {
      id: "propiedad",
      heading: "8. Propiedad intelectual",
      paragraphs: [
        "Los sistemas, plantillas, flujos y código son de AIgency.X. Mientras el servicio esté vigente, el negocio tiene una licencia para usarlos. Su marca, sus contenidos y sus datos siguen siendo suyos.",
      ],
    },
    {
      id: "responsabilidad",
      heading: "9. Límite de responsabilidad",
      paragraphs: [
        "Nuestra responsabilidad total se limita al monto que el negocio nos pagó en los últimos 3 meses. No respondemos por lucro cesante ni por daños indirectos, salvo dolo o en lo que la ley no permita limitar.",
      ],
    },
    {
      id: "termino",
      heading: "10. Término",
      paragraphs: [
        "Cualquiera de las partes puede terminar el servicio con 30 días de aviso, respetando la permanencia mínima de la propuesta. Al terminar, desconectamos nuestros sistemas y el número de WhatsApp sigue siendo del negocio.",
      ],
    },
    {
      id: "ley",
      heading: "11. Ley aplicable",
      paragraphs: [
        `Estos términos se rigen por las leyes de ${jurisdiction}, sin perjuicio de los derechos que la ley del país del cliente no permita renunciar.`,
      ],
    },
    {
      id: "cambios",
      heading: "12. Cambios",
      paragraphs: [
        "Si cambiamos estos términos, publicaremos la nueva versión aquí con su fecha y avisaremos a nuestros clientes con al menos 30 días de anticipación.",
      ],
    },
  ],
};

const termsEn: LegalDoc = {
  title: "Terms of service",
  description: `The terms under which ${brand} provides customer-messaging and booking automation services to businesses.`,
  updatedLabel: "Last updated",
  intro: `These terms govern the use of aigency-x.com and the services ${brand} provides to businesses. Each client's specific conditions (scope, price and timelines) are in the proposal they accept. If the proposal contradicts these terms, the proposal prevails.`,
  sections: [
    {
      id: "who-we-are",
      heading: "1. Who we are",
      paragraphs: [
        `${brand} is a trading name of ${name}, a sole trader registered in Australia with ABN ${abn}. Contact: ${email}.`,
      ],
    },
    {
      id: "service",
      heading: "2. The service",
      paragraphs: [
        `${brand} sets up and runs customer-messaging and booking systems for businesses: automated replies, appointment booking, reminders, follow-ups and summaries. To do so it uses the WhatsApp Business Platform, Instagram and other third-party tools.`,
      ],
    },
    {
      id: "client-responsibilities",
      heading: "3. The business's responsibilities",
      items: [
        "Provide accurate information (services, prices and opening hours) and tell us when it changes.",
        "Have the permission or legal basis needed to message its customers, and respect anyone who asks to stop receiving messages.",
        "Comply with Meta's WhatsApp Business and Commerce policies, and with the data protection laws of its country.",
        "Own its phone number and WhatsApp Business account, and pay Meta's messaging fees, which are charged directly to its payment method.",
        "Not use the service to send spam or illegal or misleading content.",
      ],
    },
    {
      id: "artificial-intelligence",
      heading: "4. Automated replies and their limits",
      paragraphs: [
        "The assistant replies only with the information the business sets up, and hands complaints, health topics and anything it cannot resolve over to a person. Like any automated reply, it can make mistakes. It does not provide diagnoses or medical, legal or financial advice. The business is responsible for reviewing its setup and for handling the conversations handed over to it.",
      ],
    },
    {
      id: "payments",
      heading: "5. Payments",
      paragraphs: [
        "Unless the proposal says otherwise, setup is paid 50% on signing and 50% at launch, and the monthly fee is paid monthly in advance from launch, with the minimum term stated in the proposal. If a payment is more than 15 days late, we may suspend the service after notice.",
      ],
    },
    {
      id: "availability",
      heading: "6. Availability",
      paragraphs: [
        "We make reasonable efforts to keep the service running around the clock, but it depends on third parties such as Meta, OpenAI, Google and our server providers. We are not liable for outages or changes on their side; if they happen, we will let you know and look for an alternative.",
      ],
    },
    {
      id: "data",
      heading: "7. Personal data",
      paragraphs: [
        "The business is the controller of its customers' data and AIgency.X acts as its processor, as described in our Privacy policy. When the service ends, we delete that data or return it to the business within 30 days.",
      ],
    },
    {
      id: "intellectual-property",
      heading: "8. Intellectual property",
      paragraphs: [
        "The systems, templates, workflows and code belong to AIgency.X. While the service is active, the business has a licence to use them. Its brand, content and data remain its own.",
      ],
    },
    {
      id: "liability",
      heading: "9. Limitation of liability",
      paragraphs: [
        "Our total liability is limited to the amount the business paid us in the last 3 months. We are not liable for lost profits or indirect damages, except in cases of wilful misconduct or where the law does not allow liability to be limited.",
      ],
    },
    {
      id: "termination",
      heading: "10. Termination",
      paragraphs: [
        "Either party may end the service with 30 days' notice, subject to the minimum term in the proposal. When it ends, we disconnect our systems and the WhatsApp number remains the business's.",
      ],
    },
    {
      id: "governing-law",
      heading: "11. Governing law",
      paragraphs: [
        `These terms are governed by the laws of ${jurisdiction}, without affecting any rights the law of the client's country does not allow to be waived.`,
      ],
    },
    {
      id: "changes",
      heading: "12. Changes",
      paragraphs: [
        "If we change these terms, we will publish the new version here with its date and notify our clients at least 30 days in advance.",
      ],
    },
  ],
};

export const legalContent: Record<AppLocale, { privacy: LegalDoc; terms: LegalDoc }> = {
  es: { privacy: privacyEs, terms: termsEs },
  en: { privacy: privacyEn, terms: termsEn },
};
