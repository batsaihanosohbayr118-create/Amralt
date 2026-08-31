"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CountryFlag } from "@/components/ui/country-flag";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { COUNTRIES } from "@/lib/countries";
import { cn } from "@/lib/utils";

const fieldClass = "h-10 rounded-lg px-3";

export function RegisterForm() {
  const t = useTranslations("RegisterForm");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      nationality: "Монгол",
      address: "",
      allergies: "",
      favoriteFoods: "",
      dietaryRestrictions: "",
      travelInterests: "",
    },
  });

  async function onSubmit(values: RegisterInput) {
    setError(null);
    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? t("genericError"));
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      router.push("/login");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">{t("lastName")}</FormLabel>
                <FormControl>
                  <Input
                    className={fieldClass}
                    placeholder="Боржигон"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">{t("firstName")}</FormLabel>
                <FormControl>
                  <Input
                    className={fieldClass}
                    placeholder="Бат-Эрдэнэ"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">{t("phone")}</FormLabel>
                <FormControl>
                  <Input
                    className={fieldClass}
                    type="tel"
                    placeholder="99112233"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">{t("email")}</FormLabel>
                <FormControl>
                  <Input
                    className={fieldClass}
                    type="email"
                    placeholder="name@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nationality"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">{t("country")}</FormLabel>
                <Select
                  value={field.value ?? ""}
                  onValueChange={(value) => field.onChange(value ?? "")}
                >
                  <FormControl>
                    <SelectTrigger className={cn(fieldClass, "w-full")}>
                      <SelectValue placeholder={t("selectCountry")}>
                        {(value: string | null) => {
                          const country = COUNTRIES.find(
                            (c) => c.name === value
                          );
                          if (!country) return t("selectCountry");
                          return (
                            <span className="flex items-center gap-2">
                              <CountryFlag src={country.flagUrl} />
                              {country.name}
                            </span>
                          );
                        }}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.code} value={country.name}>
                        <span className="flex items-center gap-2">
                          <CountryFlag src={country.flagUrl} />
                          {country.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">{t("password")}</FormLabel>
                <FormControl>
                  <Input
                    className={fieldClass}
                    type="password"
                    placeholder="••••••••"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">{t("address")}</FormLabel>
              <FormControl>
                <Input
                  className={fieldClass}
                  placeholder="Хот, дүүрэг, хаяг"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3 rounded-xl border border-border/60 p-3.5">
          <span className="flex items-center gap-2 text-xs font-semibold text-foreground sm:text-sm">
            <Sparkles className="size-3.5 text-primary" />
            {t("travelInfoTitle")}
          </span>

          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="allergies"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">{t("allergies")}</FormLabel>
                  <FormControl>
                    <Textarea
                      className="rounded-lg"
                      rows={1}
                      placeholder="Жишээ: самар, сүү (үгүй бол 'байхгүй' гэж бичнэ үү)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="favoriteFoods"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">{t("favoriteFoods")}</FormLabel>
                  <FormControl>
                    <Textarea
                      className="rounded-lg"
                      rows={1}
                      placeholder="Жишээ: махан хоол"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dietaryRestrictions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">
                    {t("dietaryRestrictions")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      className={fieldClass}
                      placeholder="Жишээ: цагаан хоолтон (үгүй бол 'байхгүй')"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="travelInterests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">{t("travelInterests")}</FormLabel>
                  <FormControl>
                    <Textarea
                      className="rounded-lg"
                      rows={1}
                      placeholder="Жишээ: байгаль, морь унах"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button
          type="submit"
          className="w-full rounded-xl"
          disabled={loading}
        >
          {loading ? t("submitting") : t("submit")}
        </Button>
      </form>
    </Form>
  );
}
