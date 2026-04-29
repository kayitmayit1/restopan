import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { token, email, password } = await req.json();

  if (!token || !email || !password || password.length < 6) {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const record = await db.verificationToken.findFirst({
    where: {
      identifier: `reset:${email.toLowerCase()}`,
      token,
    },
  });

  if (!record) {
    return NextResponse.json({ error: "Geçersiz veya süresi dolmuş bağlantı" }, { status: 400 });
  }

  if (record.expires < new Date()) {
    await db.verificationToken.delete({ where: { identifier_token: { identifier: record.identifier, token } } });
    return NextResponse.json({ error: "Bağlantının süresi dolmuş, yeniden talep edin" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await db.user.update({
    where: { email: email.toLowerCase() },
    data: { passwordHash },
  });

  await db.verificationToken.delete({
    where: { identifier_token: { identifier: record.identifier, token } },
  });

  return NextResponse.json({ ok: true });
}
