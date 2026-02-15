"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCategoryIcon } from "@/lib/icons";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product & { id: string };
  onAddToCart: (product: Product & { id: string }) => void;
  onOpenDetail: (product: Product & { id: string }) => void;
}

export default function ProductCard({
  product,
  onAddToCart,
  onOpenDetail,
}: ProductCardProps) {
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const hasImage = product.images.length > 0 && product.images[0];
  const CategoryIcon = getCategoryIcon(product.categoryId);

  return (
    <div
      onClick={() => onOpenDetail(product)}
      className="group flex gap-4 rounded-xl border bg-card p-4 cursor-pointer transition-all hover:border-primary/30 hover:shadow-sm"
    >
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <h3 className="font-medium text-sm leading-tight group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          {product.isPopular && (
            <Badge variant="secondary" className="shrink-0 text-[10px] px-1.5 py-0">
              Populer
            </Badge>
          )}
        </div>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
          {product.description}
        </p>
        <div className="mt-2 flex items-center gap-2">
          {hasDiscount ? (
            <>
              <span className="text-sm font-semibold text-primary">
                {"\u20BA"}{product.discountPrice?.toFixed(2)}
              </span>
              <span className="text-xs text-muted-foreground line-through">
                {"\u20BA"}{product.price.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-sm font-semibold">
              {"\u20BA"}{product.price.toFixed(2)}
            </span>
          )}
        </div>
      </div>

      {/* Image & Add Button */}
      <div className="relative shrink-0 w-24 h-24">
        <div className="h-full w-full rounded-xl bg-muted overflow-hidden">
          {hasImage ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              width={96}
              height={96}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/[0.06] to-muted">
              <CategoryIcon className="h-8 w-8 text-primary/20" strokeWidth={1.2} />
            </div>
          )}
        </div>
        <Button
          size="icon"
          className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full shadow-md"
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
