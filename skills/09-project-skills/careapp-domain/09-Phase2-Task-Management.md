# Task & Team Management PRP - Caregiving Companion

## Goal

Build comprehensive task management and team collaboration interfaces including to-do lists, family member coordination, communication hub, and shared calendar integration for seamless caregiving team collaboration.

## Why

- Coordinate tasks across multiple family members and caregivers
- Prevent important care tasks from being forgotten or duplicated
- Enable real-time communication and status updates
- Provide transparency in care responsibilities and progress
- Support both individual and shared task management workflows

## What (User-Visible Behavior)

- **Task Lists**: Personal and shared to-dos with assignments
- **Team Dashboard**: Family member activities and responsibilities
- **Communication Hub**: In-app messaging and updates
- **Calendar Integration**: Shared scheduling and reminders
- **Progress Tracking**: Visual indicators for task completion

## All Needed Context

### Documentation References

- React DnD: https://react-dnd.github.io/react-dnd/docs/overview
- React Hook Form: https://react-hook-form.com/docs
- Socket.io Client: https://socket.io/docs/v4/client-api/
- React Query: https://tanstack.com/query/latest/docs/framework/react/overview
- Supabase Realtime: https://supabase.com/docs/guides/realtime

### Package Dependencies

```json
{
  "dependencies": {
    "react-hook-form": "^7.53.0",
    "@hookform/resolvers": "^3.9.0",
    "zod": "^3.23.8",
    "react-beautiful-dnd": "^13.1.1",
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "react-mentions": "^4.4.10",
    "emoji-picker-react": "^4.11.1",
    "react-textarea-autosize": "^8.5.3"
  }
}
```

### Tech Stack Alignment

- **Frontend**: Next.js 15 + React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Supabase (existing schema tables: tasks, communications, organization_members)
- **Auth**: Clerk (existing organization-based permissions and roles)
- **Voice**: Existing VoiceChat component integration
- **Real-time**: Supabase realtime subscriptions for live updates
- **Notifications**: Integration with upcoming notification system

### Critical Implementation Notes

- All components must integrate with existing VoiceChat for voice task management
- Use existing Supabase schema tables (no schema changes needed)
- Implement real-time updates via Supabase subscriptions
- Support drag-and-drop task reordering and assignment
- @mention functionality for team communication
- Offline-first task management with sync

## Implementation Blueprint

### 1. Task & Team Hub Layout (/app/tasks/layout.tsx)

```typescript
import { Sidebar } from '@/components/tasks/Sidebar';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { TeamMemberPresence } from '@/components/tasks/TeamMemberPresence';
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function TasksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="member">
      <div className="flex h-full">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <TeamMemberPresence />
          <Suspense fallback={<LoadingSpinner />}>
            {children}
          </Suspense>
        </main>
      </div>
    </ProtectedRoute>
  );
}
```

### 2. Tasks Overview Page (/app/tasks/page.tsx)

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, Filter, Users, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskForm } from '@/components/tasks/TaskForm';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { QuickStats } from '@/components/tasks/QuickStats';
import { VoiceCommands } from '@/components/tasks/VoiceCommands';
import { fetchTasks, createTask, updateTask } from '@/lib/api/tasks';
import { useOrganization } from '@clerk/nextjs';
import { useSupabase } from '@/hooks/useSupabase';

export default function TasksPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    assignee: 'all',
    category: 'all',
    priority: 'all',
  });
  const [groupBy, setGroupBy] = useState('status');

  const { organization } = useOrganization();
  const { supabase } = useSupabase();
  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => fetchTasks(filters),
  });

  const { data: teamMembers } = useQuery({
    queryKey: ['team-members'],
    queryFn: fetchTeamMembers,
  });

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  // Real-time updates
  useEffect(() => {
    if (!organization?.id) return;

    const channel = supabase
      .channel('tasks')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `organization_id=eq.${organization.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['tasks'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [organization?.id, supabase, queryClient]);

  const handleVoiceCommand = async (command: string) => {
    if (command.includes('add') || command.includes('create')) {
      setShowForm(true);
    } else if (command.includes('assign')) {
      // Extract task and assignee from voice command
      const { taskName, assignee } = parseAssignmentCommand(command, tasks, teamMembers);
      if (taskName && assignee) {
        const task = tasks.find(t => t.title.toLowerCase().includes(taskName.toLowerCase()));
        if (task) {
          await updateMutation.mutateAsync({
            ...task,
            assigned_to: assignee.id,
          });
        }
      }
    } else if (command.includes('complete') || command.includes('done')) {
      // Mark task as completed
      const taskName = extractTaskName(command, tasks);
      if (taskName) {
        const task = tasks.find(t => t.title.toLowerCase().includes(taskName.toLowerCase()));
        if (task) {
          await updateMutation.mutateAsync({
            ...task,
            status: 'completed',
            completed_at: new Date().toISOString(),
          });
        }
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeTask = tasks.find(t => t.id === active.id);
    const overTask = tasks.find(t => t.id === over.id);

    if (activeTask && overTask) {
      // Update task order or status based on drop zone
      await updateMutation.mutateAsync({
        ...activeTask,
        // Update based on your grouping strategy
      });
    }
  };

  const groupedTasks = groupTasksBy(tasks, groupBy);

  const taskStats = {
    total: tasks?.length || 0,
    pending: tasks?.filter(t => t.status === 'pending').length || 0,
    inProgress: tasks?.filter(t => t.status === 'in_progress').length || 0,
    completed: tasks?.filter(t => t.status === 'completed').length || 0,
    overdue: tasks?.filter(t =>
      new Date(t.due_date) < new Date() && t.status !== 'completed'
    ).length || 0,
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks & To-Dos</h1>
          <p className="text-gray-600">Manage tasks and coordinate with your care team</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Quick Add
          </Button>
          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Task
          </Button>
        </div>
      </div>

      {/* Voice Commands */}
      <VoiceCommands
        commands={[
          'Add task [task name]',
          'Assign [task] to [person]',
          'Complete [task name]',
          'Show my tasks',
        ]}
        onCommand={handleVoiceCommand}
      />

      {/* Quick Stats */}
      <QuickStats stats={taskStats} />

      {/* Filters and Controls */}
      <div className="flex justify-between items-center mb-6">
        <TaskFilters
          filters={filters}
          onFiltersChange={setFilters}
          teamMembers={teamMembers}
        />

        <div className="flex gap-2">
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="status">Group by Status</option>
            <option value="assignee">Group by Assignee</option>
            <option value="category">Group by Category</option>
            <option value="priority">Group by Priority</option>
          </select>
        </div>
      </div>

      {/* Tasks Grid */}
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Object.entries(groupedTasks).map(([group, groupTasks]) => (
            <div key={group} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  {group} ({groupTasks.length})
                </h3>
                {groupBy === 'status' && (
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(group)}`} />
                )}
              </div>

              <SortableContext
                items={groupTasks.map(t => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {groupTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      teamMembers={teamMembers}
                      onEdit={() => {
                        setSelectedTask(task);
                        setShowForm(true);
                      }}
                      onStatusChange={(status) =>
                        updateMutation.mutate({ ...task, status })
                      }
                      onAssigneeChange={(assignee) =>
                        updateMutation.mutate({ ...task, assigned_to: assignee })
                      }
                    />
                  ))}
                </div>
              </SortableContext>
            </div>
          ))}
        </div>
      </DndContext>

      {/* Task Form Modal */}
      {showForm && (
        <TaskForm
          task={selectedTask}
          teamMembers={teamMembers}
          onClose={() => {
            setShowForm(false);
            setSelectedTask(null);
          }}
          onSubmit={selectedTask ? updateMutation.mutate : createMutation.mutate}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}
```

### 3. Team Collaboration Page (/app/tasks/team/page.tsx)

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, MessageCircle, Calendar, Activity, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TeamMemberCard } from '@/components/tasks/TeamMemberCard';
import { ActivityFeed } from '@/components/tasks/ActivityFeed';
import { TeamCalendar } from '@/components/tasks/TeamCalendar';
import { CommunicationHub } from '@/components/tasks/CommunicationHub';
import { InviteMemberModal } from '@/components/tasks/InviteMemberModal';
import { VoiceCommands } from '@/components/tasks/VoiceCommands';
import { fetchTeamMembers, fetchTeamActivity } from '@/lib/api/tasks';
import { useOrganization, useUser } from '@clerk/nextjs';

export default function TeamPage() {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const { organization } = useOrganization();
  const { user } = useUser();

  const { data: teamMembers } = useQuery({
    queryKey: ['team-members'],
    queryFn: fetchTeamMembers,
  });

  const { data: activity } = useQuery({
    queryKey: ['team-activity'],
    queryFn: fetchTeamActivity,
    refetchInterval: 30000, // 30 seconds
  });

  const handleVoiceCommand = async (command: string) => {
    if (command.includes('invite') || command.includes('add member')) {
      setShowInviteModal(true);
    } else if (command.includes('message') || command.includes('chat')) {
      setActiveTab('communication');
    } else if (command.includes('calendar') || command.includes('schedule')) {
      setActiveTab('calendar');
    } else if (command.includes('activity') || command.includes('updates')) {
      setActiveTab('activity');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Users },
    { id: 'communication', label: 'Communication', icon: MessageCircle },
    { id: 'calendar', label: 'Shared Calendar', icon: Calendar },
    { id: 'activity', label: 'Activity', icon: Activity },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Collaboration</h1>
          <p className="text-gray-600">Coordinate with your caregiving team</p>
        </div>
        <Button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Invite Member
        </Button>
      </div>

      {/* Voice Commands */}
      <VoiceCommands
        commands={[
          'Invite team member',
          'Show communication',
          'Open calendar',
          'Show activity feed',
        ]}
        onCommand={handleVoiceCommand}
      />

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Team Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Team Members</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {teamMembers?.length || 0}
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {activity?.activeTasks || 0}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Messages Today</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {activity?.messagesCount || 0}
                  </p>
                </div>
                <MessageCircle className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {activity?.completionRate || 0}%
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Team Members Grid */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Team Members</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamMembers?.map((member) => (
                <TeamMemberCard
                  key={member.id}
                  member={member}
                  activity={activity?.memberActivity?.[member.id]}
                  onClick={() => setSelectedMember(member)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'communication' && (
        <CommunicationHub
          teamMembers={teamMembers}
          currentUser={user}
        />
      )}

      {activeTab === 'calendar' && (
        <TeamCalendar
          teamMembers={teamMembers}
          organization={organization}
        />
      )}

      {activeTab === 'activity' && (
        <ActivityFeed
          activity={activity?.recentActivity}
          teamMembers={teamMembers}
        />
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <InviteMemberModal
          onClose={() => setShowInviteModal(false)}
          organization={organization}
        />
      )}
    </div>
  );
}
```

### 4. Communication Hub Component (/components/tasks/CommunicationHub.tsx)

```typescript
'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Paperclip, Smile, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MessageBubble } from './MessageBubble';
import { ChannelList } from './ChannelList';
import { MentionsInput, Mention } from 'react-mentions';
import EmojiPicker from 'emoji-picker-react';
import { fetchMessages, sendMessage, fetchChannels } from '@/lib/api/communications';
import { useSupabase } from '@/hooks/useSupabase';
import { format } from 'date-fns';

interface CommunicationHubProps {
  teamMembers: any[];
  currentUser: any;
}

export function CommunicationHub({ teamMembers, currentUser }: CommunicationHubProps) {
  const [selectedChannel, setSelectedChannel] = useState('general');
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { supabase } = useSupabase();
  const queryClient = useQueryClient();

  const { data: channels } = useQuery({
    queryKey: ['channels'],
    queryFn: fetchChannels,
  });

  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', selectedChannel],
    queryFn: () => fetchMessages(selectedChannel),
  });

  const sendMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['messages', selectedChannel] });
    },
  });

  // Real-time message updates
  useEffect(() => {
    if (!selectedChannel) return;

    const channel = supabase
      .channel(`messages:${selectedChannel}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'communications',
          filter: `channel=eq.${selectedChannel}`,
        },
        (payload) => {
          queryClient.setQueryData(['messages', selectedChannel], (old: any) => [
            ...(old || []),
            payload.new,
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedChannel, supabase, queryClient]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    await sendMutation.mutateAsync({
      content: message,
      channel: selectedChannel,
      message_type: 'message',
    });
  };

  const handleEmojiClick = (emojiData: any) => {
    setMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const mentionStyle = {
    control: {
      backgroundColor: '#fff',
      fontSize: 14,
      fontWeight: 'normal',
    },
    '&multiLine': {
      control: {
        fontFamily: 'inherit',
        minHeight: 63,
      },
      highlighter: {
        padding: 9,
        border: '1px solid transparent',
      },
      input: {
        padding: 9,
        border: '1px solid #d1d5db',
        borderRadius: 8,
      },
    },
    suggestions: {
      list: {
        backgroundColor: 'white',
        border: '1px solid #d1d5db',
        borderRadius: 8,
        fontSize: 14,
      },
      item: {
        padding: '8px 16px',
        borderBottom: '1px solid #f3f4f6',
        '&focused': {
          backgroundColor: '#f3f4f6',
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md h-[600px] flex">
      {/* Channel Sidebar */}
      <div className="w-64 border-r border-gray-200 p-4">
        <ChannelList
          channels={channels}
          selectedChannel={selectedChannel}
          onChannelSelect={setSelectedChannel}
        />
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              #{selectedChannel}
            </h3>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-500">
                {teamMembers?.length || 0} members
              </span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages?.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              currentUser={currentUser}
              teamMembers={teamMembers}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleSendMessage} className="flex items-end gap-2">
            <div className="flex-1 relative">
              <MentionsInput
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={mentionStyle}
                placeholder={`Message #${selectedChannel}...`}
                className="w-full"
              >
                <Mention
                  trigger="@"
                  data={teamMembers?.map(member => ({
                    id: member.id,
                    display: member.full_name,
                  })) || []}
                  style={{
                    backgroundColor: '#dbeafe',
                    color: '#1d4ed8',
                    fontWeight: 'bold',
                  }}
                />
              </MentionsInput>

              {showEmojiPicker && (
                <div className="absolute bottom-full right-0 mb-2">
                  <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile className="w-4 h-4" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
              >
                <Paperclip className="w-4 h-4" />
              </Button>

              <Button
                type="submit"
                disabled={!message.trim() || sendMutation.isPending}
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
```

### 5. Task Card Component (/components/tasks/TaskCard.tsx)

```typescript
'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  Calendar,
  MessageCircle,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: any;
  teamMembers: any[];
  onEdit: () => void;
  onStatusChange: (status: string) => void;
  onAssigneeChange: (assigneeId: string) => void;
}

export function TaskCard({
  task,
  teamMembers,
  onEdit,
  onStatusChange,
  onAssigneeChange
}: TaskCardProps) {
  const [showActions, setShowActions] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const assignee = teamMembers?.find(member => member.id === task.assigned_to);
  const dueDate = task.due_date ? new Date(task.due_date) : null;

  const getDateLabel = () => {
    if (!dueDate) return null;
    if (isPast(dueDate) && task.status !== 'completed') return 'Overdue';
    if (isToday(dueDate)) return 'Due today';
    if (isTomorrow(dueDate)) return 'Due tomorrow';
    return format(dueDate, 'MMM d');
  };

  const getDateColor = () => {
    if (!dueDate) return 'text-gray-500';
    if (isPast(dueDate) && task.status !== 'completed') return 'text-red-600';
    if (isToday(dueDate)) return 'text-orange-600';
    if (isTomorrow(dueDate)) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = () => {
    switch (task.status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer transition-all hover:shadow-md',
        isDragging && 'opacity-50 rotate-2',
        task.status === 'completed' && 'opacity-75'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <Badge className={`text-xs ${getPriorityColor()}`}>
            {task.priority}
          </Badge>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setShowActions(!showActions);
          }}
        >
          <MoreVertical className="w-4 h-4" />
        </Button>
      </div>

      {/* Title and Description */}
      <div className="mb-3">
        <h4 className={cn(
          'font-medium text-gray-900 mb-1',
          task.status === 'completed' && 'line-through'
        )}>
          {task.title}
        </h4>
        {task.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {task.description}
          </p>
        )}
      </div>

      {/* Category */}
      {task.category && (
        <div className="mb-3">
          <Badge variant="outline" className="text-xs">
            {task.category}
          </Badge>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-sm">
        {/* Assignee */}
        <div className="flex items-center gap-2">
          {assignee ? (
            <>
              <Avatar className="w-6 h-6">
                <AvatarImage src={assignee.image_url} />
                <AvatarFallback className="text-xs">
                  {assignee.full_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-gray-700">{assignee.full_name}</span>
            </>
          ) : (
            <div className="flex items-center gap-2 text-gray-500">
              <User className="w-4 h-4" />
              <span>Unassigned</span>
            </div>
          )}
        </div>

        {/* Due Date */}
        {dueDate && (
          <div className={`flex items-center gap-1 ${getDateColor()}`}>
            <Calendar className="w-4 h-4" />
            <span className="text-xs">{getDateLabel()}</span>
          </div>
        )}
      </div>

      {/* Actions Menu */}
      {showActions && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="text-xs"
          >
            Edit
          </Button>

          {task.status !== 'completed' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange('completed');
              }}
              className="text-xs text-green-600 hover:text-green-700"
            >
              Complete
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
          >
            <MessageCircle className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
```

## Task Checklist

### Page Development

- [ ] Create task hub layout with sidebar navigation
- [ ] Build tasks overview with drag-and-drop functionality
- [ ] Implement team collaboration dashboard
- [ ] Create communication hub with real-time messaging
- [ ] Build shared calendar integration
- [ ] Design activity feed with live updates

### Task Management Components

- [ ] TaskForm with assignment and scheduling
- [ ] TaskCard with drag-and-drop support
- [ ] TaskFilters with advanced filtering options
- [ ] QuickStats dashboard widgets
- [ ] TaskList with grouping and sorting
- [ ] TaskDetails modal with comments

### Team Collaboration Features

- [ ] TeamMemberCard with activity indicators
- [ ] CommunicationHub with @mentions
- [ ] InviteMemberModal with role selection
- [ ] ChannelList for organized conversations
- [ ] MessageBubble with threading support
- [ ] TeamCalendar with shared events

### Voice Integration

- [ ] Voice commands for task creation
- [ ] Task assignment via voice
- [ ] Status updates through voice
- [ ] Voice messaging in communication hub
- [ ] Voice search for tasks and team members

### Real-time Features

- [ ] Live task updates across users
- [ ] Real-time messaging with typing indicators
- [ ] Live presence indicators for team members
- [ ] Instant notifications for task assignments
- [ ] Real-time activity feed updates

## Validation Loop

### Level 1: Component Testing

```bash
npm test -- tasks/TaskCard.test.tsx
npm test -- tasks/CommunicationHub.test.tsx
npm test -- tasks/TeamMemberCard.test.tsx
```

### Level 2: Integration Testing

```bash
npm run test:task-management
npm run test:team-collaboration
npm run test:real-time-updates
```

### Level 3: End-to-End Testing

```bash
npm run e2e:task-workflows
npm run e2e:team-communication
npm run e2e:voice-commands
```

### Level 4: Performance Testing

```bash
npm run test:drag-drop-performance
npm run test:real-time-scalability
npm run test:message-loading
```

## Success Criteria

- [ ] All task pages load in < 2 seconds
- [ ] Drag-and-drop operations are smooth and responsive
- [ ] Real-time updates appear within 500ms
- [ ] Voice commands have 95%+ accuracy for task operations
- [ ] Team communication supports 50+ concurrent users
- [ ] Offline task management with sync when online

## Common Gotchas

- Drag-and-drop needs proper touch support for mobile
- Real-time subscriptions must handle connection drops
- @mentions require proper parsing and notification
- Voice commands need disambiguation for similar task names
- Large team chats can impact performance
- Task ordering conflicts need resolution strategy
