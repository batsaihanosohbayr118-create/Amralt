import { z } from "zod";

export const reviewSchema = z.object({
  rating: z.number().min(1, "Үнэлгээ өгнө үү").max(5),
  title: z.string().max(120).optional(),
  comment: z.string().min(10, "Хамгийн багадаа 10 тэмдэгт бичнэ үү").max(2000),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
