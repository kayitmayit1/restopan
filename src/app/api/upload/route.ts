import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { randomUUID } from "crypto";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024;
const BUCKET = "menu-images";

function getSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

function getServiceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY!;
}

async function ensureBucket(): Promise<void> {
  try {
    const res = await fetch(`${getSupabaseUrl()}/storage/v1/bucket`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getServiceKey()}`,
        "Content-Type": "application/json",
        apikey: getServiceKey(),
      },
      body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true }),
    });
    if (!res.ok && res.status !== 409) {
      const text = await res.text();
      console.warn("[upload] Bucket create warning:", res.status, text);
    }
  } catch (err) {
    console.warn("[upload] Bucket ensure failed (non-fatal):", err);
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("[upload] Missing Supabase env vars");
    return NextResponse.json({ error: "Depolama yapılandırması eksik" }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
    if (!ALLOWED_TYPES.includes(file.type))
      return NextResponse.json({ error: "Sadece JPG, PNG, WebP ve GIF desteklenir" }, { status: 400 });
    if (file.size > MAX_SIZE)
      return NextResponse.json({ error: "Dosya 5MB'dan büyük olamaz" }, { status: 400 });

    await ensureBucket();

    const ext = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
    const filename = `${session.user.organizationId ?? "org"}/${randomUUID()}.${ext}`;
    const bytes = await file.arrayBuffer();

    const uploadRes = await fetch(
      `${getSupabaseUrl()}/storage/v1/object/${BUCKET}/${filename}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getServiceKey()}`,
          apikey: getServiceKey(),
          "Content-Type": file.type,
          "x-upsert": "true",
        },
        body: Buffer.from(bytes),
      }
    );

    if (!uploadRes.ok) {
      const text = await uploadRes.text();
      console.error("[upload] Supabase upload failed:", uploadRes.status, text);
      let message = "Görsel yüklenemedi";
      try {
        const json = JSON.parse(text);
        if (json.message) message = json.message;
      } catch {}
      return NextResponse.json({ error: message }, { status: 500 });
    }

    const url = `${getSupabaseUrl()}/storage/v1/object/public/${BUCKET}/${filename}`;
    return NextResponse.json({ url });
  } catch (err) {
    console.error("[upload POST]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Yükleme başarısız" },
      { status: 500 }
    );
  }
}
