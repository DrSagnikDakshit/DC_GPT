import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type OutfitGenerationInput } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useOutfits() {
  return useQuery({
    queryKey: [api.outfits.list.path],
    queryFn: async () => {
      const res = await fetch(api.outfits.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch outfits history");
      return api.outfits.list.responses[200].parse(await res.json());
    },
  });
}

export function useOutfit(id: number) {
  return useQuery({
    queryKey: [api.outfits.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.outfits.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch outfit details");
      return api.outfits.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useGenerateOutfit() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: OutfitGenerationInput) => {
      const res = await fetch(api.outfits.generate.path, {
        method: api.outfits.generate.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.outfits.generate.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to generate outfit");
      }
      return api.outfits.generate.responses[201].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.outfits.list.path] });
      toast({
        title: "Couture Generated",
        description: "The Oracle has curated a new look for you.",
      });
      return data;
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
