"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatMNT } from "@/lib/format";
import type { AccommodationType } from "@/lib/generated/prisma/enums";
import {
  createAccommodation,
  deleteAccommodation,
} from "@/lib/actions/accommodations";

const ACCOMMODATION_TYPES: AccommodationType[] = [
  "GER",
  "FAMILY_HOUSE",
  "VIP_HOUSE",
  "TENT",
  "OTHER",
];

type AccommodationItem = {
  id: string;
  type: AccommodationType;
  name: string;
  capacity: number;
  price: number;
  facilities: string[];
};

export function AccommodationManager({
  resortId,
  accommodations,
}: {
  resortId: string;
  accommodations: AccommodationItem[];
}) {
  const t = useTranslations("AccommodationManager");
  const typeT = useTranslations("AccommodationType");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);

  const [type, setType] = useState<AccommodationType>("GER");
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState(2);
  const [price, setPrice] = useState(100000);
  const [facilities, setFacilities] = useState("");
  const [imageUrls, setImageUrls] = useState("");

  function resetForm() {
    setType("GER");
    setName("");
    setCapacity(2);
    setPrice(100000);
    setFacilities("");
    setImageUrls("");
    setShowForm(false);
  }

  function handleAdd() {
    startTransition(async () => {
      const result = await createAccommodation(resortId, {
        type,
        name,
        capacity,
        price,
        facilities: facilities
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean),
        imageUrls: imageUrls
          .split(",")
          .map((u) => u.trim())
          .filter(Boolean),
      });
      if (result.ok) {
        toast.success(t("added"));
        resetForm();
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleDelete(id: string) {
    if (!confirm(t("confirmDelete"))) return;
    startTransition(async () => {
      const result = await deleteAccommodation(resortId, id);
      if (result.ok) {
        toast.success(t("deleted"));
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="space-y-3">
      {accommodations.map((a) => (
        <div
          key={a.id}
          className="flex items-center justify-between rounded-xl border border-border/60 p-3"
        >
          <div>
            <p className="text-sm font-medium text-foreground">
              {a.name} · {typeT(a.type)}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("summary", {
                capacity: a.capacity,
                price: formatMNT(a.price),
              })}
            </p>
          </div>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => handleDelete(a.id)}
            disabled={isPending}
            aria-label={t("deleteAccommodation")}
          >
            <Trash2 className="size-3.5 text-destructive" />
          </Button>
        </div>
      ))}

      {showForm ? (
        <div className="space-y-3 rounded-xl border border-border/60 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t("type")}</Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as AccommodationType)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACCOMMODATION_TYPES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {typeT(value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t("name")}</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>{t("capacity")}</Label>
              <Input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("price")}</Label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>{t("facilities")}</Label>
              <Input
                value={facilities}
                onChange={(e) => setFacilities(e.target.value)}
                placeholder={t("facilitiesPlaceholder")}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>{t("imageUrls")}</Label>
              <Input
                value={imageUrls}
                onChange={(e) => setImageUrls(e.target.value)}
                placeholder="https://..., https://..."
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleAdd}
              disabled={isPending || !name}
            >
              {t("save")}
            </Button>
            <Button type="button" variant="ghost" onClick={resetForm}>
              {t("cancel")}
            </Button>
          </div>
        </div>
      ) : (
        <Button type="button" variant="outline" onClick={() => setShowForm(true)}>
          <Plus /> {t("addAccommodation")}
        </Button>
      )}
    </div>
  );
}
