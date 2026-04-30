"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useSyncExternalStore } from "react";
import type { SiteContent } from "@/lib/types";
import { ThemeModeToggle } from "./theme-mode-toggle";
import styles from "./events-page.module.scss";

type EventsPageProps = {
  content: SiteContent;
};

type Locale = "en" | "es";

type EventCopy = {
  navHome: string;
  navServices: string;
  navLessons: string;
  navContact: string;
  languageLabel: string;
  kicker: string;
  title: string;
  subtitle: string;
  intro: string;
  primaryCta: string;
  secondaryCta: string;
  sectionLabel: string;
  sectionTitle: string;
  sectionText: string;
  formatsLabel: string;
  formatsTitle: string;
  galleryLabel: string;
  galleryTitle: string;
  contactTitle: string;
  contactText: string;
  eventFormats: Array<{
    title: string;
    eyebrow: string;
    description: string;
    image: string;
  }>;
  gallery: Array<{
    title: string;
    place: string;
    images: string[];
  }>;
};

let localeHydrated = false;

function getStoredLocale(): Locale {
  if (typeof window === "undefined" || !localeHydrated) {
    return "en";
  }

  const saved = window.localStorage.getItem("site-locale");

  if (saved === "en" || saved === "es") {
    return saved;
  }

  return window.navigator.language.toLowerCase().startsWith("es") ? "es" : "en";
}

function subscribeLocale(callback: () => void) {
  localeHydrated = true;
  window.setTimeout(callback, 0);
  window.addEventListener("storage", callback);
  window.addEventListener("site-locale-change", callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("site-locale-change", callback);
  };
}

function setStoredLocale(locale: Locale) {
  window.localStorage.setItem("site-locale", locale);
  window.dispatchEvent(new Event("site-locale-change"));
}

const eventCopy: Record<Locale, EventCopy> = {
  en: {
    navHome: "Home",
    navServices: "Services",
    navLessons: "Lessons",
    navContact: "Contact",
    languageLabel: "Change language",
    kicker: "Live guitar for rooms that need atmosphere, taste, and pulse",
    title: "Events shaped by tone, timing, and musical intention.",
    subtitle:
      "From intimate dinners to hotel lounges, beach ceremonies, casino nights, corporate activations, gallery openings, and full-stage sets.",
    intro:
      "Guillermo brings a refined guitar voice that can sit elegantly in the background or become the emotional center of the room. Jazz harmony, blues-rock touch, Latin warmth, acoustic sensitivity, and professional stage awareness make each event feel curated rather than generic.",
    primaryCta: "Request event availability",
    secondaryCta: "See event formats",
    sectionLabel: "Performance direction",
    sectionTitle: "A versatile guitarist for elegant and high-energy settings.",
    sectionText:
      "The set can be built around warm solo guitar, tasteful standards, instrumental pop, blues-rock edge, Latin color, acoustic ceremony music, or a more energetic band-ready sound. The goal is simple: support the room, honor the occasion, and give the event a memorable musical identity.",
    formatsLabel: "Event formats",
    formatsTitle: "Where the guitar fits beautifully",
    galleryLabel: "Photo journal",
    galleryTitle: "Real rooms, edited with a cinematic stage treatment.",
    contactTitle: "Tell us what kind of room you are building.",
    contactText:
      "Share the date, city, venue type, desired mood, schedule, and whether you need solo guitar, amplified ambience, ceremony music, cocktail sets, or a bigger live sound.",
    eventFormats: [
      {
        eyebrow: "Hotels & lounges",
        title: "Lobby, rooftop, and cocktail ambience",
        description:
          "Sophisticated instrumental guitar for arrivals, receptions, hotel bars, rooftop evenings, and spaces where the music needs polish without overpowering conversation.",
        image: "/events/hotel1.jpg"
      },
      {
        eyebrow: "Private dining",
        title: "Restaurants, tastings, and intimate dinners",
        description:
          "Warm jazz, blues, boleros, acoustic textures, and elegant background performance designed around timing, service, and the natural rhythm of the table.",
        image: "/events/restaurant1.jpg"
      },
      {
        eyebrow: "Weddings & destination events",
        title: "Ceremonies, beach moments, and sunset sets",
        description:
          "A refined guitar presence for ceremonies, vows, cocktail hours, beach clubs, terraces, and destination celebrations that need emotion without excess.",
        image: "/events/beach1.jpg"
      },
      {
        eyebrow: "Stages & nightlife",
        title: "Casino nights, showcases, and live sets",
        description:
          "A more electric vocabulary for venues, casinos, cultural programming, artist showcases, and moments where the guitar should step forward.",
        image: "/events/casino1.jpg"
      }
    ],
    gallery: [
      {
        title: "Stage-ready glow",
        place: "Live performance",
        images: ["/events/main1-gallery.jpg", "/events/main2-gallery.jpg", "/events/stage1.jpg"]
      },
      {
        title: "Hotel ambience",
        place: "Lobby, lounge, and cocktail hour",
        images: ["/events/hotel1.jpg", "/events/hotel2.jpg"]
      },
      {
        title: "Cultural rooms",
        place: "Gallery openings and urban performance",
        images: ["/events/gallery1.jpg", "/events/trainstation1.jpg"]
      },
      {
        title: "Restaurant atmosphere",
        place: "Private dining",
        images: ["/events/restaurant1.jpg"]
      },
      {
        title: "Coastal ceremony",
        place: "Beach event",
        images: ["/events/beach1.jpg"]
      },
      {
        title: "Casino night",
        place: "Nightlife",
        images: ["/events/casino1.jpg"]
      },
      {
        title: "Studio detail",
        place: "Preparation and tone design",
        images: ["/events/studio1.jpg"]
      }
    ]
  },
  es: {
    navHome: "Inicio",
    navServices: "Servicios",
    navLessons: "Clases",
    navContact: "Contacto",
    languageLabel: "Cambiar idioma",
    kicker: "Guitarra en vivo para espacios que necesitan ambiente, gusto y pulso",
    title: "Eventos construidos con tono, timing e intención musical.",
    subtitle:
      "Desde cenas íntimas hasta lounges de hotel, ceremonias en playa, noches de casino, activaciones corporativas, galerías y sets de escenario.",
    intro:
      "Guillermo aporta una voz de guitarra refinada que puede acompañar con elegancia o convertirse en el centro emocional del espacio. Armonía jazz, toque blues-rock, calidez latina, sensibilidad acústica y oficio escénico hacen que cada evento se sienta curado, no genérico.",
    primaryCta: "Consultar disponibilidad",
    secondaryCta: "Ver formatos",
    sectionLabel: "Dirección musical",
    sectionTitle: "Un guitarrista versátil para espacios elegantes y momentos con energía.",
    sectionText:
      "El set puede construirse con guitarra solista cálida, standards con buen gusto, pop instrumental, filo blues-rock, color latino, música acústica para ceremonia o un sonido más eléctrico. La meta es simple: sostener el ambiente, honrar la ocasión y darle identidad musical al evento.",
    formatsLabel: "Formatos de evento",
    formatsTitle: "Donde la guitarra encaja con naturalidad",
    galleryLabel: "Diario visual",
    galleryTitle: "Espacios reales con tratamiento cinematográfico de escenario.",
    contactTitle: "Cuéntanos qué tipo de ambiente estás construyendo.",
    contactText:
      "Comparte fecha, ciudad, tipo de venue, mood deseado, horario y si necesitas guitarra solista, ambiente amplificado, música de ceremonia, coctel o un sonido en vivo más grande.",
    eventFormats: [
      {
        eyebrow: "Hoteles y lounges",
        title: "Ambiente para lobby, rooftop y coctel",
        description:
          "Guitarra instrumental sofisticada para recepciones, bares de hotel, rooftops y espacios donde la música debe sentirse pulida sin cubrir la conversación.",
        image: "/events/hotel1.jpg"
      },
      {
        eyebrow: "Cenas privadas",
        title: "Restaurantes, degustaciones y cenas íntimas",
        description:
          "Jazz cálido, blues, boleros, texturas acústicas y performance de fondo diseñada alrededor del timing, el servicio y el ritmo natural de la mesa.",
        image: "/events/restaurant1.jpg"
      },
      {
        eyebrow: "Bodas y destino",
        title: "Ceremonias, playa y sets de atardecer",
        description:
          "Una presencia refinada de guitarra para ceremonias, votos, cocteles, beach clubs, terrazas y celebraciones destino que necesitan emoción sin exceso.",
        image: "/events/beach1.jpg"
      },
      {
        eyebrow: "Escenario y noche",
        title: "Casinos, showcases y sets en vivo",
        description:
          "Un vocabulario más eléctrico para venues, casinos, programación cultural, showcases y momentos donde la guitarra debe dar un paso al frente.",
        image: "/events/casino1.jpg"
      }
    ],
    gallery: [
      {
        title: "Brillo de escenario",
        place: "Performance en vivo",
        images: ["/events/main1-gallery.jpg", "/events/main2-gallery.jpg", "/events/stage1.jpg"]
      },
      {
        title: "Ambiente de hotel",
        place: "Lobby, lounge y coctel",
        images: ["/events/hotel1.jpg", "/events/hotel2.jpg"]
      },
      {
        title: "Espacios culturales",
        place: "Galerías y performance urbana",
        images: ["/events/gallery1.jpg", "/events/trainstation1.jpg"]
      },
      {
        title: "Ambiente de restaurante",
        place: "Cena privada",
        images: ["/events/restaurant1.jpg"]
      },
      {
        title: "Ceremonia costera",
        place: "Evento de playa",
        images: ["/events/beach1.jpg"]
      },
      {
        title: "Noche de casino",
        place: "Nightlife",
        images: ["/events/casino1.jpg"]
      },
      {
        title: "Detalle de estudio",
        place: "Preparación y diseño de tono",
        images: ["/events/studio1.jpg"]
      }
    ]
  }
};

export function EventsPage({ content }: EventsPageProps) {
  const locale = useSyncExternalStore<Locale>(subscribeLocale, getStoredLocale, () => "en");
  const copy = eventCopy[locale];

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const pageStyle = {
    ...(content.theme.backgroundImage
      ? { "--hero-image": `url(${content.theme.backgroundImage})` }
      : {}),
    ...(content.theme.light.backgroundImage
      ? { "--light-hero-image": `url(${content.theme.light.backgroundImage})` }
      : {})
  } as CSSProperties;

  return (
    <main className={styles.page} style={pageStyle} data-theme-scope>
      <nav className={styles.nav} aria-label="Events navigation">
        <Link className={styles.brand} href="/">
          <span>GL</span>
          <strong>{content.siteTitle}</strong>
        </Link>
        <div className={styles.navLinks}>
          <Link href="/">{copy.navHome}</Link>
          <Link href="/#services">{copy.navServices}</Link>
          <Link href="/#lessons">{copy.navLessons}</Link>
          <Link href="/#contact">{copy.navContact}</Link>
          <LanguageToggle locale={locale} onChange={setStoredLocale} label={copy.languageLabel} />
          <ThemeModeToggle />
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>{copy.kicker}</p>
          <h1>{copy.title}</h1>
          <p>{copy.subtitle}</p>
          <div className={styles.heroActions}>
            <a className={styles.primaryButton} href={`mailto:${content.contactEmail}`}>
              {copy.primaryCta}
            </a>
            <a className={styles.secondaryButton} href="#formats">
              {copy.secondaryCta}
            </a>
          </div>
        </div>
        <div className={styles.heroMedia} aria-label="Live guitar event photography">
          <Image src="/events/main1-gallery.jpg" alt="" width={1140} height={540} priority />
          <Image src="/events/main2-gallery.jpg" alt="" width={1140} height={540} priority />
        </div>
      </section>

      <section className={styles.statement}>
        <div>
          <p className={styles.sectionLabel}>{copy.sectionLabel}</p>
          <h2>{copy.sectionTitle}</h2>
        </div>
        <p>{copy.sectionText}</p>
      </section>

      <section id="formats" className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionLabel}>{copy.formatsLabel}</p>
          <h2>{copy.formatsTitle}</h2>
          <p>{copy.intro}</p>
        </div>
        <div className={styles.formatGrid}>
          {copy.eventFormats.map((format) => (
            <article key={format.title} className={styles.formatCard}>
              <Image src={format.image} alt="" width={900} height={720} />
              <div>
                <span>{format.eyebrow}</span>
                <h3>{format.title}</h3>
                <p>{format.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionLabel}>{copy.galleryLabel}</p>
          <h2>{copy.galleryTitle}</h2>
        </div>
        <div className={styles.photoWall}>
          {copy.gallery.map((item, index) => (
            <figure
              key={item.title}
              className={[
                styles.muralScene,
                index === 0 ? styles.featuredScene : "",
                item.images.length > 1 ? styles.layeredScene : ""
              ].filter(Boolean).join(" ")}
            >
              <div className={styles.muralImages}>
                {item.images.map((image, imageIndex) => (
                  <Image
                    key={image}
                    src={image}
                    alt={`${item.title} - ${item.place}`}
                    width={1280}
                    height={900}
                    className={imageIndex === 0 ? styles.primaryPhoto : styles.secondaryPhoto}
                  />
                ))}
              </div>
              <figcaption>
                <strong>{item.title}</strong>
                <span>{item.place}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className={styles.contact}>
        <p className={styles.sectionLabel}>Booking</p>
        <h2>{copy.contactTitle}</h2>
        <p>{copy.contactText}</p>
        <a className={styles.primaryButton} href={`mailto:${content.contactEmail}`}>
          {content.contactEmail}
        </a>
      </section>
    </main>
  );
}

function LanguageToggle({
  locale,
  onChange,
  label
}: {
  locale: Locale;
  onChange: (locale: Locale) => void;
  label: string;
}) {
  const nextLocale = locale === "en" ? "es" : "en";

  return (
    <button
      className={styles.languageToggle}
      type="button"
      aria-label={label}
      onClick={() => onChange(nextLocale)}
    >
      <span className={locale === "en" ? styles.activeLanguage : undefined}>EN</span>
      <span className={locale === "es" ? styles.activeLanguage : undefined}>ES</span>
    </button>
  );
}
