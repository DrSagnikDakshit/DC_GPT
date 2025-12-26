import { storage } from "./storage";
import { db } from "./db";

async function seed() {
  console.log("Seeding...");
  const existing = await storage.getGarments();
  if (existing.length > 0) {
    console.log("Already seeded.");
    return;
  }

  const seeds = [
    { name: "Silk Black Shirt", category: "top", colorFamily: "black", silhouette: "loose", formality: 0.8 },
    { name: "Tailored Wool Trousers", category: "bottom", colorFamily: "grey", silhouette: "structured", formality: 0.9 },
    { name: "White Linen Tee", category: "top", colorFamily: "white", silhouette: "regular", formality: 0.3 },
    { name: "Raw Denim Jeans", category: "bottom", colorFamily: "blue", silhouette: "slim", formality: 0.5 },
    { name: "Leather Chelsea Boots", category: "shoes", colorFamily: "black", silhouette: "structured", formality: 0.8 },
    { name: "Oversized Beige Blazer", category: "outerwear", colorFamily: "neutral", silhouette: "oversized", formality: 0.7 },
    { name: "Black Turtle Neck", category: "top", colorFamily: "black", silhouette: "slim", formality: 0.6 },
  ];

  for (const s of seeds) {
    await storage.createGarment(s);
  }
  console.log("Seeding complete.");
  process.exit(0);
}

seed().catch(console.error);
