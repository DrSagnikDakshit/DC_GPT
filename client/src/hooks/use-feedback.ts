import { useMutation } from "@tanstack/react-query";
import { api, type FeedbackInput } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useFeedback() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: FeedbackInput) => {
      const res = await fetch(api.feedback.create.path, {
        method: api.feedback.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to submit feedback");
      return api.feedback.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      toast({
        title: "Feedback Recorded",
        description: "Your aesthetic preferences have been noted.",
      });
    },
  });
}
