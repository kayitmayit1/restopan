import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  organizationName: z.string().min(2),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

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

    const user = await db.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
      },
    });

    const organization = await db.organization.create({
      data: {
        name: data.organizationName,
        slug,
        plan: "STARTER",
        members: {
          create: {
            userId: user.id,
            role: "OWNER",
          },
        },
        locations: {
          create: {
            name: "Ana Şube",
            isActive: true,
          },
        },
      },
    });

    // Create trial subscription
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 14);

    await db.subscription.create({
      data: {
        organizationId: organization.id,
        status: "TRIALING",
        currentPeriodStart: new Date(),
        currentPeriodEnd: trialEnd,
      },
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
