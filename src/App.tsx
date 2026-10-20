/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
} from 'framer-motion';
import {
  ArrowUpRight,
  ArrowDown,
  Plus,
  Minus,
  ShoppingBag,
  MapPin,
  Clock,
  Phone,
  Instagram,
  Check,
  Sparkles,
  ChevronDown,
  X,
  Trash2,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';
import {
  MORLAKA_BRAND,
  MORLAKA_PRODUCTS,
  MORLAKA_BENEFITS,
  MORLAKA_REVIEWS,
  MORLAKA_FAQS,
  type MorlakaProduct,
} from './data/morlakaData';
import {
  updateSelectionMap,
  calculateOrderSummary,
} from './utils/orderCalculator';

const SPRING_PHYSICS = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 30,
};

const HERO_LETTERS = 'LA MORLAKA'.split('');

interface MagneticButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  target?: string;
  rel?: string;
  variant?: 'primary' | 'outline' | 'coral' | 'ghost';
  className?: string;
  ariaLabel?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

function MagneticButton({
  children,
  onClick,
  href,
  target,
  rel,
  variant = 'primary',
  className = '',
  ariaLabel,
  disabled = false,
  type = 'button',
}: MagneticButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-xs md:text-sm font-medium tracking-tight whitespace-nowrap shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EC4940] cursor-pointer select-none disabled:opacity-40 disabled:pointer-events-none';

  const variantStyles = {
    primary:
      'bg-[#EC4940] text-[#FDFBF7] border border-[#EC4940] hover:bg-[#d83b32]',
    coral:
      'bg-gradient-to-r from-[#EC4940] to-[#FF9B71] text-[#FDFBF7] border border-[#EC4940]',
    outline:
      'bg-[#FDFBF7] text-[#1A1412] border border-[#1A1412] hover:border-[#EC4940] hover:text-[#EC4940]',
    ghost:
      'bg-transparent text-[#1A1412] border border-[#1A1412]/20 hover:border-[#EC4940] hover:bg-[#FF9B71]/10',
  };

  if (href) {
    return (
      <motion.a
        href={href}
        target={target}
        rel={rel}
        aria-label={ariaLabel}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={SPRING_PHYSICS}
        className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      whileHover={disabled ? undefined : { scale: 1.05 }}
      whileTap={disabled ? undefined : { scale: 0.95 }}
      transition={SPRING_PHYSICS}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
}

interface ProductImageProps {
  src: string;
  fallbackSrc: string;
  alt: string;
  className?: string;
  title: string;
}

function ResilientProductImage({
  src,
  fallbackSrc,
  alt,
  className = '',
  title,
}: ProductImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasFailedAll, setHasFailedAll] = useState(false);

  const handleError = () => {
    if (currentSrc !== fallbackSrc && fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    } else {
      setHasFailedAll(true);
    }
  };

  if (hasFailedAll) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#FDFBF7] via-[#FF9B71]/20 to-[#EC4940]/15 p-8 text-center border border-[#EC4940]/30 ${className}`}
      >
        <span className="font-syne text-2xl font-bold text-[#EC4940]">
          LA MORLAKA
        </span>
        <span className="mt-2 text-xs text-[#1A1412]/70">{title}</span>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={handleError}
      className={className}
    />
  );
}

export default function App() {
  const skipPreloaderInit = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return (
      params.get('autostart') === '1' ||
      navigator.webdriver ||
      /HeadlessChrome/i.test(navigator.userAgent)
    );
  }, []);

  const [preloaderDone, setPreloaderDone] = useState<boolean>(skipPreloaderInit);
  const [progress, setProgress] = useState<number>(skipPreloaderInit ? 100 : 0);
  const [quantities, setQuantities] = useState<Record<string, number>>({
    mora: 1,
    fresa: 1,
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [activeProductModal, setActiveProductModal] =
    useState<MorlakaProduct | null>(null);
  const [openFaqId, setOpenFaqId] = useState<string>(MORLAKA_FAQS[0].id);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<'todos' | 'suizo' | 'griego'>('todos');

  // Preloader timer
  useEffect(() => {
    if (preloaderDone) return;
    const interval = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          window.clearInterval(interval);
          window.setTimeout(() => setPreloaderDone(true), 220);
          return 100;
        }
        return Math.min(100, prev + 5);
      });
    }, 35);
    return () => window.clearInterval(interval);
  }, [preloaderDone]);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const orderSummary = useMemo(
    () => calculateOrderSummary(MORLAKA_PRODUCTS, quantities),
    [quantities]
  );

  const handleAdjustQuantity = (
    product: MorlakaProduct,
    delta: number,
    announce = true
  ) => {
    setQuantities((prev) => {
      const next = updateSelectionMap(prev, product.id, delta, 'delta');
      const newCount = next[product.id] ?? 0;
      if (announce) {
        if (delta > 0) {
          setToastMessage(
            `${product.name}: ${newCount} ${newCount === 1 ? 'unidad' : 'unidades'} en tu selección`
          );
        } else if (newCount === 0) {
          setToastMessage(`${product.name} eliminado de tu selección`);
        }
      }
      return next;
    });
  };

  const handleSetExactQuantity = (product: MorlakaProduct, exact: number) => {
    setQuantities((prev) => updateSelectionMap(prev, product.id, exact, 'exact'));
  };

  const handleClearSelection = () => {
    setQuantities({});
    setToastMessage('Selección vaciada');
  };

  // Hero Parallax hooks
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroSectionRef,
    offset: ['start start', 'end start'],
  });

  const smoothHeroScroll = useSpring(heroScrollProgress, SPRING_PHYSICS);
  const heroMainImageY = useTransform(smoothHeroScroll, [0, 1], ['0%', '22%']);
  const heroSecondaryImageY = useTransform(
    smoothHeroScroll,
    [0, 1],
    ['0%', '-18%']
  );
  const heroTitleY = useTransform(smoothHeroScroll, [0, 1], ['0%', '35%']);

  // Horizontal Scroll Section hooks (Scroll-World architecture: h-[400vh] -> sticky h-screen -> X mapped to -70%)
  const horizontalSectionRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress: horizontalScrollProgress } = useScroll({
    target: horizontalSectionRef,
    offset: ['start start', 'end end'],
  });

  const smoothHorizontalProgress = useSpring(
    horizontalScrollProgress,
    SPRING_PHYSICS
  );
  const horizontalX = useTransform(
    smoothHorizontalProgress,
    [0, 1],
    ['0%', '-70%']
  );

  const jumpToFlavorCard = (index: number) => {
    if (!horizontalSectionRef.current) return;
    const rect = horizontalSectionRef.current.getBoundingClientRect();
    const sectionTop = window.scrollY + rect.top;
    const scrollableDistance =
      horizontalSectionRef.current.offsetHeight - window.innerHeight;
    const targetRatio = Math.min(
      1,
      Math.max(0, index / Math.max(1, MORLAKA_PRODUCTS.length - 1))
    );
    window.scrollTo({
      top: sectionTop + scrollableDistance * targetRatio,
      behavior: 'smooth',
    });
  };

  const filteredCatalog = useMemo(() => {
    if (categoryFilter === 'todos') return MORLAKA_PRODUCTS;
    return MORLAKA_PRODUCTS.filter((item) => item.category === categoryFilter);
  }, [categoryFilter]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1A1412] selection:bg-[#EC4940] selection:text-[#FDFBF7]">
      {/* =====================================================================
          SECCIÓN 1: PRELOADER INMERSIVO (Fondo Crema Crudo #FDFBF7, CERO Negro)
      ====================================================================== */}
      <AnimatePresence>
        {!preloaderDone && (
          <motion.div
            key="morlaka-preloader"
            initial={{ clipPath: 'inset(0% 0% 0% 0%)' }}
            exit={{
              clipPath: 'inset(0% 0% 100% 0%)',
              transition: SPRING_PHYSICS,
            }}
            className="fixed inset-0 z-50 flex flex-col justify-between bg-[#FDFBF7] px-6 py-8 md:px-12 md:py-10 border-b-2 border-[#EC4940]"
            aria-label="Pantalla de carga editorial La Morlaka"
          >
            <div className="flex items-center justify-between border-b border-[#1A1412]/15 pb-5">
              <div className="flex items-center gap-3 text-xs tracking-widest uppercase text-[#1A1412]/70">
                <span className="font-syne font-bold text-[#EC4940]">
                  LA MORLAKA
                </span>
                <span aria-hidden="true">·</span>
                <span>Cuenca, Ecuador</span>
                <span aria-hidden="true">·</span>
                <span className="hidden sm:inline">
                  Yogur Artesanal Tipo Suizo &amp; Griego
                </span>
              </div>
              <motion.button
                type="button"
                onClick={() => setPreloaderDone(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={SPRING_PHYSICS}
                className="px-4 py-1.5 text-xs font-medium border border-[#1A1412]/30 text-[#1A1412] hover:border-[#EC4940] hover:text-[#EC4940] cursor-pointer"
              >
                Saltar intro →
              </motion.button>
            </div>

            <div className="my-auto py-8">
              <p className="text-xs md:text-sm uppercase tracking-widest text-[#EC4940] font-medium mb-3">
                Alimentos naturales · Fuente de probióticos
              </p>
              <div className="overflow-hidden">
                <motion.p
                  initial={{ y: 60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={SPRING_PHYSICS}
                  className="font-syne text-[12vw] leading-none tracking-tighter font-extrabold bg-gradient-to-r from-[#EC4940] to-[#FF9B71] bg-clip-text text-transparent"
                >
                  LA MORLAKA
                </motion.p>
              </div>
              <p className="mt-4 max-w-md text-sm md:text-base text-[#1A1412]/75">
                Un momento delicioso. Muy natural. Elaboración artesanal en
                Cuenca, Ecuador.
              </p>
            </div>

            <div className="space-y-4">
              <div className="h-[2px] w-full bg-[#1A1412]/10 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#EC4940] to-[#FF9B71]"
                  style={{ width: `${progress}%` }}
                  transition={SPRING_PHYSICS}
                />
              </div>
              <div className="flex items-end justify-between">
                <div className="text-xs text-[#1A1412]/60 space-y-0.5">
                  <p>27 B.A PORTETE · Cuenca, Ecuador</p>
                  <p>Mora Andina · Fresa Natural · Mango · Durazno · Griego</p>
                </div>
                <span className="font-syne text-5xl md:text-7xl font-extrabold tracking-tighter tabular-nums text-[#EC4940]">
                  {String(progress).padStart(2, '0')}%
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================================
          TOP BAR CONTRACT (3 Zones: 1-line Brand | 4-5 Single-Line Links | 1 Primary CTA)
      ====================================================================== */}
      <header className="sticky top-0 z-40 flex items-center justify-between gap-8 px-6 md:px-12 py-4 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-[#1A1412]/15">
        {/* Zone 1: Brand Title (Single text element, one line) */}
        <a
          href="#hero-editorial"
          className="font-syne text-lg md:text-xl font-extrabold tracking-tighter text-[#1A1412] whitespace-nowrap shrink-0"
        >
          LA MORLAKA
        </a>

        {/* Zone 2: 4–5 concise single-line navigation links */}
        <nav
          aria-label="Navegación principal"
          className="hidden md:flex items-center gap-8 text-sm font-medium text-[#1A1412]/80"
        >
          <a
            href="#filosofia-artesanal"
            className="hover:text-[#EC4940] underline-offset-4 hover:underline transition-colors whitespace-nowrap shrink-0"
          >
            Filosofía
          </a>
          <a
            href="#galeria-sabores"
            className="hover:text-[#EC4940] underline-offset-4 hover:underline transition-colors whitespace-nowrap shrink-0"
          >
            Sabores
          </a>
          <a
            href="#beneficios-probioticos"
            className="hover:text-[#EC4940] underline-offset-4 hover:underline transition-colors whitespace-nowrap shrink-0"
          >
            Beneficios
          </a>
          <a
            href="#opiniones-cuenca"
            className="hover:text-[#EC4940] underline-offset-4 hover:underline transition-colors whitespace-nowrap shrink-0"
          >
            Opiniones
          </a>
          <a
            href="#ubicacion-cuenca"
            className="hover:text-[#EC4940] underline-offset-4 hover:underline transition-colors whitespace-nowrap shrink-0"
          >
            Cuenca
          </a>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center shrink-0">
          <MagneticButton
            variant="primary"
            onClick={() => setIsDrawerOpen(true)}
            ariaLabel={`Abrir mi selección de yogures, ${orderSummary.totalUnits} unidades`}
            className="px-4 py-2.5 text-xs"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Mi Selección ({orderSummary.totalUnits})</span>
          </MagneticButton>
        </div>
      </header>

      <main>
        {/* =====================================================================
            SECCIÓN 2: HERO EDITORIAL (Tipografía Masiva 10vw-15vw + Clip-Path Reveal + Parallax)
        ====================================================================== */}
        <section
          ref={heroSectionRef}
          id="hero-editorial"
          aria-labelledby="hero-title"
          className="relative min-h-[92vh] pt-8 pb-20 md:pt-12 md:pb-28 px-6 md:px-12 border-b border-[#1A1412]/15 overflow-hidden"
        >
          {/* Top Editorial Metadata Strip (Unboxed, Zero-Pill Discipline) */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-8 mb-8 border-b border-[#EC4940]/30 text-xs text-[#1A1412]/70">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-[#EC4940]">
                Alimentos naturales · La Morlaka
              </span>
              <span aria-hidden="true">·</span>
              <span>Yogur artesanal tipo suizo</span>
              <span aria-hidden="true">·</span>
              <span>Fuente de probióticos</span>
              <span aria-hidden="true">·</span>
              <span>También yogur griego</span>
            </div>
            <div className="flex items-center gap-2 tabular-nums">
              <span>Cuenca, Ecuador</span>
              <span aria-hidden="true">/</span>
              <span>27 B.A PORTETE</span>
            </div>
          </div>

          {/* Massive Brutalist Display Title with Clip-Path & StaggerChildren */}
          <motion.div style={{ y: heroTitleY }} className="relative z-20 overflow-hidden">
            <motion.h1
              id="hero-title"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.045,
                    delayChildren: 0.1,
                  },
                },
              }}
              aria-label="LA MORLAKA"
              className="font-syne text-[10vw] sm:text-[10.2vw] lg:text-[10.4vw] font-extrabold tracking-tighter leading-none select-none flex flex-wrap items-baseline gap-x-[2.5vw]"
            >
              {(['LA', 'MORLAKA'] as const).map((word, wordIdx) => (
                <span key={word} className="inline-flex whitespace-nowrap">
                  {word.split('').map((char, charIdx) => (
                    <span
                      key={`${word}-${charIdx}`}
                      className="inline-block overflow-hidden"
                      style={{
                        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)',
                      }}
                    >
                      <motion.span
                        variants={{
                          hidden: {
                            y: '110%',
                            clipPath: 'inset(100% 0% 0% 0%)',
                          },
                          visible: {
                            y: '0%',
                            clipPath: 'inset(0% 0% 0% 0%)',
                            transition: SPRING_PHYSICS,
                          },
                        }}
                        className={`inline-block ${
                          wordIdx === 1
                            ? 'bg-gradient-to-r from-[#EC4940] to-[#FF9B71] bg-clip-text text-transparent'
                            : 'text-[#1A1412]'
                        }`}
                      >
                        {char}
                      </motion.span>
                    </span>
                  ))}
                </span>
              ))}
            </motion.h1>
          </motion.div>

          {/* Asymmetric Brutalist Editorial Split + Bleeding Parallax Imagery */}
          <div className="mt-8 md:mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-start">
            {/* Left Editorial Manifesto & Direct Actions */}
            <div className="lg:col-span-5 lg:pt-8 space-y-8 relative z-20">
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-widest text-[#EC4940] font-semibold">
                  01. Catálogo Oficial · Cuenca, Ecuador
                </p>
                <h2 className="font-syne text-3xl sm:text-4xl xl:text-5xl font-bold tracking-tight leading-[1.05] text-[#1A1412] text-balance">
                  Un momento delicioso.{' '}
                  <span className="bg-gradient-to-r from-[#EC4940] to-[#FF9B71] bg-clip-text text-transparent italic">
                    Muy natural.
                  </span>
                </h2>
                <p className="text-base md:text-lg text-[#1A1412]/80 leading-relaxed max-w-xl">
                  {MORLAKA_BRAND.heroLead} Desde el carácter silvestre de la{' '}
                  <strong className="font-semibold text-[#1A1412]">
                    Mora Andina
                  </strong>{' '}
                  y la{' '}
                  <strong className="font-semibold text-[#1A1412]">
                    Fresa Natural
                  </strong>{' '}
                  hasta la pureza densa de nuestro{' '}
                  <strong className="font-semibold text-[#1A1412]">
                    Yogur Griego
                  </strong>
                  .
                </p>
              </div>

              {/* Primary & Secondary Magnetic Actions */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <MagneticButton
                  href="#galeria-sabores"
                  variant="coral"
                  ariaLabel="Explorar galería horizontal de sabores"
                >
                  <span>Explorar Sabores</span>
                  <ArrowDown className="w-4 h-4" />
                </MagneticButton>

                <MagneticButton
                  onClick={() => setIsDrawerOpen(true)}
                  variant="outline"
                  ariaLabel="Revisar mi selección y consultar por WhatsApp"
                >
                  <span>Prepara tu selección ({orderSummary.totalUnits})</span>
                  <ArrowUpRight className="w-4 h-4 text-[#EC4940]" />
                </MagneticButton>
              </div>

              {/* Clean Architectural Metrics Table (Tabular Numerals, No Pills) */}
              <div className="pt-8 border-t border-[#1A1412]/15 grid grid-cols-3 gap-6">
                <div>
                  <p className="font-syne text-2xl md:text-3xl font-extrabold text-[#EC4940] tabular-nums">
                    04
                  </p>
                  <p className="mt-1 text-xs text-[#1A1412]/70">
                    Sabores Tipo Suizo con Probióticos
                  </p>
                </div>
                <div className="border-l border-[#1A1412]/15 pl-6">
                  <p className="font-syne text-2xl md:text-3xl font-extrabold text-[#1A1412] tabular-nums">
                    02
                  </p>
                  <p className="mt-1 text-xs text-[#1A1412]/70">
                    Especialidades de Yogur Griego
                  </p>
                </div>
                <div className="border-l border-[#1A1412]/15 pl-6">
                  <p className="font-syne text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-[#EC4940] to-[#FF9B71] bg-clip-text text-transparent tabular-nums">
                    100%
                  </p>
                  <p className="mt-1 text-xs text-[#1A1412]/70">
                    Elaboración Artesanal en Cuenca
                  </p>
                </div>
              </div>
            </div>

            {/* Right Bleeding Asymmetric Parallax Composition */}
            <div className="lg:col-span-7 relative min-h-[460px] md:min-h-[600px] flex items-center justify-end">
              {/* Hairline Brutalist Frame Offset */}
              <div
                aria-hidden="true"
                className="absolute inset-y-4 right-0 w-11/12 border border-[#EC4940]/40 pointer-events-none"
              />

              {/* Primary Massive Hero Image (Parallax Down) */}
              <motion.div
                style={{ y: heroMainImageY }}
                className="relative z-10 w-full md:w-[78%] lg:w-[82%] bg-[#F7F2E7] border border-[#1A1412]/15 p-6 md:p-10 lg:-mr-6"
              >
                <div className="flex items-center justify-between text-xs text-[#1A1412]/60 pb-4 mb-4 border-b border-[#1A1412]/10">
                  <span>FIG. 01 — YOGUR ARTESANAL TIPO SUIZO</span>
                  <span className="font-mono tabular-nums text-[#EC4940]">
                    FRESA NATURAL · USD 3.00
                  </span>
                </div>
                <div className="relative aspect-[4/5] max-h-[520px] w-full overflow-hidden flex items-center justify-center bg-[#FDFBF7]">
                  <ResilientProductImage
                    src={MORLAKA_PRODUCTS[1].imageLocal}
                    fallbackSrc={MORLAKA_PRODUCTS[1].imageRemote}
                    alt="Botella de yogur artesanal de fresa La Morlaka junto a fresas frescas"
                    title="Yogur Artesanal de Fresa"
                    className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="mt-4 flex items-center justify-between pt-4 border-t border-[#1A1412]/10">
                  <div>
                    <p className="font-syne font-bold text-lg text-[#1A1412]">
                      El gusto de lo artesanal.
                    </p>
                    <p className="text-xs text-[#1A1412]/70">
                      La Morlaka · Cuenca · Fuente natural de probióticos
                    </p>
                  </div>
                  <MagneticButton
                    variant="primary"
                    onClick={() =>
                      handleAdjustQuantity(MORLAKA_PRODUCTS[1], 1, true)
                    }
                    ariaLabel="Agregar Yogur artesanal de fresa a mi selección"
                    className="px-4 py-2 text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Fresa</span>
                  </MagneticButton>
                </div>
              </motion.div>

              {/* Secondary Overlapping Parallax Card (Mora Andina - Moves Counter-Scroll) */}
              <motion.div
                style={{ y: heroSecondaryImageY }}
                className="hidden sm:block absolute left-0 bottom-2 z-20 w-56 md:w-64 bg-[#FDFBF7] border border-[#EC4940] p-4"
              >
                <div className="flex items-center justify-between text-[11px] text-[#EC4940] font-medium mb-2 pb-2 border-b border-[#EC4940]/20">
                  <span>MORA ANDINA</span>
                  <span className="tabular-nums">USD 3.00</span>
                </div>
                <div className="aspect-[4/5] w-full overflow-hidden bg-[#F7F2E7] mb-3">
                  <ResilientProductImage
                    src={MORLAKA_PRODUCTS[0].imageLocal}
                    fallbackSrc={MORLAKA_PRODUCTS[0].imageRemote}
                    alt="Yogur artesanal de mora La Morlaka"
                    title="Yogur Artesanal de Mora"
                    className="w-full h-full object-contain"
                  />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleAdjustQuantity(MORLAKA_PRODUCTS[0], 1, true)
                  }
                  className="w-full py-2 text-xs font-medium text-[#1A1412] border border-[#1A1412]/25 hover:border-[#EC4940] hover:bg-[#FF9B71]/15 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#EC4940]" />
                  <span>Sumar Mora ({quantities.mora ?? 0})</span>
                </button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            SECCIÓN 3: FILOSOFÍA (STICKY TEXT + NARRATIVA EDITORIAL DE CUENCA)
        ====================================================================== */}
        <section
          id="filosofia-artesanal"
          aria-labelledby="filosofia-heading"
          className="relative px-6 md:px-12 py-24 md:py-36 border-b border-[#1A1412]/15 bg-[#FDFBF7]"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-12 items-start">
            {/* Sticky Left Column */}
            <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#EC4940] font-semibold">
                <span>02. Filosofía &amp; Origen</span>
                <span aria-hidden="true">·</span>
                <span>Cuenca, Ecuador</span>
              </div>

              <h2
                id="filosofia-heading"
                className="font-syne text-3xl sm:text-5xl lg:text-[3.2vw] xl:text-[3.4vw] font-extrabold tracking-tighter leading-[0.95] text-[#1A1412]"
              >
                <span className="block whitespace-nowrap">EL GUSTO</span>
                <span className="block whitespace-nowrap">DE LO</span>
                <span className="block whitespace-nowrap bg-gradient-to-r from-[#EC4940] to-[#FF9B71] bg-clip-text text-transparent">
                  ARTESANAL.
                </span>
              </h2>

              <p className="text-base md:text-lg text-[#1A1412]/80 leading-relaxed max-w-md">
                En{' '}
                <strong className="font-semibold text-[#1A1412]">
                  La Morlaka
                </strong>{' '}
                concebimos el yogur como un alimento vivo, honesto y cercano.
                Elaborado en Cuenca con atención a cada detalle, ofrecemos dos
                experiencias complementarias: nuestro{' '}
                <span className="underline decoration-[#EC4940] underline-offset-4">
                  yogur artesanal tipo suizo
                </span>{' '}
                —fuente natural de probióticos— y nuestra línea de{' '}
                <span className="underline decoration-[#FF9B71] underline-offset-4">
                  yogur griego
                </span>
                .
              </p>

              <div className="pt-6 border-t border-[#EC4940]/30 space-y-2 text-xs text-[#1A1412]/70">
                <p>
                  <strong className="text-[#1A1412]">Ubicación:</strong> 27 B.A
                  PORTETE, Cuenca, Ecuador
                </p>
                <p>
                  <strong className="text-[#1A1412]">Atención:</strong> Lunes a
                  viernes, de 8:00 a. m. a 5:00 p. m.
                </p>
                <p>
                  <strong className="text-[#1A1412]">Contacto directo:</strong>{' '}
                  WhatsApp +593 99 561 3421 · Instagram @yogurtmorlaca
                </p>
              </div>
            </div>

            {/* Scrolling Right Narrative Chapters */}
            <div className="lg:col-span-7 space-y-16 md:space-y-24 lg:border-l lg:border-[#1A1412]/15 lg:pl-12">
              {/* Chapter 01 */}
              <motion.article
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={SPRING_PHYSICS}
                className="border-t border-[#1A1412]/15 pt-8"
              >
                <div className="flex items-center justify-between text-xs text-[#EC4940] font-medium mb-4">
                  <span>CAPÍTULO 01 · TRADICIÓN SUIZA EN LOS ANDES</span>
                  <span className="font-mono tabular-nums">01 / 03</span>
                </div>
                <h3 className="font-syne text-2xl md:text-4xl font-bold tracking-tight text-[#1A1412] mb-4">
                  Yogur Artesanal Tipo Suizo: Textura Fluida y Probióticos Vivos
                </h3>
                <p className="text-base text-[#1A1412]/80 leading-relaxed mb-8 max-w-2xl">
                  A diferencia de los procesos ultraprocesados industriales, el
                  yogur artesanal tipo suizo de La Morlaka integra la fruta con
                  una base láctea fermentada lentamente. Esta técnica conserva
                  una característica esencial destacada por el negocio:{' '}
                  <strong className="text-[#1A1412]">
                    ser fuente natural de probióticos
                  </strong>{' '}
                  para acompañar tu bienestar digestivo cada mañana.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#F7F2E7] p-6 border border-[#1A1412]/15">
                  <div className="aspect-[4/5] bg-[#FDFBF7] border border-[#1A1412]/10 p-4 flex items-center justify-center">
                    <ResilientProductImage
                      src={MORLAKA_PRODUCTS[0].imageLocal}
                      fallbackSrc={MORLAKA_PRODUCTS[0].imageRemote}
                      alt="Botella de yogur artesanal de mora La Morlaka"
                      title="Mora Andina"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex flex-col justify-between py-2">
                    <div className="space-y-3">
                      <span className="text-xs uppercase tracking-widest text-[#EC4940] font-semibold">
                        Sabor Insignia
                      </span>
                      <h4 className="font-syne text-2xl font-bold text-[#1A1412]">
                        Mora Andina &amp; Fresa Natural
                      </h4>
                      <p className="text-sm text-[#1A1412]/75 leading-relaxed">
                        Frutas emblemáticas que aportan color real, antioxidantes
                        y un perfil aromático inconfundible en cada botella.
                      </p>
                    </div>
                    <div className="pt-4 border-t border-[#1A1412]/15 flex items-center justify-between text-xs">
                      <span className="text-[#1A1412]/70">
                        Precio ref. demo
                      </span>
                      <strong className="font-mono tabular-nums text-[#EC4940] text-sm">
                        USD 3.00
                      </strong>
                    </div>
                  </div>
                </div>
              </motion.article>

              {/* Chapter 02 */}
              <motion.article
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={SPRING_PHYSICS}
                className="border-t border-[#1A1412]/15 pt-8"
              >
                <div className="flex items-center justify-between text-xs text-[#EC4940] font-medium mb-4">
                  <span>CAPÍTULO 02 · OTRA FORMA DE DISFRUTAR LA MORLAKA</span>
                  <span className="font-mono tabular-nums">02 / 03</span>
                </div>
                <h3 className="font-syne text-2xl md:text-4xl font-bold tracking-tight text-[#1A1412] mb-4">
                  Línea de Yogures Griegos: Natural y Frutos Rojos
                </h3>
                <p className="text-base text-[#1A1412]/80 leading-relaxed mb-8 max-w-2xl">
                  Para quienes buscan mayor densidad y versatilidad gastronómica
                  en casa, La Morlaka presenta sus dos opciones de{' '}
                  <strong className="text-[#1A1412]">Yogur Griego</strong> en
                  envase práctico: la versión{' '}
                  <strong className="text-[#1A1412]">Natural</strong> (ideal
                  para desayunos saludables y aderezos de ensaladas, como
                  destacan nuestros clientes en Cuenca) y la versión con{' '}
                  <strong className="text-[#1A1412]">Frutos Rojos</strong>.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[MORLAKA_PRODUCTS[4], MORLAKA_PRODUCTS[5]].map((greek) => (
                    <div
                      key={greek.id}
                      className="bg-[#F7F2E7] border border-[#1A1412]/15 p-5 flex flex-col justify-between"
                    >
                      <div className="aspect-square bg-[#FDFBF7] border border-[#1A1412]/10 p-4 mb-4 flex items-center justify-center">
                        <ResilientProductImage
                          src={greek.imageLocal}
                          fallbackSrc={greek.imageRemote}
                          alt={greek.name}
                          title={greek.shortTitle}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs text-[#1A1412]/65 mb-1">
                          <span>{greek.categoryLabel}</span>
                          <span className="font-mono tabular-nums text-[#EC4940] font-semibold">
                            {greek.priceFormatted}
                          </span>
                        </div>
                        <h4 className="font-syne text-xl font-bold text-[#1A1412]">
                          {greek.shortTitle}
                        </h4>
                        <p className="text-xs text-[#1A1412]/75 mt-1 mb-4">
                          {greek.description}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleAdjustQuantity(greek, 1, true)}
                          className="w-full py-2.5 text-xs font-medium bg-[#FDFBF7] border border-[#1A1412]/25 hover:border-[#EC4940] hover:bg-[#FF9B71]/15 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 text-[#EC4940]" />
                          <span>
                            Agregar a mi selección ({quantities[greek.id] ?? 0})
                          </span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.article>

              {/* Chapter 03 */}
              <motion.article
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={SPRING_PHYSICS}
                className="border-t border-[#1A1412]/15 pt-8"
              >
                <div className="flex items-center justify-between text-xs text-[#EC4940] font-medium mb-4">
                  <span>CAPÍTULO 03 · SELECCIÓN &amp; TRATO DIRECTO</span>
                  <span className="font-mono tabular-nums">03 / 03</span>
                </div>
                <h3 className="font-syne text-2xl md:text-4xl font-bold tracking-tight text-[#1A1412] mb-4">
                  Arma tu Pedido y Consulta Directamente en Cuenca
                </h3>
                <p className="text-base text-[#1A1412]/80 leading-relaxed mb-6 max-w-2xl">
                  Explora las fotografías reales de nuestro catálogo, reúne tus
                  sabores favoritos en tu selección interactiva y consulta
                  precios oficiales, contenido neto y disponibilidad de entrega o
                  retiro directamente por WhatsApp con nuestro equipo en{' '}
                  <strong className="text-[#1A1412]">
                    27 B.A PORTETE, Cuenca
                  </strong>
                  .
                </p>
                <div className="p-5 bg-[#FF9B71]/15 border border-[#EC4940]/40 text-xs text-[#1A1412]/85 leading-relaxed">
                  <strong className="text-[#EC4940] uppercase tracking-wider block mb-1">
                    Nota de Transparencia Comercial
                  </strong>
                  {MORLAKA_BRAND.demoDisclaimer}
                </div>
              </motion.article>
            </div>
          </div>
        </section>

        {/* =====================================================================
            SECCIÓN 4: GALERÍA HORIZONTAL DE SABORES (Scroll-World: h-[400vh] + sticky top-0 h-screen + X -70%)
        ====================================================================== */}
        <section
          ref={horizontalSectionRef}
          id="galeria-sabores"
          aria-labelledby="sabores-heading"
          className="relative h-[400vh] bg-[#FDFBF7] border-b border-[#1A1412]/15"
        >
          <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between bg-[#FDFBF7] pt-20 pb-6">
            {/* Top Bar inside Sticky Viewport */}
            <div className="px-6 md:px-12 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#1A1412]/15 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#EC4940] font-semibold mb-1.5">
                  <span>03. Catálogo La Morlaka</span>
                  <span aria-hidden="true">·</span>
                  <span>Scroll Horizontal Interactivo</span>
                </div>
                <h2
                  id="sabores-heading"
                  className="font-syne text-3xl sm:text-5xl lg:text-[4.4vw] font-extrabold tracking-tighter leading-none text-[#1A1412]"
                >
                  ELIGE TUS{' '}
                  <span className="bg-gradient-to-r from-[#EC4940] to-[#FF9B71] bg-clip-text text-transparent">
                    FAVORITOS.
                  </span>
                </h2>
              </div>

              {/* Quick Jump Controls for Accessibility & Direct Navigation */}
              <div className="flex flex-wrap items-center gap-1.5">
                {MORLAKA_PRODUCTS.map((product, idx) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => jumpToFlavorCard(idx)}
                    className="px-3 py-1.5 text-xs font-medium border border-[#1A1412]/20 bg-[#FDFBF7] hover:border-[#EC4940] hover:bg-[#FF9B71]/15 transition-colors whitespace-nowrap shrink-0 cursor-pointer tabular-nums"
                  >
                    {product.indexNumber}. {product.shortTitle}
                  </button>
                ))}
              </div>
            </div>

            {/* Horizontal Moving Track Mapped to scrollYProgress [0, 1] -> ["0%", "-70%"] */}
            <div className="relative flex-1 flex items-center overflow-hidden pl-6 md:pl-12">
              <motion.div
                style={{ x: horizontalX }}
                className="flex items-stretch gap-8 md:gap-10 pr-24 will-change-transform"
              >
                {MORLAKA_PRODUCTS.map((product) => {
                  const qty = quantities[product.id] ?? 0;
                  const singleWaUrl = `https://wa.me/${
                    MORLAKA_BRAND.whatsappNumber
                  }?text=${encodeURIComponent(product.whatsappSingleText)}`;

                  return (
                    <motion.article
                      key={product.id}
                      whileHover={{ y: -6 }}
                      transition={SPRING_PHYSICS}
                      className="group relative w-[84vw] sm:w-[390px] md:w-[420px] shrink-0 bg-[#F7F2E7] border border-[#1A1412]/20 hover:border-[#EC4940] flex flex-col justify-between p-5 md:p-6 overflow-hidden transition-colors"
                    >
                      {/* Mandatory Subtle Tinted Overlay in #FF9B71 on Hover */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-[#FF9B71]/0 group-hover:bg-[#FF9B71]/18 transition-colors duration-300 z-10"
                      />

                      {/* Card Header */}
                      <div className="relative z-20 flex items-center justify-between text-xs border-b border-[#1A1412]/15 pb-2.5 mb-3">
                        <div className="flex items-center gap-2 text-[#1A1412]/70">
                          <span className="font-mono font-bold text-[#EC4940] tabular-nums">
                            {product.indexNumber}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{product.categoryLabel}</span>
                        </div>
                        <span className="font-mono font-semibold text-sm text-[#1A1412] tabular-nums">
                          {product.priceFormatted}
                        </span>
                      </div>

                      {/* Product Photo */}
                      <div
                        onClick={() => setActiveProductModal(product)}
                        className="relative z-20 aspect-[4/3] max-h-[190px] md:max-h-[210px] w-full bg-[#FDFBF7] border border-[#1A1412]/10 p-3 mb-4 flex items-center justify-center overflow-hidden cursor-pointer"
                      >
                        <ResilientProductImage
                          src={product.imageLocal}
                          fallbackSrc={product.imageRemote}
                          alt={`${product.name} La Morlaka`}
                          title={product.shortTitle}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute bottom-2 right-2 text-[11px] bg-[#FDFBF7]/90 border border-[#1A1412]/15 px-2 py-0.5 text-[#1A1412]/75">
                          Ver ficha
                        </span>
                      </div>

                      {/* Product Info & Interactive Stepper */}
                      <div className="relative z-20 space-y-3">
                        <div>
                          <p className="text-[11px] text-[#EC4940] font-medium">
                            {product.probioticProfile}
                          </p>
                          <h3 className="font-syne text-2xl md:text-3xl font-extrabold tracking-tight text-[#1A1412]">
                            {product.shortTitle}
                          </h3>
                          <p className="text-xs md:text-sm text-[#1A1412]/75 mt-1 line-clamp-2">
                            {product.editorialNote}
                          </p>
                        </div>

                        <div className="text-[11px] text-[#1A1412]/65 pt-2 border-t border-[#1A1412]/10 flex items-center justify-between">
                          <span>{product.presentation}</span>
                          <span className="font-mono tabular-nums">
                            Demo: {product.priceFormatted}
                          </span>
                        </div>

                        {/* Quantity & Add Controls */}
                        <div className="pt-2 flex items-center gap-3">
                          <div className="flex items-center border border-[#1A1412]/30 bg-[#FDFBF7]">
                            <button
                              type="button"
                              onClick={() =>
                                handleAdjustQuantity(product, -1, true)
                              }
                              aria-label={`Reducir cantidad de ${product.name}`}
                              className="w-9 h-9 flex items-center justify-center text-[#1A1412] hover:bg-[#FF9B71]/25 transition-colors cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span
                              aria-label={`Cantidad seleccionada de ${product.name}`}
                              className="w-10 text-center font-mono text-xs font-bold tabular-nums text-[#1A1412]"
                            >
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleAdjustQuantity(product, 1, true)
                              }
                              aria-label={`Aumentar cantidad de ${product.name}`}
                              className="w-9 h-9 flex items-center justify-center text-[#1A1412] hover:bg-[#FF9B71]/25 transition-colors cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <MagneticButton
                            variant={qty > 0 ? 'coral' : 'primary'}
                            onClick={() =>
                              handleAdjustQuantity(product, 1, true)
                            }
                            ariaLabel={`Agregar ${product.name} al pedido`}
                            className="flex-1 py-2.5 px-4 text-xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>
                              {qty > 0 ? `En selección (${qty})` : 'Agregar'}
                            </span>
                          </MagneticButton>
                        </div>

                        <div className="pt-1 flex items-center justify-between">
                          <a
                            href={singleWaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#EC4940] hover:underline underline-offset-4"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Consultar por WhatsApp ↗</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => setActiveProductModal(product)}
                            className="text-xs text-[#1A1412]/70 hover:text-[#1A1412] underline underline-offset-4 cursor-pointer"
                          >
                            Notas de cata
                          </button>
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </motion.div>
            </div>

            {/* Bottom Progress Rail inside Sticky Viewport */}
            <div className="px-6 md:px-12 pt-4 border-t border-[#1A1412]/15 flex items-center justify-between gap-6">
              <div className="flex items-center gap-3 text-xs text-[#1A1412]/70 whitespace-nowrap">
                <span>DESLIZA PARA RECORRER LOS 6 SABORES</span>
                <span aria-hidden="true">·</span>
                <span className="text-[#EC4940] font-medium">
                  Mora · Fresa · Mango · Durazno · Griego Natural · Frutos Rojos
                </span>
              </div>
              <div className="w-48 md:w-72 h-1.5 bg-[#1A1412]/10 overflow-hidden shrink-0">
                <motion.div
                  style={{ scaleX: smoothHorizontalProgress }}
                  className="h-full origin-left bg-gradient-to-r from-[#EC4940] to-[#FF9B71]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            SECCIÓN 5: BENTO GRID DE BENEFICIOS, RESEÑAS REALES, CATÁLOGO RÁPIDO Y FAQ
        ====================================================================== */}
        <section
          id="beneficios-probioticos"
          aria-labelledby="bento-heading"
          className="px-6 md:px-12 py-24 md:py-36 bg-[#FDFBF7] border-b border-[#1A1412]/15"
        >
          {/* Section Header */}
          <div className="max-w-5xl mb-16">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#EC4940] font-semibold mb-3">
              <span>04. Arquitectura Nutricional &amp; Social Proof</span>
              <span aria-hidden="true">·</span>
              <span>Cuenca, Ecuador</span>
            </div>
            <h2
              id="bento-heading"
              className="font-syne text-[10vw] sm:text-[7.5vw] font-extrabold tracking-tighter leading-none text-[#1A1412] text-balance"
            >
              PROBIÓTICOS VIVOS.{' '}
              <span className="bg-gradient-to-r from-[#EC4940] to-[#FF9B71] bg-clip-text text-transparent">
                SABOR REAL.
              </span>
            </h2>
          </div>

          {/* Asymmetric Brutalist Bento Grid (Zero Generic Shadow, 1px Hairline Architecture) */}
          <div className="grid grid-cols-1 md:grid-cols-12 border-t border-l border-[#1A1412]/20">
            {/* Bento Cell 1: Feature 01 Esencia Artesanal (7 cols) */}
            <motion.article
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={SPRING_PHYSICS}
              className="md:col-span-7 border-r border-b border-[#1A1412]/20 p-8 md:p-12 bg-[#FDFBF7] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-xs text-[#EC4940] font-medium mb-8">
                <span>PILAR {MORLAKA_BENEFITS[0].number} · IDENTIDAD</span>
                <span className="font-mono tabular-nums">CUENCA · ECUADOR</span>
              </div>
              <div className="space-y-4 my-auto">
                <h3 className="font-syne text-3xl md:text-5xl font-extrabold tracking-tight text-[#1A1412]">
                  {MORLAKA_BENEFITS[0].title}
                </h3>
                <p className="text-base md:text-lg text-[#1A1412]/80 leading-relaxed max-w-xl">
                  {MORLAKA_BENEFITS[0].description}
                </p>
              </div>
              <div className="pt-8 mt-8 border-t border-[#1A1412]/15 flex items-baseline justify-between">
                <span className="text-xs text-[#1A1412]/65">
                  {MORLAKA_BENEFITS[0].metricLabel}
                </span>
                <span className="font-syne text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-[#EC4940] to-[#FF9B71] bg-clip-text text-transparent tabular-nums">
                  {MORLAKA_BENEFITS[0].metric}
                </span>
              </div>
            </motion.article>

            {/* Bento Cell 2: Feature 02 Fuente de Probióticos (5 cols) */}
            <motion.article
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={SPRING_PHYSICS}
              className="md:col-span-5 border-r border-b border-[#1A1412]/20 p-8 md:p-12 bg-[#F7F2E7] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-xs text-[#EC4940] font-medium mb-8">
                <span>PILAR {MORLAKA_BENEFITS[1].number} · BIENESTAR</span>
                <ShieldCheck className="w-4 h-4 text-[#EC4940]" />
              </div>
              <div className="space-y-4 my-auto">
                <h3 className="font-syne text-3xl md:text-4xl font-extrabold tracking-tight text-[#1A1412]">
                  {MORLAKA_BENEFITS[1].title}
                </h3>
                <p className="text-sm md:text-base text-[#1A1412]/80 leading-relaxed">
                  {MORLAKA_BENEFITS[1].description}
                </p>
              </div>
              <div className="pt-8 mt-8 border-t border-[#1A1412]/15 flex items-baseline justify-between">
                <span className="text-xs text-[#1A1412]/65">
                  {MORLAKA_BENEFITS[1].metricLabel}
                </span>
                <span className="font-syne text-4xl font-extrabold text-[#EC4940]">
                  {MORLAKA_BENEFITS[1].metric}
                </span>
              </div>
            </motion.article>

            {/* Bento Cell 3: Visual Showcase of Mango & Durazno (5 cols) */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={SPRING_PHYSICS}
              className="md:col-span-5 border-r border-b border-[#1A1412]/20 p-8 md:p-10 bg-[#F7F2E7] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-xs text-[#1A1412]/70 mb-4">
                <span>FRUTAS TROPICALES &amp; DE HUERTO</span>
                <span className="font-mono text-[#EC4940] tabular-nums">
                  USD 3.50
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 my-4">
                {[MORLAKA_PRODUCTS[2], MORLAKA_PRODUCTS[3]].map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#FDFBF7] border border-[#1A1412]/10 p-3 flex flex-col items-center text-center"
                  >
                    <div className="aspect-[4/5] w-full mb-2">
                      <ResilientProductImage
                        src={item.imageLocal}
                        fallbackSrc={item.imageRemote}
                        alt={item.name}
                        title={item.shortTitle}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="font-syne font-bold text-sm text-[#1A1412]">
                      {item.shortTitle}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleAdjustQuantity(item, 1, true)}
                      className="mt-2 w-full py-1.5 text-[11px] font-medium border border-[#EC4940] text-[#EC4940] hover:bg-[#EC4940] hover:text-[#FDFBF7] transition-colors cursor-pointer"
                    >
                      + Sumar ({quantities[item.id] ?? 0})
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#1A1412]/70">
                Mango y Durazno en presentación artesanal tipo suizo: dulzor
                equilibrado y textura cremosa.
              </p>
            </motion.div>

            {/* Bento Cell 4: Feature 03 Elige y Consulta + Interactive Quick Filter Grid (7 cols) */}
            <motion.article
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={SPRING_PHYSICS}
              className="md:col-span-7 border-r border-b border-[#1A1412]/20 p-8 md:p-12 bg-[#FDFBF7] flex flex-col justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div>
                    <span className="text-xs uppercase tracking-widest text-[#EC4940] font-semibold">
                      PILAR {MORLAKA_BENEFITS[2].number} · SELECCIÓN RÁPIDA
                    </span>
                    <h3 className="font-syne text-2xl md:text-4xl font-extrabold tracking-tight text-[#1A1412] mt-1">
                      {MORLAKA_BENEFITS[2].title}
                    </h3>
                  </div>

                  {/* Interactive Filter Buttons (Functional Segmented Control) */}
                  <div
                    role="group"
                    aria-label="Filtrar catálogo por línea de yogur"
                    className="flex items-center border border-[#1A1412]/20 bg-[#F7F2E7] p-1"
                  >
                    {(
                      [
                        { key: 'todos', label: 'Todos (6)' },
                        { key: 'suizo', label: 'Tipo Suizo (4)' },
                        { key: 'griego', label: 'Griegos (2)' },
                      ] as const
                    ).map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setCategoryFilter(tab.key)}
                        className={`px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          categoryFilter === tab.key
                            ? 'bg-[#EC4940] text-[#FDFBF7]'
                            : 'text-[#1A1412]/75 hover:text-[#1A1412]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Compact Interactive Product Matrix */}
                <div className="divide-y divide-[#1A1412]/15 border-t border-b border-[#1A1412]/15">
                  {filteredCatalog.map((prod) => {
                    const count = quantities[prod.id] ?? 0;
                    return (
                      <div
                        key={prod.id}
                        className="py-3.5 flex items-center justify-between gap-4 hover:bg-[#FF9B71]/10 px-2 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="font-mono text-xs text-[#EC4940] font-bold tabular-nums">
                            {prod.indexNumber}
                          </span>
                          <div className="min-w-0">
                            <p className="font-syne font-bold text-sm md:text-base text-[#1A1412] truncate">
                              {prod.name}
                            </p>
                            <p className="text-xs text-[#1A1412]/65">
                              {prod.categoryLabel} · Demo {prod.priceFormatted}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              handleAdjustQuantity(prod, -1, true)
                            }
                            aria-label={`Quitar una unidad de ${prod.name}`}
                            className="w-8 h-8 border border-[#1A1412]/25 flex items-center justify-center hover:border-[#EC4940] cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center font-mono text-xs font-bold tabular-nums">
                            {count}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAdjustQuantity(prod, 1, true)}
                            aria-label={`Sumar una unidad de ${prod.name}`}
                            className="w-8 h-8 border border-[#EC4940] bg-[#EC4940] text-[#FDFBF7] flex items-center justify-center hover:bg-[#d83b32] cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-6 mt-6 flex flex-wrap items-center justify-between gap-4">
                <div className="text-xs text-[#1A1412]/75">
                  <span>Seleccionados: </span>
                  <strong className="font-mono tabular-nums text-[#1A1412]">
                    {orderSummary.totalUnits} unidades
                  </strong>
                  <span aria-hidden="true"> · </span>
                  <span>Subtotal demo: </span>
                  <strong className="font-mono tabular-nums text-[#EC4940]">
                    {orderSummary.subtotalFormatted}
                  </strong>
                </div>
                <MagneticButton
                  variant="coral"
                  onClick={() => setIsDrawerOpen(true)}
                  className="px-5 py-2.5 text-xs"
                >
                  <span>Ver resumen del pedido</span>
                  <ArrowUpRight className="w-4 h-4" />
                </MagneticButton>
              </div>
            </motion.article>
          </div>

          {/* ===================================================================
              QUIENES YA LO PROBARON: 3 RESEÑAS REALES DE CLIENTES EN CUENCA
          ==================================================================== */}
          <div id="opiniones-cuenca" className="mt-24 md:mt-32">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-[#1A1412]/15">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#EC4940] font-semibold mb-2">
                  Quienes ya lo probaron · Testimonios Reales
                </p>
                <h3 className="font-syne text-3xl sm:text-5xl font-extrabold tracking-tight text-[#1A1412]">
                  El sabor también se cuenta.
                </h3>
              </div>
              <p className="text-xs text-[#1A1412]/65 mt-2 md:mt-0">
                Reseñas auténticas publicadas por clientes de La Morlaka en
                Cuenca
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-[#1A1412]/20">
              {MORLAKA_REVIEWS.map((review, index) => (
                <motion.article
                  key={review.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ ...SPRING_PHYSICS, delay: index * 0.08 }}
                  className="border-r border-b border-[#1A1412]/20 p-8 md:p-10 bg-[#FDFBF7] hover:bg-[#FF9B71]/10 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#EC4940] font-mono mb-6">
                      <span>TESTIMONIO 0{index + 1}</span>
                      <span>CUENCA</span>
                    </div>
                    <blockquote className="font-syne text-lg md:text-xl font-bold text-[#1A1412] leading-snug mb-6">
                      “{review.quote}”
                    </blockquote>
                  </div>
                  <div className="pt-4 border-t border-[#1A1412]/15">
                    <cite className="not-italic font-semibold text-sm text-[#1A1412] block">
                      {review.author}
                    </cite>
                    <span className="text-xs text-[#1A1412]/65">
                      {review.role}
                    </span>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>

          {/* ===================================================================
              PREGUNTAS FRECUENTES REALES + RESUMEN DE PEDIDO EN PÁGINA
          ==================================================================== */}
          <div className="mt-24 md:mt-32 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left: Real FAQs from Systeme.io page */}
            <div className="lg:col-span-7">
              <p className="text-xs uppercase tracking-widest text-[#EC4940] font-semibold mb-2">
                Antes de escribirnos
              </p>
              <h3 className="font-syne text-3xl sm:text-5xl font-extrabold tracking-tight text-[#1A1412] mb-8">
                Tus preguntas, más claras.
              </h3>

              <div className="divide-y divide-[#1A1412]/20 border-t border-b border-[#1A1412]/20">
                {MORLAKA_FAQS.map((faq) => {
                  const isOpen = openFaqId === faq.id;
                  return (
                    <div key={faq.id} className="py-5">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenFaqId(isOpen ? '' : faq.id)
                        }
                        aria-expanded={isOpen}
                        className="w-full flex items-center justify-between gap-4 text-left font-syne text-lg md:text-xl font-bold text-[#1A1412] hover:text-[#EC4940] transition-colors cursor-pointer"
                      >
                        <span>{faq.question}</span>
                        <ChevronDown
                          className={`w-5 h-5 text-[#EC4940] shrink-0 transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={SPRING_PHYSICS}
                            className="overflow-hidden"
                          >
                            <p className="pt-3 text-sm md:text-base text-[#1A1412]/80 leading-relaxed">
                              {faq.answer}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Embedded Order Builder Card ("Tu pedido") */}
            <div
              id="tu-pedido"
              className="lg:col-span-5 bg-[#F7F2E7] border border-[#1A1412] p-8 md:p-10 space-y-6"
            >
              <div className="flex items-start justify-between border-b border-[#1A1412]/20 pb-5">
                <div>
                  <p className="text-xs uppercase tracking-widest text-[#EC4940] font-semibold">
                    Revisa tu selección
                  </p>
                  <h3 className="font-syne text-3xl font-extrabold text-[#1A1412] mt-1">
                    Tu pedido
                  </h3>
                </div>
                <span className="font-mono text-sm font-bold text-[#EC4940] tabular-nums border border-[#EC4940] px-3 py-1 bg-[#FDFBF7]">
                  {orderSummary.totalUnits}{' '}
                  {orderSummary.totalUnits === 1 ? 'unidad' : 'unidades'}
                </span>
              </div>

              <p className="text-xs text-[#1A1412]/70">
                Modo demostración: solo solicitud de información directa por
                WhatsApp.
              </p>

              {orderSummary.hasItems ? (
                <div className="divide-y divide-[#1A1412]/15 border-t border-b border-[#1A1412]/15 max-h-72 overflow-y-auto pr-1">
                  {orderSummary.items.map((item) => {
                    const productObj = MORLAKA_PRODUCTS.find(
                      (p) => p.id === item.id
                    )!;
                    return (
                      <div
                        key={item.id}
                        className="py-3 flex items-center justify-between gap-3"
                      >
                        <div>
                          <p className="font-syne font-bold text-sm text-[#1A1412]">
                            {item.name}
                          </p>
                          <p className="font-mono text-xs text-[#EC4940] tabular-nums">
                            {item.quantity} × USD{' '}
                            {(item.priceCents / 100).toFixed(2)} ={' '}
                            {item.lineTotalFormatted}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              handleAdjustQuantity(productObj, -1, false)
                            }
                            aria-label={`Disminuir ${item.name}`}
                            className="w-7 h-7 border border-[#1A1412]/25 bg-[#FDFBF7] flex items-center justify-center hover:border-[#EC4940] cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center font-mono text-xs font-bold tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleAdjustQuantity(productObj, 1, false)
                            }
                            aria-label={`Aumentar ${item.name}`}
                            className="w-7 h-7 border border-[#1A1412]/25 bg-[#FDFBF7] flex items-center justify-center hover:border-[#EC4940] cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 bg-[#FDFBF7] border border-[#1A1412]/15 text-center text-sm text-[#1A1412]/70">
                  Tu selección está vacía. Agrega tus yogures favoritos desde el
                  catálogo.
                </div>
              )}

              <div className="space-y-2 pt-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs uppercase tracking-wider text-[#1A1412]/70">
                    Subtotal de demostración
                  </span>
                  <strong className="font-syne text-xl font-extrabold text-[#EC4940] tabular-nums">
                    {orderSummary.subtotalFormatted}
                  </strong>
                </div>
                <p className="text-xs text-[#1A1412]/65">
                  Precios ficticios de demostración; confirma los valores
                  oficiales, entrega y forma de pago directamente con La
                  Morlaka.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <MagneticButton
                  href={orderSummary.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="coral"
                  className="flex-1 py-3.5"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Consultar selección por WhatsApp</span>
                </MagneticButton>
                <button
                  type="button"
                  onClick={handleClearSelection}
                  disabled={!orderSummary.hasItems}
                  className="px-4 py-3 text-xs font-medium border border-[#1A1412]/30 text-[#1A1412] hover:border-[#EC4940] hover:text-[#EC4940] disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  Vaciar selección
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* =====================================================================
          SECCIÓN 6: FOOTER MASIVO (Ubicación Real en Cuenca + Tipografía Monumental)
          Estrictamente sobre fondo Crema Cálido #F5EFE4 / #FDFBF7 (CERO fondo negro)
      ====================================================================== */}
      <footer
        id="ubicacion-cuenca"
        aria-labelledby="footer-heading"
        className="bg-[#F5EFE4] text-[#1A1412] pt-20 pb-12 px-6 md:px-12 border-t-2 border-[#EC4940] overflow-hidden"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-[#1A1412]/15">
          {/* Location & Hours */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-3">
              <img
                src={MORLAKA_BRAND.logoLocal}
                onError={(e) => {
                  e.currentTarget.src = MORLAKA_BRAND.logoRemote;
                }}
                referrerPolicy="no-referrer"
                alt="Logotipo oficial La Morlaka"
                className="w-14 h-14 object-cover border border-[#EC4940]"
              />
              <div>
                <p className="text-xs uppercase tracking-widest text-[#EC4940] font-semibold">
                  La Morlaka · Cuenca
                </p>
                <h2
                  id="footer-heading"
                  className="font-syne text-2xl md:text-3xl font-extrabold text-[#1A1412]"
                >
                  Ubicación y horario
                </h2>
              </div>
            </div>

            <div className="space-y-3 text-sm md:text-base text-[#1A1412]/85">
              <p className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#EC4940] shrink-0 mt-0.5" />
                <span>
                  <strong>Dirección en Cuenca:</strong> 27 B.A PORTETE, Cuenca,
                  Ecuador.
                </span>
              </p>
              <p className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#EC4940] shrink-0 mt-0.5" />
                <span>
                  <strong>Horario:</strong> lunes a viernes, de 8:00 a. m. a
                  5:00 p. m.
                </span>
              </p>
              <p className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#EC4940] shrink-0 mt-0.5" />
                <span>
                  <strong>WhatsApp:</strong> +593 99 561 3421
                </span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <MagneticButton
                href={MORLAKA_BRAND.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="outline"
              >
                <MapPin className="w-4 h-4 text-[#EC4940]" />
                <span>Ver ubicación en Google Maps ↗</span>
              </MagneticButton>

              <MagneticButton
                href={MORLAKA_BRAND.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="ghost"
              >
                <Instagram className="w-4 h-4 text-[#EC4940]" />
                <span>Instagram · {MORLAKA_BRAND.instagramHandle} ↗</span>
              </MagneticButton>
            </div>
          </div>

          {/* Direct Catalog Links & WhatsApp Dispatch */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8 lg:pl-12 lg:border-l lg:border-[#1A1412]/15">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-widest text-[#EC4940] font-semibold">
                Línea Tipo Suizo · Fuente de Probióticos
              </p>
              <ul className="space-y-2.5 text-sm">
                {MORLAKA_PRODUCTS.filter((p) => p.category === 'suizo').map(
                  (item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between border-b border-[#1A1412]/10 pb-2"
                    >
                      <button
                        type="button"
                        onClick={() => setActiveProductModal(item)}
                        className="hover:text-[#EC4940] font-medium text-left cursor-pointer"
                      >
                        {item.indexNumber}. {item.name}
                      </button>
                      <span className="font-mono text-xs text-[#EC4940] tabular-nums">
                        {item.priceFormatted}
                      </span>
                    </li>
                  )
                )}
              </ul>
            </div>

            <div className="space-y-4">
              <p className="text-xs uppercase tracking-widest text-[#EC4940] font-semibold">
                Línea Yogures Griegos · Cuenca
              </p>
              <ul className="space-y-2.5 text-sm">
                {MORLAKA_PRODUCTS.filter((p) => p.category === 'griego').map(
                  (item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between border-b border-[#1A1412]/10 pb-2"
                    >
                      <button
                        type="button"
                        onClick={() => setActiveProductModal(item)}
                        className="hover:text-[#EC4940] font-medium text-left cursor-pointer"
                      >
                        {item.indexNumber}. {item.name}
                      </button>
                      <span className="font-mono text-xs text-[#EC4940] tabular-nums">
                        {item.priceFormatted}
                      </span>
                    </li>
                  )
                )}
              </ul>

              <div className="pt-4">
                <p className="text-xs text-[#1A1412]/70 mb-3">
                  Consulta las condiciones de entrega o retiro directamente con
                  el negocio en Cuenca.
                </p>
                <MagneticButton
                  href={orderSummary.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="primary"
                  className="w-full"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Escribir a WhatsApp (+593 99 561 3421)</span>
                </MagneticButton>
              </div>
            </div>
          </div>
        </div>

        {/* Monumental Brutalist Display Wordmark */}
        <div className="pt-10 pb-6 select-none overflow-hidden">
          <p className="font-syne text-[8.6vw] whitespace-nowrap font-extrabold tracking-tighter leading-none bg-gradient-to-r from-[#EC4940] via-[#EC4940] to-[#FF9B71] bg-clip-text text-transparent">
            LA MORLAKA
          </p>
        </div>

        <div className="pt-6 border-t border-[#1A1412]/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#1A1412]/70">
          <p>
            © {new Date().getFullYear()} La Morlaka · Yogur artesanal tipo suizo
            &amp; yogur griego · Cuenca, Ecuador.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="#hero-editorial"
              className="hover:text-[#EC4940] underline underline-offset-4"
            >
              Volver arriba ↑
            </a>
            <span aria-hidden="true">·</span>
            <a
              href={MORLAKA_BRAND.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#EC4940] underline underline-offset-4"
            >
              Instagram @yogurtmorlaca
            </a>
          </div>
        </div>
      </footer>

      {/* =====================================================================
          SLIDE-OVER DRAWER: MI SELECCIÓN / CARRITO DE CONSULTA WHATSAPP
      ====================================================================== */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div
            className="fixed inset-0 z-50 flex justify-end bg-[#1A1412]/30 backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={SPRING_PHYSICS}
              className="w-full max-w-md bg-[#FDFBF7] h-full border-l-2 border-[#EC4940] p-6 md:p-8 flex flex-col justify-between overflow-y-auto"
            >
              <div>
                <div className="flex items-center justify-between border-b border-[#1A1412]/15 pb-5">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-[#EC4940] font-semibold">
                      La Morlaka · Cuenca
                    </p>
                    <h2
                      id="drawer-title"
                      className="font-syne text-2xl font-extrabold text-[#1A1412]"
                    >
                      Mi Selección ({orderSummary.totalUnits})
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    aria-label="Cerrar panel de selección"
                    className="p-2 border border-[#1A1412]/20 hover:border-[#EC4940] text-[#1A1412] cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-6 space-y-4">
                  {orderSummary.hasItems ? (
                    orderSummary.items.map((item) => {
                      const productObj = MORLAKA_PRODUCTS.find(
                        (p) => p.id === item.id
                      )!;
                      return (
                        <div
                          key={item.id}
                          className="p-4 bg-[#F7F2E7] border border-[#1A1412]/15 flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={productObj.imageLocal}
                              onError={(e) => {
                                e.currentTarget.src = productObj.imageRemote;
                              }}
                              referrerPolicy="no-referrer"
                              alt={item.name}
                              className="w-12 h-14 object-contain bg-[#FDFBF7] border border-[#1A1412]/10 p-1"
                            />
                            <div>
                              <h3 className="font-syne font-bold text-sm text-[#1A1412]">
                                {item.name}
                              </h3>
                              <p className="font-mono text-xs text-[#EC4940] tabular-nums">
                                {item.lineTotalFormatted} ref.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                handleAdjustQuantity(productObj, -1, false)
                              }
                              aria-label={`Reducir ${item.name}`}
                              className="w-7 h-7 bg-[#FDFBF7] border border-[#1A1412]/25 flex items-center justify-center hover:border-[#EC4940] cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center font-mono text-xs font-bold tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleAdjustQuantity(productObj, 1, false)
                              }
                              aria-label={`Aumentar ${item.name}`}
                              className="w-7 h-7 bg-[#FDFBF7] border border-[#1A1412]/25 flex items-center justify-center hover:border-[#EC4940] cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleSetExactQuantity(productObj, 0)
                              }
                              aria-label={`Eliminar ${item.name}`}
                              className="ml-1 p-1.5 text-[#1A1412]/60 hover:text-[#EC4940] cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 bg-[#F7F2E7] border border-[#1A1412]/15 text-center space-y-3">
                      <p className="text-sm text-[#1A1412]/75">
                        Tu selección está vacía. Agrega sabores como Mora Andina
                        o Fresa Natural para armar tu consulta.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          handleAdjustQuantity(MORLAKA_PRODUCTS[0], 1, true);
                          handleAdjustQuantity(MORLAKA_PRODUCTS[1], 1, true);
                        }}
                        className="px-4 py-2 text-xs font-medium bg-[#EC4940] text-[#FDFBF7] cursor-pointer"
                      >
                        + Cargar Mora &amp; Fresa de prueba
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-[#1A1412]/20 space-y-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs uppercase tracking-wider text-[#1A1412]/70">
                    Subtotal referencial demo
                  </span>
                  <strong className="font-syne text-2xl font-extrabold text-[#EC4940] tabular-nums">
                    {orderSummary.subtotalFormatted}
                  </strong>
                </div>
                <p className="text-[11px] text-[#1A1412]/65 leading-relaxed">
                  La selección se enviará como consulta de demostración a
                  WhatsApp (+593 99 561 3421). No procesa pagos en línea; todo
                  se coordina directamente con La Morlaka en Cuenca.
                </p>

                <div className="space-y-2.5">
                  <MagneticButton
                    href={orderSummary.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="coral"
                    className="w-full py-3.5"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Consultar selección por WhatsApp ↗</span>
                  </MagneticButton>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleClearSelection}
                      disabled={!orderSummary.hasItems}
                      className="flex-1 py-2.5 text-xs font-medium border border-[#1A1412]/25 hover:border-[#EC4940] disabled:opacity-40 cursor-pointer"
                    >
                      Vaciar selección
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDrawerOpen(false)}
                      className="flex-1 py-2.5 text-xs font-medium border border-[#1A1412]/25 hover:border-[#1A1412] cursor-pointer"
                    >
                      Seguir explorando
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =====================================================================
          MODAL EDITORIAL DE DETALLE DE SABOR
      ====================================================================== */}
      <AnimatePresence>
        {activeProductModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-[#1A1412]/35 backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-flavor-title"
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={SPRING_PHYSICS}
              className="w-full max-w-2xl bg-[#FDFBF7] border-2 border-[#EC4940] p-6 md:p-10 relative max-h-[90vh] overflow-y-auto"
            >
              <button
                type="button"
                onClick={() => setActiveProductModal(null)}
                aria-label="Cerrar ficha de sabor"
                className="absolute top-5 right-5 p-2 border border-[#1A1412]/20 hover:border-[#EC4940] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
                <div className="aspect-[4/5] bg-[#F7F2E7] border border-[#1A1412]/15 p-6 flex items-center justify-center">
                  <ResilientProductImage
                    src={activeProductModal.imageLocal}
                    fallbackSrc={activeProductModal.imageRemote}
                    alt={activeProductModal.name}
                    title={activeProductModal.shortTitle}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="space-y-4">
                  <div className="text-xs text-[#EC4940] font-semibold uppercase tracking-widest">
                    {activeProductModal.indexNumber} ·{' '}
                    {activeProductModal.categoryLabel}
                  </div>
                  <h3
                    id="modal-flavor-title"
                    className="font-syne text-3xl font-extrabold text-[#1A1412]"
                  >
                    {activeProductModal.name}
                  </h3>
                  <p className="text-sm text-[#1A1412]/80 leading-relaxed">
                    {activeProductModal.editorialNote}
                  </p>

                  <div className="pt-3 border-t border-[#1A1412]/15 space-y-1.5 text-xs">
                    <p>
                      <strong>Perfil:</strong>{' '}
                      {activeProductModal.probioticProfile}
                    </p>
                    <p>
                      <strong>Notas:</strong>{' '}
                      {activeProductModal.tastingNotes.join(' · ')}
                    </p>
                    <p>
                      <strong>Presentación:</strong>{' '}
                      {activeProductModal.presentation}
                    </p>
                    <p>
                      <strong>Precio ref. demo:</strong>{' '}
                      <span className="font-mono font-bold text-[#EC4940]">
                        {activeProductModal.priceFormatted}
                      </span>
                    </p>
                  </div>

                  <div className="pt-4 flex items-center gap-3">
                    <MagneticButton
                      variant="coral"
                      onClick={() => {
                        handleAdjustQuantity(activeProductModal, 1, true);
                        setActiveProductModal(null);
                      }}
                      className="flex-1 py-3 text-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Agregar al pedido</span>
                    </MagneticButton>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Live Toast Feedback */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={SPRING_PHYSICS}
            className="fixed bottom-5 right-5 z-50 bg-[#FDFBF7] border-2 border-[#EC4940] px-4 py-3 text-xs font-medium text-[#1A1412] flex items-center gap-2.5"
          >
            <Check className="w-4 h-4 text-[#EC4940]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
