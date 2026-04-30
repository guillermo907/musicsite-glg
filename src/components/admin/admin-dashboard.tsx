"use client";

import { useActionState, useRef, useState, useSyncExternalStore } from "react";
import { saveSiteContentAction, signOutAction, type SaveState } from "@/app/actions/site-content";
import {
  contrastGrade,
  contrastRatio,
  contrastTokens,
  normalizeThemeForStorage,
  normalizeSiteTheme,
  readableTextColor
} from "@/lib/contrast";
import { defaultContent } from "@/lib/default-content";
import type { GalleryItem, LessonPackage, ServiceCard, SiteContent, Testimonial } from "@/lib/types";
import NextImage from "next/image";
import Link from "next/link";
import { LiveThemePreview } from "./live-theme-preview";
import styles from "./admin-dashboard.module.scss";

type AdminDashboardProps = {
  initialContent: SiteContent;
  userEmail: string;
};

const initialState: SaveState = {
  ok: false,
  message: ""
};

const DEFAULT_THEME = defaultContent.theme;
const themeModeEvent = "auto-gdl-theme-change";

function getStoredThemeMode(): "dark" | "light" {
  if (typeof window === "undefined") {
    return "dark";
  }

  try {
    const stored = window.localStorage.getItem("auto-gdl-theme");

    return stored === "light" || stored === "dark" ? stored : "dark";
  } catch {
    return "dark";
  }
}

function subscribeThemeMode(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(themeModeEvent, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(themeModeEvent, callback);
  };
}

export function AdminDashboard({ initialContent, userEmail }: AdminDashboardProps) {
  const [content, setContent] = useState(initialContent);
  const [paletteVariants, setPaletteVariants] = useState<PaletteVariantSet>({ dark: [], light: [] });
  const [selectedVariant, setSelectedVariant] = useState<SelectedVariant>({ dark: 0, light: 0 });
  const activePalette = useSyncExternalStore<"dark" | "light">(
    subscribeThemeMode,
    getStoredThemeMode,
    () => "dark"
  );
  const [state, formAction, pending] = useActionState(saveSiteContentAction, initialState);
  const payloadRef = useRef<HTMLInputElement>(null);
  const normalizedTheme = normalizeSiteTheme(content.theme);
  const contrast = normalizedTheme;
  const lightContrast = normalizedTheme.light;

  function setAdminThemeMode(mode: "dark" | "light") {
    if (typeof document === "undefined") {
      return;
    }

    document.documentElement.dataset.theme = mode;
    document.documentElement.style.colorScheme = mode;

    try {
      window.localStorage.setItem("auto-gdl-theme", mode);
      window.dispatchEvent(new Event(themeModeEvent));
    } catch {
      // Storage can be unavailable in private or restricted contexts.
    }
  }

  function update<K extends keyof SiteContent>(key: K, value: SiteContent[K]) {
    setContent((current) => ({ ...current, [key]: value }));
  }

  function updateTheme<K extends keyof SiteContent["theme"]>(key: K, value: SiteContent["theme"][K]) {
    setContent((current) => ({ ...current, theme: { ...current.theme, [key]: value } }));
  }

  function updateLightTheme<K extends keyof SiteContent["theme"]["light"]>(
    key: K,
    value: SiteContent["theme"]["light"][K]
  ) {
    setContent((current) => ({
      ...current,
      theme: {
        ...current.theme,
        light: normalizeSiteTheme({
          ...current.theme,
          light: {
            ...current.theme.light,
            [key]: value
          }
        }).light
      }
    }));
  }

  function applyPaletteVariant(
    mode: "dark" | "light",
    index: number,
    variants: PaletteVariantSet = paletteVariants
  ) {
    const variant = variants[mode][index] ?? variants[mode][0];

    if (!variant) {
      return;
    }

    setSelectedVariant((current) => ({ ...current, [mode]: index }));
    setContent((current) => {
      if (mode === "dark") {
        return {
          ...current,
          theme: {
            ...current.theme,
            accent: variant.tokens.accent,
            accentAlt: variant.tokens.accentAlt,
            background: variant.tokens.background
          }
        };
      }

      return {
        ...current,
        theme: {
          ...current.theme,
          light: {
            ...normalizeSiteTheme(current.theme).light,
            accent: variant.tokens.accent,
            accentAlt: variant.tokens.accentAlt,
            background: variant.tokens.background
          }
        }
      };
    });
  }

  async function generateWallpaperPalettes(wallpaper: string) {
    if (!wallpaper) {
      setPaletteVariants({ dark: [], light: [] });
      setSelectedVariant({ dark: 0, light: 0 });
      return null;
    }

    const variants = await extractPaletteOptions(wallpaper);
    setPaletteVariants(variants);
    setSelectedVariant({ dark: 0, light: 0 });
    applyPaletteVariant("dark", 0, variants);
    applyPaletteVariant("light", 0, variants);

    return variants;
  }

  function updateSeo<K extends keyof SiteContent["seo"]>(key: K, value: SiteContent["seo"][K]) {
    setContent((current) => ({ ...current, seo: { ...current.seo, [key]: value } }));
  }

  function updateSocial<K extends keyof SiteContent["socialLinks"]>(
    key: K,
    value: SiteContent["socialLinks"][K]
  ) {
    setContent((current) => ({
      ...current,
      socialLinks: { ...current.socialLinks, [key]: value }
    }));
  }

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <div>
          <p>Admin dashboard</p>
          <h1>Musician site editor</h1>
          <span>Signed in as {userEmail}</span>
        </div>
        <div className={styles.headerActions}>
          <Link className={styles.homeLink} href="/">
            Go back home
          </Link>
          <form action={signOutAction}>
            <button type="submit">Sign out</button>
          </form>
        </div>
      </header>

      <div className={styles.workspace}>
        <form
          action={formAction}
          className={styles.editor}
          onSubmit={() => {
            const normalizedContent = {
              ...content,
              theme: normalizeThemeForStorage(content.theme)
            };

            setContent(normalizedContent);

            if (payloadRef.current) {
              payloadRef.current.value = JSON.stringify(normalizedContent);
            }
          }}
        >
          <input ref={payloadRef} type="hidden" name="content" value={JSON.stringify(content)} readOnly />

          <EditorSection title="Quick style controls">
            <div className={styles.themeActions}>
              <div>
                <span>Theme studio</span>
                <p>Upload a wallpaper, extract colors, tune dark/light palettes, then save.</p>
              </div>
              <div className={styles.adminThemeToggle} aria-label="Admin preview theme">
                <button
                  className={activePalette === "dark" ? styles.activeThemeMode : undefined}
                  type="button"
                  onClick={() => setAdminThemeMode("dark")}
                >
                  <span aria-hidden="true">☾</span>
                  Dark
                </button>
                <button
                  className={activePalette === "light" ? styles.activeThemeMode : undefined}
                  type="button"
                  onClick={() => setAdminThemeMode("light")}
                >
                  <span aria-hidden="true">☀</span>
                  Light
                </button>
              </div>
              <button
                className={styles.resetTheme}
                type="button"
                onClick={() =>
                  setContent((current) => ({
                    ...current,
                    theme: { ...DEFAULT_THEME }
                  }))
                }
              >
                Regresar al tema original
              </button>
            </div>

            <WallpaperUploader
              mode={activePalette}
              paletteVariants={paletteVariants}
              selectedVariant={selectedVariant}
              currentImage={
                activePalette === "dark"
                  ? content.theme.backgroundImage
                  : content.theme.light.backgroundImage
              }
              onUploaded={(value) =>
                activePalette === "dark"
                  ? updateTheme("backgroundImage", value)
                  : updateLightTheme("backgroundImage", value)
              }
              onExtracted={generateWallpaperPalettes}
              onPalette={(index) => applyPaletteVariant(activePalette, index)}
            />

            <div className={styles.includedWallpapers}>
              <span>Included wallpapers</span>
              <WallpaperPresets
                value={
                  activePalette === "dark"
                    ? content.theme.backgroundImage
                    : content.theme.light.backgroundImage
                }
                onChange={(value) =>
                  void (async () => {
                    if (activePalette === "dark") {
                      updateTheme("backgroundImage", value);
                    } else {
                      updateLightTheme("backgroundImage", value);
                    }

                    if (value) {
                      await generateWallpaperPalettes(value);
                    }
                  })()
                }
              />
            </div>

            <div className={styles.paletteTabs} role="tablist" aria-label="Theme palette">
              <button
                className={activePalette === "dark" ? styles.activePaletteTab : undefined}
                type="button"
                onClick={() => setAdminThemeMode("dark")}
              >
                Dark palette
              </button>
              <button
                className={activePalette === "light" ? styles.activePaletteTab : undefined}
                type="button"
                onClick={() => setAdminThemeMode("light")}
              >
                Light palette
              </button>
            </div>

            {activePalette === "dark" ? (
              <PalettePanel
                accent={contrast.accent}
                accentAlt={contrast.accentAlt}
                background={contrast.background}
                contrast={content.theme.contrast}
                tokens={contrast}
                wallpaper={content.theme.backgroundImage}
                onAccent={(value) => updateTheme("accent", value)}
                onAccentAlt={(value) => updateTheme("accentAlt", value)}
                onBackground={(value) => updateTheme("background", value)}
                onContrast={(value) => updateTheme("contrast", value)}
                onWallpaper={(value) => updateTheme("backgroundImage", value)}
              />
            ) : (
              <PalettePanel
                accent={lightContrast.accent}
                accentAlt={lightContrast.accentAlt}
                background={lightContrast.background}
                contrast={content.theme.light.contrast}
                tokens={lightContrast}
                wallpaper={content.theme.light.backgroundImage}
                onAccent={(value) => updateLightTheme("accent", value)}
                onAccentAlt={(value) => updateLightTheme("accentAlt", value)}
                onBackground={(value) => updateLightTheme("background", value)}
                onContrast={(value) => updateLightTheme("contrast", value)}
                onWallpaper={(value) => updateLightTheme("backgroundImage", value)}
              />
            )}

          </EditorSection>

          <EditorSection title="Hero and identity">
            <Field label="Site title" value={content.siteTitle} onChange={(value) => update("siteTitle", value)} />
            <Field label="Subtitle" value={content.subtitle} onChange={(value) => update("subtitle", value)} />
            <Field
              label="Hero copy"
              value={content.heroText}
              multiline
              onChange={(value) => update("heroText", value)}
            />
            <div className={styles.twoColumn}>
              <Field
                label="Primary CTA"
                value={content.primaryCta}
                onChange={(value) => update("primaryCta", value)}
              />
              <Field
                label="Secondary CTA"
                value={content.secondaryCta}
                onChange={(value) => update("secondaryCta", value)}
              />
            </div>
          </EditorSection>

          <EditorSection title="Bio and credentials">
            <Field label="Bio title" value={content.bioTitle} onChange={(value) => update("bioTitle", value)} />
            <Field label="Bio text" value={content.bioText} multiline onChange={(value) => update("bioText", value)} />
            <ArrayText
              label="Credentials"
              items={content.credentials}
              onChange={(items) => update("credentials", items)}
            />
          </EditorSection>

          <EditorSection title="Services">
            <Field
              label="Services intro"
              value={content.servicesIntro}
              multiline
              onChange={(value) => update("servicesIntro", value)}
            />
            <ServiceEditor items={content.services} onChange={(items) => update("services", items)} />
          </EditorSection>

          <EditorSection title="Lessons and booking">
            <Field
              label="Lesson intro"
              value={content.lessonIntro}
              multiline
              onChange={(value) => update("lessonIntro", value)}
            />
            <PackageEditor
              items={content.lessonPackages}
              onChange={(items) => update("lessonPackages", items)}
            />
            <Field
              label="Booking info"
              value={content.bookingInfo}
              multiline
              onChange={(value) => update("bookingInfo", value)}
            />
          </EditorSection>

          <EditorSection title="Artist video">
            <Field label="Video title" value={content.videoTitle} onChange={(value) => update("videoTitle", value)} />
            <Field
              label="Video text"
              value={content.videoText}
              multiline
              onChange={(value) => update("videoText", value)}
            />
            <Field label="YouTube video URL" value={content.videoUrl} onChange={(value) => update("videoUrl", value)} />
          </EditorSection>

          <EditorSection title="Gallery">
            <Field
              label="Gallery intro"
              value={content.galleryIntro}
              multiline
              onChange={(value) => update("galleryIntro", value)}
            />
            <GalleryEditor items={content.gallery} onChange={(items) => update("gallery", items)} />
          </EditorSection>

          <EditorSection title="Testimonials">
            <TestimonialEditor
              items={content.testimonials}
              onChange={(items) => update("testimonials", items)}
            />
          </EditorSection>

          <EditorSection title="Theme, SEO, and contact">
            <div className={styles.twoColumn}>
              <Field label="Accent color" value={content.theme.accent} onChange={(value) => updateTheme("accent", value)} />
              <Field
                label="Secondary accent"
                value={content.theme.accentAlt}
                onChange={(value) => updateTheme("accentAlt", value)}
              />
            </div>
            <Field
              label="Background color"
              value={content.theme.background}
              onChange={(value) => updateTheme("background", value)}
            />
            <Field
              label="Background image URL"
              value={content.theme.backgroundImage}
              onChange={(value) => updateTheme("backgroundImage", value)}
            />
            <Field label="Contact title" value={content.contactTitle} onChange={(value) => update("contactTitle", value)} />
            <Field label="Contact text" value={content.contactText} multiline onChange={(value) => update("contactText", value)} />
            <Field label="Contact email" value={content.contactEmail} onChange={(value) => update("contactEmail", value)} />
            <Field label="SEO title" value={content.seo.title} onChange={(value) => updateSeo("title", value)} />
            <Field
              label="SEO description"
              value={content.seo.description}
              multiline
              onChange={(value) => updateSeo("description", value)}
            />
            <Field label="OG image" value={content.seo.ogImage} onChange={(value) => updateSeo("ogImage", value)} />
            <Field label="Instagram" value={content.socialLinks.instagram} onChange={(value) => updateSocial("instagram", value)} />
            <Field label="YouTube" value={content.socialLinks.youtube} onChange={(value) => updateSocial("youtube", value)} />
            <Field label="Spotify" value={content.socialLinks.spotify} onChange={(value) => updateSocial("spotify", value)} />
          </EditorSection>

          <div className={styles.saveBar}>
            <span className={state.ok ? styles.success : styles.error}>{state.message}</span>
            <button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save site"}
            </button>
          </div>
        </form>

        <aside className={styles.preview}>
          <div className={styles.previewHeader}>
            <span>Responsive preview</span>
            <a href="/" target="_blank">Open site</a>
          </div>
          <LiveThemePreview content={content} activePalette={activePalette} />
        </aside>
      </div>
    </main>
  );
}

function EditorSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(title === "Quick style controls");

  return (
    <section className={`${styles.section} ${open ? styles.sectionOpen : ""}`}>
      <button
        className={styles.sectionToggle}
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <h2>{title}</h2>
        <span>{open ? "Close" : "Open"}</span>
      </button>
      {open ? <div className={styles.fields}>{children}</div> : null}
    </section>
  );
}

function Field({
  label,
  value,
  multiline,
  onChange
}: {
  label: string;
  value: string;
  multiline?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      {multiline ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={4} />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}

function PalettePanel({
  accent,
  accentAlt,
  background,
  contrast,
  tokens,
  wallpaper,
  onAccent,
  onAccentAlt,
  onBackground,
  onContrast,
  onWallpaper
}: {
  accent: string;
  accentAlt: string;
  background: string;
  contrast: SiteContent["theme"]["contrast"];
  tokens: ReturnType<typeof contrastTokens> & { ink?: string };
  wallpaper: string;
  onAccent: (value: string) => void;
  onAccentAlt: (value: string) => void;
  onBackground: (value: string) => void;
  onContrast: (value: SiteContent["theme"]["contrast"]) => void;
  onWallpaper: (value: string) => void;
}) {
  const textRatio = contrastRatio(background, tokens.foreground);
  const buttonRatio = contrastRatio(accent, tokens.ink ?? readableTextColor(accent));

  return (
    <div className={styles.palettePanel}>
      <div className={styles.paletteGrid}>
        <ColorField label="Primary" value={accent} onChange={onAccent} />
        <ColorField label="Secondary" value={accentAlt} onChange={onAccentAlt} />
        <ColorField label="Background" value={background} onChange={onBackground} />
        <PaletteSwatch label="Surface" value={tokens.panelStrong} />
        <PaletteSwatch label="Text" value={tokens.foreground} />
        <PaletteSwatch label="Muted" value={tokens.muted} />
      </div>
      <ContrastDropdown value={contrast} onChange={onContrast} />
      <div className={styles.paletteMeta}>
        <strong>
          Text {textRatio.toFixed(1)}:1 <em>{contrastGrade(textRatio)}</em>
        </strong>
        <strong>
          Button {buttonRatio.toFixed(1)}:1 <em>{contrastGrade(buttonRatio)}</em>
        </strong>
      </div>
      <Field label="Wallpaper URL" value={wallpaper} onChange={onWallpaper} />
    </div>
  );
}

function PaletteSwatch({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.paletteSwatch}>
      <span>{label}</span>
      <i style={{ background: value }} />
      <strong>{value}</strong>
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className={styles.colorField}>
      <span>{label}</span>
      <input type="color" value={value} onChange={(event) => onChange(event.target.value)} />
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function WallpaperPresets({
  value,
  onChange
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const presets = [
    { label: "No wallpaper", value: "" },
    { label: "Jazz stage", value: "/gallery/jazz-stage.svg" },
    { label: "Blues amp", value: "/gallery/blues-amp.svg" },
    { label: "Lesson room", value: "/gallery/lesson-room.svg" }
  ];

  return (
    <div className={styles.presets} aria-label="Wallpaper presets">
      {presets.map((preset) => (
        <button
          className={value === preset.value ? styles.activePreset : undefined}
          key={preset.value || "none"}
          type="button"
          onClick={() => onChange(preset.value)}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}

function WallpaperUploader({
  mode,
  paletteVariants,
  selectedVariant,
  currentImage,
  onUploaded,
  onExtracted,
  onPalette
}: {
  mode: "dark" | "light";
  paletteVariants: PaletteVariantSet;
  selectedVariant: SelectedVariant;
  currentImage: string;
  onUploaded: (value: string) => void;
  onExtracted: (wallpaper: string) => Promise<PaletteVariantSet | null>;
  onPalette: (index: number) => void;
}) {
  const [status, setStatus] = useState<"idle" | "reading" | "processing" | "ready" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const activeOptions = paletteVariants[mode];
  const activeVariantIndex = selectedVariant[mode];

  async function handleFile(file?: File) {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setStatus("error");
      setProgress(0);
      setFileName("Please choose an image file.");
      return;
    }

    setFileName(file.name);
    setStatus("reading");
    setProgress(12);

    const reader = new FileReader();

    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        setProgress(Math.min(70, Math.round((event.loaded / event.total) * 70)));
      }
    };

    reader.onerror = () => {
      setStatus("error");
      setProgress(0);
      setFileName("Could not read that image.");
    };

    reader.onload = () => {
      setStatus("processing");
      setProgress(84);

      window.setTimeout(async () => {
        if (typeof reader.result === "string") {
          try {
            const compressed = await compressWallpaper(reader.result);

            if (compressed.length > 7_500_000) {
              setStatus("error");
              setProgress(0);
              setFileName("Image is still too large after compression. Try a smaller wallpaper.");
              return;
            }

            onUploaded(compressed);
            await onExtracted(compressed);
            setStatus("ready");
            setProgress(100);
          } catch {
            setStatus("error");
            setProgress(0);
            setFileName("Could not prepare that image.");
          }
        } else {
          setStatus("error");
          setProgress(0);
        }
      }, 260);
    };

    reader.readAsDataURL(file);
  }

  return (
    <div className={styles.uploader}>
      <div>
        <span>Custom wallpaper upload</span>
        <p>Drop in a stage photo, guitar close-up, studio wall, or abstract texture.</p>
      </div>
      <label className={styles.uploadTarget}>
        <input
          accept="image/*"
          type="file"
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
        <strong>{fileName || "Choose wallpaper image"}</strong>
        <small>JPG, PNG, WebP, SVG. Large files work, but compressed images load faster.</small>
      </label>
      <div className={styles.progressShell} aria-label="Upload progress">
        <div className={styles.progressTrack}>
          <span style={{ width: `${progress}%` }} />
        </div>
        <em>
          {status === "idle"
            ? "Waiting for image"
            : status === "reading"
              ? "Reading image..."
              : status === "processing"
                ? "Preparing live preview..."
                : status === "ready"
                  ? "Wallpaper ready. Save site to publish."
                  : "Upload failed"}
        </em>
      </div>
      {activeOptions.length > 0 ? (
        <div className={styles.palettePreview} aria-label="Extracted wallpaper colors">
          <span>Wallpaper color schemes</span>
          <div className={styles.schemeGrid}>
            {activeOptions.map((option, index) => (
              <button
                className={activeVariantIndex === index ? styles.activeScheme : undefined}
                key={`${mode}-${option.label}`}
                type="button"
                onClick={() => onPalette(index)}
              >
                <strong>{option.label}</strong>
                <span>
                  <i style={{ background: option.tokens.background }} />
                  <i style={{ background: option.tokens.accent }} />
                  <i style={{ background: option.tokens.accentAlt }} />
                </span>
              </button>
            ))}
          </div>
          <p>Choose one of five hue variants generated from the uploaded wallpaper.</p>
        </div>
      ) : null}
      {currentImage ? (
        <div className={styles.wallpaperPreview}>
          <NextImage src={currentImage} alt="" width={280} height={200} unoptimized />
          <button type="button" onClick={() => onUploaded("")}>
            Remove wallpaper
          </button>
        </div>
      ) : null}
    </div>
  );
}

type Rgb = {
  r: number;
  g: number;
  b: number;
};

type HslColor = {
  h: number;
  s: number;
  l: number;
};

type GeneratedThemeTokens = {
  accent: string;
  accentAlt: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
};

type PaletteVariant = {
  label: string;
  sourceHsl: HslColor;
  selectedHsl: HslColor;
  tokens: GeneratedThemeTokens;
};

type PaletteVariantSet = Record<"dark" | "light", PaletteVariant[]>;

type SelectedVariant = Record<"dark" | "light", number>;

function clampChannel(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function clampPercent(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function normalizeHue(hue: number) {
  return ((hue % 360) + 360) % 360;
}

function toHex({ r, g, b }: Rgb) {
  return `#${[r, g, b].map((value) => clampChannel(value).toString(16).padStart(2, "0")).join("")}`;
}

async function loadImage(dataUrl: string) {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new window.Image();
    element.onload = () => resolve(element);
    element.onerror = reject;
    element.src = dataUrl;
  });

  return image;
}

async function compressWallpaper(dataUrl: string) {
  const image = await loadImage(dataUrl);
  const maxSize = 1600;
  const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    return dataUrl;
  }

  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);

  const webp = canvas.toDataURL("image/webp", 0.82);

  if (webp.startsWith("data:image/webp") && webp.length < dataUrl.length) {
    return webp;
  }

  const jpeg = canvas.toDataURL("image/jpeg", 0.82);

  return jpeg.length < dataUrl.length ? jpeg : dataUrl;
}

async function extractPaletteOptions(dataUrl: string): Promise<PaletteVariantSet> {
  const dominantHsl = await extractDominantHslFromThumbnail(dataUrl);
  return createPaletteVariants(dominantHsl);
}

async function extractDominantHslFromThumbnail(dataUrl: string): Promise<HslColor> {
  const image = await loadImage(dataUrl);
  const canvas = document.createElement("canvas");
  const size = 200;
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    return { h: 42, s: 58, l: 52 };
  }

  const scale = Math.max(size / image.naturalWidth, size / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  const offsetX = (size - drawWidth) / 2;
  const offsetY = (size - drawHeight) / 2;
  context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);

  const pixels = context.getImageData(0, 0, size, size).data;
  const samples: HslColor[] = [];

  for (let index = 0; index < pixels.length; index += 16) {
    const alpha = pixels[index + 3];

    if (alpha < 180) {
      continue;
    }

    const hsl = rgbToHsl({
      r: pixels[index],
      g: pixels[index + 1],
      b: pixels[index + 2]
    });

    if (hsl.l > 4 && hsl.l < 97 && hsl.s > 8) {
      samples.push(hsl);
    }
  }

  if (samples.length === 0) {
    return { h: 42, s: 58, l: 52 };
  }

  return dominantClusterHsl(samples, 6);
}

function createPaletteVariants(sourceHsl: HslColor): PaletteVariantSet {
  const shifts = [0, 15, -30, 45, -60];

  const buildVariants = (mode: "dark" | "light") => shifts.map((shift) => {
    const selectedHsl = {
      h: normalizeHue(sourceHsl.h + shift),
      s: sourceHsl.s,
      l: sourceHsl.l
    };

    return {
      label: shift === 0 ? "Source hue" : `${shift > 0 ? "+" : ""}${shift}° hue`,
      sourceHsl,
      selectedHsl,
      tokens:
        mode === "light"
          ? enforceContrastLight(generateThemeTokens(selectedHsl, "light"))
          : enforceAccessibility(generateThemeTokens(selectedHsl, "dark"), "dark")
    };
  });

  return {
    dark: buildVariants("dark"),
    light: buildVariants("light")
  };
}

function generateThemeTokens(hsl: HslColor, mode: "dark" | "light"): GeneratedThemeTokens {
  const hue = normalizeHue(hsl.h);

  return {
    accent: hslToHex({ h: hue, s: 65, l: mode === "dark" ? 55 : 42 }),
    accentAlt: hslToHex({ h: hue + 180, s: 45, l: mode === "dark" ? 50 : 38 }),
    background: hslToHex({ h: hue, s: mode === "dark" ? 20 : 15, l: mode === "dark" ? 10 : 97 }),
    surface: hslToHex({ h: hue, s: mode === "dark" ? 15 : 12, l: mode === "dark" ? 18 : 92 }),
    text: hslToHex({ h: hue, s: 8, l: mode === "dark" ? 95 : 8 }),
    muted: hslToHex({ h: hue, s: 20, l: mode === "dark" ? 70 : 35 })
  };
}

function enforceAccessibility(tokens: GeneratedThemeTokens, mode: "dark" | "light"): GeneratedThemeTokens {
  if (mode === "light") {
    return enforceContrastLight(tokens);
  }

  return {
    ...tokens,
    text: adjustLightnessForContrast(tokens.text, tokens.background, 4.5, mode, "text"),
    accent: adjustLightnessForContrast(tokens.accent, tokens.background, 3, mode, "accent"),
    accentAlt: adjustLightnessForContrast(tokens.accentAlt, tokens.background, 3, mode, "accent"),
    muted: adjustLightnessForContrast(tokens.muted, tokens.background, 4.5, mode, "text")
  };
}

function enforceContrastLight(tokens: GeneratedThemeTokens): GeneratedThemeTokens {
  let text = darkenForContrast(tokens.text, tokens.background, 4.5, 5);
  text = darkenForContrast(text, tokens.surface, 4.5, 5);

  const primaryHsl = hexToHsl(tokens.accent);
  const primaryLabel = hslToHex({ h: primaryHsl.h, s: 8, l: primaryHsl.l > 55 ? 8 : 96 });
  let accent = tokens.accent;

  if (contrastRatio(primaryLabel, accent) < 4.5) {
    accent = primaryHsl.l > 55
      ? darkenForContrast(accent, primaryLabel, 4.5, 18)
      : lightenForContrast(accent, primaryLabel, 4.5, 88);
  }

  return {
    ...tokens,
    text,
    accent,
    accentAlt: darkenForContrast(tokens.accentAlt, tokens.background, 3, 18),
    muted: darkenForContrast(tokens.muted, tokens.background, 3, 25)
  };
}

function darkenForContrast(hex: string, background: string, minimumRatio: number, minimumLightness: number) {
  let next = hexToHsl(hex);

  for (let step = 0; step <= 100; step += 1) {
    const nextHex = hslToHex(next);

    if (contrastRatio(nextHex, background) >= minimumRatio) {
      return nextHex;
    }

    if (next.l <= minimumLightness) {
      return nextHex;
    }

    next = { ...next, l: Math.max(minimumLightness, next.l - 2) };
  }

  return hslToHex(next);
}

function lightenForContrast(hex: string, background: string, minimumRatio: number, maximumLightness: number) {
  let next = hexToHsl(hex);

  for (let step = 0; step <= 100; step += 1) {
    const nextHex = hslToHex(next);

    if (contrastRatio(nextHex, background) >= minimumRatio) {
      return nextHex;
    }

    if (next.l >= maximumLightness) {
      return nextHex;
    }

    next = { ...next, l: Math.min(maximumLightness, next.l + 2) };
  }

  return hslToHex(next);
}

function adjustLightnessForContrast(
  hex: string,
  background: string,
  minimumRatio: number,
  mode: "dark" | "light",
  tokenType: "text" | "accent"
) {
  const hsl = hexToHsl(hex);
  const direction = mode === "dark" ? 1 : -1;
  const cap = mode === "dark" ? (tokenType === "text" ? 98 : 88) : tokenType === "text" ? 2 : 18;
  let next = hsl;

  for (let step = 0; step <= 100; step += 1) {
    const nextHex = hslToHex(next);

    if (contrastRatio(nextHex, background) >= minimumRatio) {
      return nextHex;
    }

    const nextLightness = clampPercent(next.l + direction * 2, mode === "dark" ? hsl.l : cap, mode === "dark" ? cap : hsl.l);

    if (nextLightness === next.l) {
      return nextHex;
    }

    next = { ...next, l: nextLightness };
  }

  return hslToHex(next);
}

function dominantClusterHsl(samples: HslColor[], clusterCount: number) {
  const sorted = [...samples].sort((a, b) => b.s * 1.2 + colorWeight(b) - (a.s * 1.2 + colorWeight(a)));
  let centers = sorted.slice(0, clusterCount).map((sample) => ({ ...sample }));

  while (centers.length < clusterCount) {
    centers.push(sorted[centers.length % sorted.length] ?? { h: 42, s: 58, l: 52 });
  }

  for (let iteration = 0; iteration < 8; iteration += 1) {
    const groups = centers.map(() => [] as HslColor[]);

    samples.forEach((sample) => {
      const nearest = centers
        .map((center, index) => ({ index, distance: hslDistance(sample, center) }))
        .sort((a, b) => a.distance - b.distance)[0];
      groups[nearest?.index ?? 0].push(sample);
    });

    centers = centers.map((center, index) => averageHsl(groups[index]) ?? center);
  }

  const scored = centers
    .map((center) => ({
      center,
      count: samples.filter((sample) => hslDistance(sample, center) < 22).length,
      score: samples.filter((sample) => hslDistance(sample, center) < 22).length * (0.6 + center.s / 100)
    }))
    .sort((a, b) => b.score - a.score);

  return scored[0]?.center ?? { h: 42, s: 58, l: 52 };
}

function colorWeight(color: HslColor) {
  return 100 - Math.abs(color.l - 52);
}

function hslDistance(a: HslColor, b: HslColor) {
  const hue = Math.min(Math.abs(a.h - b.h), 360 - Math.abs(a.h - b.h)) / 1.8;
  return Math.sqrt(hue ** 2 + (a.s - b.s) ** 2 + (a.l - b.l) ** 2);
}

function averageHsl(colors: HslColor[]) {
  if (colors.length === 0) {
    return null;
  }

  const hue = Math.atan2(
    colors.reduce((total, color) => total + Math.sin((color.h * Math.PI) / 180), 0) / colors.length,
    colors.reduce((total, color) => total + Math.cos((color.h * Math.PI) / 180), 0) / colors.length
  );

  return {
    h: normalizeHue((hue * 180) / Math.PI),
    s: colors.reduce((total, color) => total + color.s, 0) / colors.length,
    l: colors.reduce((total, color) => total + color.l, 0) / colors.length
  };
}

function rgbToHsl({ r, g, b }: Rgb): HslColor {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;
  const delta = max - min;

  if (delta === 0) {
    return { h: 0, s: 0, l: lightness * 100 };
  }

  const saturation = delta / (1 - Math.abs(2 * lightness - 1));
  let hue = 0;

  if (max === red) {
    hue = 60 * (((green - blue) / delta) % 6);
  } else if (max === green) {
    hue = 60 * ((blue - red) / delta + 2);
  } else {
    hue = 60 * ((red - green) / delta + 4);
  }

  return {
    h: normalizeHue(hue),
    s: saturation * 100,
    l: lightness * 100
  };
}

function hexToHsl(hex: string) {
  return rgbToHsl(getRgbFromHex(hex));
}

function getRgbFromHex(hex: string): Rgb {
  const value = hex.replace("#", "");
  const number = Number.parseInt(value, 16);

  return {
    r: (number >> 16) & 255,
    g: (number >> 8) & 255,
    b: number & 255
  };
}

function hslToHex({ h, s, l }: HslColor) {
  const hue = normalizeHue(h);
  const saturation = clampPercent(s) / 100;
  const lightness = clampPercent(l) / 100;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const match = lightness - chroma / 2;
  let red = 0;
  let green = 0;
  let blue = 0;

  if (hue < 60) {
    red = chroma;
    green = x;
  } else if (hue < 120) {
    red = x;
    green = chroma;
  } else if (hue < 180) {
    green = chroma;
    blue = x;
  } else if (hue < 240) {
    green = x;
    blue = chroma;
  } else if (hue < 300) {
    red = x;
    blue = chroma;
  } else {
    red = chroma;
    blue = x;
  }

  return toHex({
    r: (red + match) * 255,
    g: (green + match) * 255,
    b: (blue + match) * 255
  });
}

function ContrastDropdown({
  value,
  onChange
}: {
  value: SiteContent["theme"]["contrast"];
  onChange: (value: SiteContent["theme"]["contrast"]) => void;
}) {
  return (
    <label className={styles.contrastDropdown}>
      <span>Contrast mode</span>
      <select value={value} onChange={(event) => onChange(event.target.value as SiteContent["theme"]["contrast"])}>
        <option value="soft">Soft / atmospheric</option>
        <option value="balanced">Balanced / default</option>
        <option value="high">High contrast / accessible</option>
        <option value="editorial">Editorial light surfaces</option>
      </select>
      <small>
        Controls text strength, panel opacity, borders, and live-preview readability.
      </small>
    </label>
  );
}

function ArrayText({
  label,
  items,
  onChange
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  return (
    <Field
      label={`${label} (one per line)`}
      value={items.join("\n")}
      multiline
      onChange={(value) =>
        onChange(
          value
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean)
        )
      }
    />
  );
}

function CollectionShell({
  children,
  onAdd
}: {
  children: React.ReactNode;
  onAdd: () => void;
}) {
  return (
    <div className={styles.collection}>
      {children}
      <button type="button" onClick={onAdd}>
        Add item
      </button>
    </div>
  );
}

function ServiceEditor({ items, onChange }: { items: ServiceCard[]; onChange: (items: ServiceCard[]) => void }) {
  const patch = (index: number, patchValue: Partial<ServiceCard>) =>
    onChange(items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patchValue } : item)));

  return (
    <CollectionShell
      onAdd={() => onChange([...items, { eyebrow: "New", title: "New service", description: "" }])}
    >
      {items.map((item, index) => (
        <div className={styles.item} key={`${item.title}-${index}`}>
          <Field label="Eyebrow" value={item.eyebrow} onChange={(value) => patch(index, { eyebrow: value })} />
          <Field label="Title" value={item.title} onChange={(value) => patch(index, { title: value })} />
          <Field
            label="Description"
            value={item.description}
            multiline
            onChange={(value) => patch(index, { description: value })}
          />
          <RemoveButton onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))} />
        </div>
      ))}
    </CollectionShell>
  );
}

function PackageEditor({
  items,
  onChange
}: {
  items: LessonPackage[];
  onChange: (items: LessonPackage[]) => void;
}) {
  const patch = (index: number, patchValue: Partial<LessonPackage>) =>
    onChange(items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patchValue } : item)));

  return (
    <CollectionShell
      onAdd={() =>
        onChange([
          ...items,
          { title: "New package", price: "$0", cadence: "Monthly", description: "", features: [] }
        ])
      }
    >
      {items.map((item, index) => (
        <div className={styles.item} key={`${item.title}-${index}`}>
          <Field label="Title" value={item.title} onChange={(value) => patch(index, { title: value })} />
          <div className={styles.twoColumn}>
            <Field label="Price" value={item.price} onChange={(value) => patch(index, { price: value })} />
            <Field label="Cadence" value={item.cadence} onChange={(value) => patch(index, { cadence: value })} />
          </div>
          <Field
            label="Description"
            value={item.description}
            multiline
            onChange={(value) => patch(index, { description: value })}
          />
          <ArrayText label="Features" items={item.features} onChange={(features) => patch(index, { features })} />
          <RemoveButton onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))} />
        </div>
      ))}
    </CollectionShell>
  );
}

function GalleryEditor({ items, onChange }: { items: GalleryItem[]; onChange: (items: GalleryItem[]) => void }) {
  const patch = (index: number, patchValue: Partial<GalleryItem>) =>
    onChange(items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patchValue } : item)));

  return (
    <CollectionShell
      onAdd={() => onChange([...items, { title: "New image", description: "", image: "/gallery/jazz-stage.svg" }])}
    >
      {items.map((item, index) => (
        <div className={styles.item} key={`${item.title}-${index}`}>
          <Field label="Title" value={item.title} onChange={(value) => patch(index, { title: value })} />
          <Field label="Image URL" value={item.image} onChange={(value) => patch(index, { image: value })} />
          <Field
            label="Description"
            value={item.description}
            multiline
            onChange={(value) => patch(index, { description: value })}
          />
          <RemoveButton onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))} />
        </div>
      ))}
    </CollectionShell>
  );
}

function TestimonialEditor({
  items,
  onChange
}: {
  items: Testimonial[];
  onChange: (items: Testimonial[]) => void;
}) {
  const patch = (index: number, patchValue: Partial<Testimonial>) =>
    onChange(items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patchValue } : item)));

  return (
    <CollectionShell
      onAdd={() => onChange([...items, { quote: "", name: "New client", role: "" }])}
    >
      {items.map((item, index) => (
        <div className={styles.item} key={`${item.name}-${index}`}>
          <Field label="Quote" value={item.quote} multiline onChange={(value) => patch(index, { quote: value })} />
          <Field label="Name" value={item.name} onChange={(value) => patch(index, { name: value })} />
          <Field label="Role" value={item.role} onChange={(value) => patch(index, { role: value })} />
          <RemoveButton onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))} />
        </div>
      ))}
    </CollectionShell>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button className={styles.remove} type="button" onClick={onClick}>
      Remove
    </button>
  );
}
