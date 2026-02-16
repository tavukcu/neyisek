"use client";

import {
  Crown,
  Star,
  Gift,
  Zap,
  Trophy,
  ChevronRight,
  ShoppingBag,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import Link from "next/link";

const tiers = [
  { name: "Bronz", minPoints: 0, icon: Star, color: "from-amber-700 to-amber-600", benefit: "Her sipariste 1x puan" },
  { name: "Gumus", minPoints: 500, icon: Crown, color: "from-gray-400 to-gray-500", benefit: "Her sipariste 1.5x puan + ucretsiz teslimat" },
  { name: "Altin", minPoints: 1500, icon: Trophy, color: "from-amber-400 to-amber-500", benefit: "Her sipariste 2x puan + oncelikli destek" },
  { name: "Platin", minPoints: 5000, icon: Sparkles, color: "from-purple-400 to-purple-600", benefit: "Her sipariste 3x puan + ozel kampanyalar" },
];

const rewards = [
  { id: 1, title: "25 TL Indirim", points: 200, icon: Gift, description: "Minimum 100 TL sipariste gecerli" },
  { id: 2, title: "Ucretsiz Teslimat", points: 150, icon: Zap, description: "Sonraki siparisinde gecerli" },
  { id: 3, title: "50 TL Indirim", points: 400, icon: Gift, description: "Minimum 200 TL sipariste gecerli" },
  { id: 4, title: "%15 Indirim", points: 300, icon: Star, description: "Tum restoranlarda gecerli" },
];

const history = [
  { id: 1, action: "Siparis #NY-2026-0841", points: 23, type: "earn" as const, date: "15 Sub 2026" },
  { id: 2, action: "Siparis #NY-2026-0840", points: 44, type: "earn" as const, date: "14 Sub 2026" },
  { id: 3, action: "25 TL Indirim kullanildi", points: -200, type: "spend" as const, date: "10 Sub 2026" },
  { id: 4, action: "Siparis #NY-2026-0835", points: 19, type: "earn" as const, date: "8 Sub 2026" },
  { id: 5, action: "Hosgeldin bonusu", points: 100, type: "earn" as const, date: "1 Sub 2026" },
];

export default function LoyaltyPage() {
  const currentPoints = 486;
  const currentTierIndex = tiers.findIndex(
    (t, i) => currentPoints >= t.minPoints && (i === tiers.length - 1 || currentPoints < tiers[i + 1].minPoints)
  );
  const currentTier = tiers[currentTierIndex];
  const nextTier = tiers[currentTierIndex + 1];
  const progressToNext = nextTier
    ? ((currentPoints - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100
    : 100;

  return (
    <div className="mx-auto max-w-lg px-4 py-6 space-y-6">
      {/* Points Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl bg-gradient-to-br ${currentTier.color} p-6 text-white relative overflow-hidden`}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-6 -translate-x-6" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <currentTier.icon className="h-5 w-5" />
            <span className="text-sm font-semibold opacity-90">{currentTier.name} Uye</span>
          </div>

          <p className="text-4xl font-bold mt-2">{currentPoints}</p>
          <p className="text-sm opacity-80 mt-0.5">Toplam Puan</p>

          {nextTier && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs opacity-80 mb-1.5">
                <span>{currentTier.name}</span>
                <span>{nextTier.name} ({nextTier.minPoints - currentPoints} puan kaldi)</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${progressToNext}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Tiers */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-xl border bg-card p-4"
      >
        <h2 className="font-semibold text-sm mb-3">Uyelik Seviyeleri</h2>
        <div className="grid grid-cols-4 gap-2">
          {tiers.map((tier, i) => {
            const isActive = i === currentTierIndex;
            const isLocked = i > currentTierIndex;
            return (
              <div
                key={tier.name}
                className={`rounded-lg border p-2 text-center ${
                  isActive
                    ? "border-primary bg-primary/5"
                    : isLocked
                    ? "opacity-40"
                    : "opacity-70"
                }`}
              >
                <tier.icon
                  className={`h-5 w-5 mx-auto mb-1 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <p className="text-[10px] font-semibold">{tier.name}</p>
                <p className="text-[9px] text-muted-foreground">{tier.minPoints}+</p>
              </div>
            );
          })}
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">
          {currentTier.benefit}
        </p>
      </motion.div>

      {/* Rewards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="font-semibold text-sm mb-3">Oduller</h2>
        <div className="grid grid-cols-2 gap-3">
          {rewards.map((reward) => {
            const canRedeem = currentPoints >= reward.points;
            return (
              <div
                key={reward.id}
                className={`rounded-xl border bg-card p-3 ${
                  !canRedeem ? "opacity-50" : ""
                }`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
                  <reward.icon className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold">{reward.title}</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {reward.description}
                </p>
                <Button
                  size="sm"
                  className="w-full mt-2 h-7 text-[11px] rounded-lg gap-1"
                  disabled={!canRedeem}
                  variant={canRedeem ? "default" : "outline"}
                >
                  <Star className="h-3 w-3" />
                  {reward.points} Puan
                </Button>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* How to Earn */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-xl border bg-card p-4"
      >
        <h2 className="font-semibold text-sm mb-3">Nasil Puan Kazanilir?</h2>
        <div className="space-y-2.5">
          {[
            { text: "Her 10 TL siparis = 1 puan", icon: ShoppingBag },
            { text: "Ilk sipariste 100 bonus puan", icon: Gift },
            { text: "Degerlendirme yapin = 5 puan", icon: Star },
            { text: "Arkadas davet edin = 50 puan", icon: TrendingUp },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                <item.icon className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs">{item.text}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* History */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border bg-card p-4"
      >
        <h2 className="font-semibold text-sm mb-3">Puan Gecmisi</h2>
        <div className="space-y-2.5">
          {history.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium">{item.action}</p>
                <p className="text-[10px] text-muted-foreground">{item.date}</p>
              </div>
              <span
                className={`text-sm font-semibold ${
                  item.type === "earn" ? "text-emerald-600" : "text-red-500"
                }`}
              >
                {item.type === "earn" ? "+" : ""}{item.points}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* CTA */}
      <Link href="/menu">
        <Button className="w-full h-11 rounded-xl gap-2 font-semibold">
          <ShoppingBag className="h-4 w-4" />
          Siparis Ver, Puan Kazan
        </Button>
      </Link>
    </div>
  );
}
