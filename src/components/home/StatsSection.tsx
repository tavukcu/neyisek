"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "2.000+", label: "Restoran" },
  { value: "81", label: "Sehir" },
  { value: "1.2M+", label: "Mutlu Musteri" },
  { value: "30 dk", label: "Ort. Teslimat" },
];

export default function StatsSection() {
  return (
    <section className="border-y bg-card py-8 md:py-10">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.06 }}
              className="text-center"
            >
              <p className="text-2xl font-extrabold text-primary md:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs font-medium text-muted-foreground md:text-sm">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
