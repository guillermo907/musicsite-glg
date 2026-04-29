"use client";

import { useActionState, useEffect, useRef, useState, useSyncExternalStore } from "react";
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
        light: {
          ...current.theme.light,
          [key]: value
        }
      }
    }));
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
                    theme: { ...defaultContent.theme }
                  }))
                }
              >
                Regresar al tema original
              </button>
            </div>

            <WallpaperUploader
              mode={activePalette}
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
              onPalette={(palette) =>
                setContent((current) => ({
                  ...current,
                  theme:
                    activePalette === "dark"
                      ? {
                          ...current.theme,
                          accent: palette.accent,
                          accentAlt: palette.accentAlt,
                          background: palette.background
                        }
                      : {
                          ...current.theme,
                          light: {
                            ...current.theme.light,
                            accent: palette.accent,
                            accentAlt: palette.accentAlt,
                            background: palette.background
                          }
                        }
                }))
              }
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
                  activePalette === "dark"
                    ? updateTheme("backgroundImage", value)
                    : updateLightTheme("backgroundImage", value)
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
                accent={content.theme.accent}
                accentAlt={content.theme.accentAlt}
                background={content.theme.background}
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
                accent={content.theme.light.accent}
                accentAlt={content.theme.light.accentAlt}
                background={content.theme.light.background}
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
  tokens: ReturnType<typeof contrastTokens>;
  wallpaper: string;
  onAccent: (value: string) => void;
  onAccentAlt: (value: string) => void;
  onBackground: (value: string) => void;
  onContrast: (value: SiteContent["theme"]["contrast"]) => void;
  onWallpaper: (value: string) => void;
}) {
  const textRatio = contrastRatio(background, tokens.foreground);
  const buttonRatio = contrastRatio(accent, readableTextColor(accent));

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
  currentImage,
  onUploaded,
  onPalette
}: {
  mode: "dark" | "light";
  currentImage: string;
  onUploaded: (value: string) => void;
  onPalette: (palette: ExtractedPalette) => void;
}) {
  const [status, setStatus] = useState<"idle" | "reading" | "processing" | "ready" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const [paletteOptions, setPaletteOptions] = useState<ExtractedPalette[]>([]);
  const lastUploadedImage = useRef("");

  useEffect(() => {
    if (!lastUploadedImage.current) {
      return;
    }

    let alive = true;

    extractPaletteOptions(lastUploadedImage.current, mode).then((options) => {
      if (alive) {
        setPaletteOptions(options);
      }
    });

    return () => {
      alive = false;
    };
  }, [mode]);

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
            const extracted = await extractPaletteOptions(compressed, mode);

            if (compressed.length > 7_500_000) {
              setStatus("error");
              setProgress(0);
              setFileName("Image is still too large after compression. Try a smaller wallpaper.");
              return;
            }

            lastUploadedImage.current = compressed;
            onUploaded(compressed);
            onPalette(extracted[0]);
            setPaletteOptions(extracted);
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
      {paletteOptions.length > 0 ? (
        <div className={styles.palettePreview} aria-label="Extracted wallpaper colors">
          <span>Wallpaper color schemes</span>
          <div className={styles.schemeGrid}>
            {paletteOptions.map((option) => (
              <button key={option.label} type="button" onClick={() => onPalette(option)}>
                <strong>{option.label}</strong>
                <span>
                  <i style={{ background: option.background }} />
                  <i style={{ background: option.accent }} />
                  <i style={{ background: option.accentAlt }} />
                </span>
              </button>
            ))}
          </div>
          <p>Choose one of three color moods generated from the uploaded wallpaper.</p>
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

type ExtractedPalette = {
  label: string;
  background: string;
  accent: string;
  accentAlt: string;
};

function clampChannel(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function toHex({ r, g, b }: Rgb) {
  return `#${[r, g, b].map((value) => clampChannel(value).toString(16).padStart(2, "0")).join("")}`;
}

function mixRgb(a: Rgb, b: Rgb, amount: number): Rgb {
  return {
    r: a.r + (b.r - a.r) * amount,
    g: a.g + (b.g - a.g) * amount,
    b: a.b + (b.b - a.b) * amount
  };
}

function vividRgb(color: Rgb, amount: number): Rgb {
  const average = (color.r + color.g + color.b) / 3;

  return {
    r: average + (color.r - average) * amount,
    g: average + (color.g - average) * amount,
    b: average + (color.b - average) * amount
  };
}

function colorDistance(a: Rgb, b: Rgb) {
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
}

function getColorStats(color: Rgb) {
  const max = Math.max(color.r, color.g, color.b) / 255;
  const min = Math.min(color.r, color.g, color.b) / 255;
  const lightness = (max + min) / 2;
  const saturation = max === min ? 0 : (max - min) / (1 - Math.abs(2 * lightness - 1));
  const luminance = (0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b) / 255;

  return { lightness, luminance, saturation };
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

async function extractPaletteOptions(dataUrl: string, mode: "dark" | "light"): Promise<ExtractedPalette[]> {
  const image = await loadImage(dataUrl);
  const canvas = document.createElement("canvas");
  const width = 72;
  const height = Math.max(1, Math.round((image.naturalHeight / image.naturalWidth) * width));
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    return fallbackPalettes(mode);
  }

  context.drawImage(image, 0, 0, width, height);
  const pixels = context.getImageData(0, 0, width, height).data;
  const colors: Rgb[] = [];

  for (let index = 0; index < pixels.length; index += 16) {
    const alpha = pixels[index + 3];

    if (alpha < 180) {
      continue;
    }

    colors.push({
      r: pixels[index],
      g: pixels[index + 1],
      b: pixels[index + 2]
    });
  }

  if (colors.length === 0) {
    return fallbackPalettes(mode);
  }

  const sortedByDarkness = [...colors].sort((a, b) => getColorStats(a).luminance - getColorStats(b).luminance);
  const darkBackground = sortedByDarkness[Math.floor(sortedByDarkness.length * 0.12)] ?? sortedByDarkness[0];
  const midBackground = sortedByDarkness[Math.floor(sortedByDarkness.length * 0.34)] ?? darkBackground;
  const lightSource = sortedByDarkness[Math.floor(sortedByDarkness.length * 0.82)] ?? sortedByDarkness.at(-1) ?? midBackground;
  const accentCandidates = colors
    .filter((color) => {
      const stats = getColorStats(color);
      return stats.luminance > 0.12 && stats.luminance < 0.88 && stats.saturation > 0.18;
    })
    .sort((a, b) => {
      const aStats = getColorStats(a);
      const bStats = getColorStats(b);
      return (
        bStats.saturation * 1.7 +
        colorDistance(b, darkBackground) / 255 -
        (aStats.saturation * 1.7 + colorDistance(a, darkBackground) / 255)
      );
    });

  const firstAccent = accentCandidates[0] ?? { r: 217, g: 164, b: 65 };
  const secondAccent =
    accentCandidates.find((color) => colorDistance(color, firstAccent) > 90) ??
    accentCandidates[1] ??
    { r: 70, g: 183, b: 169 };
  const thirdAccent =
    accentCandidates.find((color) => colorDistance(color, firstAccent) > 70 && colorDistance(color, secondAccent) > 70) ??
    accentCandidates[2] ??
    { r: 201, g: 134, b: 47 };

  if (mode === "light") {
    return [
      {
        label: "Light soft",
        background: toHex(mixRgb(lightSource, { r: 248, g: 239, b: 220 }, 0.72)),
        accent: toHex(vividRgb(firstAccent, 1.05)),
        accentAlt: toHex(vividRgb(secondAccent, 1.05))
      },
      {
        label: "Light vivid",
        background: toHex(mixRgb(lightSource, { r: 246, g: 232, b: 202 }, 0.58)),
        accent: toHex(vividRgb(secondAccent, 1.28)),
        accentAlt: toHex(vividRgb(thirdAccent, 1.22))
      },
      {
        label: "Light electric",
        background: toHex(mixRgb(lightSource, { r: 255, g: 246, b: 226 }, 0.46)),
        accent: toHex(vividRgb(thirdAccent, 1.55)),
        accentAlt: toHex(vividRgb(firstAccent, 1.45))
      }
    ];
  }

  return [
    {
      label: "Dark soft",
      background: toHex(mixRgb(darkBackground, { r: 13, g: 10, b: 8 }, 0.54)),
      accent: toHex(vividRgb(firstAccent, 1.05)),
      accentAlt: toHex(vividRgb(secondAccent, 1.04))
    },
    {
      label: "Dark vivid",
      background: toHex(mixRgb(midBackground, { r: 16, g: 10, b: 8 }, 0.44)),
      accent: toHex(vividRgb(secondAccent, 1.28)),
      accentAlt: toHex(vividRgb(thirdAccent, 1.22))
    },
    {
      label: "Dark electric",
      background: toHex(mixRgb(darkBackground, { r: 5, g: 8, b: 10 }, 0.34)),
      accent: toHex(vividRgb(thirdAccent, 1.58)),
      accentAlt: toHex(vividRgb(firstAccent, 1.5))
    }
  ];
}

function fallbackPalettes(mode: "dark" | "light"): ExtractedPalette[] {
  if (mode === "light") {
    return [
      { label: "Light soft", background: "#f3ead7", accent: "#c9862f", accentAlt: "#4f9f94" },
      { label: "Light vivid", background: "#f6e2bd", accent: "#d28326", accentAlt: "#2a9d90" },
      { label: "Light electric", background: "#fff0ce", accent: "#e06122", accentAlt: "#1bb5a8" }
    ];
  }

  return [
    { label: "Dark soft", background: "#120f0d", accent: "#d9a441", accentAlt: "#46b7a9" },
    { label: "Dark vivid", background: "#17100c", accent: "#e6a43a", accentAlt: "#c96f45" },
    { label: "Dark electric", background: "#091316", accent: "#65c8c1", accentAlt: "#d9a441" }
  ];
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
