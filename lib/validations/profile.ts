import { z } from "zod";

export const profileUpdateSchema = z.object({
  firstName: z.string().min(2, "Нэрээ оруулна уу"),
  lastName: z.string().min(2, "Овгоо оруулна уу"),
  phone: z.string().min(8, "Утасны дугаараа оруулна уу"),
  nationality: z.string().min(2, "Иргэншил эсвэл улсаа оруулна уу"),
  address: z.string().min(2, "Дэлгэрэнгүй мэдээллээ оруулна уу"),
  allergies: z.string().min(2, "Энэ талбарыг бөглөнө үү"),
  favoriteFoods: z.string().min(2, "Энэ талбарыг бөглөнө үү"),
  dietaryRestrictions: z.string().min(2, "Энэ талбарыг бөглөнө үү"),
  travelInterests: z.string().min(2, "Энэ талбарыг бөглөнө үү"),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
