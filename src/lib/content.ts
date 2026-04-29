import { promises as fs } from "node:fs";
import path from "node:path";
import { del, head, put } from "@vercel/blob";
import { defaultContent } from "./default-content";
import type { SiteContent } from "./types";

const contentPath = path.join(process.cwd(), "data", "site-content.json");
const blobKey = "site-content.json";

function mergeContent(raw: Partial<SiteContent>): SiteContent {
  return {
    ...defaultContent,
    ...raw,
    theme: {
      ...defaultContent.theme,
      ...raw.theme,
      light: {
        ...defaultContent.theme.light,
        ...raw.theme?.light
      }
    },
    seo: {
      ...defaultContent.seo,
      ...raw.seo
    },
    socialLinks: {
      ...defaultContent.socialLinks,
      ...raw.socialLinks
    },
    locales: {
      ...defaultContent.locales,
      ...Object.fromEntries(
        Object.entries(raw.locales ?? {}).map(([locale, copy]) => [
          locale,
          {
            ...defaultContent.locales?.[locale as keyof typeof defaultContent.locales],
            ...copy
          }
        ])
      )
    }
  };
}

async function getBlobContent(): Promise<SiteContent | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return null;
  }

  try {
    const blob = await head(blobKey);
    const response = await fetch(`${blob.url}?v=${Date.now()}`, { cache: "no-store" });

    if (!response.ok) {
      return null;
    }

    return mergeContent((await response.json()) as Partial<SiteContent>);
  } catch {
    return null;
  }
}

export async function getSiteContent(): Promise<SiteContent> {
  const blobContent = await getBlobContent();

  if (blobContent) {
    return blobContent;
  }

  try {
    const raw = await fs.readFile(contentPath, "utf8");
    return mergeContent(JSON.parse(raw) as Partial<SiteContent>);
  } catch {
    return defaultContent;
  }
}

export async function saveSiteContent(content: SiteContent) {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    await del(blobKey).catch(() => undefined);
    await put(blobKey, JSON.stringify(content, null, 2), {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/json"
    });
    return;
  }

  await fs.mkdir(path.dirname(contentPath), { recursive: true });
  await fs.writeFile(contentPath, `${JSON.stringify(content, null, 2)}\n`, "utf8");
}
