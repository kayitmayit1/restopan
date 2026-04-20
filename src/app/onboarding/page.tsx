import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session) redirect("/giris");
  if (!session.user.organizationId) redirect("/giris");

  return (
    <OnboardingWizard
      organizationId={session.user.organizationId}
      userName={session.user.name ?? ""}
    />
  );
}
