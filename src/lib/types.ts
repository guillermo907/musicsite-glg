export type ServiceCard = {
  title: string;
  eyebrow: string;
  description: string;
};

export type LessonPackage = {
  title: string;
  price: string;
  cadence: string;
  description: string;
  features: string[];
};

export type GalleryItem = {
  title: string;
  description: string;
  image: string;
};

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
};

export type SiteCopy = {
  siteTitle: string;
  subtitle: string;
  heroText: string;
  primaryCta: string;
  secondaryCta: string;
  bioTitle: string;
  bioText: string;
  credentials: string[];
  servicesIntro: string;
  services: ServiceCard[];
  lessonIntro: string;
  lessonPackages: LessonPackage[];
  bookingInfo: string;
  videoTitle: string;
  videoText: string;
  videoUrl: string;
  galleryIntro: string;
  gallery: GalleryItem[];
  testimonials: Testimonial[];
  contactTitle: string;
  contactText: string;
  contactEmail: string;
};

export type SiteLocale = "en" | "es";

export type LocalizedSiteCopy = Partial<SiteCopy>;

export type ThemeSettings = {
  accent: string;
  accentAlt: string;
  background: string;
  backgroundImage: string;
  contrast: "soft" | "balanced" | "high" | "editorial";
};

export type SiteContent = SiteCopy & {
  theme: ThemeSettings & {
    light: ThemeSettings;
  };
  seo: {
    title: string;
    description: string;
    ogImage: string;
  };
  socialLinks: {
    instagram: string;
    youtube: string;
    spotify: string;
  };
  locales?: Partial<Record<Exclude<SiteLocale, "en">, LocalizedSiteCopy>>;
};
