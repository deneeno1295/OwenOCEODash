# OCEO Dashboard - Competitive Intelligence & Executive Dashboard

## Overview

OCEO Dashboard is a Salesforce-inspired enterprise competitive intelligence platform built with modern web technologies. The application provides executives with real-time insights into competitors, emerging startups, strategic priorities, and market sentiment analysis. It features a clean, card-based Lightning Design System aesthetic with a cosmic dark mode theme, offering comprehensive data visualization through charts, diagrams, and interactive dashboards.

The platform combines AI-powered sentiment analysis, startup tracking, priority management, and data cloud ingestion capabilities into a unified executive dashboard experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 19 with TypeScript for type-safe component development
- Vite as the build tool and development server, configured for fast HMR and optimized production builds
- Component library based on Radix UI primitives with shadcn/ui design system
- Styling via TailwindCSS v4 with custom theme configuration supporting Salesforce Lightning Design System aesthetics

**UI Component Strategy**
- Modular component architecture using shadcn/ui components (50+ pre-built components including dialogs, dropdowns, cards, tables, forms)
- Custom theme variables for Salesforce-like branding (primary color #0176D3, enterprise dark backgrounds)
- Lucide React for iconography
- Recharts for data visualization (area charts, line charts for sentiment velocity tracking)
- Mermaid diagrams for architectural visualizations in Cloud Intelligence views

**State Management & Data Fetching**
- TanStack Query (React Query) for server state management with configured queryClient
- Custom API request wrapper with error handling and credential management
- Wouter for lightweight client-side routing
- React Hook Form with Zod resolvers for form validation

**Page Structure**
The application follows a dashboard-centric architecture with six main views:
- Dashboard (home): KPI cards, velocity tracker, alerts feed
- Sentiment Analysis: Competitor sentiment tracking with AI-powered analysis
- Cloud Intelligence: Agent architecture diagrams and capability matrices
- Startups: Categorized startup tracking (watchlist, manual, automated)
- Priorities: Strategic priority management with ranking and trending
- Data Cloud: Content ingestion interface for Salesforce Data Cloud

### Backend Architecture

**Server Framework**
- Express.js with TypeScript for RESTful API endpoints
- Separate development (index-dev.ts) and production (index-prod.ts) entry points
- Development server integrates Vite middleware for HMR
- Production server serves pre-built static assets

**API Design Pattern**
- RESTful endpoints organized by resource (/api/competitors, /api/startups, /api/priorities, etc.)
- CRUD operations for all major entities
- Storage abstraction layer (IStorage interface) decoupling business logic from database implementation
- Request logging middleware tracking method, path, status, duration, and JSON responses

**Database Layer**
- Drizzle ORM for type-safe database operations
- Schema-first approach with shared TypeScript schema definitions
- Support for PostgreSQL via Neon serverless driver with WebSocket configuration
- Database seeding functionality for initial data population

**Data Models**
Seven core entities with relational structure:
- Competitors (name, type, score, trend)
- Sentiment Analysis (linked to competitors, includes AI confidence scores)
- Startups (stage, velocity, category, funding details)
- Priorities (title, status, owner, rank, trend)
- Priority History (tracks ranking changes over time)
- Alerts (critical signals and notifications)
- Data Cloud Uploads (ingestion tracking)
- Sentiment Velocity (time-series sentiment data)

### Development vs Production Strategy

**Development Mode**
- Vite dev server with HMR enabled
- Index.html template transformation for dynamic content injection
- Source maps enabled for debugging
- Replit-specific plugins (cartographer, dev banner) for enhanced developer experience

**Production Build**
- Client build: Vite bundles React application to dist/public
- Server build: esbuild bundles Express server to dist/index.js with ESM format
- Static asset serving with fallback to index.html for SPA routing
- Environment-based configuration (NODE_ENV detection)

### Code Organization

**Monorepo Structure**
- `/client`: Frontend React application with src, public directories
- `/server`: Backend Express server with routes, storage, seed scripts
- `/shared`: Shared TypeScript types and Drizzle schema definitions
- TypeScript path aliases for clean imports (@/, @shared/, @assets/)

**Build Artifacts**
- `/dist/public`: Compiled frontend bundle
- `/dist/index.js`: Compiled server bundle
- `/migrations`: Drizzle database migrations

## External Dependencies

**Database & ORM**
- Neon Serverless PostgreSQL: Cloud-native serverless Postgres database with WebSocket support
- Drizzle ORM: TypeScript-first ORM for schema definition and query building
- Drizzle Kit: Migration management and database push utilities

**Frontend Libraries**
- Radix UI: Unstyled, accessible component primitives (40+ components including accordion, dialog, dropdown, tabs, tooltip)
- TailwindCSS: Utility-first CSS framework with custom configuration
- TanStack Query: Server state management with caching and background refetching
- Wouter: Minimalist routing library (lightweight alternative to React Router)
- Recharts: Declarative chart library for React
- Mermaid: Diagram and flowchart generation from text definitions
- React Hook Form: Performant form library with validation
- Zod: TypeScript-first schema validation
- date-fns: Date manipulation utility library
- class-variance-authority (CVA): Variant-based component styling
- clsx + tailwind-merge: Conditional className composition

**Backend Libraries**
- Express: Web application framework
- connect-pg-simple: PostgreSQL session store for Express
- ws: WebSocket library (required by Neon serverless)
- nanoid: Unique ID generation

**Development Tools**
- Vite: Build tool and dev server
- TypeScript: Type system and compiler
- ESBuild: Fast JavaScript bundler for production server build
- tsx: TypeScript execution environment for development
- PostCSS + Autoprefixer: CSS processing pipeline

**Replit-Specific Integrations**
- @replit/vite-plugin-runtime-error-modal: Development error overlay
- @replit/vite-plugin-cartographer: Code navigation enhancement
- @replit/vite-plugin-dev-banner: Development environment indicator
- Custom meta-images plugin for OpenGraph image URL rewriting based on Replit deployment domain

**Asset Management**
- Custom Vite plugin for meta tag updates (og:image, twitter:image)
- Static asset serving from client/public directory
- Brand assets stored in attached_assets directory (logo, branding JSON)