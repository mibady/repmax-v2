# Dashboard Implementation PRP - Caregiving Companion

## Goal

Build the main dashboard interface for the Caregiving Companion app, integrating voice chat, quick actions, at-a-glance summaries, and real-time activity feeds to create a unified command center for caregivers.

## Why

- Provide single-screen overview of all critical care information
- Enable quick task completion through voice or click
- Surface urgent items requiring immediate attention
- Facilitate team coordination with real-time updates
- Reduce cognitive load through intelligent organization

## What (User-Visible Behavior)

- **Conversational Interface**: Persistent chat with voice input at bottom
- **Quick Actions**: One-click/voice access to common tasks
- **At-a-Glance Cards**: Health, financial, and task summaries
- **Activity Feed**: Real-time updates from all team members
- **Smart Notifications**: Contextual alerts for urgent items

## All Needed Context

### Documentation References

- Next.js App Router: https://nextjs.org/docs/app
- Shadcn/ui Components: https://ui.shadcn.com/docs
- Supabase Realtime: https://supabase.com/docs/guides/realtime/broadcast
- Tailwind CSS: https://tailwindcss.com/docs
- Framer Motion: https://www.framer.com/motion/
- React Query: https://tanstack.com/query/latest
- Redis Cloud: https://redis.io/docs/
- Sentry: https://sentry.io/docs/
- Vercel Analytics: https://vercel.com/docs/analytics

### Package Dependencies

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.51.0",
    "framer-motion": "^11.2.0",
    "date-fns": "^3.6.0",
    "recharts": "^2.12.0",
    "@radix-ui/react-tabs": "^1.1.0",
    "@radix-ui/react-dialog": "^1.1.0",
    "@sentry/nextjs": "^8.3.1",
    "@upstash/redis": "^1.34.3",
    "@vercel/analytics": "^1.2.1",
    "@vercel/speed-insights": "^1.1.0"
  }
}
```

### Design System

- Primary Blue: #3B82F6
- Success Green: #10B981
- Warning Amber: #F59E0B
- Error Red: #EF4444
- Background: #F9FAFB
- Card Background: #FFFFFF
- Text Primary: #111827
- Text Secondary: #6B7280

### Critical Implementation Notes

- **Performance**:
  - Dashboard must load in < 2 seconds
  - Implement Redis caching for frequently accessed data
  - Use React Query for server state management with Redis-backed cache
  - Optimize images and assets with Next.js Image component
- **Reliability**:
  - Real-time updates via Supabase subscriptions
  - Implement retry mechanisms for failed API calls
  - Use Redis for rate limiting and caching expensive queries
  - Monitor performance with Vercel Analytics and Speed Insights
- **Security**:
  - Implement proper authentication checks for all data access
  - Use Redis for rate limiting and abuse prevention
  - Encrypt sensitive data in transit and at rest
  - Implement proper CORS policies
- **Monitoring**:
  - Integrate Sentry for error tracking and performance monitoring
  - Track key user interactions with Vercel Analytics
  - Log important events to Sentry for debugging
  - Monitor API response times and error rates

## Implementation Blueprint

### 1. Dashboard Layout (/app/dashboard/layout.tsx)

```typescript
import { Suspense, useEffect } from "react";
import { UserProfile } from "@/components/UserProfile";
import { NavigationSidebar } from "@/components/NavigationSidebar";
import { NotificationBell } from "@/components/NotificationBell";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import * as Sentry from "@sentry/nextjs";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Redis } from "@upstash/redis";

// Initialize Redis client for caching
export const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!,
});

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ...
}
```

### 2. Main Dashboard Page (/app/dashboard/page.tsx)

```typescript
'use client';

import { useState } from 'react';
import { UnifiedCommunicationPanel } from '@/components/communication/UnifiedCommunicationPanel';
import { CompanionIdentity } from '@/components/communication/CompanionIdentity';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { AtAGlanceSummary } from '@/components/dashboard/AtAGlanceSummary';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { UrgentAlerts } from '@/components/dashboard/UrgentAlerts';
import { UsageDashboard } from '@/components/billing/UsageDashboard';
import { useOrganization } from '@clerk/nextjs';
import { useAuth } from '@clerk/nextjs';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { userId } = useAuth();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column */}
      <div className="lg:col-span-2 space-y-6">
        <UrgentAlerts />
        {/* Companion Identity Card - Shows phone number, how to reach companion */}
        <CompanionIdentity />
        <AtAGlanceSummary />
        <QuickActions />
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        {/* Voice Minutes Usage - High Visibility */}
        <UsageDashboard userId={userId} compact={true} />
        <ActivityFeed />
      </div>

      {/* Unified Communication Panel - Voice, SMS, Phone Call in one interface */}
      <UnifiedCommunicationPanel className="fixed bottom-0 left-0 right-0" />
    </div>
  );
}
```

### 3. Quick Actions Component with shadcn/ui (/components/dashboard/QuickActions.tsx)

```typescript
"use client";

// Prompt: Create a quick actions grid using shadcn/ui Card, Button, and Dialog components
// with icon buttons for common caregiver tasks and voice activation support

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Pill,
  Calendar,
  Phone,
  FileText,
  Heart,
  DollarSign,
  Mic,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";

import {
  Calendar,
  Pill,
  FileText,
  Phone,
  DollarSign,
  Home,
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// ...
```

### 4. At-a-Glance Summary Component with shadcn/ui (/components/dashboard/AtAGlanceSummary.tsx)

```typescript
'use client';

// Prompt: Build a tabbed interface using shadcn/ui Tabs, Card, Progress, and Badge
// components showing health, financial, and task summaries with real-time updates

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Heart, DollarSign, CheckSquare, TrendingUp, TrendingDown } from 'lucide-react';
import { HealthSummaryCard } from './HealthSummaryCard';
import { FinancialSummaryCard } from './FinancialSummaryCard';
import { TasksSummaryCard } from './TasksSummaryCard';

export function AtAGlanceSummary() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Today's Overview</CardTitle>
        <CardDescription>
          Quick summary of caregiving activities and status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="health" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="health" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Health
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Financial
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Tasks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="health" className="mt-4 space-y-4">
            <HealthSummaryCard />
          </TabsContent>

          <TabsContent value="financial" className="mt-4 space-y-4">
            <FinancialSummaryCard />
          </TabsContent>

          <TabsContent value="tasks" className="mt-4 space-y-4">
            <TasksSummaryCard />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
```

### 5. Health Summary Card with shadcn/ui (/components/dashboard/HealthSummaryCard.tsx)

```typescript
'use client';

// Prompt: Create a health metrics card using shadcn/ui Card, Progress, Badge, Alert,
// and Skeleton components showing medication adherence, vitals, and appointments

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  Pill,
  Activity,
  AlertCircle,
  Heart,
  Thermometer,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { fetchHealthSummary } from '@/lib/api/health';

export function HealthSummaryCard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['health-summary'],
    queryFn: fetchHealthSummary,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load health summary. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Medication Adherence */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Pill className="h-4 w-4" />
              Medication Adherence
            </CardTitle>
            <Badge variant={data?.medicationAdherence >= 90 ? "default" : "destructive"}>
              {data?.medicationAdherence}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={data?.medicationAdherence} className="mb-2" />
          <p className="text-xs text-muted-foreground">
            {data?.medicationsTaken}/{data?.medicationsTotal} medications taken today
          </p>
          {data?.nextMedication && (
            <div className="mt-2 flex items-center gap-2 text-xs">
              <Clock className="h-3 w-3" />
              Next: {data.nextMedication.name} at {data.nextMedication.time}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vital Signs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Latest Vitals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Heart className="h-3 w-3 text-red-500" />
                <span className="text-xs text-muted-foreground">Blood Pressure</span>
              </div>
              <p className="text-sm font-medium">{data?.vitals?.bloodPressure || "---"}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Thermometer className="h-3 w-3 text-orange-500" />
                <span className="text-xs text-muted-foreground">Temperature</span>
              </div>
              <p className="text-sm font-medium">{data?.vitals?.temperature || "---"}°F</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Next Appointment
            </CardTitle>
            {data?.appointmentUrgent && (
              <Badge variant="destructive">Urgent</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {data?.nextAppointment ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">{data.nextAppointment.doctor}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(data.nextAppointment.date), 'PPp')}
              </p>
              <Badge variant="outline" className="text-xs">
                {data.nextAppointment.type}
              </Badge>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No upcoming appointments</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

### 6. Activity Feed Component (/components/dashboard/ActivityFeed.tsx)

```typescript
"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/hooks/useSupabase";
import { format } from "date-fns";
import { User, Calendar, Pill, DollarSign, FileText, Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Cache activity feed data in Redis with 1-minute TTL
async function fetchActivitiesWithCache() {
  // ...
}

export function ActivityFeed() {
  // ...
}
```

### 7. Urgent Alerts Component (/components/dashboard/UrgentAlerts.tsx)

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { fetchUrgentAlerts } from "@/lib/api/alerts";

// ...
```

### 8. API Functions (/lib/api/dashboard.ts)

```typescript
import { createClient } from '@supabase/supabase-js';

// Initialize Sentry for client-side error tracking
Sentry.init({
  // ...
});

// Initialize Supabase client with error tracking
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    // ...
  }
);

// Add error tracking to Supabase client
supabase
  .channel('sentry-errors')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'errors' },
    (payload) => {
      Sentry.captureException(new Error('Database error'), {
        extra: { payload },
        tags: { source: 'supabase' },
      });
    }
  )
  .subscribe();

export async function fetchHealthSummary() {
  // ...
    .order('appointment_date', { ascending: true })
    .limit(1);

  const { data: medications } = await supabase
    .from('medications')
    .select('*')
    .eq('is_active', true);

  const { data: medicationLogs } = await supabase
    .from('medication_logs')
    .select('*')
    .gte('administered_at', new Date().setHours(0, 0, 0, 0));

  return {
    nextAppointment: appointments?.[0],
    medicationsTotal: medications?.length || 0,
    medicationsTaken: medicationLogs?.length || 0,
    medicationAdherence: medications?.length
      ? Math.round((medicationLogs?.length || 0) / medications.length * 100)
      : 0,
  };
}

export async function fetchUrgentAlerts() {
  const { data } = await supabase
    .from('alerts')
    .select('*')
    .eq('is_urgent', true)
    .eq('is_resolved', false)
    .order('created_at', { ascending: false });

  return data || [];
}

export async function fetchRecentActivities() {
  const { data } = await supabase
    .from('activities')
    .select('*, users(full_name)')
    .order('created_at', { ascending: false })
    .limit(20);

  return data || [];
}
```

## Task Checklist

### Layout & Structure

- [ ] Create dashboard layout with navigation
- [ ] Implement responsive grid system
- [ ] Set up persistent chat interface
- [ ] Configure real-time subscriptions
- [ ] Add loading and error states

### Core Components

- [ ] Build QuickActions component
- [ ] Create AtAGlanceSummary with tabs
- [ ] Implement HealthSummaryCard
- [ ] Build FinancialSummaryCard
- [ ] Create TasksSummaryCard
- [ ] Develop ActivityFeed with real-time updates
- [ ] Build UrgentAlerts component

### Data Integration

- [ ] Set up React Query for data fetching
- [ ] Configure Supabase client
- [ ] Implement API functions
- [ ] Add real-time subscriptions
- [ ] Handle offline caching

### User Experience

- [ ] Add animations with Framer Motion
- [ ] Implement keyboard navigation
- [ ] Create mobile-responsive design
- [ ] Add haptic feedback for mobile
- [ ] Implement dark mode support

### 8. Companion Identity Card (/components/communication/CompanionIdentity.tsx)

```typescript
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, MessageSquare, Mail, Copy, UserPlus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useState, useEffect } from 'react';

export function CompanionIdentity() {
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCompanionInfo();
  }, []);

  const fetchCompanionInfo = async () => {
    const response = await fetch('/api/phone-number/status');
    const data = await response.json();
    setPhoneNumber(data.phoneNumber);
    setSmsEnabled(data.smsEnabled);
  };

  const copyToClipboard = () => {
    if (phoneNumber) {
      navigator.clipboard.writeText(phoneNumber);
      toast({
        title: 'Number copied!',
        description: 'Phone number copied to clipboard',
      });
    }
  };

  const addToContacts = () => {
    // Generate vCard for adding to contacts
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:Sarah (Your Companion)
TEL:${phoneNumber}
NOTE:Your AI caregiving companion - Available 24/7 via voice, text, or call
END:VCARD`;

    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sarah-companion.vcf';
    a.click();
  };

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Your Companion - Sarah</span>
          <Badge variant="outline" className="bg-green-500/10 text-green-600">
            Available 24/7
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {phoneNumber ? (
          <>
            <div className="flex items-center justify-between p-4 bg-background rounded-lg border">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Dedicated Phone Number</p>
                <p className="font-mono text-lg font-semibold">{phoneNumber}</p>
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="outline" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="outline" onClick={addToContacts}>
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-background rounded-lg">
                <Phone className="h-5 w-5 mx-auto mb-1 text-primary" />
                <p className="text-xs font-medium">Voice Calls</p>
                <Badge className="mt-1" variant="outline">Active</Badge>
              </div>
              <div className="text-center p-3 bg-background rounded-lg">
                <MessageSquare className="h-5 w-5 mx-auto mb-1 text-primary" />
                <p className="text-xs font-medium">Text (SMS)</p>
                <Badge className="mt-1" variant={smsEnabled ? "outline" : "secondary"}>
                  {smsEnabled ? 'Active' : 'Pending'}
                </Badge>
              </div>
              <div className="text-center p-3 bg-background rounded-lg">
                <Mail className="h-5 w-5 mx-auto mb-1 text-primary" />
                <p className="text-xs font-medium">Email</p>
                <Badge className="mt-1" variant="outline">Active</Badge>
              </div>
            </div>

            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm">
                <strong>One number for everything:</strong> Call, text, or use the chat below
                to reach Sarah anytime. She remembers all your conversations across every channel.
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">
              Set up your companion's phone number to enable calls and texts
            </p>
            <Button>Get Phone Number</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### 9. Unified Communication Panel (/components/communication/UnifiedCommunicationPanel.tsx)

```typescript
'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  MessageSquare,
  Send,
  Volume2,
  Bot,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRetellWebCall } from '@/hooks/useRetellWebCall';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'companion';
  channel: 'voice' | 'sms' | 'chat';
  timestamp: Date;
}

export function UnifiedCommunicationPanel({ className }: { className?: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeChannel, setActiveChannel] = useState<'voice' | 'sms' | 'chat'>('voice');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);

  const {
    startCall,
    endCall,
    isCallActive,
    isMuted,
    toggleMute,
    transcript
  } = useRetellWebCall();

  useEffect(() => {
    // Fetch companion phone number
    fetchPhoneNumber();
  }, []);

  const fetchPhoneNumber = async () => {
    const response = await fetch('/api/phone-number/status');
    const data = await response.json();
    setPhoneNumber(data.phoneNumber);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      channel: activeChannel === 'sms' ? 'sms' : 'chat',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');

    // Send to appropriate channel
    if (activeChannel === 'sms' && phoneNumber) {
      await sendSMS(inputValue);
    } else {
      await sendChat(inputValue);
    }
  };

  const sendSMS = async (message: string) => {
    // This would send via the user's dedicated Retell number
    const response = await fetch('/api/communication/sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, channel: 'sms' }),
    });

    const data = await response.json();
    if (data.reply) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: data.reply,
        sender: 'companion',
        channel: 'sms',
        timestamp: new Date(),
      }]);
    }
  };

  const sendChat = async (message: string) => {
    const response = await fetch('/api/communication/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();
    if (data.reply) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: data.reply,
        sender: 'companion',
        channel: 'chat',
        timestamp: new Date(),
      }]);
    }
  };

  const initiatePhoneCall = () => {
    if (phoneNumber) {
      // This would initiate a call FROM the companion TO the user
      window.location.href = `tel:${phoneNumber}`;
    }
  };

  return (
    <div className={cn("fixed bottom-0 left-0 right-0 z-50", className)}>
      <AnimatePresence>
        {isExpanded ? (
          <motion.div
            initial={{ height: 60 }}
            animate={{ height: 500 }}
            exit={{ height: 60 }}
            className="bg-background border-t shadow-lg"
          >
            <Card className="h-full rounded-none border-0">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Bot className="h-8 w-8 text-primary" />
                      <span className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Sarah</h3>
                      <p className="text-xs text-muted-foreground">
                        {phoneNumber || 'Your Companion'}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsExpanded(false)}
                  >
                    Minimize
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="flex flex-col h-[calc(100%-80px)]">
                <Tabs value={activeChannel} onValueChange={(v) => setActiveChannel(v as any)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="voice" className="gap-2">
                      <Mic className="h-4 w-4" />
                      Voice
                    </TabsTrigger>
                    <TabsTrigger value="sms" className="gap-2">
                      <MessageSquare className="h-4 w-4" />
                      SMS
                    </TabsTrigger>
                    <TabsTrigger value="chat" className="gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Chat
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="voice" className="flex-1 flex flex-col">
                    <ScrollArea className="flex-1 p-4">
                      {transcript && (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Live Transcript:</p>
                          <p className="text-sm">{transcript}</p>
                        </div>
                      )}
                    </ScrollArea>
                    <div className="p-4 border-t flex justify-center gap-4">
                      {isCallActive ? (
                        <>
                          <Button
                            size="lg"
                            variant={isMuted ? "secondary" : "outline"}
                            onClick={toggleMute}
                          >
                            {isMuted ? <MicOff /> : <Mic />}
                          </Button>
                          <Button
                            size="lg"
                            variant="destructive"
                            onClick={endCall}
                          >
                            <PhoneOff className="mr-2" />
                            End Call
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="lg"
                            variant="default"
                            onClick={startCall}
                          >
                            <Mic className="mr-2" />
                            Start Voice Chat
                          </Button>
                          <Button
                            size="lg"
                            variant="outline"
                            onClick={initiatePhoneCall}
                          >
                            <Phone className="mr-2" />
                            Call Me
                          </Button>
                        </>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="sms" className="flex-1 flex flex-col">
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        {messages
                          .filter(m => m.channel === 'sms')
                          .map(message => (
                            <div
                              key={message.id}
                              className={cn(
                                "flex",
                                message.sender === 'user' ? "justify-end" : "justify-start"
                              )}
                            >
                              <div className={cn(
                                "max-w-[70%] rounded-lg p-3",
                                message.sender === 'user'
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              )}>
                                <p className="text-sm">{message.content}</p>
                                <p className="text-xs opacity-70 mt-1">
                                  {message.timestamp.toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </ScrollArea>
                    <div className="p-4 border-t">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Type a text message..."
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <Button onClick={handleSendMessage}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        SMS to/from: {phoneNumber}
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="chat" className="flex-1 flex flex-col">
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        {messages
                          .filter(m => m.channel === 'chat')
                          .map(message => (
                            <div
                              key={message.id}
                              className={cn(
                                "flex",
                                message.sender === 'user' ? "justify-end" : "justify-start"
                              )}
                            >
                              <div className={cn(
                                "max-w-[70%] rounded-lg p-3",
                                message.sender === 'user'
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              )}>
                                <p className="text-sm">{message.content}</p>
                                <p className="text-xs opacity-70 mt-1">
                                  {message.timestamp.toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </ScrollArea>
                    <div className="p-4 border-t">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Type a message..."
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <Button onClick={handleSendMessage}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            className="bg-background border-t shadow-lg p-4 cursor-pointer hover:bg-muted/50"
            onClick={() => setIsExpanded(true)}
          >
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center gap-3">
                <Bot className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-medium">Sarah is here to help</p>
                  <p className="text-xs text-muted-foreground">
                    Click to chat, call, or text
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <Phone className="h-3 w-3" />
                  Voice
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <MessageSquare className="h-3 w-3" />
                  SMS
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <MessageSquare className="h-3 w-3" />
                  Chat
                </Badge>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

### Performance

- [ ] Optimize bundle size
- [ ] Implement code splitting
- [ ] Add image optimization
- [ ] Configure caching strategies
- [ ] Minimize re-renders

## Validation Loop

### Level 1: Component Testing

```bash
# Unit tests
npm test -- dashboard/QuickActions.test.tsx
npm test -- dashboard/AtAGlanceSummary.test.tsx
npm test -- dashboard/ActivityFeed.test.tsx
```

### Level 2: Integration Testing

```bash
# Test data fetching
npm run test:api-integration

# Test real-time updates
npm run test:realtime

# Test voice commands
npm run test:voice-commands
```

### Level 3: Performance Testing

```bash
# Lighthouse audit
npm run lighthouse

# Bundle analysis
npm run analyze

# Load time testing
npm run test:performance
```

### Level 4: E2E Testing

```bash
# Full dashboard flow
npm run e2e:dashboard

# Test all quick actions
npm run e2e:quick-actions

# Mobile testing
npm run e2e:mobile
```

## Success Criteria

- [ ] Dashboard loads in < 2 seconds
- [ ] Real-time updates appear within 500ms
- [ ] All quick actions functional
- [ ] Voice commands recognized correctly
- [ ] Mobile responsive at all breakpoints
- [ ] Accessibility score > 95

## Common Gotchas

- React Query cache invalidation needs careful management
- Supabase real-time has connection limits
- Framer Motion animations can impact performance
- Tab focus order must be logical for accessibility
- Mobile Safari has different viewport behavior
- Voice commands need fallback for unsupported browsers
