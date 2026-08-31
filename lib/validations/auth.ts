import { z } from "zod";

export const registerSchema = z.object({
  firstName: z.string().min(2, "Нэрээ оруулна уу"),
  lastName: z.string().min(2, "Овгоо оруулна уу"),
  email: z.string().email("И-мэйл хаяг буруу байна"),
  phone: z.string().min(8, "Утасны дугаараа оруулна уу"),
  nationality: z.string().min(2, "Иргэншил эсвэл улсаа оруулна уу"),
  address: z.string().min(2, "Дэлгэрэнгүй мэдээллээ оруулна уу"),
  allergies: z.string().min(2, "Энэ талбарыг бөглөнө үү"),
  favoriteFoods: z.string().min(2, "Энэ талбарыг бөглөнө үү"),
  dietaryRestrictions: z.string().min(2, "Энэ талбарыг бөглөнө үү"),
  travelInterests: z.string().min(2, "Энэ талбарыг бөглөнө үү"),
  password: z.string().min(6, "Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("И-мэйл хаяг буруу байна"),
  password: z.string().min(1, "Нууц үгээ оруулна уу"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("И-мэйл хаяг буруу байна"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  password: z.string().min(6, "Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой"),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
