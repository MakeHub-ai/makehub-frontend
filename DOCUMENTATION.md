# MakeHub Web Application Documentation

## Overview

MakeHub is a Next.js application that provides an AI inference routing service. The platform intelligently routes AI model requests to the optimal provider based on cost, performance, and availability criteria. This documentation provides an overview of each page and component in the application to help engineers understand the codebase.

## Application Structure

The application follows the Next.js App Router structure with the following main sections:

- `/app/*` - Main page routes
- `/components/*` - Reusable UI components
- `/lib/*` - Utility functions and API clients
- `/contexts/*` - React context providers
- `/types/*` - TypeScript type definitions

## API Client

The application uses a centralized API client (`lib/makehub-client.ts`) to handle all interactions with the backend API. This client provides the following key functionalities:

- **Model management:** Fetching and filtering available AI models
- **Chat:** Processing chat messages, both streaming and non-streaming
- **User account:** Managing authentication, usage data, and API keys
- **Performance metrics:** Tracking latency, throughput, and cost across providers

The client handles authentication, error handling (including insufficient funds detection), and response formatting to provide a consistent interface for all API interactions.

## Page Routes

### Home Page (`/app/page.tsx`)

**Purpose:** Serves as the landing page for MakeHub.

**Functionality:**
- Showcases the platform's value propositions with feature sections
- Displays the performance comparison chart between different providers
- Provides quick navigation to the chat interface and documentation
- Shows testimonials from early adopters
- Features CTAs for getting started

### Chat Interface (`/app/chat/page.tsx`)

**Purpose:** Provides an interactive chat interface for users to interact with AI models.

**Functionality:**
- Model selection via dropdown
- Parameter configuration for routing (throughput, latency)
- Chat messaging with AI models
- Sidebar for conversation management
- Quick provider selection buttons (Fastest/Cheapest)
- Adjustable parameters sidebar for fine-tuning request routing
- Conversation persistence and history management
- Mobile-responsive design with collapsible sidebars

### Models Page (`/app/models/page.tsx`)

**Purpose:** Displays a catalog of available AI models organized by organization.

**Functionality:**
- Lists all available models grouped by organization
- Search functionality for finding specific models
- Model details with provider information
- Sorting by provider count
- Modal for detailed model information

### Documentation Pages

#### Main Docs Page (`/app/docs/page.tsx`)
**Purpose:** Entry point for the documentation with overview and quickstart guide.

#### Function Calling (`/app/docs/function_calling/page.tsx`)
**Purpose:** Documents the function calling capabilities with examples and best practices.

#### Load Balancer (`/app/docs/load_balancer/page.tsx`)
**Purpose:** Explains how the load balancer works with detailed process breakdown.

#### Reference Token (`/app/docs/reference_token/page.tsx`)
**Purpose:** Documentation for the reference token concept.

#### Examples (`/app/docs/examples/page.tsx`)
**Purpose:** Code examples for integrating with the platform.

#### OpenAI Compatibility (`/app/docs/we_support_all/page.tsx`)
**Purpose:** Documentation on OpenAI endpoint compatibility.

### Dashboard (`/app/dashboard/page.tsx`)

**Purpose:** User dashboard showing usage statistics and account information.

**Functionality:**
- Displays available credits
- Shows usage metrics (total usage, total requests)
- Lists recent activity with detailed transaction history
- Protected route requiring authentication
- Options to reload credits

### API Keys Management (`/app/api-keys/page.tsx`)

**Purpose:** Interface for managing API keys for accessing the platform programmatically.

**Functionality:**
- List existing API keys
- Create new API keys
- Copy API keys to clipboard
- Delete API keys
- Toggle key visibility
- Protected route requiring authentication

### Pricing (`/app/pricing/page.tsx`)

**Purpose:** Displays pricing information for the platform.

**Functionality:**
- Showcases the beta pricing model
- Explains the transparent pricing approach
- Provides information on getting free credits
- Links to add credit page

### Reload Credits (`/app/reload/page.tsx`)

**Purpose:** Interface for adding credits to the user's account.

**Functionality:**
- Stripe integration for payment processing
- Amount selection
- Credit card form
- Secure payment processing
- Status feedback during payment flow
- Protected route requiring authentication

### Terms of Service (`/app/terms/page.tsx`)

**Purpose:** Legal terms of service documentation.

**Functionality:**
- Displays comprehensive terms of service
- Navigation back to home page

### Privacy Policy (`/app/policy/page.tsx`)

**Purpose:** Privacy policy documentation.

**Functionality:**
- Displays comprehensive privacy policy
- Navigation back to home page

## Key Components

### Layout Components

- **Header/Footer:** Provides consistent navigation and branding across the app
- **DocsSidebar:** Navigation sidebar for the documentation section
- **ChatInterface:** Main chat UI with message display and input

### UI Components

- **ModelSelector:** Dropdown for selecting AI models
- **ParametersSidebar:** Configuration panel for routing parameters
- **ChatMessages:** Renders chat message history with formatting
- **ModelCard:** Displays model information in a card format
- **UsageList:** Tabular display of usage history

### Functional Components

- **FastestProvider/CheapestProvider:** Quick toggle buttons for routing preferences
- **SignInDialog:** Authentication modal
- **ModelDetailsDialog:** Modal with detailed model information
- **ReasoningContent:** Displays AI reasoning in chat messages

## Authentication

The application uses Supabase for authentication, with protected routes that redirect unauthenticated users. The `AuthProvider` context manages user state throughout the application.

## Styling

The application uses:
- TailwindCSS for utility-based styling
- Some custom CSS for animations and specific components
- Shadcn UI components as a foundation for the interface

## API Integration

The application connects to the MakeHub backend API using the centralized `makehub-client.ts` module for:
- Model listing and information
- Chat completions
- User account management
- Usage statistics
- API key management

## State Management

- React Context for global state (auth, etc.)
- Local state for component-specific functionality
- URL parameters for shareable state (e.g., selected model)
- Local storage for conversation persistence

## Responsive Design

The application is fully responsive with:
- Mobile-optimized navigation
- Collapsible sidebars
- Adaptive layouts for different screen sizes
- Touch-friendly interface elements
