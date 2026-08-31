import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { getAmenities, getCategories, getPopularLocations } from "@/lib/data/resorts";
import { ResortForm } from "@/components/admin/resort-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AdminResortEditorPage");
  return { title: t("newMetadataTitle") };
}

export default async function NewResortPage() {
  const [categories, locations, amenities] = await Promise.all([
    getCategories(),
    getPopularLocations(),
    getAmenities(),
  ]);

  return (
    <div className="max-w-3xl">
      <ResortForm
        mode="create"
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        locations={locations.map((l) => ({ id: l.id, name: l.name }))}
        amenities={amenities}
      />
    </div>
  );
}
