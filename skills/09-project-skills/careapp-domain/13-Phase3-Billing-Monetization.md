# Billing & Monetization PRP - Sustainable Voice-First Pricing

## Goal

Implement a financially sustainable pricing model that aligns costs with value delivery, ensuring profitability while maintaining accessibility for users who need comprehensive voice-based caregiving support.

## Why

- **Current Reality**: Voice-heavy users cost $40-100/month to serve
- **Market Constraint**: Competitors price at $10-30/month for basic plans
- **Business Necessity**: Must achieve positive unit economics to be viable
- **Value Alignment**: Users who benefit most from voice features should contribute proportionally

## What (User-Visible Behavior)

- **Transparent Usage Dashboard**: Real-time voice minute tracking
- **Smart Plan Recommendations**: AI suggests optimal plan based on usage patterns
- **Flexible Minute Packages**: Add-on bundles for temporary needs
- **Family Sharing**: Pool minutes across family members
- **Cost Controls**: Spending alerts and automatic caps

## Pricing Architecture

### Base Plan Structure

#### **Starter Plan - $19/month**

- **Target**: Light users, family monitors
- **Included**:
  - 30 voice minutes/month
  - Unlimited text chat
  - Basic health tracking
  - 1 family member
- **Overage**: $0.25/minute
- **Cost to Serve**: ~$8-12
- **Margin**: 37-58%

#### **Essential Plan - $49/month**

- **Target**: Active caregivers
- **Included**:
  - 150 voice minutes/month
  - All Starter features plus:
  - Medication reminders (SMS/Push)
  - Appointment scheduling
  - 3 family members
  - Weekly wellness check calls
- **Overage**: $0.20/minute
- **Cost to Serve**: ~$28-35
- **Margin**: 29-43%

#### **Professional Plan - $99/month**

- **Target**: Primary caregivers, high-needs situations
- **Included**:
  - 400 voice minutes/month
  - All Essential features plus:
  - Daily wellness calls
  - Proactive medication calls
  - Priority support
  - 5 family members
  - Care team coordination
- **Overage**: $0.15/minute
- **Cost to Serve**: ~$55-70
- **Margin**: 29-44%

#### **Enterprise/Facility - Custom Pricing**

- **Target**: Care facilities, agencies
- **Features**: Volume discounts, dedicated support, custom integrations
- **Pricing**: Based on number of residents/patients

### Add-On Minute Packages

```typescript
interface MinutePackage {
  name: string;
  minutes: number;
  price: number;
  costPerMinute: number;
  expiresInDays: number;
}

const minutePackages: MinutePackage[] = [
  {
    name: "Quick Boost",
    minutes: 50,
    price: 9.99,
    costPerMinute: 0.2,
    expiresInDays: 30,
  },
  {
    name: "Peace of Mind",
    minutes: 150,
    price: 24.99,
    costPerMinute: 0.17,
    expiresInDays: 60,
  },
  {
    name: "Crisis Support",
    minutes: 500,
    price: 74.99,
    costPerMinute: 0.15,
    expiresInDays: 90,
  },
];
```

### Smart Cost Optimization Features

#### **Intelligent Channel Routing**

```typescript
interface ChannelRouter {
  determineOptimalChannel(interaction: Interaction): Channel {
    // Prioritize cheaper channels when appropriate
    if (interaction.complexity === 'low' && !interaction.urgent) {
      return 'push_notification'; // Free
    }
    if (interaction.requiresResponse && interaction.complexity === 'medium') {
      return 'sms'; // $0.01
    }
    if (interaction.isEmergency || interaction.complexity === 'high') {
      return 'voice_call'; // $0.15/min
    }
    return 'web_voice'; // $0.14/min (slightly cheaper)
  }
}
```

#### **Usage Prediction & Alerts**

```typescript
interface UsageMonitor {
  async checkUsageHealth(userId: string): Promise<UsageAlert[]> {
    const alerts: UsageAlert[] = [];
    const usage = await this.getCurrentMonthUsage(userId);
    const plan = await this.getUserPlan(userId);
    const daysRemaining = this.getDaysRemainingInBillingCycle();

    // Predict if user will exceed minutes
    const projectedUsage = (usage.minutes / (30 - daysRemaining)) * 30;

    if (projectedUsage > plan.includedMinutes * 0.8) {
      alerts.push({
        type: 'approaching_limit',
        message: `You're on track to use ${Math.round(projectedUsage)} minutes this month`,
        recommendation: this.suggestOptimalPlan(projectedUsage)
      });
    }

    // Suggest plan upgrade if consistently over
    if (usage.overageCharges > plan.monthlyPrice * 0.5) {
      alerts.push({
        type: 'plan_upgrade_recommended',
        message: 'You could save money with a higher plan',
        savings: this.calculatePotentialSavings(usage, plan)
      });
    }

    return alerts;
  }
}
```

### Family Pooling System

```typescript
interface FamilyPool {
  id: string;
  primaryAccountId: string;
  members: FamilyMember[];
  totalMinutes: number;
  usedMinutes: number;

  // Intelligent distribution
  minuteAllocation: {
    userId: string;
    reservedMinutes: number; // For critical needs (medications)
    sharedPoolAccess: boolean;
  }[];
}

class FamilyPoolManager {
  async allocateMinutes(poolId: string): Promise<void> {
    const pool = await this.getPool(poolId);

    // Reserve minutes for critical needs first
    for (const member of pool.members) {
      if (member.hasCriticalMedications) {
        // Reserve 3 minutes/day for medication calls
        pool.minuteAllocation.push({
          userId: member.id,
          reservedMinutes: 90,
          sharedPoolAccess: true,
        });
      }
    }

    // Remaining minutes go to shared pool
    const sharedMinutes =
      pool.totalMinutes -
      pool.minuteAllocation.reduce((sum, a) => sum + a.reservedMinutes, 0);

    await this.updatePoolAllocation(
      poolId,
      pool.minuteAllocation,
      sharedMinutes,
    );
  }
}
```

## Implementation Blueprint

### 1. Usage Tracking System (/lib/billing/UsageTracker.ts)

```typescript
import { Redis } from "@upstash/redis";
import { createClient } from "@supabase/supabase-js";

export class UsageTracker {
  private redis: Redis;
  private supabase: ReturnType<typeof createClient>;

  async trackVoiceUsage(params: {
    userId: string;
    callId: string;
    duration: number; // seconds
    channel: "web_voice" | "phone_call";
    purpose: string;
  }): Promise<UsageRecord> {
    const minutes = Math.ceil(params.duration / 60);
    const cost = this.calculateCost(minutes, params.channel);

    // Real-time tracking in Redis
    const currentUsage = await this.redis.hincrby(
      `usage:${params.userId}:${this.getCurrentMonth()}`,
      "minutes",
      minutes,
    );

    // Persistent storage in Supabase
    const record = await this.supabase
      .from("usage_records")
      .insert({
        user_id: params.userId,
        call_id: params.callId,
        duration_seconds: params.duration,
        duration_minutes: minutes,
        channel: params.channel,
        purpose: params.purpose,
        cost: cost,
        timestamp: new Date().toISOString(),
      })
      .select()
      .single();

    // Check if approaching limits
    await this.checkUsageLimits(params.userId, currentUsage);

    return record;
  }

  private async checkUsageLimits(
    userId: string,
    currentMinutes: number,
  ): Promise<void> {
    const plan = await this.getUserPlan(userId);
    const remainingMinutes = plan.includedMinutes - currentMinutes;

    if (remainingMinutes <= 30 && remainingMinutes > 0) {
      await this.sendLowMinuteWarning(userId, remainingMinutes);
    } else if (remainingMinutes <= 0) {
      await this.notifyOverageStarted(userId);
    }

    // Auto-upgrade suggestion
    if (currentMinutes > plan.includedMinutes * 1.5) {
      await this.suggestPlanUpgrade(userId, currentMinutes);
    }
  }
}
```

### 2. Billing Dashboard Component (/components/billing/UsageDashboard.tsx)

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { TrendingUp, Clock, DollarSign, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export function UsageDashboard({ userId }: { userId: string }) {
  const { data: usage, isLoading } = useQuery({
    queryKey: ['usage', userId],
    queryFn: () => fetchUserUsage(userId),
    refetchInterval: 60000 // Refresh every minute
  });

  if (isLoading) return <LoadingSpinner />;

  const percentUsed = (usage.minutesUsed / usage.plan.includedMinutes) * 100;
  const daysRemaining = usage.daysRemainingInCycle;
  const projectedUsage = (usage.minutesUsed / (30 - daysRemaining)) * 30;
  const isOverage = usage.minutesUsed > usage.plan.includedMinutes;

  return (
    <div className="space-y-6">
      {/* Usage Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Voice Minutes Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">
                  {usage.minutesUsed} / {usage.plan.includedMinutes} minutes
                </span>
                <span className="text-sm font-medium">
                  {daysRemaining} days left
                </span>
              </div>
              <Progress value={Math.min(percentUsed, 100)} />
            </div>

            {isOverage && (
              <Alert className="bg-orange-50">
                <AlertDescription>
                  You've exceeded your included minutes.
                  Overage charges: ${usage.overageCharges.toFixed(2)}
                </AlertDescription>
              </Alert>
            )}

            {projectedUsage > usage.plan.includedMinutes && !isOverage && (
              <Alert>
                <AlertDescription>
                  At your current pace, you'll use ~{Math.round(projectedUsage)} minutes
                  this month. Consider adding a minute package.
                </AlertDescription>
                <Button size="sm" className="mt-2">Add Minutes</Button>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cost Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Current Month Costs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Base Plan ({usage.plan.name})</span>
              <span className="font-medium">${usage.plan.price}</span>
            </div>
            {usage.overageCharges > 0 && (
              <div className="flex justify-between text-orange-600">
                <span>Overage Charges</span>
                <span className="font-medium">
                  ${usage.overageCharges.toFixed(2)}
                </span>
              </div>
            )}
            {usage.addOnPackages.length > 0 && (
              <div className="flex justify-between">
                <span>Add-on Packages</span>
                <span className="font-medium">
                  ${usage.addOnPackages.reduce((sum, p) => sum + p.price, 0).toFixed(2)}
                </span>
              </div>
            )}
            <div className="border-t pt-3 flex justify-between font-medium">
              <span>Total This Month</span>
              <span>${usage.totalCharges.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage by Type */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {usage.breakdown.map((item) => (
              <div key={item.type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{item.label}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">{item.minutes} min</div>
                  <div className="text-xs text-gray-500">
                    {item.percentage}% of usage
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Family Pool Status */}
      {usage.familyPool && (
        <Card>
          <CardHeader>
            <CardTitle>Family Pool</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress
                value={(usage.familyPool.usedMinutes / usage.familyPool.totalMinutes) * 100}
              />
              <div className="grid grid-cols-2 gap-4 text-sm">
                {usage.familyPool.members.map((member) => (
                  <div key={member.id} className="flex justify-between">
                    <span>{member.name}</span>
                    <span className="font-medium">{member.minutesUsed} min</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Smart Recommendations */}
      {usage.recommendations.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Smart Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {usage.recommendations.map((rec, i) => (
                <div key={i} className="p-3 bg-white rounded-lg">
                  <p className="text-sm font-medium">{rec.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{rec.description}</p>
                  {rec.potentialSavings && (
                    <p className="text-xs text-green-600 mt-1">
                      Save ~${rec.potentialSavings}/month
                    </p>
                  )}
                  <Button size="sm" variant="outline" className="mt-2">
                    {rec.action}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

### 3. Plan Management API (/app/api/billing/plans/route.ts)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
);

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { action, planId, minutePackageId } = await req.json();

  try {
    switch (action) {
      case "upgrade_plan":
        return await handlePlanUpgrade(userId, planId);

      case "add_minutes":
        return await handleAddMinutes(userId, minutePackageId);

      case "set_spending_limit":
        return await handleSetSpendingLimit(userId, req);

      case "enable_auto_upgrade":
        return await handleAutoUpgrade(userId, req);

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Billing error:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}

async function handlePlanUpgrade(userId: string, newPlanId: string) {
  // Get current usage to prorate
  const currentUsage = await getMonthlyUsage(userId);
  const currentPlan = await getCurrentPlan(userId);
  const newPlan = await getPlanDetails(newPlanId);

  // Calculate proration
  const daysRemaining = getDaysRemainingInBillingCycle();
  const proratedCredit = (currentPlan.price / 30) * daysRemaining;
  const proratedCharge = (newPlan.price / 30) * daysRemaining;

  // Update Stripe subscription
  const subscription = await stripe.subscriptions.update(
    currentPlan.stripeSubscriptionId,
    {
      items: [
        {
          id: currentPlan.stripeItemId,
          price: newPlan.stripePriceId,
        },
      ],
      proration_behavior: "create_prorations",
    },
  );

  // Update database
  await supabase
    .from("user_subscriptions")
    .update({
      plan_id: newPlanId,
      updated_at: new Date().toISOString(),
      included_minutes: newPlan.includedMinutes,
      overage_rate: newPlan.overageRate,
    })
    .eq("user_id", userId);

  // Send confirmation email
  await sendPlanChangeEmail(userId, currentPlan, newPlan, proratedCredit);

  return NextResponse.json({
    success: true,
    message: "Plan upgraded successfully",
    prorated_credit: proratedCredit,
    prorated_charge: proratedCharge,
    new_plan: newPlan,
  });
}

async function handleAddMinutes(userId: string, packageId: string) {
  const minutePackage = await getMinutePackage(packageId);

  // Create Stripe charge
  const charge = await stripe.charges.create({
    amount: minutePackage.price * 100, // Convert to cents
    currency: "usd",
    customer: await getStripeCustomerId(userId),
    description: `${minutePackage.name} - ${minutePackage.minutes} minutes`,
    metadata: {
      userId,
      packageId,
      minutes: minutePackage.minutes.toString(),
    },
  });

  // Add minutes to user's account
  await supabase.from("minute_packages").insert({
    user_id: userId,
    package_id: packageId,
    minutes_total: minutePackage.minutes,
    minutes_remaining: minutePackage.minutes,
    expires_at: new Date(
      Date.now() + minutePackage.expiresInDays * 24 * 60 * 60 * 1000,
    ),
    stripe_charge_id: charge.id,
  });

  return NextResponse.json({
    success: true,
    message: `Added ${minutePackage.minutes} minutes to your account`,
    expires_in_days: minutePackage.expiresInDays,
  });
}
```

## Task Checklist

### Core Billing Infrastructure

- [ ] Implement usage tracking with Redis and Supabase
- [ ] Build Stripe subscription management
- [ ] Create minute package system
- [ ] Set up proration calculations
- [ ] Implement spending limits and controls

### User Interface

- [ ] Build usage dashboard with real-time updates
- [ ] Create plan comparison and upgrade flow
- [ ] Design minute package purchase UI
- [ ] Implement family pool management
- [ ] Add spending alerts and notifications

### Smart Features

- [ ] Build usage prediction algorithm
- [ ] Create intelligent channel routing
- [ ] Implement auto-upgrade suggestions
- [ ] Design cost optimization recommendations
- [ ] Build usage analytics and reporting

### Integration Points

- [ ] Connect with voice tracking system
- [ ] Integrate with Retell AI callbacks
- [ ] Link to notification system
- [ ] Connect with family management
- [ ] Integrate with support system

## Validation Loop

### Level 1: Unit Tests

```bash
npm test -- billing/usage-tracker
npm test -- billing/plan-manager
npm test -- billing/minute-packages
```

### Level 2: Integration Tests

```bash
npm test -- billing/stripe-integration
npm test -- billing/usage-limits
npm test -- billing/family-pools
```

### Level 3: End-to-End Tests

```bash
npm run test:e2e:plan-upgrade
npm run test:e2e:minute-purchase
npm run test:e2e:overage-handling
```

## Success Criteria

- [ ] Positive unit economics on all plans (>25% margin)
- [ ] <5% of users hit hard spending limits
- [ ] 80% of high-usage users upgrade within 2 months
- [ ] <2% billing disputes
- [ ] 90% of users stay within or near their plan limits
- [ ] Family pools reduce individual overage by 40%

## Revenue Projections (1000 Users)

### User Distribution (Estimated)

- Starter (40%): 400 users × $19 = $7,600
- Essential (45%): 450 users × $49 = $22,050
- Professional (15%): 150 users × $99 = $14,850
- **Base Revenue**: $44,500/month

### Additional Revenue Streams

- Overage charges: ~$3,500/month
- Minute packages: ~$2,500/month
- Family add-ons: ~$1,500/month
- **Total Revenue**: ~$52,000/month

### Cost Structure

- Voice/SMS costs: ~$28,000/month
- Infrastructure: ~$2,000/month
- Third-party APIs: ~$3,000/month
- **Total Costs**: ~$33,000/month
- **Gross Margin**: ~37% ($19,000/month)

## Common Gotchas

- Stripe proration can be complex with mid-cycle changes
- Usage tracking must be real-time to prevent overages
- Family pools need careful concurrency handling
- Minute packages expiration needs clear communication
- Auto-upgrade logic must have safeguards
- International calling rates vary significantly
- Redis persistence needed for usage tracking reliability# Sustainable Pricing Model PRP - Caregiving Companion

## Goal

Implement a financially sustainable pricing model that aligns costs with value delivery, ensuring profitability while maintaining accessibility for users who need comprehensive voice-based caregiving support.

## Why

- **Current Reality**: Voice-heavy users cost $40-100/month to serve
- **Market Constraint**: Competitors price at $10-30/month for basic plans
- **Business Necessity**: Must achieve positive unit economics to be viable
- **Value Alignment**: Users who benefit most from voice features should contribute proportionally

## What (User-Visible Behavior)

- **Transparent Usage Dashboard**: Real-time voice minute tracking
- **Smart Plan Recommendations**: AI suggests optimal plan based on usage patterns
- **Flexible Minute Packages**: Add-on bundles for temporary needs
- **Family Sharing**: Pool minutes across family members
- **Cost Controls**: Spending alerts and automatic caps

## Pricing Architecture

### Base Plan Structure

#### **Starter Plan - $19/month**

- **Target**: Light users, family monitors
- **Included**:
  - 30 voice minutes/month
  - Unlimited text chat
  - Basic health tracking
  - 1 family member
- **Overage**: $0.25/minute
- **Cost to Serve**: ~$8-12
- **Margin**: 37-58%

#### **Essential Plan - $49/month**

- **Target**: Active caregivers
- **Included**:
  - 150 voice minutes/month
  - All Starter features plus:
  - Medication reminders (SMS/Push)
  - Appointment scheduling
  - 3 family members
  - Weekly wellness check calls
- **Overage**: $0.20/minute
- **Cost to Serve**: ~$28-35
- **Margin**: 29-43%

#### **Professional Plan - $99/month**

- **Target**: Primary caregivers, high-needs situations
- **Included**:
  - 400 voice minutes/month
  - All Essential features plus:
  - Daily wellness calls
  - Proactive medication calls
  - Priority support
  - 5 family members
  - Care team coordination
- **Overage**: $0.15/minute
- **Cost to Serve**: ~$55-70
- **Margin**: 29-44%

#### **Enterprise/Facility - Custom Pricing**

- **Target**: Care facilities, agencies
- **Features**: Volume discounts, dedicated support, custom integrations
- **Pricing**: Based on number of residents/patients

### Add-On Minute Packages

```typescript
interface MinutePackage {
  name: string;
  minutes: number;
  price: number;
  costPerMinute: number;
  expiresInDays: number;
}

const minutePackages: MinutePackage[] = [
  {
    name: "Quick Boost",
    minutes: 50,
    price: 9.99,
    costPerMinute: 0.2,
    expiresInDays: 30,
  },
  {
    name: "Peace of Mind",
    minutes: 150,
    price: 24.99,
    costPerMinute: 0.17,
    expiresInDays: 60,
  },
  {
    name: "Crisis Support",
    minutes: 500,
    price: 74.99,
    costPerMinute: 0.15,
    expiresInDays: 90,
  },
];
```

### Smart Cost Optimization Features

#### **Intelligent Channel Routing**

```typescript
interface ChannelRouter {
  determineOptimalChannel(interaction: Interaction): Channel {
    // Prioritize cheaper channels when appropriate
    if (interaction.complexity === 'low' && !interaction.urgent) {
      return 'push_notification'; // Free
    }
    if (interaction.requiresResponse && interaction.complexity === 'medium') {
      return 'sms'; // $0.01
    }
    if (interaction.isEmergency || interaction.complexity === 'high') {
      return 'voice_call'; // $0.15/min
    }
    return 'web_voice'; // $0.14/min (slightly cheaper)
  }
}
```

#### **Usage Prediction & Alerts**

```typescript
interface UsageMonitor {
  async checkUsageHealth(userId: string): Promise<UsageAlert[]> {
    const alerts: UsageAlert[] = [];
    const usage = await this.getCurrentMonthUsage(userId);
    const plan = await this.getUserPlan(userId);
    const daysRemaining = this.getDaysRemainingInBillingCycle();

    // Predict if user will exceed minutes
    const projectedUsage = (usage.minutes / (30 - daysRemaining)) * 30;

    if (projectedUsage > plan.includedMinutes * 0.8) {
      alerts.push({
        type: 'approaching_limit',
        message: `You're on track to use ${Math.round(projectedUsage)} minutes this month`,
        recommendation: this.suggestOptimalPlan(projectedUsage)
      });
    }

    // Suggest plan upgrade if consistently over
    if (usage.overageCharges > plan.monthlyPrice * 0.5) {
      alerts.push({
        type: 'plan_upgrade_recommended',
        message: 'You could save money with a higher plan',
        savings: this.calculatePotentialSavings(usage, plan)
      });
    }

    return alerts;
  }
}
```

### Family Pooling System

```typescript
interface FamilyPool {
  id: string;
  primaryAccountId: string;
  members: FamilyMember[];
  totalMinutes: number;
  usedMinutes: number;

  // Intelligent distribution
  minuteAllocation: {
    userId: string;
    reservedMinutes: number; // For critical needs (medications)
    sharedPoolAccess: boolean;
  }[];
}

class FamilyPoolManager {
  async allocateMinutes(poolId: string): Promise<void> {
    const pool = await this.getPool(poolId);

    // Reserve minutes for critical needs first
    for (const member of pool.members) {
      if (member.hasCriticalMedications) {
        // Reserve 3 minutes/day for medication calls
        pool.minuteAllocation.push({
          userId: member.id,
          reservedMinutes: 90,
          sharedPoolAccess: true,
        });
      }
    }

    // Remaining minutes go to shared pool
    const sharedMinutes =
      pool.totalMinutes -
      pool.minuteAllocation.reduce((sum, a) => sum + a.reservedMinutes, 0);

    await this.updatePoolAllocation(
      poolId,
      pool.minuteAllocation,
      sharedMinutes,
    );
  }
}
```

## Implementation Blueprint

### 1. Usage Tracking System (/lib/billing/UsageTracker.ts)

```typescript
import { Redis } from "@upstash/redis";
import { createClient } from "@supabase/supabase-js";

export class UsageTracker {
  private redis: Redis;
  private supabase: ReturnType<typeof createClient>;

  async trackVoiceUsage(params: {
    userId: string;
    callId: string;
    duration: number; // seconds
    channel: "web_voice" | "phone_call";
    purpose: string;
  }): Promise<UsageRecord> {
    const minutes = Math.ceil(params.duration / 60);
    const cost = this.calculateCost(minutes, params.channel);

    // Real-time tracking in Redis
    const currentUsage = await this.redis.hincrby(
      `usage:${params.userId}:${this.getCurrentMonth()}`,
      "minutes",
      minutes,
    );

    // Persistent storage in Supabase
    const record = await this.supabase
      .from("usage_records")
      .insert({
        user_id: params.userId,
        call_id: params.callId,
        duration_seconds: params.duration,
        duration_minutes: minutes,
        channel: params.channel,
        purpose: params.purpose,
        cost: cost,
        timestamp: new Date().toISOString(),
      })
      .select()
      .single();

    // Check if approaching limits
    await this.checkUsageLimits(params.userId, currentUsage);

    return record;
  }

  private async checkUsageLimits(
    userId: string,
    currentMinutes: number,
  ): Promise<void> {
    const plan = await this.getUserPlan(userId);
    const remainingMinutes = plan.includedMinutes - currentMinutes;

    if (remainingMinutes <= 30 && remainingMinutes > 0) {
      await this.sendLowMinuteWarning(userId, remainingMinutes);
    } else if (remainingMinutes <= 0) {
      await this.notifyOverageStarted(userId);
    }

    // Auto-upgrade suggestion
    if (currentMinutes > plan.includedMinutes * 1.5) {
      await this.suggestPlanUpgrade(userId, currentMinutes);
    }
  }
}
```

### 2. Billing Dashboard Component (/components/billing/UsageDashboard.tsx)

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { TrendingUp, Clock, DollarSign, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export function UsageDashboard({ userId }: { userId: string }) {
  const { data: usage, isLoading } = useQuery({
    queryKey: ['usage', userId],
    queryFn: () => fetchUserUsage(userId),
    refetchInterval: 60000 // Refresh every minute
  });

  if (isLoading) return <LoadingSpinner />;

  const percentUsed = (usage.minutesUsed / usage.plan.includedMinutes) * 100;
  const daysRemaining = usage.daysRemainingInCycle;
  const projectedUsage = (usage.minutesUsed / (30 - daysRemaining)) * 30;
  const isOverage = usage.minutesUsed > usage.plan.includedMinutes;

  return (
    <div className="space-y-6">
      {/* Usage Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Voice Minutes Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">
                  {usage.minutesUsed} / {usage.plan.includedMinutes} minutes
                </span>
                <span className="text-sm font-medium">
                  {daysRemaining} days left
                </span>
              </div>
              <Progress value={Math.min(percentUsed, 100)} />
            </div>

            {isOverage && (
              <Alert className="bg-orange-50">
                <AlertDescription>
                  You've exceeded your included minutes.
                  Overage charges: ${usage.overageCharges.toFixed(2)}
                </AlertDescription>
              </Alert>
            )}

            {projectedUsage > usage.plan.includedMinutes && !isOverage && (
              <Alert>
                <AlertDescription>
                  At your current pace, you'll use ~{Math.round(projectedUsage)} minutes
                  this month. Consider adding a minute package.
                </AlertDescription>
                <Button size="sm" className="mt-2">Add Minutes</Button>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cost Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Current Month Costs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Base Plan ({usage.plan.name})</span>
              <span className="font-medium">${usage.plan.price}</span>
            </div>
            {usage.overageCharges > 0 && (
              <div className="flex justify-between text-orange-600">
                <span>Overage Charges</span>
                <span className="font-medium">
                  ${usage.overageCharges.toFixed(2)}
                </span>
              </div>
            )}
            {usage.addOnPackages.length > 0 && (
              <div className="flex justify-between">
                <span>Add-on Packages</span>
                <span className="font-medium">
                  ${usage.addOnPackages.reduce((sum, p) => sum + p.price, 0).toFixed(2)}
                </span>
              </div>
            )}
            <div className="border-t pt-3 flex justify-between font-medium">
              <span>Total This Month</span>
              <span>${usage.totalCharges.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage by Type */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {usage.breakdown.map((item) => (
              <div key={item.type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{item.label}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium">{item.minutes} min</div>
                  <div className="text-xs text-gray-500">
                    {item.percentage}% of usage
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Family Pool Status */}
      {usage.familyPool && (
        <Card>
          <CardHeader>
            <CardTitle>Family Pool</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress
                value={(usage.familyPool.usedMinutes / usage.familyPool.totalMinutes) * 100}
              />
              <div className="grid grid-cols-2 gap-4 text-sm">
                {usage.familyPool.members.map((member) => (
                  <div key={member.id} className="flex justify-between">
                    <span>{member.name}</span>
                    <span className="font-medium">{member.minutesUsed} min</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Smart Recommendations */}
      {usage.recommendations.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Smart Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {usage.recommendations.map((rec, i) => (
                <div key={i} className="p-3 bg-white rounded-lg">
                  <p className="text-sm font-medium">{rec.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{rec.description}</p>
                  {rec.potentialSavings && (
                    <p className="text-xs text-green-600 mt-1">
                      Save ~${rec.potentialSavings}/month
                    </p>
                  )}
                  <Button size="sm" variant="outline" className="mt-2">
                    {rec.action}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

### 3. Plan Management API (/app/api/billing/plans/route.ts)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
);

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { action, planId, minutePackageId } = await req.json();

  try {
    switch (action) {
      case "upgrade_plan":
        return await handlePlanUpgrade(userId, planId);

      case "add_minutes":
        return await handleAddMinutes(userId, minutePackageId);

      case "set_spending_limit":
        return await handleSetSpendingLimit(userId, req);

      case "enable_auto_upgrade":
        return await handleAutoUpgrade(userId, req);

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Billing error:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}

async function handlePlanUpgrade(userId: string, newPlanId: string) {
  // Get current usage to prorate
  const currentUsage = await getMonthlyUsage(userId);
  const currentPlan = await getCurrentPlan(userId);
  const newPlan = await getPlanDetails(newPlanId);

  // Calculate proration
  const daysRemaining = getDaysRemainingInBillingCycle();
  const proratedCredit = (currentPlan.price / 30) * daysRemaining;
  const proratedCharge = (newPlan.price / 30) * daysRemaining;

  // Update Stripe subscription
  const subscription = await stripe.subscriptions.update(
    currentPlan.stripeSubscriptionId,
    {
      items: [
        {
          id: currentPlan.stripeItemId,
          price: newPlan.stripePriceId,
        },
      ],
      proration_behavior: "create_prorations",
    },
  );

  // Update database
  await supabase
    .from("user_subscriptions")
    .update({
      plan_id: newPlanId,
      updated_at: new Date().toISOString(),
      included_minutes: newPlan.includedMinutes,
      overage_rate: newPlan.overageRate,
    })
    .eq("user_id", userId);

  // Send confirmation email
  await sendPlanChangeEmail(userId, currentPlan, newPlan, proratedCredit);

  return NextResponse.json({
    success: true,
    message: "Plan upgraded successfully",
    prorated_credit: proratedCredit,
    prorated_charge: proratedCharge,
    new_plan: newPlan,
  });
}

async function handleAddMinutes(userId: string, packageId: string) {
  const minutePackage = await getMinutePackage(packageId);

  // Create Stripe charge
  const charge = await stripe.charges.create({
    amount: minutePackage.price * 100, // Convert to cents
    currency: "usd",
    customer: await getStripeCustomerId(userId),
    description: `${minutePackage.name} - ${minutePackage.minutes} minutes`,
    metadata: {
      userId,
      packageId,
      minutes: minutePackage.minutes.toString(),
    },
  });

  // Add minutes to user's account
  await supabase.from("minute_packages").insert({
    user_id: userId,
    package_id: packageId,
    minutes_total: minutePackage.minutes,
    minutes_remaining: minutePackage.minutes,
    expires_at: new Date(
      Date.now() + minutePackage.expiresInDays * 24 * 60 * 60 * 1000,
    ),
    stripe_charge_id: charge.id,
  });

  return NextResponse.json({
    success: true,
    message: `Added ${minutePackage.minutes} minutes to your account`,
    expires_in_days: minutePackage.expiresInDays,
  });
}
```

## Task Checklist

### Core Billing Infrastructure

- [ ] Implement usage tracking with Redis and Supabase
- [ ] Build Stripe subscription management
- [ ] Create minute package system
- [ ] Set up proration calculations
- [ ] Implement spending limits and controls

### User Interface

- [ ] Build usage dashboard with real-time updates
- [ ] Create plan comparison and upgrade flow
- [ ] Design minute package purchase UI
- [ ] Implement family pool management
- [ ] Add spending alerts and notifications

### Smart Features

- [ ] Build usage prediction algorithm
- [ ] Create intelligent channel routing
- [ ] Implement auto-upgrade suggestions
- [ ] Design cost optimization recommendations
- [ ] Build usage analytics and reporting

### Integration Points

- [ ] Connect with voice tracking system
- [ ] Integrate with Retell AI callbacks
- [ ] Link to notification system
- [ ] Connect with family management
- [ ] Integrate with support system

## Validation Loop

### Level 1: Unit Tests

```bash
npm test -- billing/usage-tracker
npm test -- billing/plan-manager
npm test -- billing/minute-packages
```

### Level 2: Integration Tests

```bash
npm test -- billing/stripe-integration
npm test -- billing/usage-limits
npm test -- billing/family-pools
```

### Level 3: End-to-End Tests

```bash
npm run test:e2e:plan-upgrade
npm run test:e2e:minute-purchase
npm run test:e2e:overage-handling
```

## Success Criteria

- [ ] Positive unit economics on all plans (>25% margin)
- [ ] <5% of users hit hard spending limits
- [ ] 80% of high-usage users upgrade within 2 months
- [ ] <2% billing disputes
- [ ] 90% of users stay within or near their plan limits
- [ ] Family pools reduce individual overage by 40%

## Revenue Projections (1000 Users)

### User Distribution (Estimated)

- Starter (40%): 400 users × $19 = $7,600
- Essential (45%): 450 users × $49 = $22,050
- Professional (15%): 150 users × $99 = $14,850
- **Base Revenue**: $44,500/month

### Additional Revenue Streams

- Overage charges: ~$3,500/month
- Minute packages: ~$2,500/month
- Family add-ons: ~$1,500/month
- **Total Revenue**: ~$52,000/month

### Cost Structure

- Voice/SMS costs: ~$28,000/month
- Infrastructure: ~$2,000/month
- Third-party APIs: ~$3,000/month
- **Total Costs**: ~$33,000/month
- **Gross Margin**: ~37% ($19,000/month)

## Common Gotchas

- Stripe proration can be complex with mid-cycle changes
- Usage tracking must be real-time to prevent overages
- Family pools need careful concurrency handling
- Minute packages expiration needs clear communication
- Auto-upgrade logic must have safeguards
- International calling rates vary significantly
- Redis persistence needed for usage tracking reliability
