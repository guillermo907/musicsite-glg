"use client";

import type { SiteContent } from "@/lib/types";
import Image from "next/image";
import { useEffect, useSyncExternalStore } from "react";
import { ThemeModeToggle } from "./theme-mode-toggle";
import styles from "./home-page.module.scss";

type HomePageProps = {
  content: SiteContent;
};

type Locale = "en" | "es";

let localeHydrated = false;

function getStoredLocale(): Locale {
  if (typeof window === "undefined") {
    return "en";
  }

  if (!localeHydrated) {
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

export function HomePage({ content }: HomePageProps) {
  const locale = useSyncExternalStore<Locale>(subscribeLocale, getStoredLocale, () => "en");

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const localized: SiteContent = {
    ...content,
    ...(locale === "es" ? content.locales?.es : undefined),
    theme: content.theme,
    seo: content.seo,
    socialLinks: content.socialLinks,
    locales: content.locales
  };

  const labels =
    locale === "es"
      ? {
          bio: "Bio",
          services: "Servicios",
          events: "Eventos",
          lessons: "Clases",
          contact: "Contacto",
          kicker: "Estudio de guitarra jazz / música en vivo / sonido de sesión",
          bioLabel: "Formación formal, sensación eléctrica",
          servicesLabel: "Servicios",
          servicesTitle: "Creado para situaciones musicales serias.",
          lessonsLabel: "Paquetes de clases",
          lessonsTitle: "Educación musical con pulso de escenario.",
          galleryLabel: "Galería",
          galleryTitle: "Brillo de amplificador, madera, armonía nocturna.",
          videoLabel: "Video",
          contactLabel: "Contacto",
          identitySmall: "Improvisación, tono, armonía, performance",
          identityTop: "Oficio de conservatorio",
          identityMain: "Jazz / Blues / Rock",
          languageLabel: "Cambiar idioma"
        }
      : {
          bio: "Bio",
          services: "Services",
          events: "Events",
          lessons: "Lessons",
          contact: "Contact",
          kicker: "Jazz guitar studio / live performance / session sound",
          bioLabel: "Formal training, electric feel",
          servicesLabel: "Services",
          servicesTitle: "Built for serious musical situations.",
          lessonsLabel: "Lesson packages",
          lessonsTitle: "Music education with a performance pulse.",
          galleryLabel: "Gallery",
          galleryTitle: "Amplifier glow, wood grain, late-night harmony.",
          videoLabel: "Video",
          contactLabel: "Contact",
          identitySmall: "Improvisation, tone, harmony, performance",
          identityTop: "Conservatory craft",
          identityMain: "Jazz / Blues / Rock",
          languageLabel: "Change language"
        };

  const bgStyle = {
    ...(content.theme.backgroundImage
      ? { "--hero-image": `url(${content.theme.backgroundImage})` }
      : {}),
    ...(content.theme.light.backgroundImage
      ? { "--light-hero-image": `url(${content.theme.light.backgroundImage})` }
      : {})
  } as React.CSSProperties;

  return (
    <main className={styles.page} style={bgStyle} data-theme-scope>
      <nav className={styles.nav} aria-label="Main navigation">
        <a className={styles.brand} href="#top">
          <span>GL</span>
          <strong>{content.siteTitle}</strong>
        </a>
        <div className={styles.navLinks}>
          <a href="#bio">{labels.bio}</a>
          <a href="#services">{labels.services}</a>
          <a href="/events">{labels.events}</a>
          <a href="#lessons">{labels.lessons}</a>
          <a href="#contact">{labels.contact}</a>
          <LanguageToggle locale={locale} onChange={setStoredLocale} label={labels.languageLabel} />
          <ThemeModeToggle />
        </div>
      </nav>

      <section id="top" className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>{labels.kicker}</p>
          <h1>{localized.siteTitle}</h1>
          <h2>{localized.subtitle}</h2>
          <p>{localized.heroText}</p>
          <div className={styles.heroActions}>
            <a className={styles.primaryButton} href={`mailto:${localized.contactEmail}`}>
              {localized.primaryCta}
            </a>
            <a className={styles.secondaryButton} href="#lessons">
              {localized.secondaryCta}
            </a>
          </div>
        </div>
        <div className={styles.heroCard} aria-label="Musician identity card">
          <span className={styles.stringLine} />
          <span className={styles.stringLine} />
          <span className={styles.stringLine} />
          <div>
            <p>{labels.identityTop}</p>
            <strong>{labels.identityMain}</strong>
          </div>
          <small>{labels.identitySmall}</small>
        </div>
      </section>

      <section id="bio" className={styles.bio}>
        <div>
          <p className={styles.sectionLabel}>{labels.bioLabel}</p>
          <h2>{localized.bioTitle}</h2>
        </div>
        <div>
          <p>{localized.bioText}</p>
          <ul>
            {localized.credentials.map((credential) => (
              <li key={credential}>{credential}</li>
            ))}
          </ul>
        </div>
      </section>

      <section id="services" className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionLabel}>{labels.servicesLabel}</p>
          <h2>{labels.servicesTitle}</h2>
          <p>{localized.servicesIntro}</p>
        </div>
        <div className={styles.serviceGrid}>
          {localized.services.map((service) => (
            <article key={service.title} className={styles.serviceCard}>
              <span>{service.eyebrow}</span>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="lessons" className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionLabel}>{labels.lessonsLabel}</p>
          <h2>{labels.lessonsTitle}</h2>
          <p>{localized.lessonIntro}</p>
        </div>
        <div className={styles.packageGrid}>
          {localized.lessonPackages.map((lessonPackage) => (
            <article key={lessonPackage.title} className={styles.packageCard}>
              <h3>{lessonPackage.title}</h3>
              <strong>{lessonPackage.price}</strong>
              <span>{lessonPackage.cadence}</span>
              <p>{lessonPackage.description}</p>
              <ul>
                {lessonPackage.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <p className={styles.bookingInfo}>{localized.bookingInfo}</p>
      </section>

      {localized.videoUrl ? (
        <section className={`${styles.section} ${styles.videoSection}`} aria-label={localized.videoTitle}>
          <div className={styles.videoCopy}>
            <p className={styles.sectionLabel}>{labels.videoLabel}</p>
            <h2>{localized.videoTitle}</h2>
            <p>{localized.videoText}</p>
          </div>
          <VideoEmbed title={localized.videoTitle} url={localized.videoUrl} />
        </section>
      ) : null}

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionLabel}>{labels.galleryLabel}</p>
          <h2>{labels.galleryTitle}</h2>
          <p>{localized.galleryIntro}</p>
        </div>
        <div className={styles.gallery}>
          {localized.gallery.map((item) => (
            <article key={item.title}>
              <Image src={item.image} alt="" width={900} height={780} unoptimized />
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.testimonials} aria-label="Testimonials">
        {localized.testimonials.map((testimonial) => (
          <figure key={testimonial.name}>
            <blockquote>{testimonial.quote}</blockquote>
            <figcaption>
              <strong>{testimonial.name}</strong>
              <span>{testimonial.role}</span>
            </figcaption>
          </figure>
        ))}
      </section>

      <section id="contact" className={styles.contact}>
        <p className={styles.sectionLabel}>{labels.contactLabel}</p>
        <h2>{localized.contactTitle}</h2>
        <p>{localized.contactText}</p>
        <a className={styles.primaryButton} href={`mailto:${localized.contactEmail}`}>
          {localized.contactEmail}
        </a>
        <div className={styles.socials}>
          <a href={content.socialLinks.instagram}>Instagram</a>
          <a href={content.socialLinks.youtube}>YouTube</a>
          <a href={content.socialLinks.spotify}>Spotify</a>
        </div>
      </section>
    </main>
  );
}

function VideoEmbed({ title, url }: { title: string; url: string }) {
  const videoId = getYouTubeVideoId(url);
  const embedUrl = getYouTubeEmbedUrl(videoId);

  return (
    <details className={styles.videoFrame}>
      <summary
        style={{
          "--video-poster": `url(https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg)`
        } as React.CSSProperties}
      >
        <span>Play</span>
      </summary>
      <iframe
        title={title}
        src={embedUrl}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </details>
  );
}

function getYouTubeVideoId(url: string) {
  const fallbackId = "AZGrF-8FmM4";

  try {
    const parsed = new URL(url);
    const videoId =
      parsed.hostname.includes("youtu.be")
        ? parsed.pathname.slice(1)
        : parsed.searchParams.get("v") ?? parsed.pathname.split("/").filter(Boolean).at(-1);

    return videoId || fallbackId;
  } catch {
    return fallbackId;
  }
}

function getYouTubeEmbedUrl(videoId: string) {
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&controls=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&disablekb=1&fs=0`;
}

function LanguageToggle({
  locale,
  label,
  onChange
}: {
  locale: Locale;
  label: string;
  onChange: (locale: Locale) => void;
}) {
  return (
    <button
      className={styles.languageToggle}
      type="button"
      aria-label={label}
      onClick={() => onChange(locale === "en" ? "es" : "en")}
    >
      <span className={locale === "en" ? styles.activeLanguage : undefined}>EN</span>
      <span className={locale === "es" ? styles.activeLanguage : undefined}>ES</span>
    </button>
  );
}
