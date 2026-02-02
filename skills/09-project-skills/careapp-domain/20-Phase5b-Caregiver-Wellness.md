# Caregiver Wellness & Burnout Prevention PRP - Caregiving Companion

## Goal

Build a comprehensive caregiver wellness system that monitors stress levels, prevents burnout, provides self-care reminders, connects to support resources, and helps maintain the caregiver's mental and physical health while caring for their loved one.

## Why

- 40-70% of family caregivers show clinically significant symptoms of depression
- Caregiver burnout leads to poor care outcomes and health crises for both parties
- Caregivers often neglect their own health, leading to chronic conditions
- Support and recognition significantly improve caregiver resilience
- Healthy caregivers provide better, more sustainable care

## What (User-Visible Behavior)

- **Wellness Dashboard**: Personal health metrics and stress indicators
- **Burnout Assessment**: Regular check-ins with validated screening tools
- **Self-Care Reminders**: Personalized nudges for breaks, exercise, social time
- **Achievement Recognition**: Celebrate milestones and daily wins
- **Support Groups**: Connect with other caregivers in similar situations
- **Respite Planning**: Help scheduling breaks and backup care
- **Resource Library**: Articles, videos, and tools for caregiver health
- **Emergency Support**: 24/7 crisis helpline access

## All Needed Context

### Documentation References

- Zarit Burden Interview: https://www.apa.org/pi/about/publications/caregivers/practice-settings/assessment/tools/zarit
- PHQ-9 Depression Screening: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC1495268/
- Caregiver Self-Assessment: https://www.caregiverstress.com/stress-management/caregiver-self-assessment/
- Support Group Best Practices: https://www.caregiver.org/resource/support-groups/

### Package Dependencies

```json
{
  "dependencies": {
    "@hookform/resolvers": "^3.9.0",
    "@radix-ui/react-progress": "^1.1.0",
    "@radix-ui/react-tabs": "^1.1.0",
    "@tanstack/react-query": "^5.0.0",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.350.0",
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-hook-form": "^7.53.0",
    "recharts": "^2.12.0",
    "zod": "^3.23.8"
  }
}
```

### Critical Implementation Notes

#### Wellness Monitoring

- **Stress Detection**:
  - Analyze interaction patterns (frequency, tone, urgency)
  - Track care task completion rates
  - Monitor time spent on caregiving activities
  - Detect signs of overwhelm through app usage

#### Support Systems

- **Peer Support**:
  - Anonymous support groups by care condition
  - Moderated forums with professional oversight
  - One-on-one peer mentoring options
  - Success story sharing

#### Self-Care Integration

- **Smart Scheduling**:
  - Identify optimal times for breaks
  - Coordinate with family for coverage
  - Integrate with calendar for protected time
  - Remind without guilt or pressure

## Implementation Blueprint

### 1. Caregiver Wellness Dashboard (/app/wellness/page.tsx)

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Heart, Brain, Users, Trophy, Calendar, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BurnoutAssessment } from '@/components/wellness/BurnoutAssessment';
import { SelfCareTracker } from '@/components/wellness/SelfCareTracker';
import { SupportGroups } from '@/components/wellness/SupportGroups';
import { AchievementBadges } from '@/components/wellness/AchievementBadges';
import { motion } from 'framer-motion';

interface WellnessMetrics {
  stressLevel: number; // 0-100
  burnoutRisk: 'low' | 'moderate' | 'high' | 'critical';
  lastBreak: Date;
  caregivingHoursWeek: number;
  selfCareMinutesWeek: number;
  moodTrend: 'improving' | 'stable' | 'declining';
  supportGroupActivity: number;
  achievements: Achievement[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  earnedAt: Date;
  icon: string;
}

export default function CaregiverWellnessPage() {
  const [showAssessment, setShowAssessment] = useState(false);

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['caregiver-wellness'],
    queryFn: async () => {
      const response = await fetch('/api/wellness/metrics');
      if (!response.ok) throw new Error('Failed to fetch wellness metrics');
      return response.json();
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  const { data: dailyTip } = useQuery({
    queryKey: ['daily-tip'],
    queryFn: async () => {
      const response = await fetch('/api/wellness/daily-tip');
      return response.json();
    },
  });

  // Check if it's time for a wellness check
  useEffect(() => {
    const lastCheck = localStorage.getItem('lastWellnessCheck');
    const daysSince = lastCheck
      ? (Date.now() - new Date(lastCheck).getTime()) / (1000 * 60 * 60 * 24)
      : 7;

    if (daysSince >= 7) {
      setShowAssessment(true);
    }
  }, []);

  const getBurnoutColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'moderate': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header with Personal Greeting */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Your Wellness Dashboard
        </h1>
        <p className="text-gray-600">
          Remember: You can't pour from an empty cup. Taking care of yourself helps you care for others.
        </p>
      </div>

      {/* Burnout Risk Alert */}
      {metrics?.burnoutRisk === 'high' || metrics?.burnoutRisk === 'critical' ? (
        <Alert className="mb-6 border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Important:</strong> Your stress levels indicate you may be experiencing caregiver burnout.
            Consider taking a break or reaching out to your support network.
            <Button
              variant="link"
              className="text-orange-700 underline p-0 ml-2"
              onClick={() => setShowAssessment(true)}
            >
              Take wellness assessment
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Stress Level</p>
                <p className="text-2xl font-bold">{metrics?.stressLevel || 0}%</p>
              </div>
              <Brain className="w-8 h-8 text-blue-500" />
            </div>
            <Progress value={metrics?.stressLevel || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Burnout Risk</p>
                <p className={`text-lg font-bold ${getBurnoutColor(metrics?.burnoutRisk || 'low')}`}>
                  {metrics?.burnoutRisk || 'Low'}
                </p>
              </div>
              <Heart className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Last Break</p>
                <p className="text-lg font-bold">
                  {metrics?.lastBreak
                    ? `${Math.floor((Date.now() - new Date(metrics.lastBreak).getTime()) / (1000 * 60 * 60))}h ago`
                    : 'Not tracked'}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Achievements</p>
                <p className="text-2xl font-bold">{metrics?.achievements?.length || 0}</p>
              </div>
              <Trophy className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Tip */}
      {dailyTip && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">Today's Self-Care Tip</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-800">{dailyTip.message}</p>
              {dailyTip.action && (
                <Button variant="outline" className="mt-4" size="sm">
                  {dailyTip.action}
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="self-care">Self-Care</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Caregiving vs Self-Care Balance */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Time Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Caregiving</span>
                      <span>{metrics?.caregivingHoursWeek || 0} hours</span>
                    </div>
                    <Progress value={75} className="h-3" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Self-Care</span>
                      <span>{Math.floor((metrics?.selfCareMinutesWeek || 0) / 60)} hours</span>
                    </div>
                    <Progress value={25} className="h-3 bg-green-100" />
                  </div>
                  <p className="text-sm text-gray-600 mt-4">
                    Recommended: 2+ hours of self-care for every 10 hours of caregiving
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Mood Tracker */}
            <Card>
              <CardHeader>
                <CardTitle>Your Mood Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <MoodChart data={metrics?.moodHistory} />
                <p className="text-sm text-gray-600 mt-4">
                  Trend: <span className="font-medium">{metrics?.moodTrend || 'Stable'}</span>
                </p>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Self-Care Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Break
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Join Support Group
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Heart className="w-4 h-4 mr-2" />
                    Breathing Exercise
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Brain className="w-4 h-4 mr-2" />
                    Meditation
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Resources */}
            <Card>
              <CardHeader>
                <CardTitle>Helpful Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-blue-600 hover:underline text-sm">
                      📚 Caregiver's Guide to Self-Care
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-blue-600 hover:underline text-sm">
                      🎥 5-Minute Stress Relief Videos
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-blue-600 hover:underline text-sm">
                      📞 24/7 Caregiver Support Hotline
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-blue-600 hover:underline text-sm">
                      🏃 Quick Exercise Routines
                    </a>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="self-care">
          <SelfCareTracker userId={user?.id} />
        </TabsContent>

        <TabsContent value="support">
          <SupportGroups userId={user?.id} />
        </TabsContent>

        <TabsContent value="achievements">
          <AchievementBadges achievements={metrics?.achievements} />
        </TabsContent>
      </Tabs>

      {/* Burnout Assessment Modal */}
      {showAssessment && (
        <BurnoutAssessment
          onClose={() => {
            setShowAssessment(false);
            localStorage.setItem('lastWellnessCheck', new Date().toISOString());
          }}
          onComplete={(results) => {
            // Process assessment results
            console.log('Assessment results:', results);
          }}
        />
      )}
    </div>
  );
}
```

### 2. Self-Care Reminder System (/components/wellness/SelfCareReminders.tsx)

```typescript
'use client';

import { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Bell, Coffee, Heart, Moon, Sun, Users } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface Reminder {
  id: string;
  type: 'break' | 'exercise' | 'social' | 'meal' | 'sleep' | 'gratitude';
  message: string;
  time: string;
  frequency: 'daily' | 'weekly' | 'as_needed';
  enabled: boolean;
}

export function SelfCareReminders({ userId }: { userId: string }) {
  // Set up periodic check for reminders
  useEffect(() => {
    const checkReminders = async () => {
      const response = await fetch(`/api/wellness/check-reminders/${userId}`);
      const reminders = await response.json();

      reminders.forEach((reminder: Reminder) => {
        if (reminder.enabled && shouldShowReminder(reminder)) {
          showReminder(reminder);
        }
      });
    };

    // Check every 30 minutes
    const interval = setInterval(checkReminders, 30 * 60 * 1000);
    checkReminders(); // Initial check

    return () => clearInterval(interval);
  }, [userId]);

  const shouldShowReminder = (reminder: Reminder): boolean => {
    const now = new Date();
    const reminderTime = new Date();
    const [hours, minutes] = reminder.time.split(':');
    reminderTime.setHours(parseInt(hours), parseInt(minutes));

    // Check if within 5 minutes of reminder time
    const diff = Math.abs(now.getTime() - reminderTime.getTime());
    return diff < 5 * 60 * 1000;
  };

  const showReminder = (reminder: Reminder) => {
    const icons = {
      break: Coffee,
      exercise: Heart,
      social: Users,
      meal: Sun,
      sleep: Moon,
      gratitude: Heart,
    };

    const Icon = icons[reminder.type];

    toast({
      title: "Self-Care Reminder",
      description: reminder.message,
      action: (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => handleComplete(reminder.id)}>
            Done
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleSnooze(reminder.id)}>
            Snooze
          </Button>
        </div>
      ),
    });

    // Also send notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Self-Care Reminder', {
        body: reminder.message,
        icon: '/icons/heart.png',
        tag: reminder.id,
      });
    }
  };

  const handleComplete = async (reminderId: string) => {
    await fetch(`/api/wellness/reminders/${reminderId}/complete`, {
      method: 'POST',
    });

    // Award points for self-care
    toast({
      title: "Great job!",
      description: "You earned 10 wellness points for taking care of yourself!",
    });
  };

  const handleSnooze = async (reminderId: string) => {
    await fetch(`/api/wellness/reminders/${reminderId}/snooze`, {
      method: 'POST',
      body: JSON.stringify({ minutes: 30 }),
    });
  };

  return null; // This is a background component
}
```

### 3. Support Group Component (/components/wellness/SupportGroups.tsx)

```typescript
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, MessageCircle, Calendar, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface SupportGroup {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  nextMeeting?: Date;
  isPrivate: boolean;
  isMember: boolean;
}

export function SupportGroups({ userId }: { userId: string }) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: groups, isLoading } = useQuery({
    queryKey: ['support-groups', selectedCategory],
    queryFn: async () => {
      const response = await fetch(`/api/wellness/support-groups?category=${selectedCategory}`);
      return response.json();
    },
  });

  const { data: myGroups } = useQuery({
    queryKey: ['my-support-groups', userId],
    queryFn: async () => {
      const response = await fetch(`/api/wellness/my-groups/${userId}`);
      return response.json();
    },
  });

  const categories = [
    'all',
    'Dementia Care',
    'Alzheimer\'s',
    'Cancer Care',
    'Parkinson\'s',
    'Stroke Recovery',
    'General Caregiving',
  ];

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* My Groups */}
      {myGroups && myGroups.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Support Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myGroups.map((group: SupportGroup) => (
                <div key={group.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-medium">{group.name}</p>
                      {group.nextMeeting && (
                        <p className="text-sm text-gray-600">
                          Next meeting: {new Date(group.nextMeeting).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Enter
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Groups */}
      <Card>
        <CardHeader>
          <CardTitle>Find Support Groups</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groups?.map((group: SupportGroup) => (
              <div key={group.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium flex items-center gap-2">
                      {group.name}
                      {group.isPrivate && <Lock className="w-3 h-3" />}
                    </h3>
                    <Badge variant="secondary" className="mt-1">
                      {group.category}
                    </Badge>
                  </div>
                  <span className="text-sm text-gray-600">
                    {group.memberCount} members
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-4">{group.description}</p>

                {group.nextMeeting && (
                  <p className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Next: {new Date(group.nextMeeting).toLocaleDateString()}
                  </p>
                )}

                <Button
                  size="sm"
                  variant={group.isMember ? 'secondary' : 'default'}
                  className="w-full"
                >
                  {group.isMember ? 'View Group' : 'Join Group'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

## Validation (Must be executable)

### Level 1: Syntax & Type Checking

```bash
npm run build
npm run type-check
```

### Level 2: Component Testing

```bash
npm run test -- wellness/
npm run test:e2e -- --spec wellness
```

### Level 3: Integration Testing

```bash
# Test wellness metrics API
curl -X GET http://localhost:3000/api/wellness/metrics \
  -H "Authorization: Bearer $AUTH_TOKEN"

# Test burnout assessment submission
curl -X POST http://localhost:3000/api/wellness/assessment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "responses": {
      "stress_level": 7,
      "sleep_quality": 4,
      "social_support": 6
    }
  }'
```

## Task List Validation

- [ ] Wellness dashboard displays correctly
- [ ] Burnout assessment triggers at appropriate intervals
- [ ] Self-care reminders fire on schedule
- [ ] Support groups load and filter properly
- [ ] Achievements track and display
- [ ] Stress metrics calculate accurately
- [ ] Integration with main app navigation
- [ ] Mobile responsive design
- [ ] Analytics tracking works
- [ ] Crisis resources accessible

## Gotchas

1. **Privacy**: Support group discussions must be anonymous/pseudonymous
2. **Moderation**: Support groups need professional oversight
3. **Clinical Boundaries**: Don't provide medical advice, only wellness support
4. **Cultural Sensitivity**: Self-care looks different across cultures
5. **Notification Fatigue**: Balance helpful reminders with being annoying

## Success Metrics

- Caregiver stress levels reduce by 25% after 30 days
- 60% of users engage with support groups monthly
- Self-care time increases by 2+ hours per week
- Burnout risk scores improve for 40% of users
- 80% user satisfaction with wellness features

## Dependencies

- Must be implemented after Phase 2 (Dashboard)
- Integrates with notification system (PRP-11)
- Uses authentication from PRP-03
- Shares UI components from PRP-06

## Implementation Confidence

**Score: 9/10** - This PRP provides comprehensive caregiver wellness support with clear implementation patterns, validated assessment tools, and practical self-care features that directly address caregiver burnout.
