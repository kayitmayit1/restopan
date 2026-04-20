import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function usePlanLimit() {
  const router = useRouter();

  function handleResponse(res: Response) {
    if (res.status === 403) {
      res.json().then((data) => {
        if (data.upgradeRequired) {
          toast.error(data.message, {
            action: {
              label: "Planı Yükselt",
              onClick: () => router.push("/dashboard/ayarlar/fatura"),
            },
            duration: 8000,
          });
        }
      });
      return false;
    }
    return true;
  }

  return { handleResponse };
}
