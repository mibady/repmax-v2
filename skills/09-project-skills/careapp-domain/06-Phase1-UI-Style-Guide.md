# PRP: UI Style Guide

## 1. Color Scheme

### 1.1 Core Palette

```javascript
// tailwind.config.js
const { fontFamily } = require("tailwindcss/defaultTheme");

module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Brand colors
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        // Semantic colors for specific use cases
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
        heading: ["var(--font-heading)", ...fontFamily.sans],
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
```

### 1.2 CSS Variables

```css
/* styles/globals.css */
:root {
  /* Light theme */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;

  /* Gradients */
  --gradient-ocean: linear-gradient(135deg, #1e3a8a 0%, #0ea5e9 100%);
  --gradient-gold: linear-gradient(135deg, #f59e0b 0%, #fde68a 100%);
  --gradient-turquoise: linear-gradient(135deg, #0d9488 0%, #5eead4 100%);
}

.dark {
  /* Dark theme overrides */
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  --primary-foreground: 222.2 47.4% 11.2%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
}
```

## 2. Component Styles

### 2.1 Cards

```tsx
// components/ui/card.tsx
import { cn } from "@/lib/utils";

const Card = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-glow transition-shadow",
      className,
    )}
    {...props}
  />
);

const CardHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
);

// Additional card subcomponents...

export { Card, CardHeader /*, ... */ };
```

### 2.2 Buttons

```tsx
// components/ui/button.tsx
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        gradient: 'bg-gradient-to-r from-blue-600 to-teal-500 text-white hover:from-blue-700 hover:to-teal-600',
        emergency: 'bg-red-600 text-white hover:bg-red-700 animate-pulse',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        xl: 'h-12 rounded-md px-10 text-base',
        icon: 'h-10 w-10',
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
```

## 3. Effects & Utilities

### 3.1 Gradients

```css
/* styles/globals.css */
@layer utilities {
  .text-gradient {
    @apply bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-turquoise-500;
  }

  .gradient-ocean {
    @apply bg-gradient-to-r from-navy-700 to-blue-600;
  }

  .gradient-gold {
    @apply bg-gradient-to-r from-gold-500 to-amber-500;
  }

  .gradient-turquoise {
    @apply bg-gradient-to-r from-teal-500 to-emerald-500;
  }
}
```

### 3.2 Glow Effects

```css
/* styles/glow.css */
@layer components {
  .glow-effect {
    @apply relative;
  }

  .glow-effect::after {
    @apply content-[''] absolute inset-0 -z-10 opacity-0 blur-xl transition-opacity duration-300;
    background: radial-gradient(
      circle at center,
      currentColor 0%,
      transparent 70%
    );
  }

  .glow-effect:hover::after {
    @apply opacity-70;
  }

  .shadow-glow {
    box-shadow: 0 0 15px -3px rgba(99, 102, 241, 0.3);
  }

  .shadow-glow-lg {
    box-shadow: 0 0 30px -5px rgba(99, 102, 241, 0.5);
  }
}
```

## 4. Usage Examples

### 4.1 Card with Glow Effect

```tsx
<Card className="group hover:shadow-glow-lg transition-all duration-300">
  <CardHeader>
    <CardTitle className="text-2xl font-bold">Premium Plan</CardTitle>
    <CardDescription>For growing businesses</CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-4xl font-bold mb-4">
      $29<span className="text-lg text-muted-foreground">/month</span>
    </p>
    <ul className="space-y-2">
      <li className="flex items-center">
        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
        <span>Unlimited projects</span>
      </li>
      {/* More features */}
    </ul>
  </CardContent>
  <CardFooter>
    <Button className="w-full" variant="gradient">
      Get Started
    </Button>
  </CardFooter>
</Card>
```

### 4.2 Gradient Text

```tsx
<h2 className="text-4xl font-bold text-gradient">Beautiful Gradients</h2>
```

## 5. Implementation Notes

### 5.1 Theme Provider

```tsx
// components/theme-provider.tsx
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
```

### 5.2 Theme Toggle Component

```tsx
// components/theme-toggle.tsx
"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### 5.3 Responsive Design

- **Mobile-first approach**: All components are designed mobile-first
- **Breakpoints**:
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px
  - `2xl`: 1536px
- **Testing**: Test on various devices and screen sizes using Chrome DevTools

## 6. Comprehensive shadcn/ui Component Examples

### 6.1 Form Components for Caregiving App

#### Health Data Input Form

```tsx
// Prompt: Create a medication tracking form using shadcn/ui with Input, Label, Select,
// DatePicker, and validation feedback for dosage and frequency fields

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarIcon, Clock, Pill } from "lucide-react";

export function MedicationForm() {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Pill className="h-5 w-5" />
          Add Medication
        </CardTitle>
        <CardDescription>
          Track medication schedules and dosages for your care recipient
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="medication-name">Medication Name*</Label>
            <Input
              id="medication-name"
              placeholder="e.g., Lisinopril"
              className="focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dosage">Dosage*</Label>
            <div className="flex gap-2">
              <Input
                id="dosage"
                type="number"
                placeholder="10"
                className="w-20"
              />
              <Select>
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mg">mg</SelectItem>
                  <SelectItem value="ml">ml</SelectItem>
                  <SelectItem value="mcg">mcg</SelectItem>
                  <SelectItem value="units">units</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Frequency</Label>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-primary hover:text-white"
            >
              Once daily
            </Badge>
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-primary hover:text-white"
            >
              Twice daily
            </Badge>
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-primary hover:text-white"
            >
              Three times daily
            </Badge>
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-primary hover:text-white"
            >
              As needed
            </Badge>
          </div>
        </div>

        <Alert>
          <AlertDescription>
            Set up reminders to ensure medications are taken on time
          </AlertDescription>
        </Alert>

        <div className="flex justify-end gap-2">
          <Button variant="outline">Cancel</Button>
          <Button>Save Medication</Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 6.2 Dashboard Components

#### Care Metrics Dashboard

```tsx
// Prompt: Design a caregiver dashboard with KPI cards using shadcn/ui Card, Badge,
// Progress components showing health metrics, appointments, and tasks

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Calendar, Pill, Users } from "lucide-react";

export function CaregiverDashboard() {
  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Medications Today
            </CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8/12</div>
            <Progress value={66} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              4 medications remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Appointments
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <Badge variant="secondary" className="mt-2">
              This Week
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Next: Dr. Smith, Tomorrow 2PM
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Health Score</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Good</div>
            <Progress value={78} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              +5% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Care Team</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex -space-x-2">
              <Avatar className="h-8 w-8 border-2 border-background">
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <Avatar className="h-8 w-8 border-2 border-background">
                <AvatarFallback>MK</AvatarFallback>
              </Avatar>
              <Avatar className="h-8 w-8 border-2 border-background">
                <AvatarFallback>+2</AvatarFallback>
              </Avatar>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              4 active caregivers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content Area */}
      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="today">Today's Tasks</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="notes">Care Notes</TabsTrigger>
        </TabsList>
        <TabsContent value="today" className="space-y-4">
          {/* Task content here */}
        </TabsContent>
        <TabsContent value="medications" className="space-y-4">
          {/* Medication content here */}
        </TabsContent>
        <TabsContent value="notes" className="space-y-4">
          {/* Notes content here */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### 6.3 Notification & Alert Components

#### Emergency Alert System

```tsx
// Prompt: Create an emergency notification system using shadcn/ui Alert, Dialog,
// and Toast components with different urgency levels

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Bell, CheckCircle, Info, XCircle } from "lucide-react";

export function NotificationSystem() {
  const { toast } = useToast();

  return (
    <div className="space-y-4">
      {/* Emergency Alert */}
      <Alert className="border-red-500 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-900">
          Emergency: Missed Medication
        </AlertTitle>
        <AlertDescription className="text-red-700">
          Mom hasn't taken her heart medication for 2 doses.
          <Button
            variant="link"
            className="text-red-700 underline p-0 h-auto ml-1"
            onClick={() => {
              toast({
                title: "Calling Mom...",
                description: "Initiating voice call to check on medication",
              });
            }}
          >
            Call now
          </Button>
        </AlertDescription>
      </Alert>

      {/* Warning Alert */}
      <Alert className="border-yellow-500 bg-yellow-50">
        <Bell className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-900">
          Appointment Reminder
        </AlertTitle>
        <AlertDescription className="text-yellow-700">
          Dr. Johnson appointment tomorrow at 2:00 PM. Transportation arranged
          with John.
        </AlertDescription>
      </Alert>

      {/* Success Alert */}
      <Alert className="border-green-500 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-900">All Tasks Complete</AlertTitle>
        <AlertDescription className="text-green-700">
          Today's care tasks have been completed successfully.
        </AlertDescription>
      </Alert>

      {/* Critical Action Dialog */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">Emergency Contact</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Contact Emergency Services?</AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately call 911 and notify all care team members.
              Use only in genuine emergencies.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700">
              Call 911
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
```

### 6.4 Data Display Components

#### Care Team Table

```tsx
// Prompt: Build a care team management table using shadcn/ui Table, Badge,
// Avatar, and DropdownMenu components with sorting and actions

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Phone, Mail, Calendar } from "lucide-react";

export function CareTeamTable() {
  return (
    <Table>
      <TableCaption>
        Active care team members and their responsibilities
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Member</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Availability</TableHead>
          <TableHead>Last Active</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src="/avatars/01.png" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">John Doe</div>
              <div className="text-sm text-muted-foreground">Son</div>
            </div>
          </TableCell>
          <TableCell>
            <Badge>Primary Caregiver</Badge>
          </TableCell>
          <TableCell>
            <Badge variant="outline" className="text-green-600">
              Available
            </Badge>
          </TableCell>
          <TableCell>2 hours ago</TableCell>
          <TableCell className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem>
                  <Phone className="mr-2 h-4 w-4" />
                  Call
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Mail className="mr-2 h-4 w-4" />
                  Message
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>View profile</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
```

### 6.5 Voice & Chat Interface

#### AI Chat Component

```tsx
// Prompt: Create a voice-enabled chat interface using shadcn/ui Card, Input, Button,
// ScrollArea, and Avatar components with voice recording indicator

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Send, Bot, User } from "lucide-react";

export function VoiceChatInterface() {
  return (
    <Card className="w-full max-w-2xl h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-white">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">Care Assistant</h3>
              <Badge variant="outline" className="text-xs">
                Voice Enabled
              </Badge>
            </div>
          </div>
          <Badge className="bg-green-500">Online</Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4">
            {/* AI Message */}
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-white">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Card className="bg-muted">
                  <CardContent className="p-3">
                    <p className="text-sm">
                      Good morning! Mom took her morning medications on time
                      today. Her next dose is at 2 PM. Would you like me to set
                      a reminder?
                    </p>
                  </CardContent>
                </Card>
                <span className="text-xs text-muted-foreground">9:15 AM</span>
              </div>
            </div>

            {/* User Message */}
            <div className="flex gap-3 justify-end">
              <div className="flex-1 max-w-[70%]">
                <Card className="bg-primary text-primary-foreground">
                  <CardContent className="p-3">
                    <p className="text-sm">
                      Yes, please set a reminder. Also, can you check if she has
                      a doctor's appointment this week?
                    </p>
                  </CardContent>
                </Card>
                <span className="text-xs text-muted-foreground text-right block">
                  9:16 AM
                </span>
              </div>
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="border-t p-4">
        <div className="flex gap-2 w-full">
          <Button variant="outline" size="icon" className="shrink-0">
            <Mic className="h-4 w-4" />
          </Button>
          <Input
            placeholder="Type a message or click the mic to speak..."
            className="flex-1"
          />
          <Button size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
```

## 7. Best Practices & Guidelines

### 6.1 Theming

- Use semantic color variables for consistent theming
- Support both light and dark modes
- Test color contrast ratios (minimum 4.5:1 for normal text)
- Use CSS variables for dynamic theming

### 6.2 Component Development

- Follow the Atomic Design methodology
- Keep components small and focused
- Use TypeScript for type safety
- Document props and usage examples
- Implement proper loading and error states

### 6.3 Accessibility (a11y)

- Use semantic HTML elements
- Implement keyboard navigation
- Add proper ARIA attributes
- Ensure sufficient color contrast
- Support screen readers
- Test with keyboard-only navigation

### 6.4 Performance

- Optimize images and assets
- Implement code splitting
- Use dynamic imports for heavy components
- Leverage Next.js optimizations
- Monitor performance with Web Vitals

### 6.5 Code Organization

- Follow the project's directory structure
- Keep styles co-located with components
- Use consistent naming conventions
- Document complex logic
- Write unit tests for critical components

### 6.6 State Management

- Use React Context for global state
- Leverage React Query for server state
- Implement optimistic updates
- Handle loading and error states gracefully
- Use proper state cleanup

### 6.7 Forms

- Use React Hook Form for form handling
- Implement proper form validation
- Show clear error messages
- Support keyboard navigation
- Handle form submission states

### 6.8 Testing

- Write unit tests for components
- Test edge cases
- Implement integration tests
- Use snapshot testing for UI consistency
- Test across browsers and devices

### 6.9 Documentation

- Document component props and usage
- Include code examples
- Document accessibility considerations
- Keep README files up to date
- Document any known issues or limitations
