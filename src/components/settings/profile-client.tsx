"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, User, Lock } from "lucide-react";
import { toast } from "sonner";
import { getInitials } from "@/lib/utils";

interface Props {
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    image: string | null;
    hasPassword: boolean;
  };
}

export function ProfileClient({ user: initial }: Props) {
  const [name, setName] = useState(initial.name ?? "");
  const [phone, setPhone] = useState(initial.phone ?? "");
  const [savingInfo, setSavingInfo] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  async function saveInfo() {
    if (!name.trim()) { toast.error("Ad soyad boş olamaz"); return; }
    setSavingInfo(true);
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone: phone || null }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      toast.success("Profil güncellendi");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Güncelleme başarısız");
    } finally {
      setSavingInfo(false);
    }
  }

  async function savePassword() {
    if (newPassword !== confirmPassword) { toast.error("Şifreler eşleşmiyor"); return; }
    if (newPassword.length < 6) { toast.error("Şifre en az 6 karakter olmalı"); return; }
    setSavingPw(true);
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      toast.success("Şifre güncellendi");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Şifre güncellenemedi");
    } finally {
      setSavingPw(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-5">
      {/* Avatar + Info */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4" />
            Kişisel Bilgiler
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={initial.image ?? ""} />
              <AvatarFallback className="bg-primary text-white text-lg font-bold">
                {getInitials(name || initial.email)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{name || "—"}</p>
              <p className="text-sm text-muted-foreground">{initial.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ad Soyad</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Adınız Soyadınız" />
            </div>
            <div className="space-y-2">
              <Label>Telefon</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+90 5XX XXX XX XX" />
            </div>
            <div className="space-y-2">
              <Label>E-posta</Label>
              <Input value={initial.email} disabled className="bg-muted/50" />
            </div>
          </div>

          <Button onClick={saveInfo} disabled={savingInfo}>
            {savingInfo && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Kaydet
          </Button>
        </CardContent>
      </Card>

      {/* Password */}
      {initial.hasPassword && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Şifre Değiştir
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Mevcut Şifre</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Yeni Şifre</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="En az 6 karakter"
                />
              </div>
              <div className="space-y-2">
                <Label>Yeni Şifre (Tekrar)</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Şifreyi tekrarlayın"
                />
              </div>
            </div>
            <Button onClick={savePassword} disabled={savingPw || !currentPassword || !newPassword}>
              {savingPw && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Şifreyi Güncelle
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
