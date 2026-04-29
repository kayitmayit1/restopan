import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

const DEMO_EMAIL = "demo@restopan.app";
const DEMO_PASSWORD = "demo1234";
const DEMO_ORG = "Demo Restoran";

export async function POST() {
  let user = await db.user.findUnique({ where: { email: DEMO_EMAIL } });

  if (!user) {
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
    user = await db.user.create({
      data: {
        name: "Demo Kullanıcı",
        email: DEMO_EMAIL,
        passwordHash,
      },
    });

    const slug = "demo-restoran";
    let org = await db.organization.findUnique({ where: { slug } });

    if (!org) {
      org = await db.organization.create({
        data: {
          name: DEMO_ORG,
          slug,
          plan: "PROFESSIONAL",
          members: {
            create: { userId: user.id, role: "OWNER" },
          },
          locations: {
            create: {
              name: "Ana Şube",
              isActive: true,
              tables: {
                create: Array.from({ length: 10 }, (_, i) => ({
                  name: `Masa ${i + 1}`,
                  capacity: 4,
                  status: "AVAILABLE",
                  posX: (i % 5) * 120,
                  posY: Math.floor(i / 5) * 120,
                })),
              },
            },
          },
        },
      });

      // Create demo subscription
      const trialEnd = new Date();
      trialEnd.setFullYear(trialEnd.getFullYear() + 1);
      await db.subscription.create({
        data: {
          organizationId: org.id,
          status: "ACTIVE",
          currentPeriodStart: new Date(),
          currentPeriodEnd: trialEnd,
        },
      });
    } else {
      // Org exists but user wasn't a member
      await db.organizationMember.upsert({
        where: { organizationId_userId: { organizationId: org.id, userId: user.id } },
        update: {},
        create: { organizationId: org.id, userId: user.id, role: "OWNER" },
      });
    }
  }

  return NextResponse.json({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
}
