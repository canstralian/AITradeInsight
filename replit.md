# Smart AI Trading Assistant

## Overview

This is a full-stack Smart AI Trading Assistant application built with a modern technology stack. The application provides AI-powered trading insights, market analysis, and portfolio management tools through a sophisticated web interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

- **Framework**: React with TypeScript using Vite for fast development
- **UI Library**: Radix UI components with shadcn/ui for consistent, accessible design
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite with custom configuration for development and production builds

### Backend Architecture

- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript throughout the stack
- **API Design**: RESTful API with structured error handling
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: Express sessions with PostgreSQL session store

### Data Storage Solutions

- **Primary Database**: PostgreSQL hosted on Neon
- **ORM**: Drizzle ORM with migrations support
- **Schema**: Structured tables for users, stocks, portfolios, watchlists, AI predictions, trading signals, and market sentiment
- **Session Storage**: PostgreSQL-backed session store using connect-pg-simple

## Key Components

### Database Schema

The application uses a comprehensive database schema including:

- **Users**: Authentication and user management
- **Stocks**: Stock data with real-time pricing information
- **Portfolios**: User portfolio tracking with P&L calculations
- **Watchlists**: User-customizable stock watchlists
- **AI Predictions**: Machine learning-based price predictions and signals
- **Trading Signals**: AI-generated trading recommendations
- **Market Sentiment**: Overall market sentiment analysis

### Frontend Components

- **Dashboard**: Main trading interface with multiple data visualization components
- **Portfolio Overview**: Real-time portfolio performance tracking
- **Price Charts**: Interactive stock price visualization with technical indicators
- **AI Predictions**: Machine learning-based price forecasting display
- **Trading Signals**: AI-generated buy/sell/hold recommendations
- **Watchlist**: User-managed stock tracking interface
- **Market Sentiment**: Market-wide sentiment analysis visualization

### API Endpoints

- Stock data retrieval and search functionality
- Portfolio management and tracking
- Watchlist operations (add/remove stocks)
- AI prediction data serving
- Trading signal generation and retrieval
- Market sentiment analysis

## Data Flow

1. **Client Requests**: Frontend makes API calls using TanStack Query for caching and state management
2. **API Processing**: Express server handles requests with structured error handling
3. **Database Operations**: Drizzle ORM performs type-safe database operations
4. **Data Transformation**: Server transforms raw data into structured responses
5. **Client Updates**: React components update automatically via Query invalidation
6. **Real-time Updates**: Components can refresh data based on user interactions or time intervals

## External Dependencies

### Core Dependencies

- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/\***: Accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **wouter**: Lightweight routing library

### Development Dependencies

- **vite**: Fast build tool and development server
- **typescript**: Type safety throughout the stack
- **drizzle-kit**: Database migration and schema management
- **@replit/vite-plugin-runtime-error-modal**: Development error handling

## Deployment Strategy

### Development Environment

- **Local Development**: Vite dev server with hot module replacement
- **Database**: Neon serverless PostgreSQL with environment-based configuration
- **Environment Variables**: DATABASE_URL for database connection
- **Build Process**: Vite for frontend, esbuild for backend bundling

### Production Deployment

- **Frontend**: Static assets built with Vite and served via Express
- **Backend**: Node.js server with bundled dependencies
- **Database**: Neon serverless PostgreSQL for scalability
- **Build Commands**:
  - `npm run build`: Creates production-ready frontend and backend bundles
  - `npm run start`: Runs production server
  - `npm run db:push`: Applies database schema changes

### Architecture Decisions

**Database Choice**: PostgreSQL with Drizzle ORM was chosen for:

- Type safety with TypeScript integration
- Robust relational data modeling for complex trading data
- Serverless scaling with Neon Database
- Advanced query capabilities for financial data analysis

**Frontend State Management**: TanStack Query provides:

- Automatic caching and background updates
- Optimistic updates for better UX
- Error handling and retry logic
- Minimal boilerplate compared to Redux

**UI Component Strategy**: Radix UI + shadcn/ui offers:

- Accessibility compliance out of the box
- Consistent design system
- Customizable theming with CSS variables
- Minimal bundle size impact

**Real-time Updates**: Polling-based updates chosen over WebSockets for:

- Simpler implementation and debugging
- Better compatibility with serverless deployments
- Easier error handling and recovery
- Sufficient for trading dashboard use case
