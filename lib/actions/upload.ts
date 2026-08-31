"use server";

import crypto from "crypto";

import { auth } from "@/lib/auth/auth";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function uploadImage(
  formData: FormData
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const session = await requireAdmin();
  if (!session) return { ok: false, error: "Зөвшөөрөлгүй байна." };

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, error: "Файл олдсонгүй." };
  }
  if (!file.type.startsWith("image/")) {
    return { ok: false, error: "Зөвхөн зургийн файл оруулна уу." };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { ok: false, error: "Файлын хэмжээ 10MB-с хэтэрсэн байна." };
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    return { ok: false, error: "Зураг байршуулах үйлчилгээ тохируулагдаагүй байна." };
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = "amralt";
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
  const signature = crypto
    .createHash("sha1")
    .update(paramsToSign + apiSecret)
    .digest("hex");

  const uploadForm = new FormData();
  uploadForm.append("file", file);
  uploadForm.append("api_key", apiKey);
  uploadForm.append("timestamp", String(timestamp));
  uploadForm.append("folder", folder);
  uploadForm.append("signature", signature);

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: uploadForm }
    );

    if (!res.ok) {
      return { ok: false, error: "Зураг байршуулахад алдаа гарлаа." };
    }

    const data: { secure_url?: string } = await res.json();
    if (!data.secure_url) {
      return { ok: false, error: "Зураг байршуулахад алдаа гарлаа." };
    }

    return { ok: true, url: data.secure_url };
  } catch {
    return { ok: false, error: "Сүлжээний алдаа гарлаа." };
  }
}
