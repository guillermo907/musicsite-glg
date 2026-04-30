import type { Metadata } from "next";
import { EventsPage } from "@/components/home/events-page";
import { getSiteContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  const title = `Events | ${content.siteTitle}`;
  const description =
    "Live guitar for hotels, restaurants, private dinners, weddings, beach ceremonies, casino nights, gallery openings, corporate events, and stage performances.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ["/events/main1-gallery.jpg"]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/events/main1-gallery.jpg"]
    }
  };
}

export default async function EventsRoute() {
  const content = await getSiteContent();

  return <EventsPage content={content} />;
}
