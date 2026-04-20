"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Globe, Bell, Shield, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Organization {
  id: string; name: string; slug: string; currency: string; timezone: string;
  locale: string; taxRate: number; taxIncluded: boolean; address?: string | null;
  phone?: string | null; email?: string | null; website?: string | null;
  plan: string;
}
interface Location {
  id: string; name: string; address?: string | null; phone?: string | null;
  email?: string | null; isActive: boolean;
  _count: { tables: number; members: number };
}

interface SettingsClientProps { organization: Organization; locations: Location[] }

export function SettingsClient({ organization: initialOrg, locations: initialLocations }: SettingsClientProps) {
  const [org, setOrg] = useState(initialOrg);
  const [locations, setLocations] = useState(initialLocations);
  const [saving, setSaving] = useState(false);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [newLocName, setNewLocName] = useState("");
  const [addingLoc, setAddingLoc] = useState(false);

  async function saveOrg() {
    setSaving(true);
    try {
      await fetch(`/api/organizations/${org.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(org),
      });
      toast.success("Ayarlar kaydedildi");
    } catch { toast.error("Kayıt başarısız"); }
    finally { setSaving(false); }
  }

  async function addLocation() {
    if (!newLocName.trim()) return;
    setAddingLoc(true);
    try {
      const res = await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: org.id, name: newLocName }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLocations((prev) => [...prev, { ...data, _count: { tables: 0, members: 0 } }]);
      setShowAddLocation(false);
      setNewLocName("");
      toast.success("Şube eklendi");
    } catch { toast.error("Şube eklenemedi"); }
    finally { setAddingLoc(false); }
  }

  const planConfig = {
    STARTER: { label: "Starter", color: "bg-gray-100 text-gray-700" },
    PROFESSIONAL: { label: "Professional", color: "bg-blue-100 text-blue-700" },
    ENTERPRISE: { label: "Enterprise", color: "bg-purple-100 text-purple-700" },
  };
  const plan = planConfig[org.plan as keyof typeof planConfig] || planConfig.STARTER;

  return (
    <div className="max-w-4xl space-y-5">
      {/* Plan */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Mevcut Plan</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2.5 py-0.5 rounded-full text-sm font-semibold ${plan.color}`}>{plan.label}</span>
            </div>
          </div>
          <Button variant="outline" size="sm">Planı Yükselt</Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general"><Building2 className="w-3.5 h-3.5 mr-1.5" />Genel</TabsTrigger>
          <TabsTrigger value="locations"><MapPin className="w-3.5 h-3.5 mr-1.5" />Şubeler</TabsTrigger>
          <TabsTrigger value="preferences"><Globe className="w-3.5 h-3.5 mr-1.5" />Tercihler</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="w-3.5 h-3.5 mr-1.5" />Bildirimler</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-base">Restoran Bilgileri</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Restoran Adı</Label>
                  <Input value={org.name} onChange={(e) => setOrg({ ...org, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>URL Slug</Label>
                  <Input value={org.slug} onChange={(e) => setOrg({ ...org, slug: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Telefon</Label>
                  <Input value={org.phone || ""} onChange={(e) => setOrg({ ...org, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>E-posta</Label>
                  <Input type="email" value={org.email || ""} onChange={(e) => setOrg({ ...org, email: e.target.value })} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Adres</Label>
                  <Input value={org.address || ""} onChange={(e) => setOrg({ ...org, address: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Web Sitesi</Label>
                  <Input value={org.website || ""} onChange={(e) => setOrg({ ...org, website: e.target.value })} />
                </div>
              </div>
              <Button onClick={saveOrg} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Kaydet
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setShowAddLocation(true)}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />Şube Ekle
            </Button>
          </div>

          {showAddLocation && (
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-4">
                <div className="flex items-end gap-3">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Şube Adı</Label>
                    <Input value={newLocName} onChange={(e) => setNewLocName(e.target.value)} placeholder="Örn: Kadıköy Şubesi" />
                  </div>
                  <Button size="sm" onClick={addLocation} disabled={addingLoc}>
                    {addingLoc && <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />}Ekle
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowAddLocation(false)}>İptal</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {locations.map((loc) => (
              <Card key={loc.id} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{loc.name}</p>
                        {loc.address && <p className="text-xs text-muted-foreground">{loc.address}</p>}
                        <p className="text-xs text-muted-foreground mt-1">
                          {loc._count.tables} masa · {loc._count.members} personel
                        </p>
                      </div>
                    </div>
                    <Badge variant={loc.isActive ? "secondary" : "destructive"} className="text-xs">
                      {loc.isActive ? "Aktif" : "Pasif"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="preferences" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-base">Para & Dil</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Para Birimi</Label>
                  <Select value={org.currency} onValueChange={(v) => v !== null && setOrg({ ...org, currency: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TRY">₺ Türk Lirası</SelectItem>
                      <SelectItem value="USD">$ ABD Doları</SelectItem>
                      <SelectItem value="EUR">€ Euro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Dil</Label>
                  <Select value={org.locale} onValueChange={(v) => v !== null && setOrg({ ...org, locale: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tr">Türkçe</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>KDV Oranı (%)</Label>
                  <Input type="number" value={org.taxRate}
                    onChange={(e) => setOrg({ ...org, taxRate: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>KDV Fiyata Dahil</Label>
                  <p className="text-xs text-muted-foreground">Fiyatlar KDV dahil görüntülenir</p>
                </div>
                <Switch checked={org.taxIncluded} onCheckedChange={(v) => setOrg({ ...org, taxIncluded: v })} />
              </div>
              <Button onClick={saveOrg} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Kaydet
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-base">Bildirim Tercihleri</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "newOrder", label: "Yeni Sipariş", desc: "Yeni sipariş geldiğinde bildir" },
                { key: "lowStock", label: "Düşük Stok", desc: "Stok minimumun altına düştüğünde bildir" },
                { key: "newReservation", label: "Yeni Rezervasyon", desc: "Online rezervasyon geldiğinde bildir" },
                { key: "dailyReport", label: "Günlük Rapor", desc: "Her gün sonunda özet rapor gönder" },
              ].map((n) => (
                <div key={n.key} className="flex items-center justify-between">
                  <div>
                    <Label>{n.label}</Label>
                    <p className="text-xs text-muted-foreground">{n.desc}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
