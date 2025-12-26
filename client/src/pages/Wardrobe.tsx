import { useGarments } from "@/hooks/use-garments";
import { GarmentCard } from "@/components/GarmentCard";
import { CreateGarmentDialog } from "@/components/CreateGarmentDialog";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Search, Shirt, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Wardrobe() {
  const { data: garments, isLoading } = useGarments();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filteredGarments = garments?.filter(g => {
    const matchesCategory = filter === "all" || g.category === filter;
    const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 pt-20 px-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">Wardrobe Intelligence</p>
          <h1 className="font-serif text-6xl md:text-7xl font-medium leading-tight">Your Wardrobe</h1>
        </div>
        <CreateGarmentDialog />
      </div>

      <AnimatePresence mode="wait">
        {garments?.length === 0 ? (
          <motion.div 
            key="empty-wardrobe"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border/50 rounded-2xl p-20 text-center shadow-sm"
          >
            <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-8">
              <Shirt className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="font-serif text-3xl mb-4">Your Wardrobe Awaits</h2>
            <p className="text-muted-foreground text-lg mb-12 max-w-md mx-auto leading-relaxed">
              Start building your personal wardrobe. Each garment you add helps us understand your aesthetic and generate better outfit recommendations.
            </p>
            <CreateGarmentDialog />
          </motion.div>
        ) : (
          <motion.div
            key="wardrobe-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="sticky top-16 z-30 bg-background/80 backdrop-blur-md py-6 mb-10 border-b border-border/50">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search garments..." 
                    className="pl-9 bg-secondary/50 border-transparent focus:border-primary transition-all"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Items</SelectItem>
                    <SelectItem value="top">Tops</SelectItem>
                    <SelectItem value="bottom">Bottoms</SelectItem>
                    <SelectItem value="one-piece">One-Piece</SelectItem>
                    <SelectItem value="shoes">Shoes</SelectItem>
                    <SelectItem value="outerwear">Outerwear</SelectItem>
                    <SelectItem value="accessory">Accessories</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {filteredGarments?.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-lg">No garments found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filteredGarments?.map((garment) => (
                  <GarmentCard key={garment.id} garment={garment} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Footnote */}
      <footer className="w-full py-24 flex flex-col items-center justify-center space-y-1 opacity-40">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Identity over Trends</p>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Structure over Chaos</p>
      </footer>
    </div>
  );
}
