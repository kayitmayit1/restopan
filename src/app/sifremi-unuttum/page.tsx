"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { RestoPanLogo } from "@/components/ui/restopan-logo";

const schema = z.object({
  email: z.string().email("Geçerli bir e-posta girin"),
});

export default function SifremiUnuttumPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors }, getValues } = useForm({
    resolver: zodResolver(schema),
  });

  async function onSubmit({ email }: { email: string }) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/sifremi-unuttum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSent(true);
      } else {
        toast.error("Bir hata oluştu, tekrar deneyin");
      }
    } catch {
      toast.error("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-red-50 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-3">
          <RestoPanLogo iconSize={48} />
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Şifremi Unuttum</CardTitle>
            <CardDescription>
              {sent
                ? "E-posta gönderildi"
                : "E-posta adresinizi girin, sıfırlama bağlantısı gönderelim"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="text-center space-y-4 py-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <p className="text-sm text-muted-foreground">
                  <strong>{getValues("email")}</strong> adresine şifre sıfırlama bağlantısı gönderdik.
                  Gelen kutunuzu kontrol edin.
                </p>
                <p className="text-xs text-muted-foreground">Bağlantı 1 saat geçerlidir.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="ornek@restoran.com"
                      autoComplete="email"
                      className="pl-9"
                      {...register("email")}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email.message as string}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Sıfırlama Bağlantısı Gönder
                </Button>
              </form>
            )}

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
