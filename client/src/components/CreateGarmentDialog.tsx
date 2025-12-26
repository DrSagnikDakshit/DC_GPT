import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertGarmentSchema, type InsertGarment } from "@shared/schema";
import { useCreateGarment } from "@/hooks/use-garments";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Plus } from "lucide-react";
import { useState } from "react";

export function CreateGarmentDialog() {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateGarment();

  const form = useForm<InsertGarment>({
    resolver: zodResolver(insertGarmentSchema),
    defaultValues: {
      name: "",
      category: "top",
      colorFamily: "black",
      silhouette: "regular",
      formality: 0.5,
      season: "all",
      imageUrl: "",
    },
  });

  const onSubmit = (data: InsertGarment) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-5 h-5 mr-2" />
          Add Piece
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">New Acquisition</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Garment Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Vintage Silk Blouse" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="top">Top</SelectItem>
                        <SelectItem value="bottom">Bottom</SelectItem>
                        <SelectItem value="one-piece">One-Piece</SelectItem>
                        <SelectItem value="shoes">Shoes</SelectItem>
                        <SelectItem value="outerwear">Outerwear</SelectItem>
                        <SelectItem value="accessory">Accessory</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="colorFamily"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color Family</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="black">Black</SelectItem>
                        <SelectItem value="white">White</SelectItem>
                        <SelectItem value="neutral">Neutral/Beige</SelectItem>
                        <SelectItem value="accent">Accent Color</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="silhouette"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Silhouette</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="slim">Slim / Fitted</SelectItem>
                      <SelectItem value="regular">Regular / Straight</SelectItem>
                      <SelectItem value="oversized">Oversized / Loose</SelectItem>
                      <SelectItem value="structured">Structured</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="formality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Formality ({Math.round(field.value * 100)}%)</FormLabel>
                  <FormControl>
                    <Slider
                      min={0}
                      max={1}
                      step={0.1}
                      defaultValue={[field.value]}
                      onValueChange={(vals) => field.onChange(vals[0])}
                    />
                  </FormControl>
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>Casual</span>
                    <span>Formal</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="submit" disabled={createMutation.isPending} className="w-full">
                {createMutation.isPending ? "Cataloging..." : "Add to Wardrobe"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
