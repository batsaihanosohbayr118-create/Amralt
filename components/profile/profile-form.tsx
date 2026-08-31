"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Compass,
  Globe,
  Home,
  Phone,
  ShieldAlert,
  UtensilsCrossed,
} from "lucide-react";

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
import {
  profileUpdateSchema,
  type ProfileUpdateInput,
} from "@/lib/validations/profile";
import { updateProfile } from "@/lib/actions/profile";
import { COUNTRIES } from "@/lib/countries";
import { cn } from "@/lib/utils";

const fieldClass = "h-11 rounded-xl px-3.5";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </h3>
  );
}

function IconLabel({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <FormLabel className="flex items-center gap-1.5 text-sm font-medium text-foreground">
      <Icon className="size-3.5 text-primary" />
      {children}
    </FormLabel>
  );
}

export function ProfileForm({
  defaultValues,
}: {
  defaultValues: ProfileUpdateInput;
}) {
  const t = useTranslations("ProfileForm");
  const [isPending, startTransition] = useTransition();

  const form = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues,
  });

  function onSubmit(values: ProfileUpdateInput) {
    startTransition(async () => {
      const result = await updateProfile(values);
      if (result.ok) toast.success(t("updated"));
      else toast.error(result.error);
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-3">
          <SectionLabel>{t("contactInfo")}</SectionLabel>
          <div className="grid gap-3 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">{t("lastName")}</FormLabel>
                  <FormControl>
                    <Input className={fieldClass} {...field} />
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
                  <FormLabel className="text-sm font-medium">{t("firstName")}</FormLabel>
                  <FormControl>
                    <Input className={fieldClass} {...field} />
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
                  <IconLabel icon={Phone}>{t("phone")}</IconLabel>
                  <FormControl>
                    <Input className={fieldClass} type="tel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="nationality"
              render={({ field }) => (
                <FormItem>
                  <IconLabel icon={Globe}>{t("country")}</IconLabel>
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
              name="address"
              render={({ field }) => (
                <FormItem>
                  <IconLabel icon={Home}>{t("address")}</IconLabel>
                  <FormControl>
                    <Input className={fieldClass} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-3 border-t border-border/60 pt-6">
          <SectionLabel>{t("foodTravelInterests")}</SectionLabel>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="allergies"
              render={({ field }) => (
                <FormItem>
                  <IconLabel icon={ShieldAlert}>{t("allergies")}</IconLabel>
                  <FormControl>
                    <Textarea className="rounded-xl" rows={2} {...field} />
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
                  <IconLabel icon={UtensilsCrossed}>{t("favoriteFoods")}</IconLabel>
                  <FormControl>
                    <Textarea className="rounded-xl" rows={2} {...field} />
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
                  <FormLabel className="text-sm font-medium">
                    {t("dietaryRestrictions")}
                  </FormLabel>
                  <FormControl>
                    <Input className={fieldClass} {...field} />
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
                  <IconLabel icon={Compass}>{t("travelInterests")}</IconLabel>
                  <FormControl>
                    <Textarea className="rounded-xl" rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button
          type="submit"
          className={cn("rounded-xl px-6", isPending && "opacity-80")}
          disabled={isPending}
        >
          {isPending ? t("saving") : t("save")}
        </Button>
      </form>
    </Form>
  );
}
