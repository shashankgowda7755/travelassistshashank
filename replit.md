# Overview

"Miles Alone" is a comprehensive travel companion app designed for solo travelers and digital nomads. The application provides an all-in-one solution for managing travel itineraries, tracking expenses, journaling experiences, and maintaining connections with people met during travels. Built with a modern web stack, it features a mobile-first design with PWA capabilities and a natural language command interface for quick data entry.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript for type safety and component-based development
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design system
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Mobile-First Design**: Responsive layout optimized for mobile devices with bottom navigation

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for full-stack type safety
- **API Design**: RESTful endpoints with consistent error handling
- **Session Management**: Express session with PostgreSQL storage
- **Build System**: Vite for development and esbuild for production builds

## Authentication System
- **Provider**: Replit's OpenID Connect (OIDC) authentication
- **Strategy**: Passport.js with OpenID client strategy
- **Session Storage**: PostgreSQL-backed sessions with connect-pg-simple
- **Security**: HTTP-only cookies with secure flags and CSRF protection

## Data Storage
- **Database**: PostgreSQL with Neon serverless driver
- **ORM**: Drizzle ORM for type-safe database queries and schema management
- **Schema**: Comprehensive travel-focused data models including pins, expenses, journal entries, people, routines, and packing lists
- **Migrations**: Drizzle Kit for database schema versioning

## Key Features Architecture
- **Travel Planning**: Pin-based system for destinations with status tracking (planned/visited)
- **Expense Tracking**: Categorized spending logs with date-based filtering
- **Journal System**: Rich text entries with location and photo support
- **People Management**: Contact system for travelers, locals, and guides with searchable profiles
- **Routine Tracking**: Daily habit and routine monitoring with completion status
- **Packing Management**: Categorized packing lists with item status tracking
- **Natural Language Interface**: Command console for quick data entry using natural language parsing

## Component Architecture
- **Modular Components**: Reusable UI components with consistent styling
- **Screen Components**: Main feature screens (Dashboard, Planner, Journal, People, More)
- **Navigation**: Bottom tab navigation for mobile-optimized user experience
- **Command Interface**: Floating action button with command console overlay

# External Dependencies

## Core Infrastructure
- **Database**: Neon PostgreSQL serverless database
- **Authentication**: Replit OIDC service for user authentication
- **Session Storage**: PostgreSQL for server-side session management

## UI Framework
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Lucide React**: Icon library for consistent iconography
- **Font Awesome**: Additional icon support via CDN

## Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Static type checking for JavaScript
- **ESBuild**: Fast JavaScript bundler for production builds
- **Drizzle Kit**: Database schema management and migration tool

## Runtime Dependencies
- **TanStack Query**: Server state management and data fetching
- **React Hook Form**: Form handling with validation support
- **Date-fns**: Date manipulation and formatting utilities
- **Zod**: Schema validation for type-safe data handling
- **Wouter**: Lightweight client-side routing
- **WebSocket (ws)**: WebSocket support for real-time features

## PWA Support
- **Service Worker**: Offline functionality and caching
- **Web App Manifest**: Native app-like installation experience
- **Font Loading**: Google Fonts with preconnect optimization