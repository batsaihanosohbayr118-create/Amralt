"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  images: { url: string; alt?: string | null }[];
  resortName: string;
};

export function ImageGallery({ images, resortName }: Props) {
  const t = useTranslations("ImageGallery");
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-video w-full rounded-3xl bg-muted sm:aspect-[21/9]" />
    );
  }

  const visible = images.slice(0, 5);

  function openAt(i: number) {
    setIndex(i);
    setOpen(true);
  }

  return (
    <>
      <div className="scrollbar-hide flex snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-hidden rounded-3xl scroll-smooth sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-4">
        {visible.map((img, i) => (
          <button
            key={img.url}
            type="button"
            onClick={() => openAt(i)}
            className="group relative aspect-[4/3] min-w-[86%] shrink-0 snap-center overflow-hidden rounded-2xl bg-muted first:ml-[7%] last:mr-[7%] sm:min-w-0 sm:shrink sm:first:ml-0 sm:last:mr-0"
          >
            <Image
              src={img.url}
              alt={img.alt ?? resortName}
              fill
              priority={i === 0}
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {i === visible.length - 1 && images.length > visible.length && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/45 text-sm font-semibold text-white">
                +{images.length - visible.length}
              </div>
            )}
          </button>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="mt-3 sm:hidden"
        onClick={() => openAt(0)}
      >
        <Images /> {t("viewAll", { count: images.length })}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="max-w-[calc(100%-1rem)] border-none bg-black p-0 sm:max-w-4xl"
        >
          <DialogTitle className="sr-only">{t("photosOf", { name: resortName })}</DialogTitle>
          <div className="relative aspect-square w-full sm:aspect-video">
            <Image
              key={images[index].url}
              src={images[index].url}
              alt={images[index].alt ?? resortName}
              fill
              sizes="100vw"
              className="animate-in fade-in object-contain duration-300"
            />

            <DialogClose
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 right-3 text-white hover:bg-white/10 hover:text-white"
                />
              }
            >
              <X />
            </DialogClose>

            {images.length > 1 && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-white hover:bg-white/10 hover:text-white"
                  onClick={() =>
                    setIndex((i) => (i - 1 + images.length) % images.length)
                  }
                >
                  <ChevronLeft />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-white hover:bg-white/10 hover:text-white"
                  onClick={() => setIndex((i) => (i + 1) % images.length)}
                >
                  <ChevronRight />
                </Button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white">
                  {index + 1} / {images.length}
                </div>
              </>
            )}
          </div>

          <div className="scrollbar-hide flex gap-2 overflow-x-auto p-3">
            {images.map((img, i) => (
              <button
                key={img.url}
                type="button"
                onClick={() => setIndex(i)}
                className={cn(
                  "relative size-14 shrink-0 overflow-hidden rounded-lg opacity-60 transition-opacity",
                  i === index && "opacity-100 ring-2 ring-white"
                )}
              >
                <Image src={img.url} alt="" fill sizes="56px" className="object-cover" />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
