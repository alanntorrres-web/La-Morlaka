export interface MorlakaProduct {
  id: string;
  slug: string;
  name: string;
  shortTitle: string;
  category: 'suizo' | 'griego';
  categoryLabel: string;
  priceCents: number;
  priceFormatted: string;
  presentation: string;
  description: string;
  editorialNote: string;
  tastingNotes: string[];
  probioticProfile: string;
  imageLocal: string;
  imageRemote: string;
  whatsappSingleText: string;
  indexNumber: string;
}

export interface MorlakaBenefit {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  metric: string;
  metricLabel: string;
}

export interface MorlakaReview {
  id: string;
  author: string;
  role: string;
  quote: string;
  highlight: string;
}

export interface MorlakaFaq {
  id: string;
  question: string;
  answer: string;
}

export const MORLAKA_BRAND = {
  name: 'La Morlaka',
  origin: 'Cuenca, Ecuador',
  category: 'Alimentos naturales · Yogur artesanal tipo suizo & Yogur griego',
  heroHeadline: 'Un momento delicioso. Muy natural.',
  heroSubheadline: 'El gusto de lo artesanal.',
  heroLead:
    'Conoce nuestro yogur artesanal tipo suizo, fuente de probióticos, y nuestras opciones de yogur griego en Cuenca.',
  address: '27 B.A PORTETE, Cuenca, Ecuador',
  hours: 'Lunes a viernes, de 8:00 a. m. a 5:00 p. m.',
  whatsappNumber: '593995613421',
  whatsappDisplay: '+593 99 561 3421',
  instagramHandle: '@yogurtmorlaca',
  instagramUrl: 'https://www.instagram.com/yogurtmorlaca/',
  googleMapsUrl:
    'https://www.google.com/maps/place/27+B.A+PORTETE/@-2.8797146,-78.9701822,657m/data=!3m2!1e3!4b1!4m6!3m5!1s0x91cd177a5f413f63:0x93ddd3057022b23a!8m2!3d-2.87972!4d-78.9676073!16s%2Fg%2F11rx3w7dcm?entry=ttu',
  logoLocal: '/images/logo-morlaka.jpg',
  logoRemote:
    'https://d1yei2z3i6k35z.cloudfront.net/12244199/6ad3d5a8d48701.45329763_logoyogurt.jpg',
  demoDisclaimer:
    'Demostración comercial. Sabores de referencia según las fotografías. Precios ficticios en USD, utilizados únicamente para demostrar el cálculo del pedido. Contenidos netos y disponibilidad pendientes de confirmar directamente con La Morlaka.',
};

export const MORLAKA_PRODUCTS: MorlakaProduct[] = [
  {
    id: 'mora',
    slug: 'yogur-artesanal-de-mora',
    name: 'Yogur artesanal de mora',
    shortTitle: 'Mora Andina',
    category: 'suizo',
    categoryLabel: 'Yogur artesanal tipo suizo',
    priceCents: 300,
    priceFormatted: 'USD 3.00',
    presentation: 'Contenido neto: pendiente de confirmar',
    description: 'Una opción de mora para tu próximo antojo.',
    editorialNote:
      'Elaborado en Cuenca bajo fermentación artesanal tipo suizo, fusionando cultivos probióticos vivos con el carácter intenso y silvestre de la mora.',
    tastingNotes: ['Acidez vibrante', 'Fruta natural', 'Textura sedosa tipo suizo'],
    probioticProfile: 'Cultivos lácticos activos · Fuente de probióticos',
    imageLocal: '/images/yogur-mora.png',
    imageRemote:
      'https://d1yei2z3i6k35z.cloudfront.net/12244199/6ad3ba0160ef15.56915603_exec-1e78b8c2-3845-4488-b04e-590730e2f230.png',
    whatsappSingleText:
      'Hola, estoy revisando una demostración de su catálogo y quisiera información sobre el yogur artesanal de mora. ¿Está disponible? ¿Podrían confirmar su precio y presentación?',
    indexNumber: '01',
  },
  {
    id: 'fresa',
    slug: 'yogur-artesanal-de-fresa',
    name: 'Yogur artesanal de fresa',
    shortTitle: 'Fresa Natural',
    category: 'suizo',
    categoryLabel: 'Yogur artesanal tipo suizo',
    priceCents: 300,
    priceFormatted: 'USD 3.00',
    presentation: 'Contenido neto: pendiente de confirmar',
    description: 'Elige la opción de fresa de La Morlaka.',
    editorialNote:
      'Equilibrio clásico y luminoso. Nuestro yogur artesanal tipo suizo de fresa conserva trozos y matices naturales de fruta fresca en una base láctea rica en probióticos.',
    tastingNotes: ['Dulzor botánico', 'Cremosidad fluida', 'Aroma fresco'],
    probioticProfile: 'Cultivos lácticos activos · Fuente de probióticos',
    imageLocal: '/images/yogur-fresa.png',
    imageRemote:
      'https://d1yei2z3i6k35z.cloudfront.net/12244199/6ad3ba01644b69.03063813_exec-9f311f58-c249-424c-b6c3-6d7481170d43.png',
    whatsappSingleText:
      'Hola, estoy revisando una demostración de su catálogo y quisiera información sobre el yogur artesanal de fresa. ¿Está disponible? ¿Podrían confirmar su precio y presentación?',
    indexNumber: '02',
  },
  {
    id: 'mango',
    slug: 'yogur-artesanal-de-mango',
    name: 'Yogur artesanal de mango',
    shortTitle: 'Mango',
    category: 'suizo',
    categoryLabel: 'Yogur artesanal tipo suizo',
    priceCents: 350,
    priceFormatted: 'USD 3.50',
    presentation: 'Contenido neto: pendiente de confirmar',
    description: 'Una alternativa de mango para variar tu selección.',
    editorialNote:
      'Expresión tropical dentro de la tradición cuencana. La pulpa dorada de mango se integra suavemente con la acidez limpia del yogur artesanal tipo suizo.',
    tastingNotes: ['Notas solares', 'Cuerpo aterciopelado', 'Final refrescante'],
    probioticProfile: 'Cultivos lácticos activos · Fuente de probióticos',
    imageLocal: '/images/yogur-mango.png',
    imageRemote:
      'https://d1yei2z3i6k35z.cloudfront.net/12244199/6ad3ba017c65c8.26561024_exec-5799bd35-617f-492f-a743-b85e87b7b41f.png',
    whatsappSingleText:
      'Hola, estoy revisando una demostración de su catálogo y quisiera información sobre el yogur artesanal de mango. ¿Está disponible? ¿Podrían confirmar su precio y presentación?',
    indexNumber: '03',
  },
  {
    id: 'durazno',
    slug: 'yogur-artesanal-de-durazno',
    name: 'Yogur artesanal de durazno',
    shortTitle: 'Durazno',
    category: 'suizo',
    categoryLabel: 'Yogur artesanal tipo suizo',
    priceCents: 350,
    priceFormatted: 'USD 3.50',
    presentation: 'Contenido neto: pendiente de confirmar',
    description: 'Agrega el sabor de durazno a tus favoritos.',
    editorialNote:
      'Delicadeza frutal y fermentación honesta. El durazno aporta una textura envolvente ideal para acompañar desayunos nutritivos o disfrutar frío a cualquier hora.',
    tastingNotes: ['Suavidad floral', 'Fruta seleccionada', 'Fermentación lenta'],
    probioticProfile: 'Cultivos lácticos activos · Fuente de probióticos',
    imageLocal: '/images/yogur-durazno.png',
    imageRemote:
      'https://d1yei2z3i6k35z.cloudfront.net/12244199/6ad3ba017f6932.25605883_exec-2661ddb7-20bb-4021-8774-8f2ecdbe7540.png',
    whatsappSingleText:
      'Hola, estoy revisando una demostración de su catálogo y quisiera información sobre el yogur artesanal de durazno. ¿Está disponible? ¿Podrían confirmar su precio y presentación?',
    indexNumber: '04',
  },
  {
    id: 'griego-natural',
    slug: 'yogur-griego-natural',
    name: 'Yogur griego natural',
    shortTitle: 'Griego Natural',
    category: 'griego',
    categoryLabel: 'Yogur griego',
    priceCents: 250,
    priceFormatted: 'USD 2.50',
    presentation: 'Contenido neto: pendiente de confirmar',
    description: 'Conoce la opción natural de nuestro yogur griego.',
    editorialNote:
      'Otra forma de disfrutar La Morlaka. Denso, puro y sin artificios; el aliado predilecto en Cuenca para desayunos saludables, bowls de fruta o aderezos de ensaladas.',
    tastingNotes: ['Pureza láctea', 'Alta densidad', 'Cero excesos'],
    probioticProfile: 'Línea Griega La Morlaka · Nutrición diaria',
    imageLocal: '/images/griego-natural.png',
    imageRemote:
      'https://d1yei2z3i6k35z.cloudfront.net/12244199/6ad3ba017cb2c6.83949851_Yogurgriegonaturalenenvasepl%C3%A1stico.png',
    whatsappSingleText:
      'Hola, estoy revisando una demostración de su catálogo y quisiera información sobre el yogur griego natural. ¿Está disponible? ¿Podrían confirmar su precio y presentación?',
    indexNumber: '05',
  },
  {
    id: 'griego-frutos-rojos',
    slug: 'yogur-griego-de-frutos-rojos',
    name: 'Yogur griego de frutos rojos',
    shortTitle: 'Griego Frutos Rojos',
    category: 'griego',
    categoryLabel: 'Yogur griego',
    priceCents: 300,
    priceFormatted: 'USD 3.00',
    presentation: 'Contenido neto: pendiente de confirmar',
    description: 'Explora la opción de yogur griego de frutos rojos.',
    editorialNote:
      'La untuosidad característica de nuestro yogur griego en envase familiar, coronada por el matiz antioxidante y vibrante de los frutos rojos seleccionados.',
    tastingNotes: ['Cuerpo espeso', 'Contraste de bayas', 'Sabor profundo'],
    probioticProfile: 'Línea Griega La Morlaka · Con frutos rojos',
    imageLocal: '/images/griego-frutos-rojos.png',
    imageRemote:
      'https://d1yei2z3i6k35z.cloudfront.net/12244199/6ad3ba017b0f08.33208949_LaMorlakayogurgriegodefrutosrojos.png',
    whatsappSingleText:
      'Hola, estoy revisando una demostración de su catálogo y quisiera información sobre el yogur griego de frutos rojos. ¿Está disponible? ¿Podrían confirmar su precio y presentación?',
    indexNumber: '06',
  },
];

export const MORLAKA_BENEFITS: MorlakaBenefit[] = [
  {
    number: '01',
    title: 'Esencia artesanal',
    subtitle: 'Elaboración tipo suizo en Cuenca',
    description:
      'Conoce el yogur artesanal tipo suizo de La Morlaka. Cuidamos cada lote en Cuenca para preservar la textura aterciopelada y el sabor auténtico de la fruta.',
    metric: '100%',
    metricLabel: 'Identidad Morlaka · Cuenca',
  },
  {
    number: '02',
    title: 'Fuente de probióticos',
    subtitle: 'Bienestar digestivo y vitalidad diaria',
    description:
      'Una característica fundamental de nuestro yogur artesanal tipo suizo, según la información proporcionada por el negocio: fermentación viva que aporta probióticos naturales.',
    metric: 'VIVO',
    metricLabel: 'Cultivo probiótico activo',
  },
  {
    number: '03',
    title: 'Elige y consulta',
    subtitle: 'Trato directo sin intermediarios',
    description:
      'Reúne tus favoritos entre nuestras 4 variedades tipo suizo y 2 opciones de yogur griego en una selección personalizada y consulta directamente con La Morlaka por WhatsApp.',
    metric: '06',
    metricLabel: 'Variedades en catálogo',
  },
];

export const MORLAKA_REVIEWS: MorlakaReview[] = [
  {
    id: 'edgar-gonzalez',
    author: 'Edgar González',
    role: 'Cliente en Cuenca · Reseña verificada',
    quote:
      'Excelentes productos, frescos, saludables y lo mejor de todo deliciosos. 100% recomendable.',
    highlight: 'Frescos, saludables y deliciosos',
  },
  {
    id: 'sandra-molina',
    author: 'Sandra Molina',
    role: 'Cliente en Cuenca · Desayunos y cocina saludable',
    quote:
      'Es muy rico y sobretodo sano. Es una manera saludable de desayunar en mi caso y para las ensaladas ni se diga.',
    highlight: 'Saludable para desayunar y ensaladas',
  },
  {
    id: 'gladys-figueroa',
    author: 'Gladys Figueroa',
    role: 'Cliente en Cuenca · Nutrición diaria',
    quote: 'Excelente Producto muy nutritivo y saludable.',
    highlight: 'Muy nutritivo y saludable',
  },
];

export const MORLAKA_FAQS: MorlakaFaq[] = [
  {
    id: 'faq-productos',
    question: '¿Qué productos puedo consultar?',
    answer:
      'Puedes pedir información sobre el yogur artesanal tipo suizo, fuente de probióticos (Mora, Fresa, Mango y Durazno), y las opciones de yogur griego de La Morlaka (Natural y Frutos rojos).',
  },
  {
    id: 'faq-precios',
    question: '¿Cómo conozco los precios y sabores disponibles?',
    answer:
      'Los precios mostrados (USD 2.50 a USD 3.50) son ficticios para esta demostración. Consulta los precios oficiales, contenidos netos y disponibilidad con La Morlaka. Puedes reunir varios productos en tu selección.',
  },
  {
    id: 'faq-subtotal',
    question: '¿Cómo se calcula el subtotal?',
    answer:
      'En esta demo se multiplican las cantidades por los precios ficticios mostrados. Si falta algún precio, se indica que el subtotal está pendiente; nunca se considera un producto sin precio como gratuito. El envío, si corresponde, se consulta con el negocio.',
  },
  {
    id: 'faq-entregas',
    question: '¿Tienen entregas o puedo retirar mi pedido?',
    answer:
      'Consulta por WhatsApp (+593 99 561 3421) las opciones de entrega o retiro, la dirección exacta y las condiciones antes de realizar una compra.',
  },
  {
    id: 'faq-ubicacion',
    question: '¿Dónde están y cuál es el horario?',
    answer:
      'La Morlaka está en Cuenca, Ecuador. El horario es de lunes a viernes, de 8:00 a. m. a 5:00 p. m. El enlace de Google Maps abre la ubicación proporcionada: 27 B.A PORTETE, Cuenca.',
  },
  {
    id: 'faq-demo',
    question: '¿Esta demo confirma pedidos o procesa pagos?',
    answer:
      'No. Puedes agregar productos y probar las cantidades. El botón final abre una consulta por WhatsApp que identifica la selección como demostración; todo se acuerda directamente con el negocio.',
  },
];
