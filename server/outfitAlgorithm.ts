import type { Garment } from "@shared/schema";

export type OutfitIntent = {
  context: string;
  targetFormality: number;      // 0..1
  formalityTolerance: number;   // +/- around target
  maxStatementPieces: number;
  allowOversizedCombo: boolean;
  preferredColors: Array<Garment["colorFamily"]>;
  season?: NonNullable<Garment["season"]>;
};

export type OutfitCandidate = {
  items: number[];
  scoreBreakdown: {
    compatibility: number;
    context: number;
    novelty: number;
    total: number;
  };
  isElevated: boolean;
};

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

// Deterministic "jitter" to avoid feeling identical day after day, without true randomness
function fnv1a(seed: string): number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
function hashToUnit(seed: string): number {
  const h = fnv1a(seed);
  return (h % 10_000) / 10_000;
}

export function intentFromContext(contextRaw?: string): OutfitIntent {
  const context = (contextRaw || "general").trim().toLowerCase();

  let intent: OutfitIntent = {
    context,
    targetFormality: 0.55,
    formalityTolerance: 0.25,
    maxStatementPieces: 1,
    allowOversizedCombo: false,
    preferredColors: ["black", "white", "neutral", "accent", "other"],
  };

  if (["work", "office", "meeting", "interview"].includes(context)) {
    intent = {
      context,
      targetFormality: 0.75,
      formalityTolerance: 0.18,
      maxStatementPieces: 1,
      allowOversizedCombo: false,
      preferredColors: ["black", "white", "neutral"],
    };
  } else if (["date", "dinner", "night out"].includes(context)) {
    intent = {
      context,
      targetFormality: 0.65,
      formalityTolerance: 0.25,
      maxStatementPieces: 1,
      allowOversizedCombo: false,
      preferredColors: ["black", "neutral", "accent", "other", "white"],
    };
  } else if (["weekend", "casual", "brunch"].includes(context)) {
    intent = {
      context,
      targetFormality: 0.35,
      formalityTolerance: 0.30,
      maxStatementPieces: 2,
      allowOversizedCombo: true,
      preferredColors: ["neutral", "black", "white", "accent", "other"],
    };
  } else if (["wedding", "formal", "gala"].includes(context)) {
    intent = {
      context,
      targetFormality: 0.9,
      formalityTolerance: 0.12,
      maxStatementPieces: 1,
      allowOversizedCombo: false,
      preferredColors: ["black", "neutral", "white", "accent", "other"],
    };
  }

  return intent;
}

function isNeutral(colorFamily: string) {
  return colorFamily === "black" || colorFamily === "white" || colorFamily === "neutral";
}

function isStatement(g: Garment): boolean {
  // MVP heuristic: accent/other are "statement-ish"
  return g.colorFamily === "accent" || g.colorFamily === "other";
}

function formalityScore(avgFormality: number, intent: OutfitIntent): number {
  const delta = Math.abs(avgFormality - intent.targetFormality);
  // full score at delta=0, goes to ~0 at 2*tolerance
  return clamp01(1 - (delta / (intent.formalityTolerance * 2)));
}

function colorHarmonyScore(gs: Garment[], intent: OutfitIntent): number {
  const neutrals = gs.filter(g => isNeutral(g.colorFamily)).length;
  const statements = gs.filter(isStatement).length;

  let score = 0.9;

  if (statements > intent.maxStatementPieces) {
    score -= 0.2 * (statements - intent.maxStatementPieces);
  }

  if (neutrals >= 2) score += 0.08;
  if (neutrals === gs.length) score += 0.10;
  if (neutrals === 0 && gs.length >= 2) score -= 0.12;

  const prefHits = gs.filter(g => intent.preferredColors.includes(g.colorFamily)).length;
  score += (prefHits / Math.max(1, gs.length)) * 0.05;

  return clamp01(score);
}

function silhouetteBalanceScore(gs: Garment[], intent: OutfitIntent): number {
  const onePiece = gs.find(g => g.category === "one-piece");
  if (onePiece) {
    let s = 0.85;
    if (onePiece.silhouette === "structured" && intent.targetFormality >= 0.7) s += 0.05;
    return clamp01(s);
  }

  const top = gs.find(g => g.category === "top");
  const bottom = gs.find(g => g.category === "bottom");

  let score = 0.85;
  if (!top || !bottom) return clamp01(score);

  const bigTop = top.silhouette === "oversized";
  const bigBottom = bottom.silhouette === "oversized";

  if (bigTop && bigBottom && !intent.allowOversizedCombo) score -= 0.25;

  const topStructured = top.silhouette === "structured" || top.silhouette === "slim";
  const bottomStructured = bottom.silhouette === "structured" || bottom.silhouette === "slim";
  if (topStructured && bottomStructured && intent.targetFormality >= 0.65) {
    score += 0.08;
  }

  return clamp01(score);
}

function seasonScore(gs: Garment[], intent: OutfitIntent): number {
  if (!intent.season) return 0.75;

  const tagged = gs.filter(g => !!g.season);
  if (tagged.length === 0) return 0.75;

  const hits = tagged.filter(g => g.season === intent.season || g.season === "all").length;
  return clamp01(0.5 + 0.5 * (hits / tagged.length));
}

function computeScores(gs: Garment[], intent: OutfitIntent) {
  const avgFormality = gs.reduce((s, g) => s + (g.formality ?? 0.5), 0) / Math.max(1, gs.length);

  const sFormality = formalityScore(avgFormality, intent);
  const sColor = colorHarmonyScore(gs, intent);
  const sSil = silhouetteBalanceScore(gs, intent);
  const sSeason = seasonScore(gs, intent);

  const compatibility = clamp01((sColor * 0.45) + (sSil * 0.35) + (sSeason * 0.20));
  const context = clamp01(sFormality);

  // MVP: no outfit history yet, so novelty is a constant baseline.
  // Next upgrade: compute novelty based on "recently worn" + "overused items".
  const novelty = 0.55;

  const total = clamp01((compatibility * 0.45) + (context * 0.45) + (novelty * 0.10));

  return { compatibility, context, novelty, total };
}

function byFormalityCloseness(intent: OutfitIntent) {
  return (a: Garment, b: Garment) =>
    Math.abs((a.formality ?? 0.5) - intent.targetFormality) - Math.abs((b.formality ?? 0.5) - intent.targetFormality);
}

function takeTop<T>(arr: T[], n: number): T[] {
  return arr.slice(0, Math.max(0, n));
}

function uniqIds(ids: number[]): number[] {
  return Array.from(new Set(ids));
}

function candidateFromIds(all: Garment[], ids: number[], intent: OutfitIntent): OutfitCandidate | null {
  const unique = uniqIds(ids);
  const gs = unique.map(id => all.find(g => g.id === id)).filter(Boolean) as Garment[];
  if (gs.length < 2) return null;

  const hasCore =
    gs.some(g => g.category === "one-piece") ||
    (gs.some(g => g.category === "top") && gs.some(g => g.category === "bottom"));
  if (!hasCore) return null;

  const scores = computeScores(gs, intent);
  const isElevated = scores.total >= 0.78 && scores.context >= 0.75;

  return {
    items: unique,
    scoreBreakdown: scores,
    isElevated,
  };
}

export function generateOutfitPlan(allGarments: Garment[], context?: string): OutfitCandidate {
  const intent = intentFromContext(context);

  const tops = allGarments.filter(g => g.category === "top").sort(byFormalityCloseness(intent));
  const bottoms = allGarments.filter(g => g.category === "bottom").sort(byFormalityCloseness(intent));
  const onePieces = allGarments.filter(g => g.category === "one-piece").sort(byFormalityCloseness(intent));
  const shoes = allGarments.filter(g => g.category === "shoes").sort(byFormalityCloseness(intent));
  const outerwear = allGarments.filter(g => g.category === "outerwear").sort(byFormalityCloseness(intent));
  const accessories = allGarments.filter(g => g.category === "accessory").sort(byFormalityCloseness(intent));

  const candidates: OutfitCandidate[] = [];

  const dressAnchors = takeTop(onePieces, 6);
  const topAnchors = takeTop(tops, 6);
  const bottomAnchors = takeTop(bottoms, 6);

  const shoeTop = takeTop(shoes, 6);
  const outerTop = takeTop(outerwear, 4);
  const accTop = takeTop(accessories, 4);

  // 1) One-piece outfits
  for (const d of dressAnchors) {
    const base = [d.id];
    if (shoeTop[0]) base.push(shoeTop[0].id);
    if (outerTop[0]) base.push(outerTop[0].id);
    if (accTop[0]) base.push(accTop[0].id);

    const cand = candidateFromIds(allGarments, base, intent);
    if (cand) candidates.push(cand);
  }

  // 2) Top + Bottom outfits
  for (const t of topAnchors) {
    for (const b of bottomAnchors) {
      const base = [t.id, b.id];
      if (shoeTop[0]) base.push(shoeTop[0].id);
      if (outerTop[0]) base.push(outerTop[0].id);
      if (accTop[0]) base.push(accTop[0].id);

      const cand = candidateFromIds(allGarments, base, intent);
      if (cand) candidates.push(cand);
    }
  }

  // 3) Ultimate fallback: best-by-formality first 3 items
  if (candidates.length === 0) {
    const sorted = [...allGarments].sort(byFormalityCloseness(intent));
    const base = sorted.slice(0, 3).map(g => g.id);
    const cand = candidateFromIds(allGarments, base, intent);
    if (cand) candidates.push(cand);
  }

  // Deterministic variety within near-best candidates
  const dayKey = new Date().toISOString().slice(0, 10);
  const seed = `${intent.context}|${allGarments.length}|${dayKey}`;
  const jitter = hashToUnit(seed) * 0.01;

  candidates.sort((a, b) => (b.scoreBreakdown.total - a.scoreBreakdown.total) || (b.items.length - a.items.length));

  const best = candidates[0];
  if (!best) {
    return {
      items: [],
      scoreBreakdown: { compatibility: 0, context: 0, novelty: 0, total: 0 },
      isElevated: false,
    };
  }

  const topScore = best.scoreBreakdown.total;
  const nearBest = candidates.filter(c => Math.abs(c.scoreBreakdown.total - topScore) < 0.03);

  if (nearBest.length > 1) {
    const idx = Math.floor(hashToUnit(seed + "|pick") * nearBest.length);
    const picked = nearBest[idx];
    picked.scoreBreakdown.total = clamp01(picked.scoreBreakdown.total + jitter);
    return picked;
  }

  best.scoreBreakdown.total = clamp01(best.scoreBreakdown.total + jitter);
  return best;
}
