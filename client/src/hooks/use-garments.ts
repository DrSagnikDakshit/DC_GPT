import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type GarmentInput } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useGarments() {
  return useQuery({
    queryKey: [api.garments.list.path],
    queryFn: async () => {
      const res = await fetch(api.garments.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch wardrobe");
      return api.garments.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateGarment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: GarmentInput) => {
      const res = await fetch(api.garments.create.path, {
        method: api.garments.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.garments.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to add garment");
      }
      return api.garments.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.garments.list.path] });
      toast({
        title: "Wardrobe Updated",
        description: "Your new piece has been cataloged successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteGarment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.garments.delete.path, { id });
      const res = await fetch(url, { 
        method: api.garments.delete.method,
        credentials: "include" 
      });
      
      if (!res.ok) throw new Error("Failed to remove garment");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.garments.list.path] });
      toast({
        title: "Item Removed",
        description: "The garment has been removed from your wardrobe.",
      });
    },
  });
}

export function useSeedData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/seed", { method: "POST" });
      if (!res.ok) throw new Error("Failed to seed data");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.garments.list.path] });
    }
  });
}
