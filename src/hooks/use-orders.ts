"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createOrder,
  subscribeToOrder,
  subscribeToCustomerOrders,
} from "@/services/order.service";
import { useAuth } from "@/hooks/use-auth";
import type { Order } from "@/types";

export function useOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setOrders([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = subscribeToCustomerOrders(user.id, (data) => {
      setOrders(data);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user?.id]);

  return { orders, isLoading };
}

export function useOrder(orderId: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setOrder(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = subscribeToOrder(orderId, (data) => {
      setOrder(data);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [orderId]);

  return { order, isLoading };
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
