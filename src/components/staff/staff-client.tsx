"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { getInitials, cn } from "@/lib/utils";
import { MemberRole, ShiftStatus } from "@prisma/client";
import { UserPlus, Calendar, Clock, Mail, Phone } from "lucide-react";
import { InviteModal } from "./invite-modal";
import { AddShiftModal } from "./add-shift-modal";

const roleConfig: Record<MemberRole, { label: string; color: string }> = {
  OWNER: { label: "Sahip", color: "bg-purple-100 text-purple-700" },
  ADMIN: { label: "Yönetici", color: "bg-blue-100 text-blue-700" },
  MANAGER: { label: "Müdür", color: "bg-indigo-100 text-indigo-700" },
  CASHIER: { label: "Kasiyer", color: "bg-emerald-100 text-emerald-700" },
  WAITER: { label: "Garson", color: "bg-amber-100 text-amber-700" },
  KITCHEN: { label: "Mutfak", color: "bg-red-100 text-red-700" },
  STAFF: { label: "Personel", color: "bg-gray-100 text-gray-700" },
};

const shiftStatusConfig: Record<ShiftStatus, { label: string; color: string }> = {
  SCHEDULED: { label: "Planlandı", color: "text-blue-600" },
  ACTIVE: { label: "Aktif", color: "text-emerald-600" },
  COMPLETED: { label: "Tamamlandı", color: "text-gray-600" },
  ABSENT: { label: "Gelmedi", color: "text-red-600" },
  CANCELLED: { label: "İptal", color: "text-gray-400" },
};

interface Member {
  id: string;
  role: MemberRole;
  user: { id: string; name?: string | null; email: string; image?: string | null; phone?: string | null };
  location?: { name: string } | null;
}

interface ClockEvent { id: string; type: string; time: Date }

interface Shift {
  id: string;
  staffId: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: ShiftStatus;
  clockEvents: ClockEvent[];
}

interface StaffClientProps {
  members: Member[];
  shifts: Shift[];
  locationId: string;
  organizationId: string;
}

export function StaffClient({ members, shifts, locationId, organizationId }: StaffClientProps) {
  const [showInvite, setShowInvite] = useState(false);
  const [showShift, setShowShift] = useState(false);
  const [allShifts, setAllShifts] = useState(shifts);

  const activeShifts = allShifts.filter((s) => s.status === "ACTIVE").length;
  const todayShifts = allShifts.filter((s) => {
    const d = new Date(s.date);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Toplam Personel</p>
            <p className="text-2xl font-bold">{members.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Bugünkü Vardiya</p>
            <p className="text-2xl font-bold">{todayShifts.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Aktif Çalışan</p>
            <p className="text-2xl font-bold text-emerald-600">{activeShifts}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="staff">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="staff">Personel Listesi</TabsTrigger>
            <TabsTrigger value="shifts">Vardiyalar</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowShift(true)}>
              <Calendar className="w-3.5 h-3.5 mr-1.5" />
              Vardiya Ekle
            </Button>
            <Button size="sm" onClick={() => setShowInvite(true)}>
              <UserPlus className="w-3.5 h-3.5 mr-1.5" />
              Personel Davet Et
            </Button>
          </div>
        </div>

        <TabsContent value="staff" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => {
              const rc = roleConfig[member.role];
              return (
                <Card key={member.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={member.user.image || ""} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {getInitials(member.user.name || member.user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold truncate">{member.user.name || "—"}</p>
                          <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", rc.color)}>
                            {rc.label}
                          </span>
                        </div>
                        <div className="mt-1.5 space-y-1">
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Mail className="w-3 h-3" />{member.user.email}
                          </p>
                          {member.user.phone && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <Phone className="w-3 h-3" />{member.user.phone}
                            </p>
                          )}
                          {member.location && (
                            <p className="text-xs text-muted-foreground">{member.location.name}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="shifts" className="mt-4">
          <div className="rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  {["Tarih", "Personel", "Başlangıç", "Bitiş", "Durum", "Giriş/Çıkış"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {allShifts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-muted-foreground">
                      <Clock className="w-8 h-8 mx-auto mb-2 opacity-20" />
                      Vardiya bulunamadı
                    </td>
                  </tr>
                ) : (
                  allShifts.map((shift) => {
                    const sc = shiftStatusConfig[shift.status];
                    const clockIn = shift.clockEvents.find((e) => e.type === "CLOCK_IN");
                    const clockOut = shift.clockEvents.find((e) => e.type === "CLOCK_OUT");
                    const staffMember = members.find((m) => m.user.id === shift.staffId);
                    return (
                      <tr key={shift.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3 text-xs">{new Date(shift.date).toLocaleDateString("tr-TR")}</td>
                        <td className="px-4 py-3 font-medium">
                          {staffMember?.user.name || "—"}
                        </td>
                        <td className="px-4 py-3">{shift.startTime}</td>
                        <td className="px-4 py-3">{shift.endTime}</td>
                        <td className="px-4 py-3">
                          <span className={cn("text-xs font-medium", sc.color)}>{sc.label}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {clockIn ? `Giriş: ${new Date(clockIn.time).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}` : "—"}
                          {clockOut ? ` · Çıkış: ${new Date(clockOut.time).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}` : ""}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {showInvite && (
        <InviteModal
          organizationId={organizationId}
          onClose={() => setShowInvite(false)}
        />
      )}
      {showShift && (
        <AddShiftModal
          locationId={locationId}
          members={members}
          onClose={() => setShowShift(false)}
          onSaved={(shift) => {
            setAllShifts((prev) => [{ ...shift, clockEvents: [] }, ...prev]);
            setShowShift(false);
          }}
        />
      )}
    </div>
  );
}
