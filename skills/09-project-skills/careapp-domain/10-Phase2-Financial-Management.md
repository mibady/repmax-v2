# Financial Management Pages PRP - Caregiving Companion

## Goal

Build comprehensive financial management interfaces including bill tracking, spending analytics, account management, and budget monitoring, integrated with voice commands and secure multi-user access controls.

## Why

- Centralize all financial information for elder care expenses
- Enable quick bill payments and expense tracking via voice
- Provide spending insights and budget alerts for families
- Support multiple authorized users with role-based access
- Ensure secure handling of sensitive financial data

## What (User-Visible Behavior)

- **Bill Tracking**: Visual dashboard with payment due dates
- **Expense Analytics**: Charts showing spending patterns by category
- **Account Management**: Secure storage of account information
- **Budget Monitoring**: Alerts for overspending and upcoming bills
- **Payment Workflow**: Streamlined bill payment with confirmations
- **Fraud Protection**: AI-powered detection of unusual charges and scams
- **Elder Financial Abuse Prevention**: Real-time monitoring for exploitation

## All Needed Context

### Documentation References

- React Hook Form: https://react-hook-form.com/docs
- Recharts: https://recharts.org/en-US/guide
- React Table: https://tanstack.com/table/latest/docs/framework/react/overview
- Plaid API: https://plaid.com/docs/api/ (for bank integration)
- Stripe Connect: https://stripe.com/docs/connect (for payments)

### Package Dependencies

```json
{
  "dependencies": {
    "@hookform/resolvers": "^3.9.0",
    "@stripe/react-stripe-js": "^2.7.3",
    "@stripe/stripe-js": "^4.1.0",
    "@tanstack/react-query": "^5.0.0",
    "@tanstack/react-table": "^8.19.3",
    "@upstash/redis": "^1.34.0",
    "@vercel/analytics": "^1.2.0",
    "@vercel/speed-insights": "^1.1.0",
    "currency.js": "^2.0.4",
    "date-fns": "^3.6.0",
    "lucide-react": "^0.350.0",
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.53.0",
    "recharts": "^2.12.0",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "autoprefixer": "^10.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "14.0.0",
    "postcss": "^8.0.0",
    "tailwindcss": "^3.0.0",
    "typescript": "^5.0.0"
  }
}
```

### Tech Stack Alignment

- **Frontend**: Next.js 15 + React 18 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Next.js API Routes + Server Actions
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Caching & Real-time**: Redis Cloud
- **Auth**: Clerk (organization-based permissions with financial access roles)
- **Payments**: Stripe for secure payment processing
- **Bank Integration**: Direct bank API integration via Supabase Edge Functions
- **Voice**: Retell AI for voice commands and interactions
- **AI**: Claude AI for financial insights and natural language processing
- **Monitoring**: Sentry for error tracking
- **Analytics**: Vercel Analytics and Speed Insights
- **Email**: Resend for transaction receipts and alerts

### Critical Implementation Notes

#### Security & Compliance

- **Row Level Security (RLS)**: All Supabase tables must have strict RLS policies
- **Data Encryption**:
  - Encrypt sensitive data at rest using Supabase Vault
  - Use HTTPS for all API communications
  - Implement field-level encryption for PII
- **PCI Compliance**:
  - Never store full payment card details
  - Use Stripe Elements for secure card input
  - Store only tokenized payment methods
- **Rate Limiting**:
  - Implement Redis-based rate limiting on all financial endpoints
  - Set appropriate rate limits for different user roles

#### Performance & Reliability

- **Caching Strategy**:
  - Use Redis to cache frequently accessed financial data
  - Implement cache invalidation for real-time updates
  - Cache time-to-live (TTL) based on data sensitivity
- **Error Handling**:
  - Implement comprehensive error boundaries
  - Log all financial transactions and errors to Sentry
  - Provide user-friendly error messages

#### Voice Integration

- **Voice Commands**:
  - Integrate with Retell AI for natural language processing
  - Support voice commands for common financial actions
  - Provide visual confirmation for voice actions
- **Security**:
  - Require voice authentication for sensitive operations
  - Implement voice command validation
  - Log all voice interactions for auditing

#### Audit & Compliance

- **Transaction Logging**:
  - Log all financial transactions with user context
  - Store immutable audit logs in a separate database
  - Implement log rotation and archival
- **Access Control**:
  - Implement role-based access control (RBAC)
  - Require 2FA for financial operations
  - Log all access to sensitive financial data

#### Fraud Detection & Prevention

- **Transaction Monitoring**:
  - Flag transactions 2x larger than typical spending
  - Alert on first-time payees or merchants
  - Detect sudden spending pattern changes
  - Monitor for known scam patterns
- **Elder Financial Abuse Protection**:
  - Track unusual account access patterns
  - Monitor for rapid depletion of funds
  - Alert family on suspicious activity
  - Implement transaction approval thresholds
- **AI-Powered Analysis**:
  - Machine learning for anomaly detection
  - Pattern recognition for common scams
  - Real-time risk scoring
  - Predictive fraud alerts

## Implementation Blueprint

### 1. Financial Hub Layout (/app/finances/layout.tsx)

```typescript
import { Sidebar } from '@/components/finances/Sidebar';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { FinancialAccessGuard } from '@/components/finances/FinancialAccessGuard';
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function FinancesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="member">
      <FinancialAccessGuard>
        <div className="flex h-full">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-gray-50">
            <Suspense fallback={<LoadingSpinner />}>
              {children}
            </Suspense>
          </main>
        </div>
      </FinancialAccessGuard>
    </ProtectedRoute>
  );
}
```

### 2. Financial Overview Page (/app/finances/page.tsx)

```typescript
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, TrendingUp, AlertTriangle, CreditCard, Calendar } from 'lucide-react';
import { SpendingChart } from '@/components/finances/SpendingChart';
import { UpcomingBills } from '@/components/finances/UpcomingBills';
import { RecentTransactions } from '@/components/finances/RecentTransactions';
import { BudgetAlerts } from '@/components/finances/BudgetAlerts';
import { VoiceCommands } from '@/components/finances/VoiceCommands';
import {
  fetchFinancialSummary,
  fetchUpcomingBills,
  fetchRecentTransactions
} from '@/lib/api/finances';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import currency from 'currency.js';

export default function FinancesOverviewPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['financial-summary', selectedPeriod],
    queryFn: () => fetchFinancialSummary(selectedPeriod),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    onError: (error) => {
      console.error('Error fetching financial summary:', error);
      Sentry.captureException(error, {
        tags: { component: 'financial-summary' }
      });
    },
  });

  const { data: upcomingBills } = useQuery({
    queryKey: ['upcoming-bills'],
    queryFn: fetchUpcomingBills,
    refetchInterval: 300000, // 5 minutes
  });

  const { data: recentTransactions } = useQuery({
    queryKey: ['recent-transactions'],
    queryFn: () => fetchRecentTransactions(10),
  });

  const handleVoiceCommand = async (command: string) => {
    try {
      // Process voice command using Claude AI for better intent recognition
      const response = await fetch('/api/voice/process-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, context: 'financial' })
      });

      const { action, params } = await response.json();

      switch (action) {
        case 'navigate':
          router.push(params.route);
          break;
        case 'filter':
          setSelectedPeriod(params.period);
          break;
        case 'search':
          // Handle search functionality
          break;
        default:
          console.log('Command not recognized');
      }

      // Log voice command for analytics
      await fetch('/api/analytics/voice-command', {
        method: 'POST',
        body: JSON.stringify({ command, action, params })
      });

    } catch (error) {
      console.error('Error processing voice command:', error);
      Sentry.captureException(error, {
        tags: { component: 'voice-command', context: 'financial' }
      });
    }
  };

  const summaryCards = [
    {
      title: 'Monthly Spending',
      value: currency(summary?.monthlySpending || 0).format(),
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: summary?.spendingChange,
    },
    {
      title: 'Upcoming Bills',
      value: upcomingBills?.length || 0,
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      subtitle: `${currency(upcomingBills?.reduce((sum, bill) => sum + bill.amount, 0) || 0).format()} due`,
    },
    {
      title: 'Account Balance',
      value: currency(summary?.totalBalance || 0).format(),
      icon: CreditCard,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: summary?.balanceChange,
    },
    {
      title: 'Budget Status',
      value: `${summary?.budgetUsed || 0}%`,
      icon: TrendingUp,
      color: summary?.budgetUsed > 90 ? 'text-red-600' : 'text-purple-600',
      bgColor: summary?.budgetUsed > 90 ? 'bg-red-100' : 'bg-purple-100',
      subtitle: 'of monthly budget',
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Overview</h1>
          <p className="text-gray-600">Monitor expenses and manage bills</p>
        </div>
        <div className="flex gap-2">
          {['week', 'month', 'quarter'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 text-sm rounded-lg capitalize ${
                selectedPeriod === period
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Voice Commands */}
      <VoiceCommands
        commands={[
          'Pay bills',
          'Show spending',
          'Check budget',
          'Add expense',
        ]}
        onCommand={handleVoiceCommand}
      />

      {/* Budget Alerts */}
      <BudgetAlerts />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <div key={card.title} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
                {card.change && (
                  <span className={`text-sm font-medium ${
                    card.change > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {card.change > 0 ? '+' : ''}{card.change}%
                  </span>
                )}
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">{card.title}</h3>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              {card.subtitle && (
                <p className="text-sm text-gray-500 mt-1">{card.subtitle}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Spending Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
          <SpendingChart
            data={summary?.categorySpending}
            period={selectedPeriod}
          />
        </div>

        {/* Upcoming Bills */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Upcoming Bills</h3>
          <UpcomingBills bills={upcomingBills?.slice(0, 5)} />
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
        <RecentTransactions transactions={recentTransactions} />
      </div>
    </div>
  );
}
```

### 3. Bills Management Page (/app/finances/bills/page.tsx)

```typescript
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Calendar, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BillForm } from '@/components/finances/BillForm';
import { BillCard } from '@/components/finances/BillCard';
import { PaymentModal } from '@/components/finances/PaymentModal';
import { BillsTable } from '@/components/finances/BillsTable';
import { VoiceCommands } from '@/components/finances/VoiceCommands';
import { fetchBills, createBill, payBill } from '@/lib/api/finances';
import { format, isToday, isTomorrow, isPast } from 'date-fns';

export default function BillsPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const queryClient = useQueryClient();

  const { data: bills, isLoading } = useQuery({
    queryKey: ['bills', filterStatus],
    queryFn: () => fetchBills({ status: filterStatus }),
  });

  const createMutation = useMutation({
    mutationFn: createBill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      setShowForm(false);
    },
  });

  const payMutation = useMutation({
    mutationFn: payBill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      setShowPaymentModal(false);
      setSelectedBill(null);
    },
  });

  const handleVoiceCommand = async (command: string) => {
    if (command.includes('pay')) {
      // Extract bill name or show payment modal
      const billName = extractBillName(command, bills);
      if (billName) {
        const bill = bills.find(b =>
          b.payee.toLowerCase().includes(billName.toLowerCase())
        );
        if (bill) {
          setSelectedBill(bill);
          setShowPaymentModal(true);
        }
      } else {
        setShowPaymentModal(true);
      }
    } else if (command.includes('add') || command.includes('create')) {
      setShowForm(true);
    }
  };

  const getBillPriority = (bill: any) => {
    const dueDate = new Date(bill.due_date);
    if (isPast(dueDate) && bill.status === 'pending') return 'overdue';
    if (isToday(dueDate)) return 'due-today';
    if (isTomorrow(dueDate)) return 'due-tomorrow';
    return 'upcoming';
  };

  const groupedBills = bills?.reduce((groups, bill) => {
    const priority = getBillPriority(bill);
    if (!groups[priority]) groups[priority] = [];
    groups[priority].push(bill);
    return groups;
  }, {} as Record<string, any[]>);

  const priorityConfig = {
    overdue: {
      label: 'Overdue',
      color: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      icon: AlertCircle,
    },
    'due-today': {
      label: 'Due Today',
      color: 'text-orange-700',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      icon: Clock,
    },
    'due-tomorrow': {
      label: 'Due Tomorrow',
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      icon: Calendar,
    },
    upcoming: {
      label: 'Upcoming',
      color: 'text-gray-700',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      icon: CheckCircle,
    },
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bills & Payments</h1>
          <p className="text-gray-600">Manage bill payments and recurring expenses</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPaymentModal(true)}
            className="flex items-center gap-2"
          >
            <DollarSign className="w-4 h-4" />
            Pay Bill
          </Button>
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Bill
          </Button>
        </div>
      </div>

      {/* Voice Commands */}
      <VoiceCommands
        commands={[
          'Pay [bill name]',
          'Add new bill',
          'Show overdue bills',
          'Mark as paid',
        ]}
        onCommand={handleVoiceCommand}
      />

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {['all', 'pending', 'paid', 'overdue'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 text-sm rounded-lg capitalize ${
              filterStatus === status
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Bills by Priority */}
      <div className="space-y-6">
        {Object.entries(priorityConfig).map(([priority, config]) => {
          const billsInPriority = groupedBills?.[priority] || [];
          if (billsInPriority.length === 0) return null;

          const Icon = config.icon;

          return (
            <div key={priority} className={`rounded-lg border ${config.borderColor} ${config.bgColor} p-6`}>
              <div className="flex items-center gap-3 mb-4">
                <Icon className={`w-5 h-5 ${config.color}`} />
                <h3 className={`text-lg font-semibold ${config.color}`}>
                  {config.label} ({billsInPriority.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {billsInPriority.map((bill) => (
                  <BillCard
                    key={bill.id}
                    bill={bill}
                    onPay={() => {
                      setSelectedBill(bill);
                      setShowPaymentModal(true);
                    }}
                    onEdit={() => {
                      setSelectedBill(bill);
                      setShowForm(true);
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* All Bills Table */}
      {filterStatus === 'all' && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">All Bills</h3>
          <BillsTable
            bills={bills}
            onPay={(bill) => {
              setSelectedBill(bill);
              setShowPaymentModal(true);
            }}
            onEdit={(bill) => {
              setSelectedBill(bill);
              setShowForm(true);
            }}
          />
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <BillForm
          bill={selectedBill}
          onClose={() => {
            setShowForm(false);
            setSelectedBill(null);
          }}
          onSubmit={createMutation.mutate}
          isLoading={createMutation.isPending}
        />
      )}

      {showPaymentModal && (
        <PaymentModal
          bill={selectedBill}
          bills={bills?.filter(b => b.status === 'pending')}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedBill(null);
          }}
          onSubmit={payMutation.mutate}
          isLoading={payMutation.isPending}
        />
      )}
    </div>
  );
}
```

### 4. Fraud Detection Component (/components/finances/FraudDetection.tsx)

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Shield, AlertTriangle, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';

interface FraudAlert {
  id: string;
  type: 'unusual_amount' | 'new_payee' | 'pattern_change' | 'known_scam' | 'rapid_depletion';
  severity: 'low' | 'medium' | 'high' | 'critical';
  transaction: {
    id: string;
    amount: number;
    payee: string;
    date: string;
    category: string;
  };
  description: string;
  recommendedAction: string;
  requiresApproval: boolean;
}

interface FraudSettings {
  enableMonitoring: boolean;
  unusualAmountThreshold: number;  // 2x normal by default
  alertNewPayees: boolean;
  blockSuspiciousTransactions: boolean;
  requireApprovalAbove: number;
  notifyFamily: boolean;
  elderAbuseProtection: boolean;
}

export function FraudDetection({ patientId }: { patientId: string }) {
  const [settings, setSettings] = useState<FraudSettings>({
    enableMonitoring: true,
    unusualAmountThreshold: 2,
    alertNewPayees: true,
    blockSuspiciousTransactions: false,
    requireApprovalAbove: 500,
    notifyFamily: true,
    elderAbuseProtection: true,
  });

  // Fetch fraud alerts
  const { data: alerts, isLoading, refetch } = useQuery({
    queryKey: ['fraud-alerts', patientId],
    queryFn: async () => {
      const response = await fetch(`/api/finances/fraud-alerts/${patientId}`);
      if (!response.ok) throw new Error('Failed to fetch fraud alerts');
      return response.json();
    },
    refetchInterval: 30000, // Check every 30 seconds
  });

  // Fetch fraud risk score
  const { data: riskScore } = useQuery({
    queryKey: ['fraud-risk-score', patientId],
    queryFn: async () => {
      const response = await fetch(`/api/finances/fraud-risk/${patientId}`);
      if (!response.ok) throw new Error('Failed to fetch risk score');
      return response.json();
    },
  });

  // Handle alert actions
  const handleAlertAction = useMutation({
    mutationFn: async ({ alertId, action }: { alertId: string; action: 'approve' | 'block' | 'investigate' }) => {
      const response = await fetch(`/api/finances/fraud-alerts/${alertId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!response.ok) throw new Error('Failed to process action');
      return response.json();
    },
    onSuccess: () => {
      refetch();
      toast({
        title: 'Action Processed',
        description: 'The fraud alert has been handled.',
      });
    },
  });

  // Update fraud settings
  const updateSettings = useMutation({
    mutationFn: async (newSettings: FraudSettings) => {
      const response = await fetch(`/api/finances/fraud-settings/${patientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      if (!response.ok) throw new Error('Failed to update settings');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Settings Updated',
        description: 'Fraud protection settings have been saved.',
      });
    },
  });

  // Check for critical alerts
  const criticalAlerts = alerts?.filter((a: FraudAlert) => a.severity === 'critical');
  const hasElderAbuseRisk = alerts?.some((a: FraudAlert) => a.type === 'rapid_depletion');

  return (
    <div className="space-y-6">
      {/* Critical Alert Banner */}
      {criticalAlerts?.length > 0 && (
        <Alert className="border-red-500 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-900">Critical Security Alert</AlertTitle>
          <AlertDescription className="text-red-800">
            {criticalAlerts.length} critical fraud alert(s) require immediate attention.
            {hasElderAbuseRisk && ' Potential elder financial abuse detected.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Fraud Risk Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Fraud Protection Status
            </span>
            <Badge variant={riskScore?.level === 'low' ? 'success' : riskScore?.level === 'high' ? 'destructive' : 'warning'}>
              {riskScore?.level || 'Unknown'} Risk
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Security Score</span>
                <span>{riskScore?.score || 0}/100</span>
              </div>
              <Progress value={riskScore?.score || 0} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {riskScore?.blockedThisMonth || 0}
                </p>
                <p className="text-sm text-gray-600">Threats Blocked</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  ${riskScore?.savedThisMonth || 0}
                </p>
                <p className="text-sm text-gray-600">Saved This Month</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Active Fraud Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          {alerts && alerts.length > 0 ? (
            <div className="space-y-4">
              {alerts.map((alert: FraudAlert) => (
                <div key={alert.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={
                          alert.severity === 'critical' ? 'destructive' :
                          alert.severity === 'high' ? 'warning' :
                          'secondary'
                        }>
                          {alert.severity}
                        </Badge>
                        <span className="text-sm font-medium">{alert.type.replace(/_/g, ' ')}</span>
                      </div>

                      <p className="text-sm text-gray-600 mb-2">{alert.description}</p>

                      <div className="bg-gray-50 rounded p-2 mb-3">
                        <p className="text-xs text-gray-500">Transaction Details:</p>
                        <p className="text-sm">
                          ${alert.transaction.amount} to {alert.transaction.payee}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(alert.transaction.date).toLocaleDateString()}
                        </p>
                      </div>

                      <p className="text-sm font-medium text-blue-600 mb-3">
                        Recommended: {alert.recommendedAction}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {alert.requiresApproval && (
                      <>
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleAlertAction.mutate({ alertId: alert.id, action: 'approve' })}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleAlertAction.mutate({ alertId: alert.id, action: 'block' })}
                        >
                          Block
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAlertAction.mutate({ alertId: alert.id, action: 'investigate' })}
                    >
                      Investigate
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No active fraud alerts. All transactions appear normal.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Protection Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Protection Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium">Fraud Monitoring</p>
                <p className="text-sm text-gray-600">Monitor all transactions for suspicious activity</p>
              </div>
              <Switch
                checked={settings.enableMonitoring}
                onCheckedChange={(checked) => {
                  const newSettings = { ...settings, enableMonitoring: checked };
                  setSettings(newSettings);
                  updateSettings.mutate(newSettings);
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium">Elder Abuse Protection</p>
                <p className="text-sm text-gray-600">Extra protection against financial exploitation</p>
              </div>
              <Switch
                checked={settings.elderAbuseProtection}
                onCheckedChange={(checked) => {
                  const newSettings = { ...settings, elderAbuseProtection: checked };
                  setSettings(newSettings);
                  updateSettings.mutate(newSettings);
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium">Block Suspicious Transactions</p>
                <p className="text-sm text-gray-600">Automatically block high-risk transactions</p>
              </div>
              <Switch
                checked={settings.blockSuspiciousTransactions}
                onCheckedChange={(checked) => {
                  const newSettings = { ...settings, blockSuspiciousTransactions: checked };
                  setSettings(newSettings);
                  updateSettings.mutate(newSettings);
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium">Family Notifications</p>
                <p className="text-sm text-gray-600">Alert family members of suspicious activity</p>
              </div>
              <Switch
                checked={settings.notifyFamily}
                onCheckedChange={(checked) => {
                  const newSettings = { ...settings, notifyFamily: checked };
                  setSettings(newSettings);
                  updateSettings.mutate(newSettings);
                }}
              />
            </div>

            <div className="pt-2">
              <label className="text-sm font-medium">Approval Required Above</label>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm">$</span>
                <input
                  type="number"
                  value={settings.requireApprovalAbove}
                  onChange={(e) => {
                    const newSettings = { ...settings, requireApprovalAbove: parseInt(e.target.value) };
                    setSettings(newSettings);
                  }}
                  onBlur={() => updateSettings.mutate(settings)}
                  className="w-24 px-2 py-1 border rounded"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 5. Spending Analytics Page (/app/finances/analytics/page.tsx)

```typescript
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Download, Filter, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SpendingChart } from '@/components/finances/SpendingChart';
import { CategoryBreakdown } from '@/components/finances/CategoryBreakdown';
import { TrendAnalysis } from '@/components/finances/TrendAnalysis';
import { ExpenseHeatmap } from '@/components/finances/ExpenseHeatmap';
import { VoiceCommands } from '@/components/finances/VoiceCommands';
import { fetchSpendingAnalytics, exportSpendingReport } from '@/lib/api/finances';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

export default function SpendingAnalyticsPage() {
  const [dateRange, setDateRange] = useState({
    from: subMonths(startOfMonth(new Date()), 5),
    to: endOfMonth(new Date()),
  });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [chartType, setChartType] = useState('line');

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['spending-analytics', dateRange, selectedCategory],
    queryFn: () => fetchSpendingAnalytics({
      startDate: dateRange.from,
      endDate: dateRange.to,
      category: selectedCategory,
    }),
  });

  const handleVoiceCommand = async (command: string) => {
    if (command.includes('export') || command.includes('download')) {
      await exportSpendingReport(dateRange);
    } else if (command.includes('category')) {
      // Extract category name from command
      const category = extractCategoryName(command, analytics?.categories);
      if (category) {
        setSelectedCategory(category);
      }
    } else if (command.includes('chart') || command.includes('graph')) {
      setChartType(chartType === 'line' ? 'bar' : 'line');
    }
  };

  const insights = [
    {
      title: 'Monthly Average',
      value: analytics?.monthlyAverage,
      format: 'currency',
      trend: analytics?.monthlyTrend,
    },
    {
      title: 'Highest Category',
      value: analytics?.highestCategory?.name,
      subtitle: analytics?.highestCategory?.amount,
      format: 'text',
    },
    {
      title: 'Savings Rate',
      value: analytics?.savingsRate,
      format: 'percentage',
      trend: analytics?.savingsTrend,
    },
    {
      title: 'Budget Variance',
      value: analytics?.budgetVariance,
      format: 'currency',
      trend: analytics?.budgetTrend,
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Spending Analytics</h1>
          <p className="text-gray-600">Analyze spending patterns and trends</p>
        </div>
        <div className="flex gap-2">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
          />
          <Button
            variant="outline"
            onClick={() => exportSpendingReport(dateRange)}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Voice Commands */}
      <VoiceCommands
        commands={[
          'Show [category] spending',
          'Export report',
          'Change chart type',
          'Show monthly trend',
        ]}
        onCommand={handleVoiceCommand}
      />

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {insights.map((insight) => (
          <div key={insight.title} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">{insight.title}</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {insight.format === 'currency' && '$'}
                  {insight.value}
                  {insight.format === 'percentage' && '%'}
                </p>
                {insight.subtitle && (
                  <p className="text-sm text-gray-500">${insight.subtitle}</p>
                )}
              </div>
              {insight.trend && (
                <div className={`flex items-center ${
                  insight.trend > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">
                    {Math.abs(insight.trend)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Main Chart */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Spending Trend</h3>
          <div className="flex gap-2">
            {['line', 'bar', 'area'].map((type) => (
              <button
                key={type}
                onClick={() => setChartType(type)}
                className={`px-3 py-1 text-sm rounded capitalize ${
                  chartType === type
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        <SpendingChart
          data={analytics?.trendData}
          type={chartType}
          height={400}
        />
      </div>

      {/* Category Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
          <CategoryBreakdown
            data={analytics?.categoryData}
            onCategoryClick={setSelectedCategory}
            selectedCategory={selectedCategory}
          />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Trend Analysis</h3>
          <TrendAnalysis
            data={analytics?.trendAnalysis}
            category={selectedCategory}
          />
        </div>
      </div>

      {/* Expense Heatmap */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Spending Heatmap</h3>
        <ExpenseHeatmap
          data={analytics?.heatmapData}
          dateRange={dateRange}
        />
      </div>
    </div>
  );
}
```

### 5. Financial Sidebar Component (/components/finances/Sidebar.tsx)

```typescript
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  DollarSign,
  CreditCard,
  PieChart,
  Receipt,
  TrendingUp,
  Settings,
  Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  {
    name: 'Overview',
    href: '/finances',
    icon: DollarSign,
  },
  {
    name: 'Bills & Payments',
    href: '/finances/bills',
    icon: Receipt,
  },
  {
    name: 'Accounts',
    href: '/finances/accounts',
    icon: Building2,
  },
  {
    name: 'Analytics',
    href: '/finances/analytics',
    icon: PieChart,
  },
  {
    name: 'Budget',
    href: '/finances/budget',
    icon: TrendingUp,
  },
  {
    name: 'Settings',
    href: '/finances/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">Financial Management</h2>
      </div>

      <nav className="space-y-1 px-3">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
```

### 6. Financial Access Guard (/components/finances/FinancialAccessGuard.tsx)

```typescript
'use client';

import { useOrganization, useUser } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import { Shield, Lock } from 'lucide-react';
import { checkFinancialAccess } from '@/lib/api/finances';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface FinancialAccessGuardProps {
  children: React.ReactNode;
}

export function FinancialAccessGuard({ children }: FinancialAccessGuardProps) {
  const { user } = useUser();
  const { organization, membership } = useOrganization();

  const { data: hasAccess, isLoading } = useQuery({
    queryKey: ['financial-access', user?.id, organization?.id],
    queryFn: () => checkFinancialAccess(),
    enabled: !!user && !!organization,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
          <div className="p-4 bg-amber-100 rounded-full w-16 h-16 mx-auto mb-4">
            <Lock className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Financial Access Required
          </h2>
          <p className="text-gray-600 mb-4">
            You need financial management permissions to access this section.
            Please contact your organization administrator.
          </p>
          <div className="text-sm text-gray-500">
            Current role: {membership?.role}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
```

## Task Checklist

### Page Development

- [ ] Create financial hub layout with secure sidebar
- [ ] Build overview dashboard with spending insights
- [ ] Implement bills management with payment workflow
- [ ] Create spending analytics with trend analysis
- [ ] Build account management with bank integration
- [ ] Design budget tracking with alerts

### Financial Components

- [ ] BillForm with recurring payment setup
- [ ] PaymentModal with Stripe integration
- [ ] SpendingChart with multiple visualizations
- [ ] CategoryBreakdown with drill-down capability
- [ ] BudgetTracker with variance analysis
- [ ] AccountConnector with Plaid integration

### Security Features

- [ ] Financial access control guards
- [ ] Encrypted storage for account data
- [ ] PCI compliant payment handling
- [ ] Audit trail for all transactions
- [ ] Role-based financial permissions
- [ ] Two-factor auth for payments

### Voice Integration

- [ ] Voice commands for bill payments
- [ ] Expense logging via voice
- [ ] Budget status queries
- [ ] Payment confirmations
- [ ] Financial report requests

### Data Analytics

- [ ] Spending trend analysis
- [ ] Category comparison charts
- [ ] Budget variance tracking
- [ ] Cash flow projections
- [ ] Tax preparation reports

## Validation Loop

### Level 1: Component Testing

```bash
npm test -- finances/BillForm.test.tsx
npm test -- finances/PaymentModal.test.tsx
npm test -- finances/SpendingChart.test.tsx
```

### Level 2: Security Testing

```bash
npm run test:financial-security
npm run test:payment-flow
npm run test:access-control
```

### Level 3: Integration Testing

```bash
npm run test:stripe-integration
npm run test:plaid-connection
npm run test:voice-payments
```

### Level 4: Compliance Testing

```bash
npm run test:pci-compliance
npm run test:data-encryption
npm run test:audit-trail
```

## Success Criteria

- [ ] All financial pages load in < 2 seconds
- [ ] Payment processing completes in < 10 seconds
- [ ] Voice commands have 95%+ accuracy for payments
- [ ] Charts render smoothly with 1000+ transactions
- [ ] Bank account linking works with major institutions
- [ ] All financial data properly encrypted at rest

## Common Gotchas

- Stripe requires HTTPS for production payments
- Plaid integration needs proper webhook handling
- Voice payment commands need confirmation steps
- Chart performance degrades with large datasets
- Financial data requires enhanced RLS policies
- PCI compliance limits how card data is handled
