# D-Couture

## Overview

D-Couture is a premium PWA (Progressive Web App) described as an "aesthetic operating system" for personal wardrobe management. It is not a shopping app, trend app, or chatbot stylist. The core purpose is to help users build a structured wardrobe, generate deterministic outfit recommendations ("Today's Couture"), and track their style evolution through an "Aesthetic Health" metric.

Key features:
- **Wardrobe Management**: Add and manage garments with structured attributes (category, color, formality, silhouette)
- **Outfit Generation**: Deterministic algorithm generates 1-3 outfit recommendations based on scoring rules (compatibility, context, novelty)
- **LLM Explanation Layer**: AI narrates decisions but never chooses garments - the deterministic system decides
- **Feedback Capture**: Users record whether they wore outfits and how they felt
- **Aesthetic Health**: Simple progress signal tracking wardrobe diversity and usage patterns

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, built using Vite
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state and caching
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom luxury design tokens (wine red, royal green accents)
- **Animations**: Framer Motion for page transitions and micro-interactions
- **Typography**: Playfair Display (serif headings) + DM Sans (body text)
- **Design Philosophy**: Premium, calm, minimal, high-contrast with generous spacing

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod validation
- **Build System**: Custom esbuild script bundles server for production
- **Development**: Vite dev server with HMR proxied through Express

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` contains all table definitions
- **Migrations**: Drizzle Kit manages migrations in `/migrations` folder
- **Key Tables**:
  - `garments`: Wardrobe items with attributes (name, category, colorFamily, formality, silhouette, season)
  - `outfits`: Generated outfit combinations with scoring breakdown
  - `feedback`: User feedback on worn outfits
  - `conversations`/`messages`: Chat integration tables

### API Structure
Routes are defined declaratively in `shared/routes.ts` with full type safety:
- `GET/POST /api/garments` - Wardrobe CRUD
- `GET/POST /api/outfits` - Outfit history and generation
- `POST /api/feedback` - Feedback capture
- `POST /api/outfits/generate` - Outfit generation endpoint
- `POST /api/chat` - LLM explanation endpoint

### Project Structure
```
client/           # React frontend
  src/
    components/   # UI components
    pages/        # Route pages (Home, Wardrobe, Outfits, Health)
    hooks/        # Custom React hooks for API calls
    lib/          # Utilities and query client
server/           # Express backend
  routes.ts       # API route handlers
  storage.ts      # Database access layer
  db.ts           # Database connection
  replit_integrations/  # AI/Chat/Image integrations
shared/           # Shared code between client/server
  schema.ts       # Drizzle database schema
  routes.ts       # API contract definitions with Zod
```

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries and schema management
- **connect-pg-simple**: Session storage for Express sessions

### AI/LLM Integration
- **OpenAI API**: Used for outfit explanation generation
- **Environment Variables**:
  - `AI_INTEGRATIONS_OPENAI_API_KEY`: API key for OpenAI
  - `AI_INTEGRATIONS_OPENAI_BASE_URL`: Custom base URL (Replit AI Integrations)

### Frontend Libraries
- **Recharts**: Data visualization for Aesthetic Health page
- **date-fns**: Date formatting for outfit history
- **react-day-picker**: Calendar components

### Build Tools
- **Vite**: Frontend build and dev server
- **esbuild**: Server bundling for production
- **TypeScript**: Full type coverage across the stack