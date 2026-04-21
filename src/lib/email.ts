import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM ?? "RestoPan <onboarding@resend.dev>";

export async function sendReservationConfirmation(opts: {
  to: string;
  guestName: string;
  date: Date;
  guestCount: number;
  restaurantName: string;
  tableName?: string;
}) {
  const dateStr = opts.date.toLocaleDateString("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `Rezervasyon Onayı — ${opts.restaurantName}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
        <h2 style="color:#111;margin-bottom:8px;">Rezervasyonunuz Onaylandı ✓</h2>
        <p style="color:#555;margin-bottom:24px;">Merhaba ${opts.guestName},</p>
        <div style="background:#f9f9f9;border-radius:12px;padding:20px;margin-bottom:24px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="color:#888;padding:6px 0;">Restoran</td><td style="font-weight:600;text-align:right;">${opts.restaurantName}</td></tr>
            <tr><td style="color:#888;padding:6px 0;">Tarih & Saat</td><td style="font-weight:600;text-align:right;">${dateStr}</td></tr>
            <tr><td style="color:#888;padding:6px 0;">Kişi Sayısı</td><td style="font-weight:600;text-align:right;">${opts.guestCount} kişi</td></tr>
            ${opts.tableName ? `<tr><td style="color:#888;padding:6px 0;">Masa</td><td style="font-weight:600;text-align:right;">${opts.tableName}</td></tr>` : ""}
          </table>
        </div>
        <p style="color:#555;font-size:14px;">İptal veya değişiklik için lütfen restoranımızı arayın.</p>
      </div>
    `,
  });
}

export async function sendStaffInvite(opts: {
  to: string;
  restaurantName: string;
  role: string;
  inviteUrl: string;
  invitedBy: string;
}) {
  const roleLabels: Record<string, string> = {
    ADMIN: "Yönetici",
    MANAGER: "Müdür",
    CASHIER: "Kasiyer",
    WAITER: "Garson",
    KITCHEN: "Mutfak",
    STAFF: "Personel",
  };

  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `${opts.restaurantName} — Personel Daveti`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
        <h2 style="color:#111;margin-bottom:8px;">Takıma Davet Edildiniz</h2>
        <p style="color:#555;margin-bottom:24px;">
          <strong>${opts.invitedBy}</strong> sizi <strong>${opts.restaurantName}</strong> restoranına
          <strong>${roleLabels[opts.role] ?? opts.role}</strong> olarak davet etti.
        </p>
        <a href="${opts.inviteUrl}"
          style="display:inline-block;background:#e85d04;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;">
          Daveti Kabul Et
        </a>
        <p style="color:#999;font-size:12px;margin-top:24px;">Bu davet 7 gün geçerlidir.</p>
      </div>
    `,
  });
}
