import { z } from "zod";

export const resortFormSchema = z.object({
  name: z.string().min(2, "Нэрээ оруулна уу"),
  nameEn: z.string().optional().or(z.literal("")),
  nameZh: z.string().optional().or(z.literal("")),
  description: z.string().min(20, "Хамгийн багадаа 20 тэмдэгт бичнэ үү"),
  descriptionEn: z.string().optional().or(z.literal("")),
  descriptionZh: z.string().optional().or(z.literal("")),
  province: z.string().min(2, "Аймгаа оруулна уу"),
  district: z.string().min(2, "Сумаа оруулна уу"),
  address: z.string().min(2, "Хаягаа оруулна уу"),
  addressEn: z.string().optional().or(z.literal("")),
  addressZh: z.string().optional().or(z.literal("")),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  phone: z.string().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  distanceFromUbKm: z.coerce.number().min(0).optional(),
  categoryId: z.string().optional().or(z.literal("")),
  locationId: z.string().optional().or(z.literal("")),
  amenitySlugs: z.array(z.string()).default([]),
  imageUrls: z.array(z.string().url()).default([]),
});

export type ResortFormInput = z.output<typeof resortFormSchema>;
export type ResortFormValues = z.input<typeof resortFormSchema>;

export const accommodationFormSchema = z.object({
  type: z.enum(["GER", "FAMILY_HOUSE", "VIP_HOUSE", "TENT", "OTHER"]),
  name: z.string().min(2, "Нэрээ оруулна уу"),
  nameEn: z.string().optional().or(z.literal("")),
  nameZh: z.string().optional().or(z.literal("")),
  capacity: z.coerce.number().min(1).max(50),
  price: z.coerce.number().min(0),
  facilities: z.array(z.string()).default([]),
  facilitiesEn: z.array(z.string()).default([]),
  facilitiesZh: z.array(z.string()).default([]),
  imageUrls: z.array(z.string().url()).default([]),
});

export type AccommodationFormInput = z.infer<typeof accommodationFormSchema>;
