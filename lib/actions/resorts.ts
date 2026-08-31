"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { slugify } from "@/lib/slugify";
import { resortFormSchema, type ResortFormInput } from "@/lib/validations/resort";
import type { ResortStatus } from "@/lib/generated/prisma/enums";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

async function uniqueSlug(base: string, excludeId?: string) {
  const baseSlug = slugify(base) || "resort";
  let slug = baseSlug;
  let n = 1;
  while (
    await prisma.resort.findFirst({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    })
  ) {
    n += 1;
    slug = `${baseSlug}-${n}`;
  }
  return slug;
}

export async function createResort(input: ResortFormInput) {
  const session = await requireAdmin();
  if (!session) return { ok: false as const, error: "Зөвшөөрөлгүй байна." };

  const parsed = resortFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Буруу өгөгдөл" };
  }
  const data = parsed.data;
  const slug = await uniqueSlug(data.name);

  const resort = await prisma.resort.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      province: data.province,
      district: data.district,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      phone: data.phone || null,
      email: data.email || null,
      website: data.website || null,
      distanceFromUbKm: data.distanceFromUbKm,
      categoryId: data.categoryId || null,
      locationId: data.locationId || null,
      priceFrom: 0,
      status: "APPROVED",
      images: {
        create: data.imageUrls.map((url, i) => ({
          url,
          order: i,
          isCover: i === 0,
        })),
      },
      amenities: {
        create: data.amenitySlugs.map((slug) => ({
          amenity: { connect: { slug } },
        })),
      },
    },
  });

  revalidatePath("/admin/resorts");
  return { ok: true as const, resortId: resort.id };
}

export async function updateResort(resortId: string, input: ResortFormInput) {
  const session = await requireAdmin();
  if (!session) return { ok: false as const, error: "Зөвшөөрөлгүй байна." };

  const existing = await prisma.resort.findUnique({ where: { id: resortId } });
  if (!existing) return { ok: false as const, error: "Олдсонгүй" };

  const parsed = resortFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Буруу өгөгдөл" };
  }
  const data = parsed.data;
  const slug =
    data.name === existing.name ? existing.slug : await uniqueSlug(data.name, resortId);

  await prisma.resortImage.deleteMany({ where: { resortId } });
  await prisma.resortAmenity.deleteMany({ where: { resortId } });

  await prisma.resort.update({
    where: { id: resortId },
    data: {
      name: data.name,
      slug,
      description: data.description,
      province: data.province,
      district: data.district,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      phone: data.phone || null,
      email: data.email || null,
      website: data.website || null,
      distanceFromUbKm: data.distanceFromUbKm,
      categoryId: data.categoryId || null,
      locationId: data.locationId || null,
      images: {
        create: data.imageUrls.map((url, i) => ({
          url,
          order: i,
          isCover: i === 0,
        })),
      },
      amenities: {
        create: data.amenitySlugs.map((slug) => ({
          amenity: { connect: { slug } },
        })),
      },
    },
  });

  revalidatePath("/admin/resorts");
  revalidatePath(`/resorts/${slug}`);
  return { ok: true as const, slug };
}

export async function deleteResort(resortId: string) {
  const session = await requireAdmin();
  if (!session) return { ok: false as const, error: "Зөвшөөрөлгүй байна." };

  await prisma.resort.delete({ where: { id: resortId } });
  revalidatePath("/admin/resorts");
  return { ok: true as const };
}

export async function recalcResortPriceFrom(resortId: string) {
  const min = await prisma.accommodation.aggregate({
    where: { resortId },
    _min: { price: true },
  });
  await prisma.resort.update({
    where: { id: resortId },
    data: { priceFrom: min._min.price ?? 0 },
  });
}

export async function setResortStatus(resortId: string, status: ResortStatus) {
  const session = await requireAdmin();
  if (!session) return { ok: false as const, error: "Зөвшөөрөлгүй байна." };

  const resort = await prisma.resort.update({
    where: { id: resortId },
    data: { status },
  });

  revalidatePath("/admin/resorts");
  revalidatePath(`/resorts/${resort.slug}`);
  return { ok: true as const };
}

export async function setResortFeatured(resortId: string, featured: boolean) {
  const session = await requireAdmin();
  if (!session) return { ok: false as const, error: "Зөвшөөрөлгүй байна." };

  await prisma.resort.update({ where: { id: resortId }, data: { featured } });
  revalidatePath("/admin/resorts");
  revalidatePath("/");
  return { ok: true as const };
}
