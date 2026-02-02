# **Internal App Architecture: Next.js & React**

This document outlines the high-level architecture for the internal web application, designed to function as the caregiver's centralized command center. Built with Next.js and React, the architecture emphasizes a modular, component-based approach for scalability, performance, and maintainability.

### **Core Architectural Philosophy**

- **Next.js App Router:** The architecture will use the Next.js App Router, which supports a file-system-based routing structure. Each top-level page will be a folder containing a page.tsx file.
- **React Components:** The UI will be broken down into reusable and self-contained React components. This modularity allows for easy development, testing, and future feature expansion.
- **Server Components vs. Client Components:** Key parts of the application will use Next.js's Server Components for improved performance (faster loading times and reduced JavaScript bundle size). Interactive, stateful components (e.g., forms, buttons, animated charts) will be Client Components, marked with "use client".
- **Authentication & Security:** A Next.js middleware or a wrapper component will be used to protect all authenticated routes, ensuring that a user is signed in before they can access the application.
- **Technology Stack Integration:** The application will be built using the specified tech stack:
  - **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS, and shadcn/ui
  - **Backend & Data:** Next.js API Routes and Server Actions with **Supabase (PostgreSQL with Realtime)** for the database
  - **AI & Voice:** Claude AI for natural language processing and Retell AI for Speech-to-Text (STT) and Text-to-Speech (TTS)
  - **Caching & Real-time:** Redis Cloud for caching, queues, and real-time features
  - **Monitoring:** Sentry for error tracking and performance monitoring
  - **Analytics:** Vercel Analytics and Speed Insights for usage metrics
  - **Email:** Resend for transactional email notifications
  - **Authentication:** Clerk for secure authentication and user management

### **User Experience Layers & Interface Architecture**

The application's interface will be a blend of a minimalist chat window and a traditional web dashboard, optimized for both speech and visual interaction, as you've requested.

- **Primary Interaction Mode:** A clean, uncluttered chat window will serve as the primary interface for most actions. This chat window will be a persistent element on every major hub page.
- **Voice Interaction:** Seamless voice experience powered by Retell AI, handling both STT and TTS. Voice commands are processed through Claude AI, with responses converted to natural-sounding speech. Redis caches frequent voice responses to improve performance and reduce latency.
- **Visual Confirmation:** After a successful voice command, a simple, clear visual confirmation will appear in the chat window (e.g., "I've added the appointment," followed by a small calendar icon with a checkmark).

### **Page-by-Page Architecture**

The application will be organized into a series of logical pages, each with a specific purpose.

#### **1. Dashboard (/dashboard)**

This is the user's home screen, providing a quick overview of all critical information and serving as the primary conversation interface.

- **Page Structure:** Server component with client-side interactivity, leveraging Redis for cached data and real-time updates.
- **Key Components:**
  - `ConversationalInterface`: Client component with Retell AI integration for voice interactions, connected to Claude AI for natural language processing.
  - `QuickActions`: Voice-accessible buttons for common tasks, with Redis caching for frequent actions.
  - `AtAGlanceSummary`: Real-time dashboard with Sentry monitoring for errors and performance issues.
    - `HealthSummaryCard`: Displays upcoming appointments and medication status, with Redis caching for instant loading.
    - `FinancialSummaryCard`: Shows bills and spending trends, with Vercel Analytics tracking for usage patterns.
    - `ToDosSummaryCard`: Lists top tasks with real-time updates via Supabase Realtime.
  - `RecentActivityFeed`: Real-time feed of caregiver actions, with Redis pub/sub for instant updates across all devices.
  - `PerformanceMetrics`: Embedded Vercel Analytics dashboard showing app performance and usage statistics.

#### **2\. Health Hub (/health)**

A dedicated hub for managing all health-related aspects, with the chat interface persisting at the bottom for easy voice interaction.

- **Page Structure:** A client component with a sidebar for navigation to sub-sections.
- **Key Components:**
  - AppointmentCalendar: A calendar component (client-side) for viewing and adding appointments.
  - MedicationTracker: A component to manage and log medications.
    - **Sub-components:** MedicationList, DoseLog, MedicationHistoryChart.
  - HealthRecordsViewer: A secure component for viewing and managing medical documents.
  - VitalsTracker: A simple form to manually input and track vitals like blood pressure or weight.

#### **3\. Finances Hub (/finances)**

A secure hub for managing and tracking all financial matters, with the chat interface persisting at the bottom.

- **Page Structure:** A client component with nested routes for different financial views.
- **Key Components:**
  - BillsTracker: A component to list, track, and mark bills as paid.
    - **Sub-components:** BillCard, PaymentForm.
  - SpendingDashboard: An interactive chart that visualizes spending over time, categorized by type (e.g., utilities, groceries, medical).
  - FinancialDocuments: A secure viewer for financial documents like tax forms or insurance policies.

#### **4\. Home & Tasks Hub (/tasks)**

For managing all to-dos and home maintenance, with the chat interface persisting at the bottom.

- **Page Structure:** A simple, scrollable client component.
- **Key Components:**
  - ToDoList: A a list of to-dos with checkboxes and due dates, allowing for assignment to different family members.
  - HomeMaintenanceLog: A section to track home repairs or cleaning schedules.
  - ProfessionalContactsList: A simple list of contacts for hired help (e.g., cleaning service, handyman).

#### **5\. Team & Communication (/team)**

The hub for family collaboration and communication, with the chat interface persisting at the bottom.

- **Page Structure:** A client component focused on user management and shared information.
- **Key Components:**
  - FamilyMembersList: A list of all caregivers with their assigned roles and permissions.
  - SharedCalendarView: A read-only view of the shared calendar.
  - CommunicationLog: A chronological feed of all in-app communications (e.g., messages, shared updates).

#### **6\. Emergency Hub (/emergency)**

A critical, simplified, read-only page for immediate access during a crisis.

- **Page Structure:** A minimal, server-rendered component with large, clear text.
- **Key Content (not interactive components):**
  - Emergency Contacts (911, doctor, family).
  - List of all medications and allergies.
  - A list of medical conditions.
  - The location of key documents.

#### **7\. Settings (/settings)**

The administrative page for user and account management.

- **Page Structure:** A client component with sub-sections for different settings.
- **Key Components:**
  - ProfileManagement: For updating user information.
  - SecuritySettings: For password changes or two-factor authentication.
  - DataManagement: Buttons to export data, manage documents, or delete an account.

### **Data Flow & State Management**

- **Database Layer:**
  - **Supabase PostgreSQL**: Primary data storage for all structured data
  - **Redis Cloud**: High-performance caching layer for frequently accessed data and real-time features
  - **Supabase Storage**: Secure file storage for documents and media

- **State Management:**
  - **React Server Components**: For efficient server-side rendering and data fetching
  - **React Query**: For server state management with built-in caching and background updates
  - **Zustand**: For client-side global state when needed
  - **Supabase Realtime + Redis Pub/Sub**: For real-time updates across all connected clients

- **API Layer:**
  - **Next.js API Routes**: For server-side logic and third-party API integrations
  - **Server Actions**: For mutations and form submissions with progressive enhancement
  - **Rate Limiting**: Redis-based rate limiting on all API endpoints

- **Real-time Architecture:**
  - **WebSockets**: For bidirectional communication via Supabase Realtime
  - **Redis Pub/Sub**: For cross-service communication and event broadcasting
  - **Server-Sent Events (SSE)**: For one-way real-time updates from server to client

- **Monitoring & Analytics:**
  - **Sentry**: Error tracking and performance monitoring
  - **Vercel Analytics**: Usage metrics and performance insights
  - **Custom Logging**: Structured logging with Redis for analysis

- **Security Layer:**
  - **Clerk Authentication**: Secure user authentication and session management
  - **Row Level Security (RLS)**: Database-level security in Supabase
  - **API Rate Limiting**: Redis-based protection against abuse
  - **Encryption**: Data encryption at rest and in transit
  - **CSP Headers**: Content Security Policy for XSS protection

This updated architecture provides a robust and scalable foundation for the application, ensuring that the development process is organized and the final product is both powerful and intuitive for the user, while staying within your provided tech stack.
