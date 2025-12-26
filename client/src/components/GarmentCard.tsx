import { type Garment } from "@shared/schema";
import { Trash2, Shirt } from "lucide-react";
import { useDeleteGarment } from "@/hooks/use-garments";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface GarmentCardProps {
  garment: Garment;
}

export function GarmentCard({ garment }: GarmentCardProps) {
  const deleteMutation = useDeleteGarment();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group overflow-hidden border-border/40 rounded-3xl transition-all duration-300 shadow-none hover:shadow-lg hover:shadow-black/5 bg-white">
        <CardContent className="p-4 pt-6 flex flex-col items-center relative">
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-muted-foreground/40 hover:text-destructive transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Retire this piece?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to remove "{garment.name}" from your digital wardrobe? This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteMutation.mutate(garment.id)}>
                    Retire
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="w-full aspect-square bg-[#F5F5F5] rounded-2xl flex items-center justify-center mb-6 relative overflow-hidden group-hover:bg-[#EEEEEE] transition-colors">
            <Shirt className="w-12 h-12 text-muted-foreground/5" />
            <span className="absolute inset-0 flex items-center justify-center text-4xl select-none">
              {garment.category === 'top' ? '👕' : garment.category === 'bottom' ? '👖' : garment.category === 'shoes' ? '👞' : '🧥'}
            </span>
          </div>

          <div className="w-full text-left space-y-4 px-2">
            <h3 className="font-serif text-xl text-foreground leading-tight truncate group-hover:text-primary transition-colors">
              {garment.name}
            </h3>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-[#F5F5F5] text-[10px] font-bold uppercase tracking-widest border-none rounded-full px-3 py-1 text-muted-foreground">
                {garment.category}
              </Badge>
              <Badge variant="secondary" className="bg-[#F5F5F5] text-[10px] font-bold uppercase tracking-widest border-none rounded-full px-3 py-1 text-muted-foreground">
                {garment.colorFamily}
              </Badge>
            </div>

            <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 pt-2 border-t border-border/10">
              <span className="capitalize">{garment.silhouette}</span>
              <span>Smart Casual</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
