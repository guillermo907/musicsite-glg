"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { saveSiteContent } from "@/lib/content";
import { normalizeThemeForStorage } from "@/lib/theme-contrast";
import type { SiteContent } from "@/lib/types";

export type SaveState = {
  ok: boolean;
  message: string;
};

export async function saveSiteContentAction(
  _previousState: SaveState,
  formData: FormData
): Promise<SaveState> {
  await requireAdmin();

  const raw = formData.get("content");

  if (typeof raw !== "string") {
    return { ok: false, message: "Missing content payload." };
  }

  try {
    const parsed = JSON.parse(raw) as SiteContent;
    await saveSiteContent({
      ...parsed,
      theme: normalizeThemeForStorage(parsed.theme)
    });
    revalidatePath("/");
    revalidatePath("/", "layout");
    revalidatePath("/admin");
    return { ok: true, message: "Saved. The homepage is updated." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Could not save content."
    };
  }
}

export async function signOutAction() {
  const { signOut } = await import("@/auth");
  await signOut({ redirectTo: "/admin/login" });
}
