import { z } from 'zod';
import { insertGarmentSchema, insertOutfitSchema, insertFeedbackSchema, garments, outfits, feedback } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  garments: {
    list: {
      method: 'GET' as const,
      path: '/api/garments',
      responses: {
        200: z.array(z.custom<typeof garments.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/garments',
      input: insertGarmentSchema,
      responses: {
        201: z.custom<typeof garments.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/garments/:id',
      input: insertGarmentSchema.partial(),
      responses: {
        200: z.custom<typeof garments.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/garments/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  outfits: {
    generate: {
      method: 'POST' as const,
      path: '/api/outfits/generate',
      input: z.object({
        context: z.string().optional(),
      }),
      responses: {
        201: z.custom<typeof outfits.$inferSelect>(), // Returns the generated outfit
        400: errorSchemas.validation,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/outfits',
      responses: {
        200: z.array(z.custom<typeof outfits.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/outfits/:id',
      responses: {
        200: z.custom<typeof outfits.$inferSelect & { garmentDetails?: typeof garments.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
  },
  feedback: {
    create: {
      method: 'POST' as const,
      path: '/api/feedback',
      input: insertFeedbackSchema,
      responses: {
        201: z.custom<typeof feedback.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type GarmentInput = z.infer<typeof api.garments.create.input>;
export type OutfitGenerationInput = z.infer<typeof api.outfits.generate.input>;
export type FeedbackInput = z.infer<typeof api.feedback.create.input>;
