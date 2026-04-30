import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { db } from "@/lib/db";
import type { MemberRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/giris",
    error: "/giris",
  },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [Google({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET })]
      : []),
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await db.user.findUnique({
          where: { email: parsed.data.email },
        });

        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash
        );
        if (!valid) return null;

        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
      }
      if (token.id && (user || trigger === "update" || !token.organizationId || !token.role)) {
        try {
          const membership = await db.organizationMember.findFirst({
            where: { userId: token.id as string },
            include: { organization: true },
            orderBy: { createdAt: "asc" },
          });
          if (membership) {
            token.organizationId = membership.organizationId;
            token.organizationSlug = membership.organization.slug;
            token.role = membership.role;
            token.locationId = membership.locationId ?? undefined;
            token.plan = membership.organization.plan;
          }
        } catch (err) {
          console.error("[auth] jwt db lookup failed:", err);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string;
        session.user.organizationId = token.organizationId as string | undefined;
        session.user.organizationSlug = token.organizationSlug as string | undefined;
        session.user.role = token.role as MemberRole | undefined;
        session.user.locationId = token.locationId as string | undefined;
        session.user.plan = token.plan as string | undefined;
      }
      return session;
    },
  },
});
