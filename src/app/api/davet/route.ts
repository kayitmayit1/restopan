import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  token: z.string(),
  name: z.string().min(2),
  password: z.string().min(6),
});

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Token gerekli" }, { status: 400 });

  const invite = await db.organizationInvite.findUnique({
    where: { token },
    include: { organization: { select: { name: true, slug: true } } },
  });

  if (!invite) return NextResponse.json({ error: "Davet bulunamadı" }, { status: 404 });
  if (invite.expiresAt < new Date()) return NextResponse.json({ error: "Davet süresi dolmuş" }, { status: 410 });
  if (invite.acceptedAt) return NextResponse.json({ error: "Davet zaten kullanıldı" }, { status: 409 });

  return NextResponse.json({
    email: invite.email,
    role: invite.role,
    organizationName: invite.organization.name,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const data = schema.parse(body);

  const invite = await db.organizationInvite.findUnique({
    where: { token: data.token },
    include: { organization: true },
  });

  if (!invite) return NextResponse.json({ error: "Davet bulunamadı" }, { status: 404 });
  if (invite.expiresAt < new Date()) return NextResponse.json({ error: "Davet süresi dolmuş" }, { status: 410 });
  if (invite.acceptedAt) return NextResponse.json({ error: "Davet zaten kullanıldı" }, { status: 409 });

  const passwordHash = await bcrypt.hash(data.password, 12);

  let user = await db.user.findUnique({ where: { email: invite.email } });

  if (!user) {
    user = await db.user.create({
      data: { name: data.name, email: invite.email, passwordHash },
    });
  }

  const alreadyMember = await db.organizationMember.findFirst({
    where: { organizationId: invite.organizationId, userId: user.id },
  });

  if (!alreadyMember) {
    await db.organizationMember.create({
      data: {
        organizationId: invite.organizationId,
        userId: user.id,
        role: invite.role,
      },
    });
  }

  await db.organizationInvite.update({
    where: { token: data.token },
    data: { acceptedAt: new Date() },
  });

  return NextResponse.json({ success: true, email: invite.email });
}
