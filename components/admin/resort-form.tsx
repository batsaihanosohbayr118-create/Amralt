"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  resortFormSchema,
  type ResortFormInput,
  type ResortFormValues,
} from "@/lib/validations/resort";
import { createResort, updateResort } from "@/lib/actions/resorts";
import { uploadImage } from "@/lib/actions/upload";

type Option = { id: string; name: string };

type Props = {
  mode: "create" | "edit";
  resortId?: string;
  categories: Option[];
  locations: Option[];
  amenities: { slug: string; name: string }[];
  defaultValues?: Partial<ResortFormValues>;
};

export function ResortForm({
  mode,
  resortId,
  categories,
  locations,
  amenities,
  defaultValues,
}: Props) {
  const t = useTranslations("ResortForm");
  const amenityT = useTranslations("AmenityLabels");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ResortFormValues, unknown, ResortFormInput>({
    resolver: zodResolver(resortFormSchema),
    defaultValues: {
      name: "",
      nameEn: "",
      description: "",
      province: "",
      district: "",
      address: "",
      latitude: 47.9184,
      longitude: 106.9177,
      phone: "",
      email: "",
      website: "",
      categoryId: "",
      locationId: "",
      amenitySlugs: [],
      imageUrls: [],
      ...defaultValues,
    },
  });

  const [imageUrls, setImageUrls] = useState<string[]>(
    defaultValues?.imageUrls?.length ? defaultValues.imageUrls : [""]
  );
  const [isUploading, startUpload] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function updateImageUrl(index: number, value: string) {
    setImageUrls((prev) => prev.map((u, i) => (i === index ? value : u)));
  }
  function removeImageUrl(index: number) {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    startUpload(async () => {
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        const result = await uploadImage(fd);
        if (!result.ok) {
          toast.error(result.error);
          continue;
        }
        setImageUrls((prev) => {
          const empty = prev.findIndex((u) => u.trim().length === 0);
          if (empty !== -1) {
            return prev.map((u, i) => (i === empty ? result.url : u));
          }
          return [...prev, result.url];
        });
      }
    });
  }

  function onSubmit(values: ResortFormInput) {
    const cleaned = {
      ...values,
      imageUrls: imageUrls.filter((u) => u.trim().length > 0),
    };

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createResort(cleaned)
          : await updateResort(resortId!, cleaned);

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success(mode === "create" ? t("created") : t("saved"));
      router.push("/admin/resorts");
      router.refresh();
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>{t("name")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("namePlaceholder")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nameEn"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>{t("nameEn")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("nameEnPlaceholder")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>{t("description")}</FormLabel>
                <FormControl>
                  <Textarea rows={5} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="province"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("province")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("provincePlaceholder")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="district"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("district")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("districtPlaceholder")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>{t("addressDetail")}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="latitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("latitude")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="any"
                    {...field}
                    value={String(field.value ?? "")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="longitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("longitude")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="any"
                    {...field}
                    value={String(field.value ?? "")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="distanceFromUbKm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("distanceFromUb")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="any"
                    {...field}
                    value={String(field.value ?? "")}
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
                <FormLabel>{t("phone")}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("email")}</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("website")}</FormLabel>
                <FormControl>
                  <Input placeholder="https://" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("category")}</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("select")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
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
            name="locationId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("region")}</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("select")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {locations.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormLabel>{t("amenities")}</FormLabel>
          <FormField
            control={form.control}
            name="amenitySlugs"
            render={({ field }) => (
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {amenities.map((amenity) => (
                  <label
                    key={amenity.slug}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Checkbox
                      checked={(field.value ?? []).includes(amenity.slug)}
                      onCheckedChange={() => {
                        const current = field.value ?? [];
                        const next = current.includes(amenity.slug)
                          ? current.filter((s) => s !== amenity.slug)
                          : [...current, amenity.slug];
                        field.onChange(next);
                      }}
                    />
                    {amenityT(amenity.slug)}
                  </label>
                ))}
              </div>
            )}
          />
        </div>

        <div>
          <FormLabel>{t("imageUrls")}</FormLabel>
          <div className="mt-3 space-y-2">
            {imageUrls.map((url, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="https://..."
                  value={url}
                  onChange={(e) => updateImageUrl(index, e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeImageUrl(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setImageUrls((prev) => [...prev, ""])}
              >
                <Plus /> {t("addImage")}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? <Loader2 className="animate-spin" /> : <Upload />}
                {t("uploadImage")}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          </div>
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending
            ? t("saving")
            : mode === "create"
              ? t("createResort")
              : t("save")}
        </Button>
      </form>
    </Form>
  );
}
