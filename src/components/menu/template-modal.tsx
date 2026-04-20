"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Loader2, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { TEMPLATES } from "./template-data";

interface TemplateModalProps {
  organizationId: string;
  onClose: () => void;
  onImported: () => void;
}

export function TemplateModal({ organizationId, onClose, onImported }: TemplateModalProps) {
  const [selected, setSelected] = useState(TEMPLATES[0]);
  const [loading, setLoading] = useState(false);

  async function handleImport() {
    setLoading(true);
    try {
      const res = await fetch("/api/menu/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId, categories: selected.categories }),
      });
      if (!res.ok) throw new Error();
      toast.success(`${selected.label} şablonu içe aktarıldı`);
      onImported();
    } catch {
      toast.error("İçe aktarma başarısız");
    } finally {
      setLoading(false);
    }
  }

  const totalItems = selected.categories.reduce((s, c) => s + c.items.length, 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">Hazır Menü Şablonu</p>
              <p className="text-xs text-muted-foreground">Restoran tipinizi seçin, tek tıkla menünüz hazır</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0">

          {/* Left — Template Picker */}
          <div className="w-72 shrink-0 border-r flex flex-col">
            <p className="px-4 pt-4 pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Şablonlar
            </p>
            <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-2">
              {TEMPLATES.map((t) => {
                const isActive = selected.id === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelected(t)}
                    className={cn(
                      "w-full text-left rounded-xl overflow-hidden transition-all ring-2",
                      isActive ? "ring-primary shadow-lg scale-[1.01]" : "ring-transparent hover:ring-border hover:shadow-md"
                    )}
                  >
                    <div className={cn("bg-gradient-to-r h-20 flex items-end p-3", t.gradient)}>
                      <span className="text-3xl drop-shadow-sm">{t.emoji}</span>
                    </div>
                    <div className="bg-card px-3 py-2.5 border-x border-b rounded-b-xl">
                      <p className="font-semibold text-sm">{t.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{t.subtitle}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-muted-foreground">{t.categories.length} kategori</span>
                        <span className="text-muted-foreground/40">·</span>
                        <span className="text-[10px] text-muted-foreground">
                          {t.categories.reduce((s, c) => s + c.items.length, 0)} ürün
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right — Menu Preview */}
          <div className="flex-1 min-w-0 overflow-y-auto" style={{ backgroundColor: selected.bgColor }}>
            <div className={cn("bg-gradient-to-br px-10 py-10 text-center relative overflow-hidden", selected.gradient)}>
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
              <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/5" />
              <p className="text-white/60 text-xs tracking-[0.3em] uppercase mb-2">{selected.subtitle}</p>
              <h1 className="text-white text-3xl font-bold tracking-tight">{selected.label}</h1>
              <div className="flex items-center gap-3 justify-center mt-4">
                <div className="h-px w-12 bg-white/30" />
                <span className="text-white/70 text-sm">{selected.emoji}</span>
                <div className="h-px w-12 bg-white/30" />
              </div>
              <p className="text-white/60 text-xs mt-3 tracking-wider">{selected.tagline}</p>
            </div>

            <div className="px-8 py-8 space-y-8">
              {selected.categories.map((cat, ci) => (
                <div key={ci}>
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className="px-4 py-1.5 rounded-full text-white text-xs font-bold uppercase shadow-sm shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${selected.borderColor}, ${selected.accentColor})`,
                        letterSpacing: "0.15em",
                      }}
                    >
                      {cat.name}
                    </div>
                    <div className="h-px flex-1" style={{ backgroundColor: selected.borderColor + "25" }} />
                  </div>

                  <div className="space-y-3.5 pl-1">
                    {cat.items.map((item, ii) => (
                      <div key={ii}>
                        <div className="flex items-baseline gap-2">
                          <span className="font-semibold text-[15px] leading-snug tracking-tight" style={{ color: selected.textColor }}>
                            {item.name}
                          </span>
                          <div className="flex-1 border-b border-dotted mb-0.5" style={{ borderColor: selected.borderColor + "28" }} />
                          <span className="font-bold text-base shrink-0 tabular-nums" style={{ color: selected.accentColor }}>
                            ₺{item.price}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-[12px] mt-0.5 leading-relaxed pl-0.5 italic" style={{ color: selected.accentColor + "88" }}>
                            {item.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-3 justify-center pt-4">
                <div className="h-px w-16" style={{ backgroundColor: selected.borderColor + "30" }} />
                <span className="text-lg">{selected.emoji}</span>
                <div className="h-px w-16" style={{ backgroundColor: selected.borderColor + "30" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex items-center gap-4 shrink-0" style={{ backgroundColor: selected.bgColor + "80" }}>
          <div>
            <p className="text-sm font-semibold">{selected.label} şablonu</p>
            <p className="text-xs text-muted-foreground">
              {selected.categories.length} kategori · {totalItems} ürün sisteme aktarılacak
            </p>
          </div>
          <div className="flex-1" />
          <Button variant="outline" onClick={onClose} size="sm">İptal</Button>
          <Button onClick={handleImport} disabled={loading} size="sm" className="gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            {loading ? "Aktarılıyor…" : "Bu Şablonu Kullan"}
          </Button>
        </div>
      </div>
    </div>
  );
}
