import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, MessageSquare, CheckCircle2, History, RotateCcw, LayoutDashboard, Heart } from "lucide-react";

export default function Home() {
  const [showOptions, setShowOptions] = useState(false);
  const conciergeNumber = import.meta.env.VITE_CONCIERGE_NUMBER;

  const features = [
    { title: "Today’s Couture", description: "A considered outfit decision for today, with one elevated alternative.", icon: Sparkles, color: "text-[#C8A24A]" },
    { title: "Why It Works", description: "A concise explanation grounded in color, form, and context.", icon: MessageSquare, color: "text-[#1B4332]" }, // Royal Green
    { title: "Aesthetic Health", description: "A quiet signal of how coherent your style is over time.", icon: Heart, color: "text-[#641220]" }, // Wine Red
    { title: "Wardrobe Intelligence", description: "A structured view of what you own and how it works together.", icon: LayoutDashboard, color: "text-[#C8A24A]" },
    { title: "Ask by Text or WhatsApp", description: "Request an outfit decision whenever you need one.", icon: MessageSquare, color: "text-[#1B4332]" },
    { title: "Recent Decisions", description: "A light record of past selections to maintain continuity.", icon: History, color: "text-[#641220]" },
    { title: "Reflection", description: "A moment to note how your style felt, not how it performed.", icon: RotateCcw, color: "text-[#C8A24A]" },
  ];

  return (
    <div className="min-h-[100svh] bg-[#F6F4F1] text-[#0B0B0B] flex flex-col items-center relative overflow-x-hidden font-sans">
      {/* Main Content Area */}
      <main className="flex-1 w-full flex flex-col items-center py-24 px-6 pb-[env(safe-area-inset-bottom)]">
        <div className="w-full max-w-[800px] flex flex-col items-center space-y-16 md:space-y-24">
          
          {/* 1) Hero Section & Placard */}
          <div className="w-full flex flex-col items-center space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-[640px] bg-[#FBF9F6] border border-[#C8A24A]/25 rounded-[24px] px-8 py-12 md:px-16 md:py-20 text-center shadow-[0_18px_60px_rgba(0,0,0,0.06)] flex flex-col items-center space-y-8 md:space-y-10 relative overflow-hidden"
            >
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none scale-[1.5]">
                <span className="font-serif text-[240px] leading-none text-[#0B0B0B]">D</span>
              </div>

              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold uppercase tracking-[0.8em] mr-[-0.8em] text-[#0B0B0B] whitespace-nowrap relative z-10">
                D-COUTURE
              </h1>
              
              <div className="space-y-6 md:space-y-8 relative z-10">
                <p className="text-base md:text-lg font-light leading-relaxed text-[#0B0B0B]/70 italic font-serif">
                  Style is not about following trends—<br />
                  it’s about knowing yourself
                </p>
              </div>
            </motion.div>

            <div className="w-full max-w-[400px] space-y-8">
              <AnimatePresence mode="wait">
                {!showOptions ? (
                  <motion.div
                    key="begin"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5, ease: "circOut" }}
                  >
                    <Button
                      onClick={() => setShowOptions(true)}
                      className="w-full h-14 rounded-full border border-[#C8A24A] bg-transparent text-[#0B0B0B] hover:bg-[#C8A24A]/10 transition-all duration-300 uppercase tracking-[0.25em] text-[10px] font-bold shadow-none active:scale-[0.98]"
                    >
                      Begin Experience
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="options"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5, ease: "circOut" }}
                    className="flex flex-col gap-3"
                  >
                    <Link href="/outfits">
                      <Button
                        className="w-full h-14 rounded-full bg-[#0B0B0B] text-[#F6F4F1] hover:bg-[#0B0B0B]/90 transition-all duration-300 uppercase tracking-[0.25em] text-[10px] font-bold border border-[#C8A24A] shadow-lg shadow-[#C8A24A]/10 active:scale-[0.98]"
                      >
                        Today’s Couture
                      </Button>
                    </Link>
                    <Link href="/wardrobe">
                      <Button
                        className="w-full h-14 rounded-full border border-[#C8A24A] bg-transparent text-[#0B0B0B] hover:bg-[#C8A24A]/10 transition-all duration-300 uppercase tracking-[0.25em] text-[10px] font-bold shadow-none active:scale-[0.98]"
                      >
                        Wardrobe Intelligence
                      </Button>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="text-center space-y-4 pt-4">
                <h2 className="font-serif text-xl md:text-2xl text-foreground italic leading-tight opacity-80">
                  Personalized stylizing for everyday and every-body.
                </h2>
              </div>
            </div>
          </div>

          {/* 2) Features Section */}
          <section className="w-full space-y-12">
            <div className="flex items-center gap-4">
              <div className="h-[1px] flex-1 bg-[#C8A24A]/20" />
              <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#C8A24A]">Features</h3>
              <div className="h-[1px] flex-1 bg-[#C8A24A]/20" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              {features.map((feature, idx) => (
                <motion.div 
                  key={feature.title}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-4 group cursor-default"
                >
                  <div className={`mt-1 ${feature.color} opacity-60 group-hover:opacity-100 transition-opacity flex-shrink-0`}>
                    <feature.icon className="w-4 h-4" />
                  </div>
                  <div className="space-y-1 text-left">
                    <p className="font-serif text-lg text-foreground leading-none">{feature.title}</p>
                    <p className="text-[11px] text-muted-foreground font-light tracking-wide leading-snug">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* 4) Concierge Micro-module */}
          <section className="w-full max-w-[500px] p-8 border border-[#C8A24A]/20 rounded-[24px] bg-[#FBF9F6]/50 backdrop-blur-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#1B4332]">Ask by Text / WhatsApp</p>
                <p className="text-xs text-muted-foreground font-light italic font-serif">Send the occasion. Receive a decision.</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#1B4332]/5 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-[#1B4332]" />
              </div>
            </div>
            <div className="pt-4 border-t border-[#C8A24A]/10">
              <p className="text-[10px] font-bold uppercase tracking-widest text-center">
                {conciergeNumber ? conciergeNumber : "Connect in Settings"}
              </p>
            </div>
          </section>

          {/* How It Works Section */}
          <div className="w-full space-y-12">
            <div className="flex items-center gap-4">
              <div className="h-[1px] flex-1 bg-border/20" />
              <h2 className="font-serif text-xl text-[#0B0B0B]">How It Works</h2>
              <div className="h-[1px] flex-1 bg-border/20" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureStep number="1" text="Add your garments with category, color, and formality" />
              <FeatureStep number="2" text="Our algorithm calculates outfit compatibility scores" />
              <FeatureStep number="3" text="Receive curated outfits with intelligent explanations" />
            </div>
          </div>
        </div>
      </main>

      {/* Global Footnote */}
      <footer className="w-full py-12 px-6 flex flex-col items-center justify-center space-y-1 opacity-40">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Identity over Trends</p>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Structure over Chaos</p>
      </footer>
    </div>
  );
}

function FeatureStep({ number, text }: { number: string, text: string }) {
  return (
    <div className="flex flex-col items-center text-center space-y-2 group">
      <div className="w-8 h-8 rounded-full border border-border/40 flex items-center justify-center text-[10px] font-bold group-hover:border-[#C8A24A]/40 group-hover:text-[#C8A24A] transition-colors">{number}</div>
      <p className="text-[11px] text-muted-foreground font-light leading-relaxed px-2">
        {text}
      </p>
    </div>
  );
}
