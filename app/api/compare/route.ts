import { NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get("ids")?.split(",").filter(Boolean) ?? [];

  if (ids.length === 0) {
    return NextResponse.json({ resorts: [] });
  }

  const resorts = await prisma.resort.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      name: true,
      slug: true,
      priceFrom: true,
      images: { orderBy: { order: "asc" }, take: 1, select: { url: true } },
    },
  });

  return NextResponse.json({ resorts });
}
