import { useOutfits } from "@/hooks/use-outfits";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Loader2, Shirt, MessageSquare, ArrowRight, Sparkles } from "lucide-react";
import { useFeedback } from "@/hooks/use-feedback";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useGarments } from "@/hooks/use-garments";
import { Progress } from "@/components/ui/progress";

export default function Outfits() {
  const { data: outfits, isLoading: isOutfitsLoading } = useOutfits();
  const { data: garments, isLoading: isGarmentsLoading } = useGarments();

  if (isOutfitsLoading || isGarmentsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 pt-32 px-6 max-w-[1400px] mx-auto flex flex-col">
      <div className="mb-16 space-y-6">
        <div className="flex items-center gap-3">
          <Sparkles className="w-4 h-4 text-[#C8A24A]" />
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()}
          </p>
        </div>
        <h1 className="font-serif text-5xl md:text-6xl text-foreground leading-tight">Today's Couture</h1>
        <p className="text-muted-foreground font-light max-w-2xl leading-relaxed">
          Your intelligently curated selections for the day. Curated outfit suggestions based on your wardrobe's compatibility graph.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
        {outfits?.length === 0 ? (
          <div className="col-span-2 bg-white border border-border/40 rounded-3xl p-20 text-center shadow-sm">
            <p className="text-muted-foreground text-lg italic font-light">The archive is empty. Generate your first couture look to begin.</p>
          </div>
        ) : (
          outfits?.map((outfit, index) => (
            <OutfitCard key={outfit.id} outfit={outfit} index={index} garments={garments || []} />
          ))
        )}
      </div>

      {/* Global Footnote */}
      <footer className="w-full py-24 flex flex-col items-center justify-center space-y-1 opacity-40">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Identity over Trends</p>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Structure over Chaos</p>
      </footer>
    </div>
  );
}

function OutfitCard({ outfit, index, garments }: { outfit: any, index: number, garments: any[] }) {
  const feedbackMutation = useFeedback();
  const [isExplaining, setIsExplaining] = useState(false);

  const handleWorn = () => {
    feedbackMutation.mutate({
      outfitId: outfit.id,
      worn: true,
      rating: 5,
    });
  };

  const score = Math.round((outfit.scoreBreakdown?.total || 0) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white border border-border/40 rounded-3xl overflow-hidden shadow-sm flex flex-col h-full"
    >
      <div className="p-6 flex-1 flex flex-col space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Option {index + 1}</p>
            <h3 className="font-serif text-2xl text-foreground">{score}% Match</h3>
          </div>
          <div className="text-right space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Items</p>
            <p className="font-serif text-2xl text-foreground">{outfit.items.length}</p>
          </div>
        </div>

        {/* Garments List */}
        <div className="space-y-4">
          {outfit.items.map((garmentId: number) => {
            const garment = garments?.find(g => g.id === garmentId);
            if (!garment) return null;
            return (
              <div key={garmentId} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-muted/20 rounded-xl flex items-center justify-center group-hover:bg-muted/30 transition-colors">
                    <Shirt className="w-5 h-5 text-muted-foreground/40" />
                  </div>
                  <div>
                    <p className="font-serif text-base text-foreground leading-tight">{garment.name}</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">
                      {garment.category}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Score Breakdown */}
        <div className="space-y-6 pt-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Score Breakdown</p>
          <div className="space-y-4">
            <ScoreRow label="Color" value={Math.round((outfit.scoreBreakdown?.color || 0.95) * 100)} />
            <ScoreRow label="Formality" value={Math.round((outfit.scoreBreakdown?.formality || 0.88) * 100)} />
            <ScoreRow label="Silhouette" value={Math.round((outfit.scoreBreakdown?.silhouette || 0.92) * 100)} />
          </div>
        </div>

        {/* AI Explanation */}
        <div className="space-y-4 pt-6">
          <div className="flex justify-between items-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Why this works</p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary/80 p-0 h-auto"
              onClick={() => setIsExplaining(!isExplaining)}
            >
              Explain
            </Button>
          </div>
          <p className="text-sm text-muted-foreground font-light leading-relaxed">
            {isExplaining ? outfit.explanation : "Click 'Explain' for styling insights"}
          </p>
        </div>

        {/* Footer Action */}
        <div className="pt-8">
          <Button 
            variant="outline" 
            className="w-full h-14 rounded-2xl border-border/40 text-xs font-bold uppercase tracking-[0.2em] gap-3 hover:bg-muted/5 group"
            onClick={handleWorn}
            disabled={feedbackMutation.isPending}
          >
            <MessageSquare className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            I Wore This
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function ScoreRow({ label, value }: { label: string, value: number }) {
  return (
    <div className="flex items-center gap-6">
      <span className="text-[10px] font-medium text-muted-foreground w-20">{label}</span>
      <div className="flex-1 h-[2px] bg-muted/20 relative overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          className="absolute inset-y-0 left-0 bg-foreground"
        />
      </div>
      <span className="text-[10px] font-serif text-foreground w-8 text-right">{value}</span>
    </div>
  );
}
