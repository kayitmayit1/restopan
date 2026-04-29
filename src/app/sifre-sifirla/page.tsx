"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Eye, EyeOff, CheckCircle2, ArrowLeft } from "lucide-react";
import { RestoPanLogo } from "@/components/ui/restopan-logo";

const schema = z.object({
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, {
  message: "Şifreler eşleşmiyor",
  path: ["confirm"],
});

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const email = params.get("email") ?? "";
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  if (!token || !email) {
    return (
      <div className="text-center space-y-4 py-4">
        <p className="text-sm text-destructive">Geçersiz veya eksik bağlantı.</p>
        <Link href="/sifremi-unuttum" className="text-sm text-primary hover:underline">
          Yeni bağlantı talep et
        </Link>
      </div>
    );
  }

  async function onSubmit({ password }: { password: string; confirm: string }) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/sifre-sifirla", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, password }),
      });
      if (res.ok) {
        setDone(true);
        setTimeout(() => router.push("/giris"), 2000);
      } else {
        const data = await res.json();
        toast.error(data.error ?? "Bir hata oluştu");
      }
    } catch {
      toast.error("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="text-center space-y-4 py-4">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
        <p className="text-sm text-muted-foreground">
          Şifreniz başarıyla güncellendi. Giriş sayfasına yönlendiriliyorsunuz...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">Yeni Şifre</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPw ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="new-password"
            {...register("password")}
          />
          <button type="button" onClick={() => setShowPw(!showPw)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-destructive">{errors.password.message as string}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm">Şifre Tekrar</Label>
        <Input
          id="confirm"
          type={showPw ? "text" : "password"}
          placeholder="••••••••"
          autoComplete="new-password"
          {...register("confirm")}
        />
        {errors.confirm && <p className="text-xs text-destructive">{errors.confirm.message as string}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        Şifremi Güncelle
      </Button>
    </form>
  );
}

export default function SifreSifirlaPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-red-50 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-3">
          <RestoPanLogo iconSize={48} />
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Yeni Şifre Belirle</CardTitle>
            <CardDescription>Hesabınız için yeni bir şifre girin</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="py-4 text-center text-muted-foreground text-sm">Yükleniyor...</div>}>
              <ResetForm />
            </Suspense>

            <div className="mt-6 text-center">
              <Link href="/giris" className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5" />
                Giriş sayfasına dön
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
