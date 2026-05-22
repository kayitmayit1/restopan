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

export async function sendOrderReceipt(opts: {
  to: string;
  customerName: string;
  restaurantName: string;
  orderNumber: string;
  items: { name: string; quantity: number; unitPrice: number }[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: string;
}) {
  const fmt = (n: number) =>
    n.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });

  const methodLabels: Record<string, string> = {
    CASH: "Nakit",
    CREDIT_CARD: "Kredi Kartı",
    DEBIT_CARD: "Banka Kartı",
    ONLINE: "Online",
    GIFT_CARD: "Hediye Kartı",
    LOYALTY_POINTS: "Puan",
    BANK_TRANSFER: "Havale",
  };

  const rows = opts.items
    .map(
      (i) => `
      <tr>
        <td style="padding:6px 0;color:#333;">${i.name} x${i.quantity}</td>
        <td style="padding:6px 0;text-align:right;color:#333;">${fmt(i.unitPrice * i.quantity)}</td>
      </tr>`
    )
    .join("");

  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `Fişiniz — ${opts.restaurantName} #${opts.orderNumber}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
        <h2 style="color:#111;margin-bottom:4px;">Teşekkürler, ${opts.customerName}!</h2>
        <p style="color:#888;margin-bottom:24px;font-size:14px;">${opts.restaurantName} · Sipariş #${opts.orderNumber}</p>
        <div style="background:#f9f9f9;border-radius:12px;padding:20px;margin-bottom:20px;">
          <table style="width:100%;border-collapse:collapse;">
            ${rows}
            <tr><td colspan="2" style="border-top:1px solid #e5e5e5;padding-top:10px;"></td></tr>
            <tr>
              <td style="color:#888;padding:4px 0;font-size:13px;">Ara Toplam</td>
              <td style="text-align:right;color:#888;font-size:13px;">${fmt(opts.subtotal)}</td>
            </tr>
            ${opts.discountAmount > 0 ? `<tr><td style="color:#e85d04;padding:4px 0;font-size:13px;">İndirim</td><td style="text-align:right;color:#e85d04;font-size:13px;">-${fmt(opts.discountAmount)}</td></tr>` : ""}
            <tr>
              <td style="color:#888;padding:4px 0;font-size:13px;">KDV</td>
              <td style="text-align:right;color:#888;font-size:13px;">${fmt(opts.taxAmount)}</td>
            </tr>
            <tr>
              <td style="font-weight:700;padding:8px 0;font-size:16px;">Toplam</td>
              <td style="text-align:right;font-weight:700;font-size:16px;">${fmt(opts.totalAmount)}</td>
            </tr>
            <tr>
              <td style="color:#888;padding:4px 0;font-size:13px;">Ödeme</td>
              <td style="text-align:right;color:#888;font-size:13px;">${methodLabels[opts.paymentMethod] ?? opts.paymentMethod}</td>
            </tr>
          </table>
        </div>
        <p style="color:#aaa;font-size:12px;text-align:center;">Bizi tercih ettiğiniz için teşekkürler.</p>
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
