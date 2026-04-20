"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, cn } from "@/lib/utils";
import { PurchaseOrderStatus } from "@prisma/client";
import { Plus, Building2, Phone, Mail, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

const poStatusConfig: Record<PurchaseOrderStatus, { label: string; color: string }> = {
  DRAFT:     { label: "Taslak",      color: "text-gray-500" },
  ORDERED:   { label: "Sipariş Verildi", color: "text-blue-600" },
  PARTIAL:   { label: "Kısmi Teslim", color: "text-amber-600" },
  RECEIVED:  { label: "Teslim Alındı", color: "text-emerald-600" },
  CANCELLED: { label: "İptal",       color: "text-red-600" },
};

interface Supplier {
  id: string; name: string; contactName?: string | null; email?: string | null;
  phone?: string | null; isActive: boolean;
  _count: { purchaseOrders: number; inventoryItems: number };
}
interface PurchaseOrder {
  id: string; orderNumber: string; status: PurchaseOrderStatus; totalAmount: number; createdAt: Date;
  supplier: { name: string };
  items: Array<{ quantity: number; unitCost: number; inventoryItem: { name: string; unit: string } }>;
}

interface SuppliersClientProps {
  suppliers: Supplier[];
  orders: PurchaseOrder[];
  locationId: string;
}

export function SuppliersClient({ suppliers: initialSuppliers, orders: initialOrders, locationId }: SuppliersClientProps) {
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [orders, setOrders] = useState(initialOrders);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", contactName: "", phone: "", email: "", address: "" });

  async function handleAddSupplier(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, locationId }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSuppliers((prev) => [...prev, { ...data, _count: { purchaseOrders: 0, inventoryItems: 0 } }]);
      setShowAdd(false);
      toast.success("Tedarikçi eklendi");
    } catch { toast.error("İşlem başarısız"); }
    finally { setLoading(false); }
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm"><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Toplam Tedarikçi</p>
          <p className="text-2xl font-bold">{suppliers.length}</p>
        </CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Aktif Sipariş</p>
          <p className="text-2xl font-bold text-blue-600">
            {orders.filter((o) => o.status === "ORDERED").length}
          </p>
        </CardContent></Card>
        <Card className="border-0 shadow-sm"><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Toplam Satın Alım</p>
          <p className="text-2xl font-bold">{orders.length}</p>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="suppliers">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="suppliers">Tedarikçiler</TabsTrigger>
            <TabsTrigger value="orders">Satın Alma Siparişleri</TabsTrigger>
          </TabsList>
          <Button size="sm" onClick={() => setShowAdd(true)}>
            <Plus className="w-3.5 h-3.5 mr-1.5" />Tedarikçi Ekle
          </Button>
        </div>

        <TabsContent value="suppliers" className="mt-4">
          {showAdd && (
            <Card className="border-0 shadow-sm mb-4">
              <CardContent className="pt-4">
                <form onSubmit={handleAddSupplier} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Firma Adı *</Label>
                      <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Yetkili Adı</Label>
                      <Input value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Telefon</Label>
                      <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">E-posta</Label>
                      <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowAdd(false)}>İptal</Button>
                    <Button type="submit" size="sm" disabled={loading}>
                      {loading && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}Kaydet
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers.map((s) => (
              <Card key={s.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{s.name}</p>
                      {s.contactName && <p className="text-xs text-muted-foreground">{s.contactName}</p>}
                      <div className="mt-1.5 space-y-0.5">
                        {s.phone && <p className="text-xs flex items-center gap-1"><Phone className="w-3 h-3" />{s.phone}</p>}
                        {s.email && <p className="text-xs flex items-center gap-1"><Mail className="w-3 h-3" />{s.email}</p>}
                      </div>
                      <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                        <span>{s._count.purchaseOrders} sipariş</span>
                        <span>{s._count.inventoryItems} ürün</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="orders" className="mt-4">
          <div className="rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  {["Sipariş No", "Tedarikçi", "Durum", "Tutar", "Tarih"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Satın alma siparişi yok</td></tr>
                ) : orders.map((o) => {
                  const sc = poStatusConfig[o.status];
                  return (
                    <tr key={o.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono text-xs">{o.orderNumber}</td>
                      <td className="px-4 py-3 font-medium">{o.supplier.name}</td>
                      <td className="px-4 py-3"><span className={cn("text-xs font-medium", sc.color)}>{sc.label}</span></td>
                      <td className="px-4 py-3 font-semibold">{formatCurrency(o.totalAmount)}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString("tr-TR")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
