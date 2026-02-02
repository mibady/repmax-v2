# Health Management Pages PRP - Caregiving Companion

## Goal

Build comprehensive health management interfaces including appointment scheduling, medication tracking, vitals logging, and health records management, integrated with voice commands and real-time collaboration.

## Why

- Centralize all health information in one secure, accessible location
- Enable quick medication logging and appointment scheduling via voice
- Provide visual dashboards for tracking health trends over time
- Support multiple family members collaborating on care
- Ensure HIPAA-compliant data handling and emergency access

## What (User-Visible Behavior)

- **Appointment Management**: Visual calendar with voice scheduling
- **Medication Tracking**: Adherence monitoring with photo logging
- **Vitals Dashboard**: Charts showing blood pressure, weight trends
- **Health Records**: Secure document storage with AI summarization
- **Emergency Info**: Quick-access critical health data
- **Cognitive Assessment**: Daily cognitive tracking through conversation analysis
- **Pattern Detection**: AI-powered health trend analysis and predictions

## All Needed Context

### Documentation References

- React Hook Form: https://react-hook-form.com/docs
- Recharts: https://recharts.org/en-US/guide
- React Big Calendar: https://github.com/jquense/react-big-calendar
- date-fns: https://date-fns.org/docs/Getting-Started
- React Query: https://tanstack.com/query/latest/docs/framework/react/overview

### Package Dependencies

```json
{
  "dependencies": {
    "@hookform/resolvers": "^3.9.0",
    "@radix-ui/react-select": "^2.1.1",
    "@radix-ui/react-toast": "^1.2.1",
    "@tanstack/react-query": "^5.0.0",
    "@upstash/redis": "^1.34.0",
    "@vercel/analytics": "^1.2.0",
    "@vercel/speed-insights": "^1.1.0",
    "date-fns": "^3.6.0",
    "lucide-react": "^0.350.0",
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-big-calendar": "^1.15.0",
    "react-camera-pro": "^1.4.0",
    "react-dropzone": "^14.2.9",
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
- **Auth**: Clerk (organization-based permissions with health data access roles)
- **Voice**: Retell AI for voice commands and interactions
- **AI**: Claude AI for health insights and natural language processing
- **Monitoring**: Sentry for error tracking
- **Analytics**: Vercel Analytics and Speed Insights
- **Storage**: Supabase Storage for health documents and images

### Critical Implementation Notes

#### Security & Compliance

- **HIPAA Compliance**:
  - All health data must be encrypted at rest and in transit
  - Implement strict access controls and audit logging
  - Sign Business Associate Agreements (BAAs) with all vendors
  - Store audit logs in a separate, immutable database

#### Data Protection

- **Encryption**:
  - Field-level encryption for all PHI (Protected Health Information)
  - Use Supabase Vault for encryption key management
  - Encrypt all data in transit using TLS 1.3

#### Access Control

- **Role-Based Access (RBAC)**:
  - Define clear roles (admin, caregiver, family, patient)
  - Implement attribute-based access control (ABAC) for fine-grained permissions
  - Require 2FA for all user accounts
  - Session timeout after 15 minutes of inactivity

#### Performance & Reliability

- **Caching Strategy**:
  - Use Redis to cache frequently accessed health data
  - Implement cache invalidation for real-time updates
  - Set appropriate TTL based on data sensitivity
- **Error Handling**:
  - Comprehensive error boundaries
  - Log all errors to Sentry
  - User-friendly error messages

#### Voice Integration

- **Voice Commands**:
  - Integrate with Retell AI for natural language processing
  - Support voice commands for common health actions
  - Provide visual confirmation for voice actions
- **Security**:
  - Require voice authentication for sensitive operations
  - Implement voice command validation
  - Log all voice interactions for auditing

#### Emergency Access

- **Critical Information**:
  - Quick-access emergency health information
  - Read-only mode for emergency contacts
  - Offline access to critical data
- **Notifications**:
  - Real-time alerts for critical health events
  - SMS and email notifications for caregivers
  - Escalation paths for unacknowledged alerts

#### Cognitive Health Monitoring

- **Daily Assessment**:
  - Track orientation questions (time, place, person)
  - Monitor response time and coherence
  - Detect confusion patterns in conversations
  - Adaptive difficulty based on cognitive state
- **Trend Analysis**:
  - Weekly cognitive health reports
  - Early warning system for decline
  - Doctor-ready summaries for appointments
- **Personalized Interaction**:
  - Adjust language complexity based on comprehension
  - Increase reminder frequency if memory issues detected
  - Visual cues and pictures for better understanding

## Implementation Blueprint

### 1. Health Hub Layout (/app/health/layout.tsx)

```typescript
import { Sidebar } from '@/components/health/Sidebar';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function HealthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="member">
      <div className="flex h-full">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Suspense fallback={<LoadingSpinner />}>
            {children}
          </Suspense>
        </main>
      </div>
    </ProtectedRoute>
  );
}
```

### 2. Appointments Calendar Page (/app/health/appointments/page.tsx)

```typescript
'use client';

import { useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Clock, MapPin, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppointmentForm } from '@/components/health/AppointmentForm';
import { AppointmentDetails } from '@/components/health/AppointmentDetails';
import { VoiceCommands } from '@/components/health/VoiceCommands';
import { fetchAppointments, createAppointment, updateAppointment } from '@/lib/api/health';
import { toast } from '@/components/ui/use-toast';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { 'en-US': enUS },
});

export default function AppointmentsPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const queryClient = useQueryClient();

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: fetchAppointments,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    onError: (error) => {
      console.error('Error fetching appointments:', error);
      Sentry.captureException(error, {
        tags: {
          component: 'appointments',
          userId: user?.id
        }
      });
    },
  });

  const createMutation = useMutation({
    mutationFn: createAppointment,
    onSuccess: (data) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['appointments'] });

      // Update cache optimistically
      queryClient.setQueryData(['appointments'], (old: any) =>
        old ? [...old, data] : [data]
      );

      setShowForm(false);

      // Show success message
      toast({
        title: 'Appointment Created',
        description: 'New appointment has been scheduled.',
      });

      // Log the appointment creation
      fetch('/api/audit/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'appointment_created',
          entityId: data.id,
          userId: user.id,
          timestamp: new Date().toISOString(),
          metadata: {
            provider: data.provider,
            date: data.appointment_date
          }
        })
      });
    },
    onError: (error) => {
      console.error('Error creating appointment:', error);
      Sentry.captureException(error, {
        tags: {
          component: 'appointments',
          action: 'create',
          userId: user?.id
        }
      });

      toast({
        title: 'Error',
        description: 'Failed to create appointment. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSelectSlot = ({ start }: { start: Date }) => {
    setSelectedDate(start);
    setShowForm(true);
  };

  const handleSelectEvent = (event: any) => {
    setSelectedAppointment(event);
  };

  const handleVoiceCommand = async (command: string) => {
    try {
      // Process voice command using Claude AI for better intent recognition
      const response = await fetch('/api/voice/process-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command,
          context: 'health',
          userId: user.id,
          organizationId: user.organizationId
        })
      });

      const { action, params } = await response.json();

      switch (action) {
        case 'schedule_appointment':
          setShowForm(true);
          break;
        case 'view_appointment':
          const appointment = await fetchAppointment(params.id);
          setSelectedAppointment(appointment);
          break;
        case 'next_appointment':
          const nextAppt = await fetchNextAppointment();
          if (nextAppt) {
            setSelectedAppointment(nextAppt);
          }
          break;
        default:
          console.log('Command not recognized');
      }

      // Log voice command for analytics and compliance
      await fetch('/api/analytics/voice-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command,
          action,
          params,
          timestamp: new Date().toISOString(),
          userId: user.id
        })
      });

    } catch (error) {
      console.error('Error processing voice command:', error);
      Sentry.captureException(error, {
        tags: {
          component: 'voice-command',
          context: 'health',
          userId: user?.id
        }
      });
    }
  };

  const eventStyleGetter = (event: any) => {
    const isUrgent = event.priority === 'urgent';
    return {
      style: {
        backgroundColor: isUrgent ? '#EF4444' : '#3B82F6',
        borderRadius: '6px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600">Manage medical appointments and schedules</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Schedule Appointment
        </Button>
      </div>

      {/* Voice Commands */}
      <VoiceCommands
        commands={[
          'Schedule appointment',
          'Book doctor visit',
          'Show next appointment',
          'Cancel appointment',
        ]}
        onCommand={handleVoiceCommand}
      />

      {/* Calendar */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <Calendar
          localizer={localizer}
          events={appointments?.map(apt => ({
            ...apt,
            start: new Date(apt.appointment_date),
            end: new Date(new Date(apt.appointment_date).getTime() + (apt.duration_minutes || 60) * 60000),
            title: apt.title,
          })) || []}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          views={['month', 'week', 'day', 'agenda']}
          defaultView="month"
          step={30}
          timeslots={2}
        />
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Upcoming Appointments</h3>
        <div className="space-y-3">
          {appointments
            ?.filter(apt => new Date(apt.appointment_date) > new Date())
            .slice(0, 5)
            .map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                onClick={() => setSelectedAppointment(appointment)}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{appointment.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {format(new Date(appointment.appointment_date), 'MMM d, h:mm a')}
                      </span>
                      {appointment.provider && (
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {appointment.provider}
                        </span>
                      )}
                      {appointment.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {appointment.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    appointment.status === 'scheduled' ? 'bg-green-100 text-green-800' :
                    appointment.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {appointment.status}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Modals */}
      {showForm && (
        <AppointmentForm
          defaultDate={selectedDate}
          onClose={() => setShowForm(false)}
          onSubmit={createMutation.mutate}
          isLoading={createMutation.isPending}
        />
      )}

      {selectedAppointment && (
        <AppointmentDetails
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
        />
      )}
    </div>
  );
}
```

### 3. Medication Tracking Page (/app/health/medications/page.tsx)

```typescript
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pill, Camera, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MedicationForm } from '@/components/health/MedicationForm';
import { MedicationCard } from '@/components/health/MedicationCard';
import { DoseLogger } from '@/components/health/DoseLogger';
import { AdherenceChart } from '@/components/health/AdherenceChart';
import { VoiceCommands } from '@/components/health/VoiceCommands';
import { fetchMedications, logMedication } from '@/lib/api/health';
import { format, isToday, parseISO } from 'date-fns';

export default function MedicationsPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [showDoseLogger, setShowDoseLogger] = useState(false);

  const queryClient = useQueryClient();

  const { data: medications, isLoading } = useQuery({
    queryKey: ['medications'],
    queryFn: fetchMedications,
  });

  const { data: todayLogs } = useQuery({
    queryKey: ['medication-logs', 'today'],
    queryFn: () => fetchMedicationLogs(new Date()),
  });

  const logMutation = useMutation({
    mutationFn: logMedication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medication-logs'] });
      setShowDoseLogger(false);
    },
  });

  const handleVoiceCommand = async (command: string) => {
    if (command.includes('log') || command.includes('took') || command.includes('take')) {
      // Extract medication name from voice command
      const medicationName = extractMedicationName(command, medications);
      if (medicationName) {
        const medication = medications.find(med =>
          med.name.toLowerCase().includes(medicationName.toLowerCase())
        );
        if (medication) {
          await logMutation.mutateAsync({
            medicationId: medication.id,
            status: 'given',
            administeredAt: new Date(),
          });
        }
      } else {
        setShowDoseLogger(true);
      }
    }
  };

  const getTodayAdherence = () => {
    if (!medications || !todayLogs) return 0;
    const activeMeds = medications.filter(med => med.is_active);
    const loggedCount = todayLogs.length;
    return activeMeds.length > 0 ? (loggedCount / activeMeds.length) * 100 : 0;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medications</h1>
          <p className="text-gray-600">Track medications and dosing schedules</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowDoseLogger(true)}
            className="flex items-center gap-2"
          >
            <Pill className="w-4 h-4" />
            Log Dose
          </Button>
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Medication
          </Button>
        </div>
      </div>

      {/* Voice Commands */}
      <VoiceCommands
        commands={[
          'Log medication',
          'Took [medication name]',
          'Add new medication',
          'Show adherence',
        ]}
        onCommand={handleVoiceCommand}
      />

      {/* Today's Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Adherence</p>
              <p className="text-2xl font-bold text-gray-900">{getTodayAdherence().toFixed(0)}%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Doses Taken</p>
              <p className="text-2xl font-bold text-gray-900">
                {todayLogs?.length || 0}/{medications?.filter(med => med.is_active).length || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Pill className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Next Dose</p>
              <p className="text-lg font-semibold text-gray-900">
                {getNextDoseTime(medications, todayLogs)}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Adherence Chart */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">7-Day Adherence Trend</h3>
        <AdherenceChart />
      </div>

      {/* Active Medications */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Active Medications</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {medications
            ?.filter(med => med.is_active)
            .map((medication) => (
              <MedicationCard
                key={medication.id}
                medication={medication}
                todayLogs={todayLogs?.filter(log => log.medication_id === medication.id)}
                onLogDose={(medId) => {
                  setSelectedMedication(medId);
                  setShowDoseLogger(true);
                }}
                onClick={() => setSelectedMedication(medication)}
              />
            ))}
        </div>
      </div>

      {/* Modals */}
      {showForm && (
        <MedicationForm
          onClose={() => setShowForm(false)}
          onSubmit={(data) => createMedication(data)}
        />
      )}

      {showDoseLogger && (
        <DoseLogger
          medications={medications?.filter(med => med.is_active)}
          preselectedMedication={selectedMedication}
          onClose={() => {
            setShowDoseLogger(false);
            setSelectedMedication(null);
          }}
          onSubmit={logMutation.mutate}
          isLoading={logMutation.isPending}
        />
      )}
    </div>
  );
}
```

### 4. Vitals Tracking Page (/app/health/vitals/page.tsx)

```typescript
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, TrendingUp, Heart, Thermometer, Weight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VitalsForm } from '@/components/health/VitalsForm';
import { VitalsChart } from '@/components/health/VitalsChart';
import { VitalsTable } from '@/components/health/VitalsTable';
import { VoiceCommands } from '@/components/health/VoiceCommands';
import { fetchVitals, createVitals } from '@/lib/api/health';
import { format, subDays } from 'date-fns';

export default function VitalsPage() {
  const [showForm, setShowForm] = useState(false);
  const [dateRange, setDateRange] = useState(30); // days
  const [selectedMetric, setSelectedMetric] = useState('blood_pressure');

  const queryClient = useQueryClient();

  const { data: vitals, isLoading } = useQuery({
    queryKey: ['vitals', dateRange],
    queryFn: () => fetchVitals({
      startDate: subDays(new Date(), dateRange),
      endDate: new Date(),
    }),
  });

  const createMutation = useMutation({
    mutationFn: createVitals,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vitals'] });
      setShowForm(false);
    },
  });

  const handleVoiceCommand = async (command: string) => {
    if (command.includes('record') || command.includes('log') || command.includes('add')) {
      setShowForm(true);
    } else if (command.includes('blood pressure')) {
      setSelectedMetric('blood_pressure');
    } else if (command.includes('weight')) {
      setSelectedMetric('weight');
    } else if (command.includes('temperature')) {
      setSelectedMetric('temperature');
    }
  };

  const getLatestVital = (type: string) => {
    return vitals?.find(vital => vital[type] !== null);
  };

  const vitalsMetrics = [
    {
      key: 'blood_pressure',
      label: 'Blood Pressure',
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      getValue: (vital: any) =>
        vital.blood_pressure_systolic && vital.blood_pressure_diastolic
          ? `${vital.blood_pressure_systolic}/${vital.blood_pressure_diastolic}`
          : null,
    },
    {
      key: 'heart_rate',
      label: 'Heart Rate',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      getValue: (vital: any) => vital.heart_rate ? `${vital.heart_rate} bpm` : null,
    },
    {
      key: 'temperature',
      label: 'Temperature',
      icon: Thermometer,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      getValue: (vital: any) => vital.temperature ? `${vital.temperature}°F` : null,
    },
    {
      key: 'weight',
      label: 'Weight',
      icon: Weight,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      getValue: (vital: any) => vital.weight ? `${vital.weight} lbs` : null,
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vitals</h1>
          <p className="text-gray-600">Track and monitor health vitals over time</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Record Vitals
        </Button>
      </div>

      {/* Voice Commands */}
      <VoiceCommands
        commands={[
          'Record vitals',
          'Log blood pressure',
          'Add weight',
          'Show temperature chart',
        ]}
        onCommand={handleVoiceCommand}
      />

      {/* Latest Readings */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {vitalsMetrics.map((metric) => {
          const Icon = metric.icon;
          const latest = getLatestVital(metric.key);
          const value = latest ? metric.getValue(latest) : 'No data';
          const date = latest ? format(new Date(latest.recorded_at), 'MMM d') : '';

          return (
            <div key={metric.key} className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <Icon className={`w-5 h-5 ${metric.color}`} />
                </div>
                <button
                  onClick={() => setSelectedMetric(metric.key)}
                  className={`text-xs px-2 py-1 rounded ${
                    selectedMetric === metric.key
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  View
                </button>
              </div>
              <h3 className="text-sm font-medium text-gray-600">{metric.label}</h3>
              <p className="text-lg font-semibold text-gray-900">{value}</p>
              {date && <p className="text-xs text-gray-500 mt-1">{date}</p>}
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {vitalsMetrics.find(m => m.key === selectedMetric)?.label} Trend
          </h3>
          <div className="flex gap-2">
            {[7, 30, 90].map((days) => (
              <button
                key={days}
                onClick={() => setDateRange(days)}
                className={`px-3 py-1 text-sm rounded ${
                  dateRange === days
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {days}d
              </button>
            ))}
          </div>
        </div>
        <VitalsChart
          data={vitals}
          metric={selectedMetric}
          height={300}
        />
      </div>

      {/* Recent Entries Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Entries</h3>
        <VitalsTable vitals={vitals?.slice(0, 10)} />
      </div>

      {/* Form Modal */}
      {showForm && (
        <VitalsForm
          onClose={() => setShowForm(false)}
          onSubmit={createMutation.mutate}
          isLoading={createMutation.isPending}
        />
      )}
    </div>
  );
}
```

### 5. Cognitive Assessment Component (/components/health/CognitiveAssessment.tsx)

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Brain, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';

interface CognitiveMetrics {
  orientation_score: number;  // 0-10
  memory_score: number;       // 0-10
  response_time: number;      // seconds
  coherence_score: number;    // 0-10
  confusion_detected: boolean;
  assessment_date: string;
}

export function CognitiveAssessment({ patientId }: { patientId: string }) {
  const [showAlert, setShowAlert] = useState(false);

  // Fetch cognitive assessment data
  const { data: assessments, isLoading } = useQuery({
    queryKey: ['cognitive-assessments', patientId],
    queryFn: async () => {
      const response = await fetch(`/api/health/cognitive/${patientId}`);
      if (!response.ok) throw new Error('Failed to fetch assessments');
      return response.json();
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  // Analyze trends
  const analyzeTrend = () => {
    if (!assessments || assessments.length < 7) return null;

    const recent = assessments.slice(0, 7);
    const older = assessments.slice(7, 14);

    const recentAvg = recent.reduce((sum: number, a: CognitiveMetrics) =>
      sum + (a.orientation_score + a.memory_score + a.coherence_score) / 3, 0) / recent.length;

    const olderAvg = older.reduce((sum: number, a: CognitiveMetrics) =>
      sum + (a.orientation_score + a.memory_score + a.coherence_score) / 3, 0) / older.length;

    const decline = ((olderAvg - recentAvg) / olderAvg) * 100;

    if (decline > 20) {
      setShowAlert(true);
      // Notify caregiver of significant decline
      fetch('/api/notifications/cognitive-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          declinePercentage: decline,
          metrics: recent[0],
        }),
      });
    }

    return { decline, recentAvg, olderAvg };
  };

  const trend = analyzeTrend();
  const latestAssessment = assessments?.[0];

  // Format data for chart
  const chartData = assessments?.slice(0, 30).reverse().map((a: CognitiveMetrics) => ({
    date: format(new Date(a.assessment_date), 'MMM dd'),
    overall: ((a.orientation_score + a.memory_score + a.coherence_score) / 3).toFixed(1),
    orientation: a.orientation_score,
    memory: a.memory_score,
    coherence: a.coherence_score,
  }));

  return (
    <div className="space-y-6">
      {/* Alert for cognitive decline */}
      {showAlert && trend && trend.decline > 20 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Significant cognitive decline detected ({trend.decline.toFixed(1)}% over 2 weeks).
            Consider scheduling a medical evaluation.
          </AlertDescription>
        </Alert>
      )}

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Cognitive Health Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {latestAssessment ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Orientation</p>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={latestAssessment.orientation_score * 10}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium">
                      {latestAssessment.orientation_score}/10
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Memory</p>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={latestAssessment.memory_score * 10}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium">
                      {latestAssessment.memory_score}/10
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Coherence</p>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={latestAssessment.coherence_score * 10}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium">
                      {latestAssessment.coherence_score}/10
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Response Time</p>
                  <p className="text-lg font-semibold">
                    {latestAssessment.response_time.toFixed(1)}s
                  </p>
                </div>
              </div>

              {latestAssessment.confusion_detected && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertDescription className="text-yellow-800">
                    Confusion detected in recent interaction
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No assessment data available</p>
          )}
        </CardContent>
      </Card>

      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>30-Day Cognitive Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData && chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="overall"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  name="Overall"
                />
                <Line
                  type="monotone"
                  dataKey="memory"
                  stroke="#10B981"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  name="Memory"
                />
                <Line
                  type="monotone"
                  dataKey="orientation"
                  stroke="#F59E0B"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  name="Orientation"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Insufficient data for trend analysis
            </p>
          )}
        </CardContent>
      </Card>

      {/* Doctor Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Doctor Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none text-sm">
            <p>
              <strong>Patient:</strong> {patientId}
            </p>
            <p>
              <strong>Assessment Period:</strong> Last 30 days
            </p>
            {trend && (
              <>
                <p>
                  <strong>Trend:</strong> {trend.decline > 0 ? (
                    <span className="text-red-600">
                      {trend.decline.toFixed(1)}% decline
                    </span>
                  ) : (
                    <span className="text-green-600">
                      {Math.abs(trend.decline).toFixed(1)}% improvement
                    </span>
                  )}
                </p>
                <p>
                  <strong>Current Average:</strong> {trend.recentAvg.toFixed(1)}/10
                </p>
              </>
            )}
            <p className="mt-4">
              <strong>Recommendations:</strong>
            </p>
            <ul>
              {trend && trend.decline > 20 && (
                <li>Consider comprehensive cognitive evaluation</li>
              )}
              {latestAssessment?.confusion_detected && (
                <li>Monitor for increased confusion episodes</li>
              )}
              {latestAssessment?.memory_score && latestAssessment.memory_score < 5 && (
                <li>Implement memory aids and structured routines</li>
              )}
              <li>Continue daily cognitive assessments via voice calls</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 6. Health Sidebar Component (/components/health/Sidebar.tsx)

```typescript
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  Pill,
  Activity,
  FileText,
  AlertTriangle,
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  {
    name: 'Overview',
    href: '/health',
    icon: Heart,
  },
  {
    name: 'Appointments',
    href: '/health/appointments',
    icon: Calendar,
  },
  {
    name: 'Medications',
    href: '/health/medications',
    icon: Pill,
  },
  {
    name: 'Vitals',
    href: '/health/vitals',
    icon: Activity,
  },
  {
    name: 'Records',
    href: '/health/records',
    icon: FileText,
  },
  {
    name: 'Emergency',
    href: '/health/emergency',
    icon: AlertTriangle,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">Health Management</h2>
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

## Task Checklist

### Page Development

- [ ] Create health hub layout with sidebar navigation
- [ ] Build appointments calendar with voice scheduling
- [ ] Implement medication tracking with photo logging
- [ ] Create vitals dashboard with trending charts
- [ ] Build health records document management
- [ ] Design emergency info quick-access page

### Form Components

- [ ] AppointmentForm with date/time picker
- [ ] MedicationForm with dosage calculator
- [ ] VitalsForm with multiple input types
- [ ] DoseLogger with camera integration
- [ ] HealthRecordForm with file upload

### Data Visualization

- [ ] Calendar component for appointments
- [ ] Adherence charts for medications
- [ ] Trend charts for vitals tracking
- [ ] Progress indicators for health goals
- [ ] Emergency contact quick cards

### Voice Integration

- [ ] Voice commands for appointment scheduling
- [ ] Medication logging via voice
- [ ] Vitals recording voice interface
- [ ] Voice search for health records
- [ ] Emergency voice access protocols

### Real-time Features

- [ ] Live medication reminders
- [ ] Appointment notifications
- [ ] Family member activity updates
- [ ] Critical health alerts
- [ ] Emergency notification system

## Validation Loop

### Level 1: Component Testing

```bash
npm test -- health/AppointmentForm.test.tsx
npm test -- health/MedicationCard.test.tsx
npm test -- health/VitalsChart.test.tsx
```

### Level 2: Integration Testing

```bash
npm run test:health-flows
npm run test:voice-commands
npm run test:data-persistence
```

### Level 3: End-to-End Testing

```bash
npm run e2e:health-management
npm run e2e:medication-tracking
npm run e2e:appointment-scheduling
```

### Level 4: Performance Testing

```bash
npm run lighthouse:health-pages
npm run test:chart-performance
npm run test:realtime-updates
```

## Success Criteria

- [ ] All health pages load in < 2 seconds
- [ ] Voice commands have 95%+ accuracy
- [ ] Real-time updates appear within 500ms
- [ ] Charts render smoothly with 100+ data points
- [ ] Photo uploads complete within 10 seconds
- [ ] Emergency page accessible in offline mode

## Common Gotchas

- Calendar component needs proper timezone handling
- Medication photos require Supabase Storage bucket setup
- Voice commands need medication name disambiguation
- Charts performance degrades with large datasets
- Real-time subscriptions need proper cleanup
- Emergency page must work without full authentication
