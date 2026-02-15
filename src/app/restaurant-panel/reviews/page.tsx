"use client";

import { useState } from "react";
import {
  Star,
  MessageSquare,
  Send,
  Filter,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useRestaurantPanelStore } from "@/stores/restaurant-panel.store";
import { toast } from "sonner";
import { motion } from "framer-motion";

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ReviewsPage() {
  const { reviews, replyReview } = useRestaurantPanelStore();
  const [filter, setFilter] = useState<"all" | "replied" | "unreplied">("all");
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  const ratingDist = [5, 4, 3, 2, 1].map((r) => ({
    rating: r,
    count: reviews.filter((rev) => rev.rating === r).length,
    percentage:
      reviews.length > 0
        ? (reviews.filter((rev) => rev.rating === r).length / reviews.length) *
          100
        : 0,
  }));

  const filtered = reviews.filter((r) => {
    if (filter === "replied") return !!r.reply;
    if (filter === "unreplied") return !r.reply;
    return true;
  });

  const handleReply = (id: string) => {
    if (!replyText.trim()) {
      toast.error("Yanit bos olamaz");
      return;
    }
    replyReview(id, replyText.trim());
    setReplyingId(null);
    setReplyText("");
    toast.success("Yanit gonderildi");
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
        {/* Average */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border bg-card p-5 text-center"
        >
          <p className="text-4xl font-bold">{avgRating.toFixed(1)}</p>
          <div className="flex justify-center gap-0.5 mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.round(avgRating)
                    ? "text-amber-500 fill-amber-500"
                    : "text-muted-foreground/20"
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {reviews.length} degerlendirme
          </p>
        </motion.div>

        {/* Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-xl border bg-card p-5"
        >
          <div className="space-y-2">
            {ratingDist.map((d) => (
              <div key={d.rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-10 shrink-0">
                  <span className="text-xs font-medium">{d.rating}</span>
                  <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                </div>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{ width: `${d.percentage}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-8 text-right">
                  {d.count}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Filter */}
      <div className="flex gap-1 rounded-lg border bg-card p-1 w-fit">
        {(
          [
            { key: "all", label: "Tumu" },
            { key: "unreplied", label: "Yanitlanmamis" },
            { key: "replied", label: "Yanitlanmis" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === tab.key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {filtered.map((review, i) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="rounded-xl border bg-card p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">
                    {review.customerName}
                  </span>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < review.rating
                            ? "text-amber-500 fill-amber-500"
                            : "text-muted-foreground/20"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {formatDate(review.createdAt)}
                </p>
              </div>

              {review.rating >= 4 ? (
                <ThumbsUp className="h-4 w-4 text-emerald-500 shrink-0" />
              ) : review.rating <= 2 ? (
                <ThumbsDown className="h-4 w-4 text-red-500 shrink-0" />
              ) : null}
            </div>

            <p className="mt-2 text-sm">{review.comment}</p>

            {/* Reply */}
            {review.reply && (
              <div className="mt-3 rounded-lg bg-muted/50 p-3">
                <p className="text-[11px] font-medium text-primary mb-1">
                  Yanitiniz
                </p>
                <p className="text-xs text-muted-foreground">{review.reply}</p>
              </div>
            )}

            {/* Reply Form */}
            {!review.reply && replyingId === review.id && (
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Yanitinizi yazin..."
                  className="flex-1 rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:border-primary/50"
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleReply(review.id)
                  }
                  autoFocus
                />
                <Button
                  size="sm"
                  className="rounded-lg gap-1"
                  onClick={() => handleReply(review.id)}
                >
                  <Send className="h-3 w-3" />
                  Gonder
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg"
                  onClick={() => {
                    setReplyingId(null);
                    setReplyText("");
                  }}
                >
                  Iptal
                </Button>
              </div>
            )}

            {!review.reply && replyingId !== review.id && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 h-7 text-[11px] gap-1"
                onClick={() => setReplyingId(review.id)}
              >
                <MessageSquare className="h-3 w-3" />
                Yanitla
              </Button>
            )}
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Star className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
            <h3 className="font-semibold">Degerlendirme bulunamadi</h3>
          </div>
        )}
      </div>
    </div>
  );
}
