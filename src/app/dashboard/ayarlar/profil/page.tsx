import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Topbar } from "@/components/layout/topbar";
import { ProfileClient } from "@/components/settings/profile-client";

export default async function ProfilPage() {
  const session = await auth();
  if (!session?.user.id) return null;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, phone: true, image: true, passwordHash: true },
  });

  if (!user) return null;

  return (
    <div>
      <Topbar title="Profil" subtitle="Hesap bilgilerinizi yönetin" />
      <div className="p-6">
        <ProfileClient
          user={{
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            image: user.image,
            hasPassword: !!user.passwordHash,
          }}
        />
      </div>
    </div>
  );
}
