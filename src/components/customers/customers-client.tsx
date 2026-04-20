"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatCurrency, getInitials, formatDate } from "@/lib/utils";
import { Search, UserPlus, Star, Phone, Mail, ShoppingBag, Calendar } from "lucide-react";
import { AddCustomerModal } from "./add-customer-modal";

interface Customer {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  loyaltyPoints: number;
  totalSpent: number;
  visitCount: number;
  lastVisitAt?: Date | null;
  tags: string[];
  createdAt: Date;
  _count: { orders: number; reservations: number };
}

interface CustomersClientProps {
  customers: Customer[];
  organizationId: string;
}

export function CustomersClient({ customers: initialCustomers, organizationId }: CustomersClientProps) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<Customer | null>(null);

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: customers.length,
    totalRevenue: customers.reduce((s, c) => s + c.totalSpent, 0),
    avgSpend: customers.length > 0 ? customers.reduce((s, c) => s + c.totalSpent, 0) / customers.length : 0,
    loyaltyMembers: customers.filter((c) => c.loyaltyPoints > 0).length,
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Toplam Müşteri", value: stats.total.toString() },
          { label: "Toplam Gelir", value: formatCurrency(stats.totalRevenue) },
          { label: "Ort. Harcama", value: formatCurrency(stats.avgSpend) },
          { label: "Sadakat Üyesi", value: stats.loyaltyMembers.toString() },
        ].map((s) => (
          <Card key={s.label} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold mt-0.5">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="İsim, telefon, e-posta..." value={search}
            onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button size="sm" onClick={() => setShowAdd(true)}>
          <UserPlus className="w-3.5 h-3.5 mr-1.5" />Müşteri Ekle
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <p className="col-span-3 text-center py-10 text-muted-foreground">Müşteri bulunamadı</p>
        ) : filtered.map((customer) => (
          <Card key={customer.id} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelected(customer)}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-12 h-12 bg-primary/10">
                  <AvatarFallback className="text-primary font-semibold text-sm">
                    {getInitials(customer.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold truncate">{customer.name}</p>
                    {customer.loyaltyPoints > 0 && (
                      <Star className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    )}
                  </div>
                  {customer.phone && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3" />{customer.phone}
                    </p>
                  )}
                  {customer.email && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Mail className="w-3 h-3" />{customer.email}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ShoppingBag className="w-3 h-3" />{customer._count.orders} sipariş
                    </span>
                    <span className="font-semibold text-primary">
                      {formatCurrency(customer.totalSpent)}
                    </span>
                  </div>
                  {customer.loyaltyPoints > 0 && (
                    <Badge variant="secondary" className="mt-2 text-xs">
                      <Star className="w-2.5 h-2.5 mr-1" />{customer.loyaltyPoints} puan
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showAdd && (
        <AddCustomerModal
          organizationId={organizationId}
          onClose={() => setShowAdd(false)}
          onSaved={(c) => {
            setCustomers((prev) => [{ ...c, _count: { orders: 0, reservations: 0 } }, ...prev]);
            setShowAdd(false);
          }}
        />
      )}
    </div>
  );
}
