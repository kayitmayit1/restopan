import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional().nullable(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data = schema.parse(body);

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });

  if (data.newPassword) {
    if (!data.currentPassword)
      return NextResponse.json({ error: "Mevcut şifre gerekli" }, { status: 400 });
    if (!user.passwordHash)
      return NextResponse.json({ error: "Şifre ile giriş yapılmamış" }, { status: 400 });
    const valid = await bcrypt.compare(data.currentPassword, user.passwordHash);
    if (!valid)
      return NextResponse.json({ error: "Mevcut şifre yanlış" }, { status: 400 });
  }

  const updated = await db.user.update({
    where: { id: session.user.id },
    data: {
      ...(data.name ? { name: data.name } : {}),
      ...(data.phone !== undefined ? { phone: data.phone } : {}),
      ...(data.newPassword ? { passwordHash: await bcrypt.hash(data.newPassword, 12) } : {}),
    },
    select: { id: true, name: true, email: true, phone: true, image: true },
  });

  return NextResponse.json(updated);
}
