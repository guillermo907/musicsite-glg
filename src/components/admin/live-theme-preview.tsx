"use client";

import { useEffect, useRef } from "react";
import { normalizeSiteTheme } from "@/lib/theme-contrast";
import type { SiteContent } from "@/lib/types";
import styles from "./admin-dashboard.module.scss";

type LiveThemePreviewProps = {
  content: SiteContent;
  activePalette: "dark" | "light";
};

export function LiveThemePreview({ content, activePalette }: LiveThemePreviewProps) {
  const latestConfig = useRef({ content, activePalette });
  const previousObjectUrl = useRef("");
  const normalizedTheme = normalizeSiteTheme(content.theme);
  const activeTheme = activePalette === "dark" ? normalizedTheme : normalizedTheme.light;
  const snapshotTheme = {
    "--accent": activeTheme.accent,
    "--accent-alt": activeTheme.accentAlt,
    "--background": activeTheme.background,
    "--foreground": activeTheme.foreground,
    "--muted": activeTheme.muted,
    "--line": activeTheme.line,
    "--panel": activeTheme.panel,
    "--panel-strong": activeTheme.panelStrong,
    "--ink": activeTheme.ink,
    "--snapshot-image": activeTheme.backgroundImage ? `url(${activeTheme.backgroundImage})` : "none"
  } as React.CSSProperties;

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    latestConfig.current = { content, activePalette };
    const theme = normalizeSiteTheme(latestConfig.current.content.theme);
    const vars = {
      "--accent": theme.accent,
      "--accent-alt": theme.accentAlt,
      "--background": theme.background,
      "--foreground": theme.foreground,
      "--muted": theme.muted,
      "--line": theme.line,
      "--panel": theme.panel,
      "--panel-strong": theme.panelStrong,
      "--ink": theme.ink,
      "--light-accent": theme.light.accent,
      "--light-accent-alt": theme.light.accentAlt,
      "--light-background": theme.light.background,
      "--light-foreground": theme.light.foreground,
      "--light-muted": theme.light.muted,
      "--light-line": theme.light.line,
      "--light-panel": theme.light.panel,
      "--light-panel-strong": theme.light.panelStrong,
      "--light-ink": theme.light.ink
    };

    Object.entries(vars).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }, [content, activePalette]);

  useEffect(() => {
    const image = activeTheme.backgroundImage;

    if (previousObjectUrl.current && previousObjectUrl.current !== image) {
      URL.revokeObjectURL(previousObjectUrl.current);
      previousObjectUrl.current = "";
    }

    if (image.startsWith("blob:")) {
      previousObjectUrl.current = image;
    }

    return () => {
      if (previousObjectUrl.current) {
        URL.revokeObjectURL(previousObjectUrl.current);
        previousObjectUrl.current = "";
      }
    };
  }, [activeTheme.backgroundImage]);

  return (
    <div className={styles.deviceStage} style={snapshotTheme}>
      <div className={styles.deviceSet}>
        <ThemeDevice
          content={content}
          label="Desktop"
          className={styles.desktopSnapshot}
          lines={["Bio", "Services", "Lessons", "Contact"]}
        />
        <ThemeDevice
          content={content}
          label="Tablet"
          className={styles.tabletSnapshot}
          lines={["Services", "Lessons"]}
        />
        <ThemeDevice content={content} label="Phone" className={styles.phoneSnapshot} lines={["Menu"]} />
      </div>
    </div>
  );
}

function ThemeDevice({
  content,
  label,
  className,
  lines
}: {
  content: SiteContent;
  label: string;
  className: string;
  lines: string[];
}) {
  return (
    <article className={`${styles.snapshotDevice} ${className}`}>
      <div className={styles.snapshotTop}>
        <i />
        <span>{label}</span>
      </div>
      <div className={styles.snapshotScreen}>
        <nav className={styles.snapshotNav}>
          <strong>GL</strong>
          <div>
            {lines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </div>
        </nav>
        <section className={styles.snapshotHero}>
          <p>Jazz / Blues / Rock</p>
          <h3>{content.siteTitle}</h3>
          <span>{content.subtitle}</span>
          <div>
            <b>{content.primaryCta}</b>
            <em>{content.secondaryCta}</em>
          </div>
        </section>
        <div className={styles.snapshotCards}>
          {content.services.slice(0, 3).map((service) => (
            <i key={service.title}>
              <strong>{service.title}</strong>
              <span />
            </i>
          ))}
        </div>
      </div>
    </article>
  );
}
