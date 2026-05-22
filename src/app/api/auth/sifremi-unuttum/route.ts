import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { randomBytes } from "crypto";
import { Resend } from "resend";
import { rateLimit } from "@/lib/rate-limit";
import { publicAppUrl } from "@/lib/public-app-url";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM ?? "RestoPan <onboarding@resend.dev>";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  const rl = await rateLimit(`pw-reset:${ip}`, 5, 15 * 60 * 1000); // 5 per 15 min per IP
  if (!rl.success) {
    return NextResponse.json({ error: "Çok fazla deneme. 15 dakika sonra tekrar deneyin." }, { status: 429 });
  }

  const { email } = await req.json();
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Geçersiz e-posta" }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });

  // Always return success to avoid email enumeration
  if (!user) return NextResponse.json({ ok: true });

  // Delete existing reset tokens for this user
  await db.verificationToken.deleteMany({
    where: { identifier: `reset:${email.toLowerCase()}` },
  });

  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  await db.verificationToken.create({
    data: {
      identifier: `reset:${email.toLowerCase()}`,
      token,
      expires,
    },
  });

  const appUrl =
    process.env.NEXTAUTH_URL?.trim().replace(/\/$/, "") || publicAppUrl();
  const resetUrl = `${appUrl}/sifre-sifirla?token=${token}&email=${encodeURIComponent(email.toLowerCase())}`;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "RestoPAN — Şifre Sıfırlama",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
        <h2 style="color:#111;margin-bottom:8px;">Şifrenizi Sıfırlayın</h2>
        <p style="color:#555;margin-bottom:24px;">
          Şifre sıfırlama talebinizi aldık. Aşağıdaki butona tıklayarak yeni şifrenizi belirleyin.
        </p>
        <a href="${resetUrl}"
          style="display:inline-block;background:#e85d04;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;">
          Şifremi Sıfırla
        </a>
        <p style="color:#999;font-size:12px;margin-top:24px;">
          Bu bağlantı 1 saat geçerlidir. Eğer böyle bir talepte bulunmadıysanız bu e-postayı yok sayabilirsiniz.
        </p>
      </div>
    `,
  });

  return NextResponse.json({ ok: true });
}
