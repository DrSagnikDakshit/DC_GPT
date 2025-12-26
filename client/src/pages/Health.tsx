import { useGarments } from "@/hooks/use-garments";
import { useOutfits } from "@/hooks/use-outfits";
import { useFeedback } from "@/hooks/use-feedback";
import { motion } from "framer-motion";
import { Loader2, Activity, Zap, Target, Sparkles } from "lucide-react";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";

export default function Health() {
  const { data: garments, isLoading: isGarmentsLoading } = useGarments();
  const { data: outfits, isLoading: isOutfitsLoading } = useOutfits();
  const feedbackQuery = useFeedback();

  const stats = useMemo(() => {
    const feedbacks = (Array.isArray(feedbackQuery.data) ? feedbackQuery.data : []);
    
    return {
      totalGarments: garments?.length || 0,
      outfitsWorn: feedbacks.filter(f => f.worn).length || 0,
      activeDays: outfits?.length || 0,
    };
  }, [garments, outfits, feedbackQuery.data]);

  if (isGarmentsLoading || isOutfitsLoading || feedbackQuery.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-24 pt-32 px-6">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-4 mb-16">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">Aesthetic Health</p>
          <p className="text-muted-foreground font-light max-w-lg mx-auto leading-relaxed">
            Track your style evolution through meaningful signals, not vanity metrics
          </p>
        </div>

        {/* Main Score Card */}
        <div className="bg-white border border-border/40 rounded-3xl p-12 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-12 items-center">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-muted/10"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-serif text-foreground">—</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-2">Not enough data</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="font-serif text-4xl text-foreground leading-tight">Your Aesthetic Score</h2>
              <p className="text-muted-foreground font-light leading-relaxed">
                Start wearing curated outfits and provide feedback to build your aesthetic health profile. This score reflects consistency, not perfection.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-secondary/50 text-[10px] uppercase tracking-wider py-1 px-3">Outfit consistency</Badge>
                <Badge variant="secondary" className="bg-secondary/50 text-[10px] uppercase tracking-wider py-1 px-3">Feedback engagement</Badge>
                <Badge variant="secondary" className="bg-secondary/50 text-[10px] uppercase tracking-wider py-1 px-3">Wardrobe utilization</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Lower Grid Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard 
            label="Daily Streak" 
            value="—" 
            icon={Zap}
          />
          <MetricCard 
            label="Outfits Worn" 
            value={stats.outfitsWorn > 0 ? stats.outfitsWorn : "—"} 
            icon={Target}
          />
          <MetricCard 
            label="Garments Active" 
            value={stats.totalGarments > 0 ? stats.totalGarments : "—"} 
            icon={Sparkles}
          />
        </div>
      </div>

      {/* Global Footnote */}
      <footer className="w-full py-24 flex flex-col items-center justify-center space-y-1 opacity-40">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Identity over Trends</p>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Structure over Chaos</p>
      </footer>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon }: { label: string, value: string | number, icon: any }) {
  return (
    <div className="bg-white border border-border/40 rounded-3xl p-10 flex flex-col items-center justify-center text-center space-y-8 shadow-sm">
      <Icon className="w-6 h-6 text-primary/60" />
      <div className="space-y-4 w-full">
        <div className="h-[2px] w-8 bg-foreground/80 mx-auto" />
        <p className="font-serif text-4xl text-foreground">{value}</p>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
