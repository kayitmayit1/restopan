"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Rocket, CheckCircle2 } from "lucide-react";
import { RestoPanLogo } from "@/components/ui/restopan-logo";

const schema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalı"),
  email: z.string().email("Geçerli bir e-posta girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
  organizationName: z.string().min(2, "Restoran adı en az 2 karakter olmalı"),
});

type FormData = z.infer<typeof schema>;

export default function ProKayitPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/kayit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, plan: "PROFESSIONAL" }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.message || "Kayıt başarısız");
        return;
      }

      await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      router.push("/onboarding");
      toast.success("Hoş geldiniz! 14 günlük denemeniz başladı.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-red-50 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-3">
          <RestoPanLogo iconSize={48} />
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-2">
              <Rocket className="w-3 h-3" />
              Professional Plan — 14 Gün Ücretsiz Deneme
            </div>
            <p className="text-xs text-muted-foreground">Kredi kartı gerekmez · İstediğiniz zaman iptal</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm">
          <div className="flex flex-col gap-1 w-full">
            {["50 masa, 10 kullanıcı, 3 şube", "Online sipariş & QR menü", "WhatsApp destek — 1 saat yanıt"].map((f) => (
              <div key={f} className="flex items-center gap-2 text-xs text-gray-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Hesap Oluştur</CardTitle>
            <CardDescription>
              14 gün boyunca tüm özellikleri ücretsiz kullanın
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="organizationName">Restoran Adı</Label>
                <Input
                  id="organizationName"
                  placeholder="Örn: Lezzet Durağı"
                  {...register("organizationName")}
                />
                {errors.organizationName && (
                  <p className="text-xs text-destructive">
                    {errors.organizationName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Ad Soyad</Label>
                <Input
                  id="name"
                  placeholder="Ahmet Yılmaz"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@restoran.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Şifre</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="En az 6 karakter"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                14 Gün Ücretsiz Başla
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">
                Zaten hesabınız var mı?{" "}
              </span>
              <a
                href="/giris"
                className="text-primary font-medium hover:underline"
              >
                Giriş Yap
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
