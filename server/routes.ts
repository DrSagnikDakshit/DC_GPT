import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerImageRoutes } from "./replit_integrations/image";
import { generateOutfitPlan } from "./outfitAlgorithm";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Register integration routes
  registerChatRoutes(app);
  registerImageRoutes(app);

  // === GARMENTS ROUTES ===
  app.get(api.garments.list.path, async (req, res) => {
    const garments = await storage.getGarments();
    res.json(garments);
  });

  app.post(api.garments.create.path, async (req, res) => {
    try {
      const input = api.garments.create.input.parse(req.body);
      const garment = await storage.createGarment(input);
      res.status(201).json(garment);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.garments.update.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const input = api.garments.update.input.parse(req.body);
      const garment = await storage.updateGarment(id, input);
      if (!garment) return res.status(404).json({ message: "Garment not found" });
      res.json(garment);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.garments.delete.path, async (req, res) => {
    const id = Number(req.params.id);
    const existing = await storage.getGarment(id);
    if (!existing) return res.status(404).json({ message: "Garment not found" });
    await storage.deleteGarment(id);
    res.status(204).send();
  });

  // === OUTFITS ROUTES ===
  app.get(api.outfits.list.path, async (req, res) => {
    const outfits = await storage.getOutfits();
    res.json(outfits);
  });

  app.get(api.outfits.get.path, async (req, res) => {
    const id = Number(req.params.id);
    const outfit = await storage.getOutfit(id);
    if (!outfit) return res.status(404).json({ message: "Outfit not found" });
    
    // Hydrate items
    const allGarments = await storage.getGarments();
    const details = allGarments.filter(g => outfit.items.includes(g.id));
    
    res.json({ ...outfit, garmentDetails: details });
  });

  // OUTFIT GENERATION LOGIC
  app.post(api.outfits.generate.path, async (req, res) => {
    try {
      const { context } = req.body;
      const allGarments = await storage.getGarments();
      
      if (allGarments.length < 2) {
        return res.status(400).json({ message: "Not enough garments to generate an outfit." });
      }

      // 1. Outfit generation (weighted compatibility instead of random)
      const plan = generateOutfitPlan(allGarments, context);
      const selectedItems: number[] = plan.items;
      const scoreBreakdown = plan.scoreBreakdown;
      const isElevated = plan.isElevated;

      let explanation = "A deterministic fallback explanation.";
      
      try {
        const prompt = `
          You are a high-end fashion stylist assistant for 'D-Couture'.
          Explain why this outfit works for a context of '${context || "general day"}'.
          Items: ${selectedItems.map(id => allGarments.find(g => g.id === id)?.name).join(", ")}.
          Keep it brief, elegant, and focused on aesthetics (color, silhouette).
          Do not suggest buying anything new.
        `;

        const response = await openai.chat.completions.create({
          model: "gpt-5.1",
          messages: [{ role: "user", content: prompt }],
          max_completion_tokens: 150,
        });

        explanation = response.choices[0]?.message?.content || explanation;
      } catch (error) {
        console.error("OpenAI generation failed, using fallback", error);
      }

      const outfit = await storage.createOutfit({
        items: selectedItems,
        scoreBreakdown,
        explanation,
        isElevated
      });

      res.status(201).json(outfit);

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to generate outfit" });
    }
  });

  // === FEEDBACK ROUTES ===
  app.post(api.feedback.create.path, async (req, res) => {
    try {
      const input = api.feedback.create.input.parse(req.body);
      const fb = await storage.createFeedback(input);
      res.status(201).json(fb);
    } catch (err) {
       if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Seed Data Endpoint (for MVP demo)
  app.post("/api/seed", async (req, res) => {
    const existing = await storage.getGarments();
    if (existing.length > 0) return res.json({ message: "Already seeded" });

    const seeds = [
      { name: "Silk Black Shirt", category: "top", colorFamily: "black", silhouette: "loose", formality: 0.8 },
      { name: "Tailored Wool Trousers", category: "bottom", colorFamily: "grey", silhouette: "structured", formality: 0.9 },
      { name: "White Linen Tee", category: "top", colorFamily: "white", silhouette: "regular", formality: 0.3 },
      { name: "Raw Denim Jeans", category: "bottom", colorFamily: "blue", silhouette: "slim", formality: 0.5 },
      { name: "Leather Chelsea Boots", category: "shoes", colorFamily: "black", silhouette: "structured", formality: 0.8 },
    ];

    for (const s of seeds) {
      await storage.createGarment(s);
    }

    res.json({ message: "Seeded successfully" });
  });

  return httpServer;
}
