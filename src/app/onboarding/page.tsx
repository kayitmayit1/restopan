import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session) redirect("/giris");
  if (!session.user.organizationId) redirect("/giris");

  const org = await db.organization.findUnique({
    where: { id: session.user.organizationId },
    select: { plan: true },
  });

  return (
    <OnboardingWizard
      organizationId={session.user.organizationId}
      userName={session.user.name ?? ""}
      plan={(org?.plan ?? session.user.plan ?? "STARTER") as "STARTER" | "PROFESSIONAL" | "ENTERPRISE"}
    />
  );
}
