import { MemberRole } from "@prisma/client";
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      organizationId?: string;
      organizationSlug?: string;
      role?: MemberRole;
      locationId?: string;
      plan?: string;
    };
  }
}
