import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { MapPin, Route as RouteIcon } from "lucide-react";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { getResortBySlug } from "@/lib/data/resorts";
import { formatMNT } from "@/lib/format";
import { RatingStars } from "@/components/resort/rating-stars";
import { FavoriteButton } from "@/components/resort/favorite-button";
import { ShareButton } from "@/components/resort/share-button";
import { CallButton } from "@/components/resort/call-button";
import { ImageGallery } from "@/components/resort/image-gallery";
import { AmenityList } from "@/components/resort/amenity-list";
import { AccommodationCard } from "@/components/resort/accommodation-card";
import { ResortMap } from "@/components/map/resort-map";
import { RoutePanel } from "@/components/map/route-panel";
import { Button } from "@/components/ui/button";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const resort = await getResortBySlug(slug);
  if (!resort) return {};

  const description = resort.description.slice(0, 155);
  const cover = resort.images[0]?.url;

  return {
    title: resort.name,
    description,
    alternates: { canonical: `/resorts/${resort.slug}` },
    openGraph: {
      title: `${resort.name} | Amralt.mn`,
      description,
      type: "website",
      images: cover ? [{ url: cover, width: 1200, height: 800 }] : undefined,
    },
  };
}

export default async function ResortDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const t = await getTranslations("ResortDetail");
  const [resort, session] = await Promise.all([getResortBySlug(slug), auth()]);

  if (!resort || resort.status !== "APPROVED") notFound();

  await prisma.resort.update({
    where: { id: resort.id },
    data: { viewCount: { increment: 1 } },
  });

  const isFavorited = session?.user
    ? !!(await prisma.favorite.findUnique({
        where: {
          userId_resortId: { userId: session.user.id, resortId: resort.id },
        },
      }))
    : false;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: resort.name,
    description: resort.description,
    image: resort.images.map((img) => img.url),
    address: {
      "@type": "PostalAddress",
      streetAddress: resort.address,
      addressLocality: resort.district,
      addressRegion: resort.province,
      addressCountry: "MN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: resort.latitude,
      longitude: resort.longitude,
    },
    telephone: resort.phone ?? undefined,
    priceRange: formatMNT(resort.priceFrom),
    aggregateRating:
      resort.reviewCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: resort.rating,
            reviewCount: resort.reviewCount,
          }
        : undefined,
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ImageGallery
        images={resort.images.map((img) => ({ url: img.url, alt: img.alt }))}
        resortName={resort.name}
      />

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
            {resort.name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <RatingStars rating={resort.rating} />
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-4" />
              {resort.address}, {resort.province}
            </span>
          </div>
          <p className="mt-3">
            <span className="font-heading text-2xl font-bold text-foreground">
              {formatMNT(resort.priceFrom)}
            </span>
            <span className="text-muted-foreground"> {t("perNight")}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <FavoriteButton
            resortId={resort.id}
            initialFavorited={isFavorited}
            isAuthenticated={!!session?.user}
            variant="full"
          />
          <Button
            variant="outline"
            className="hover:border-emerald-600 hover:bg-emerald-600 hover:text-white"
            nativeButton={false}
            render={<a href="#route" />}
          >
            <RouteIcon /> {t("route")}
          </Button>
          <CallButton phone={resort.phone} />
          <ShareButton title={resort.name} />
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-3">
        <div className="space-y-10 lg:col-span-2">
          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground">
              {t("about")}
            </h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {resort.description}
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground">
              {t("amenities")}
            </h2>
            <div className="mt-4">
              <AmenityList amenities={resort.amenities} />
            </div>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground">
              {t("accommodations")}
            </h2>
            <div className="mt-4 space-y-4">
              {resort.accommodations.map((a) => (
                <AccommodationCard key={a.id} accommodation={a} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-foreground">
              {t("location")}
            </h2>
            <div className="mt-4">
              <ResortMap
                resorts={[
                  {
                    id: resort.id,
                    slug: resort.slug,
                    name: resort.name,
                    latitude: resort.latitude,
                    longitude: resort.longitude,
                    priceFrom: resort.priceFrom,
                    rating: resort.rating,
                    province: resort.province,
                    coverUrl: resort.images[0]?.url,
                  },
                ]}
                height="h-80"
              />
            </div>
          </section>

          <section id="route" className="scroll-mt-20">
            <h2 className="font-heading text-xl font-semibold text-foreground">
              {t("route")}
            </h2>
            <div className="mt-4">
              <RoutePanel
                destination={{ lat: resort.latitude, lng: resort.longitude }}
                destinationLabel={resort.name}
              />
            </div>
          </section>

        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-3xl border border-border/60 p-5">
            <h3 className="font-heading text-sm font-semibold text-foreground">
              {t("contact")}
            </h3>
            <dl className="mt-3 space-y-2 text-sm">
              {resort.phone && (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">{t("phone")}</dt>
                  <dd className="font-medium text-foreground">{resort.phone}</dd>
                </div>
              )}
              {resort.email && (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">{t("email")}</dt>
                  <dd className="font-medium text-foreground">{resort.email}</dd>
                </div>
              )}
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">{t("location")}</dt>
                <dd className="text-right font-medium text-foreground">
                  {resort.district}, {resort.province}
                </dd>
              </div>
              {resort.distanceFromUbKm != null && (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">{t("distanceFromUb")}</dt>
                  <dd className="font-medium text-foreground">
                    {t("km", { km: Math.round(resort.distanceFromUbKm) })}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
