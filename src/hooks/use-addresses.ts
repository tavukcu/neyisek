"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAddresses,
  addAddress,
  updateAddress,
  removeAddress,
} from "@/services/address.service";
import { useAuth } from "@/hooks/use-auth";
import type { Address } from "@/types";

export function useAddresses() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ["addresses", userId],
    queryFn: () => getAddresses(userId!),
    enabled: !!userId,
  });

  const addMutation = useMutation({
    mutationFn: (address: Omit<Address, "id">) => addAddress(userId!, address),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses", userId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ addressId, data }: { addressId: string; data: Partial<Address> }) =>
      updateAddress(userId!, addressId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses", userId] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (addressId: string) => removeAddress(userId!, addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses", userId] });
    },
  });

  const setDefault = (addressId: string) => {
    updateMutation.mutate({ addressId, data: { isDefault: true } });
  };

  const getDefault = () =>
    addresses.find((a) => a.isDefault) || addresses[0];

  return {
    addresses,
    isLoading,
    addAddress: addMutation.mutateAsync,
    updateAddress: (addressId: string, data: Partial<Address>) =>
      updateMutation.mutateAsync({ addressId, data }),
    removeAddress: removeMutation.mutateAsync,
    setDefault,
    getDefault,
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isRemoving: removeMutation.isPending,
  };
}
