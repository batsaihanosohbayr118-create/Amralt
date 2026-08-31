import { z } from "zod";

export const tripPlannerSchema = z.object({
  locationSlug: z.string().min(1, "Байршил сонгоно уу"),
  days: z.coerce.number().min(1, "Дор хаяж 1 хоног").max(14, "Хамгийн ихдээ 14 хоног"),
  guests: z.coerce.number().min(1).max(20),
  budget: z.enum(["budget", "mid", "luxury"]).optional(),
  interests: z.string().max(300).optional(),
});

export type TripPlannerInput = z.infer<typeof tripPlannerSchema>;
