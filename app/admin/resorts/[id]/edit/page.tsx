import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { prisma } from "@/lib/db/prisma";
import { getAmenities, getCategories, getPopularLocations } from "@/lib/data/resorts";
import { ResortForm } from "@/components/admin/resort-form";
import { AccommodationManager } from "@/components/admin/accommodation-manager";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AdminResortEditorPage");
  return { title: t("editMetadataTitle") };
}

export default async function EditResortPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("AdminResortEditorPage");

  const resort = await prisma.resort.findUnique({
    where: { id },
    include: {
      images: { orderBy: { order: "asc" } },
      amenities: { include: { amenity: true } },
      accommodations: true,
    },
  });

  if (!resort) notFound();

  const [categories, locations, amenities] = await Promise.all([
    getCategories(),
    getPopularLocations(),
    getAmenities(),
  ]);

  return (
    <div className="max-w-3xl space-y-10">
      <ResortForm
        mode="edit"
        resortId={resort.id}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        locations={locations.map((l) => ({ id: l.id, name: l.name }))}
        amenities={amenities}
        defaultValues={{
          name: resort.name,
          description: resort.description,
          province: resort.province,
          district: resort.district,
          address: resort.address,
          latitude: resort.latitude,
          longitude: resort.longitude,
          phone: resort.phone ?? "",
          email: resort.email ?? "",
          website: resort.website ?? "",
          distanceFromUbKm: resort.distanceFromUbKm ?? undefined,
          categoryId: resort.categoryId ?? "",
          locationId: resort.locationId ?? "",
          amenitySlugs: resort.amenities.map((a) => a.amenity.slug),
          imageUrls: resort.images.map((img) => img.url),
        }}
      />

      <section>
        <h2 className="font-heading text-lg font-semibold text-foreground">
          {t("accommodationsTitle")}
        </h2>
        <div className="mt-4">
          <AccommodationManager
            resortId={resort.id}
            accommodations={resort.accommodations}
          />
        </div>
      </section>
    </div>
  );
}
