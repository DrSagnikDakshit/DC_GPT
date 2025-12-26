import { db } from "./db";
import {
  garments, outfits, feedback,
  type InsertGarment, type InsertOutfit, type InsertFeedback,
  type Garment, type Outfit, type Feedback,
  type UpdateGarmentRequest
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Garments
  getGarments(): Promise<Garment[]>;
  getGarment(id: number): Promise<Garment | undefined>;
  createGarment(garment: InsertGarment): Promise<Garment>;
  updateGarment(id: number, updates: UpdateGarmentRequest): Promise<Garment>;
  deleteGarment(id: number): Promise<void>;

  // Outfits
  getOutfits(): Promise<Outfit[]>;
  getOutfit(id: number): Promise<Outfit | undefined>;
  createOutfit(outfit: InsertOutfit): Promise<Outfit>;

  // Feedback
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
}

export class DatabaseStorage implements IStorage {
  async getGarments(): Promise<Garment[]> {
    return await db.select().from(garments).orderBy(desc(garments.createdAt));
  }

  async getGarment(id: number): Promise<Garment | undefined> {
    const [garment] = await db.select().from(garments).where(eq(garments.id, id));
    return garment;
  }

  async createGarment(garment: InsertGarment): Promise<Garment> {
    const [newGarment] = await db.insert(garments).values(garment).returning();
    return newGarment;
  }

  async updateGarment(id: number, updates: UpdateGarmentRequest): Promise<Garment> {
    const [updated] = await db.update(garments)
      .set(updates)
      .where(eq(garments.id, id))
      .returning();
    return updated;
  }

  async deleteGarment(id: number): Promise<void> {
    await db.delete(garments).where(eq(garments.id, id));
  }

  async getOutfits(): Promise<Outfit[]> {
    return await db.select().from(outfits).orderBy(desc(outfits.date));
  }

  async getOutfit(id: number): Promise<Outfit | undefined> {
    const [outfit] = await db.select().from(outfits).where(eq(outfits.id, id));
    return outfit;
  }

  async createOutfit(outfit: InsertOutfit): Promise<Outfit> {
    const [newOutfit] = await db.insert(outfits).values(outfit).returning();
    return newOutfit;
  }

  async createFeedback(fb: InsertFeedback): Promise<Feedback> {
    const [newFeedback] = await db.insert(feedback).values(fb).returning();
    return newFeedback;
  }
}

export const storage = new DatabaseStorage();
