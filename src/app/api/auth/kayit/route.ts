import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com","guerrillamail.com","guerrillamailblock.com","throwam.com",
  "10minutemail.com","10minutemail.net","tempmail.com","temp-mail.org",
  "yopmail.com","yopmail.fr","cool.fr.nf","jetable.fr.nf","nospam.ze.tc",
  "nomail.xl.cx","mega.zik.dj","speed.1s.fr","courriel.fr.nf","moncourrier.fr.nf",
  "monemail.fr.nf","monmail.fr.nf","getairmail.com","fakeinbox.com",
  "sharklasers.com","spam4.me","mailnull.com","maildrop.cc",
  "spamgourmet.com","spamgourmet.net","spamgourmet.org","trashmail.com",
  "trashmail.at","trashmail.io","trashmail.me","trashmail.net","trashmail.org",
  "trashmail.xyz","dispostable.com","mailexpire.com","throwaway.email",
  "discard.email","tempr.email","mt2015.com","mt2016.com","mt2017.com",
  "rtrtr.com","frapmail.com","spamoverlord.com","tempinbox.com",
  "mailtemp.info","disposablemail.com","byom.de","spamfree24.org",
  "spam.la","binkmail.com","bobmail.info","damnthespam.com","devnullmail.com",
  "discardmail.com","discardmail.de","dodgeit.com","dodgit.com","dump-email.info",
  "dumpandforfeit.com","dumpyemail.com","e4ward.com","emailias.com",
  "emailinfive.com","emailmiser.com","emailsensei.com","emailtemporario.com.br",
  "emailto.de","emailwarden.com","emailx.at.hm","emailxfer.com","emkei.cz",
  "enterto.com","ephemail.net","fakedemail.com","filzmail.com","fleckens.hu",
  "garliclife.com","gishpuppy.com","great-host.in","gsrv.co.uk","guerrillamail.biz",
  "guerrillamail.de","guerrillamail.info","guerrillamail.net","guerrillamail.org",
  "h.mintemail.com","hatespam.org","hmamail.com","hulapla.de","imails.info",
  "irishspringrealty.com","jetable.com","jetable.net","jetable.org","kasmail.com",
  "klassmaster.com","klassmaster.net","klzlk.com","kulkarni.net.in","lovemeleaveme.com",
  "lt2.pl","lukop.dk","m4ilweb.info","maileimer.de","mailexpire.com","mailguard.me",
  "mailimate.com","mailinater.com","mailme.lv","mailmoat.com","mailnew.com",
  "mailnull.com","mailsiphon.com","mailslapping.com","mailslite.com","mailzilla.com",
  "mailzilla.org","mbx.cc","mega.zik.dj","mintemail.com","mypartyclip.de",
  "myphantomemail.com","mysamp.de","negativespace.co","neverbox.com","no-spam.ws",
  "nobulk.com","noclickemail.com","nogmailspam.info","nospamfor.us","nospamthanks.info",
  "notmailinator.com","nurfuerspam.de","nut.cc","objectmail.com","obobbo.com",
  "oneoffemail.com","onewaymail.com","online.ms","opayq.com","ordinaryamerican.net",
  "pookmail.com","privacy.net","proxymail.eu","punkass.com","put2.net",
  "quickinbox.com","rcpt.at","reallymymail.com","recode.me","recursor.net",
  "regbypass.com","rhyta.com","robotsrobots.com","rppkn.com","rtrtr.com",
  "s0ny.net","safe-mail.net","safetymail.info","safetypost.de","sandelf.de",
  "shieldedmail.com","shiftmail.com","sibmail.com","sneakemail.com","snkmail.com",
  "sofimail.com","sogetthis.com","soisz.com","spam.su","spamavert.com",
  "spambob.com","spambob.net","spambob.org","spamcorpse.com","spamday.com",
  "spamex.com","spamfree.eu","spamgoes.in","spamgourmet.com","spamgourmet.net",
  "spamgourmet.org","spamherelots.com","spamhereplease.com","spamhole.com",
  "spamify.com","spaminator.de","spaminmotion.com","spamme.xyz","spammotel.com",
  "spamoff.de","spamoverse.com","spamspot.com","spamthis.co.uk","spamtrail.com",
  "speed.1s.fr","spoofmail.de","stuffmail.de","super-auswahl.de","supergreatmail.com",
  "suremail.info","tempalias.com","tempe-mail.com","tempemail.biz","tempemail.com",
  "tempemail.net","tempinbox.co.uk","tempinbox.com","tempmail.it","tempmailer.com",
  "tempomail.fr","temporaryemail.net","temporaryinbox.com","thanksnospam.info",
  "thelimestones.com","throwam.com","throwam.net","throwam.org","toiea.com",
  "tradermail.info","trash-mail.at","trash-mail.com","trash-mail.de","trash-mail.io",
  "trash-mail.net","trashemail.de","trashmail.app","trashmail.at","trashmail.com",
  "trbvm.com","trickmail.net","trillianpro.com","turual.com","twinmail.de",
  "tyldd.com","uggsrock.com","umail.net","upliftnow.com","uplipht.com",
  "uroid.com","veryrealemail.com","vidchart.com","vipmail.pw","viralplays.com",
  "vpn.st","vsimcard.com","vubby.com","walala.org","webemail.me","webm4il.info",
  "wegwerfadresse.de","wegwerfemail.com","wegwerfemail.de","wegwerfmail.de",
  "wegwerfmail.net","wegwerfmail.org","wh4f.org","whyspam.me","willhackforfood.biz",
  "willselfdestruct.com","wuzup.net","wuzupmail.net","xagloo.com","xemaps.com",
  "xents.com","xmaily.com","xoxy.net","yapped.net","yepmail.net","yert.ye.vc",
  "yogamaven.com","yopmail.com","yopmail.fr","youmail.ga","ypmail.webarnak.fr.eu.org",
  "z1p.biz","za.com","zebins.com","zebins.eu","zehnminutenmail.de","zetmail.com",
  "zippymail.info","zoemail.net","zoemail.org","zomg.info","zwallet.com",
]);

function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return !!domain && DISPOSABLE_DOMAINS.has(domain);
}

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  organizationName: z.string().min(2),
  plan: z.enum(["STARTER", "PROFESSIONAL"]).optional().default("STARTER"),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  const rl = rateLimit(`signup:${ip}`, 10, 60 * 60 * 1000); // 10 signups per hour per IP
  if (!rl.success) {
    return NextResponse.json({ message: "Çok fazla deneme. Lütfen daha sonra tekrar deneyin." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const data = schema.parse(body);

    if (isDisposableEmail(data.email)) {
      return NextResponse.json(
        { message: "Geçici veya sahte e-posta adresleri kabul edilmemektedir. Lütfen gerçek e-posta adresinizi girin." },
        { status: 400 }
      );
    }

    const existing = await db.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json(
        { message: "Bu e-posta adresi zaten kullanılıyor" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    let slug = slugify(data.organizationName);
    const slugExists = await db.organization.findUnique({ where: { slug } });
    if (slugExists) slug = `${slug}-${Date.now()}`;

    const now = new Date();
    const isPro = data.plan === "PROFESSIONAL";
    const periodEnd = new Date(now);
    if (isPro) {
      periodEnd.setDate(periodEnd.getDate() + 14);
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 100);
    }

    await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { name: data.name, email: data.email, passwordHash },
      });

      const organization = await tx.organization.create({
        data: {
          name: data.organizationName,
          slug,
          plan: data.plan,
          members: { create: { userId: user.id, role: "OWNER" } },
          locations: { create: { name: "Ana Şube", isActive: true } },
        },
      });

      await tx.subscription.create({
        data: {
          organizationId: organization.id,
          status: isPro ? "TRIALING" : "ACTIVE",
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[REGISTER]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Geçersiz veri" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
