import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Export chat models from the integration
export * from "./models/chat";

// === TABLE DEFINITIONS ===

export const garments = pgTable("garments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // top, bottom, one-piece, shoes, outerwear, accessory
  colorFamily: text("color_family").notNull(), // black, white, neutral, accent, other
  formality: real("formality").notNull().default(0.5), // 0.0 to 1.0
  silhouette: text("silhouette").notNull(), // slim, regular, oversized, structured
  season: text("season"), // spring, summer, fall, winter, all
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const outfits = pgTable("outfits", {
  id: serial("id").primaryKey(),
  date: timestamp("date").defaultNow(),
  items: jsonb("items").$type<number[]>().notNull(), // Array of garment IDs
  scoreBreakdown: jsonb("score_breakdown").$type<{
    compatibility: number;
    context: number;
    novelty: number;
    total: number;
  }>().notNull(),
  explanation: text("explanation"),
  isElevated: boolean("is_elevated").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  outfitId: integer("outfit_id").notNull(), // Foreign key relation would go here
  worn: boolean("worn").default(true),
  rating: integer("rating"), // 1-5
  comments: text("comments"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === SCHEMAS ===

export const insertGarmentSchema = createInsertSchema(garments).omit({ 
  id: true, 
  createdAt: true 
}).extend({
  formality: z.coerce.number().min(0).max(1),
});

export const insertOutfitSchema = createInsertSchema(outfits).omit({ 
  id: true, 
  createdAt: true,
  date: true 
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({ 
  id: true, 
  createdAt: true 
});

// === TYPES ===

export type Garment = typeof garments.$inferSelect;
export type InsertGarment = z.infer<typeof insertGarmentSchema>;

export type Outfit = typeof outfits.$inferSelect;
export type InsertOutfit = z.infer<typeof insertOutfitSchema>;

export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;

// === API REQUEST TYPES ===

export type CreateGarmentRequest = InsertGarment;
export type UpdateGarmentRequest = Partial<InsertGarment>;

export type GenerateOutfitRequest = {
  context?: string; // e.g., "work", "dinner", "weekend"
};

export type OutfitResponse = Outfit & {
  garmentDetails?: Garment[]; // Hydrated garments for display
};
