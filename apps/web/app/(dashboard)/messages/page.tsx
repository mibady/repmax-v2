'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Mail } from 'lucide-react';
import { MessageThread } from '@/components/messages/MessageThread';
import { ComposeModal } from '@/components/messages/ComposeModal';
import { useMessages, useConversation } from '@/lib/hooks';
import type { Tables } from '@/types/database';

type MessageRole = 'recruiter' | 'parent' | 'athlete' | 'coach' | 'admin' | 'club';
type FilterTab = 'all' | 'unread' | 'archived';

interface Conversation {
  id: string;
  contactName: string;
  contactAvatar?: string;
  role: MessageRole;
  organization?: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  archived: boolean;
  recipientId: string;
}

const ROLE_COLORS: Record<MessageRole, { bg: string; text: string }> = {
  recruiter: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  parent: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  athlete: { bg: 'bg-green-500/20', text: 'text-green-400' },
  coach: { bg: 'bg-[#d4af35]/20', text: 'text-[#d4af35]' },
  admin: { bg: 'bg-red-500/20', text: 'text-red-400' },
  club: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
};

function formatTimestamp(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

// Group messages by sender/recipient into conversations
function groupMessagesIntoConversations(
  messages: Array<Tables<"messages"> & {
    sender: Pick<Tables<"profiles">, "id" | "full_name" | "avatar_url" | "role"> | null;
    recipient: Pick<Tables<"profiles">, "id" | "full_name" | "avatar_url" | "role"> | null;
  }>,
  currentUserId?: string
): Conversation[] {
  const conversationMap = new Map<string, Conversation>();

  messages.forEach((msg) => {
    // Determine the other party in the conversation
    const isIncoming = msg.recipient?.id === currentUserId;
    const otherParty = isIncoming ? msg.sender : msg.recipient;
    if (!otherParty) return;

    const existingConv = conversationMap.get(otherParty.id);
    const msgDate = new Date(msg.created_at);

    if (!existingConv || new Date(existingConv.timestamp) < msgDate) {
      conversationMap.set(otherParty.id, {
        id: otherParty.id,
        contactName: otherParty.full_name || 'Unknown',
        contactAvatar: otherParty.avatar_url || undefined,
        role: otherParty.role || 'coach',
        lastMessage: msg.body,
        timestamp: formatTimestamp(msg.created_at),
        unread: isIncoming && !msg.read,
        archived: false,
        recipientId: otherParty.id,
      });
    }
  });

  return Array.from(conversationMap.values()).sort((a, b) => {
    // Sort by timestamp (most recent first)
    return b.timestamp.localeCompare(a.timestamp);
  });
}

function LoadingSkeleton() {
  return (
    <div className="divide-y divide-[#27272a]">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-4 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-700"></div>
            <div className="flex-1">
              <div className="h-4 w-32 bg-gray-700 rounded mb-2"></div>
              <div className="h-3 w-48 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MessagesPage() {
  const { messages, unreadCount, profileId, isLoading, sendMessage } = useMessages();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [recipients, setRecipients] = useState<{ id: string; name: string; organization: string; role: string; avatar?: string; isCompliant: boolean }[]>([]);

  // Fetch recipients when compose modal opens
  useEffect(() => {
    if (!isComposeOpen) return;
    fetch('/api/messages/recipients')
      .then(r => r.json())
      .then(data => setRecipients(data.recipients || []))
      .catch(() => setRecipients([]));
  }, [isComposeOpen]);

  // Convert messages to conversations
  const conversations = useMemo(() => {
    return groupMessagesIntoConversations(messages, profileId);
  }, [messages, profileId]);

  const filteredConversations = conversations.filter((conv) => {
    // Search filter
    const matchesSearch =
      conv.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

    // Tab filter
    if (activeFilter === 'unread') return matchesSearch && conv.unread;
    if (activeFilter === 'archived') return matchesSearch && conv.archived;
    return matchesSearch && !conv.archived;
  });

  const selectedConversation = conversations.find((c) => c.id === selectedId);

  // Fetch conversation thread for selected contact
  const {
    messages: threadMessages,
    isLoading: isThreadLoading,
    sendMessage: sendThreadMessage,
  } = useConversation(selectedId);

  const handleSendMessage = async (message: { recipientId: string; subject: string; body: string; attachments: File[] }) => {
    try {
      await sendMessage(message.recipientId, message.body, message.subject);
      setIsComposeOpen(false);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleSendThreadMessage = async (body: string) => {
    if (!selectedId) return;
    await sendThreadMessage(body);
  };

  return (
    <div className="h-full flex">
      {/* Sidebar - Conversation List */}
      <div className="w-[380px] border-r border-[#27272a] flex flex-col bg-[#050505]">
        {/* Header */}
        <div className="p-4 border-b border-[#27272a]">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-white">Messages</h1>
            <button
              onClick={() => setIsComposeOpen(true)}
              className="flex items-center gap-2 px-3 py-2 bg-[#d4af35] hover:bg-[#e5c246] text-[#201d12] font-medium rounded-lg transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              New Message
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#0a0a0a] border border-[#27272a] rounded-lg text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-[#d4af35]"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1 mt-3">
            {(['all', 'unread', 'archived'] as FilterTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === tab
                    ? 'bg-[#d4af35] text-[#201d12]'
                    : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
                }`}
              >
                {tab === 'all' && 'All'}
                {tab === 'unread' && `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
                {tab === 'archived' && 'Archived'}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <LoadingSkeleton />
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center">
              <Mail className="w-10 h-10 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">
                {conversations.length === 0
                  ? 'No messages yet. Start a conversation!'
                  : 'No conversations found'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#27272a]">
              {filteredConversations.map((conversation) => {
                const roleStyle = ROLE_COLORS[conversation.role];
                return (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedId(conversation.id)}
                    className={`w-full p-4 text-left hover:bg-[#0a0a0a] transition-colors ${
                      selectedId === conversation.id ? 'bg-[#0a0a0a]' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      {conversation.contactAvatar ? (
                        <div
                          className="w-10 h-10 rounded-full bg-cover bg-center flex-shrink-0"
                          style={{ backgroundImage: `url("${conversation.contactAvatar}")` }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-medium text-sm">
                            {conversation.contactName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)}
                          </span>
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`font-medium text-sm ${
                              conversation.unread ? 'text-white' : 'text-gray-300'
                            }`}
                          >
                            {conversation.contactName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {conversation.timestamp}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-1.5 py-0.5 rounded text-xs font-medium ${roleStyle.bg} ${roleStyle.text}`}
                          >
                            {conversation.role.charAt(0).toUpperCase() +
                              conversation.role.slice(1)}
                          </span>
                          {conversation.organization && (
                            <span className="text-xs text-gray-500">
                              {conversation.organization}
                            </span>
                          )}
                        </div>

                        <p
                          className={`text-sm truncate ${
                            conversation.unread ? 'text-gray-300' : 'text-gray-500'
                          }`}
                        >
                          {conversation.lastMessage}
                        </p>
                      </div>

                      {conversation.unread && (
                        <div className="w-2 h-2 rounded-full bg-[#d4af35] mt-2" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Message Thread or Empty State */}
      <div className="flex-1 flex flex-col bg-[#050505]">
        {selectedConversation ? (
          <MessageThread
            conversation={selectedConversation}
            messages={threadMessages}
            isLoading={isThreadLoading}
            onBack={() => setSelectedId(null)}
            onSendMessage={handleSendThreadMessage}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 rounded-full bg-[#1a1a1a] flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-gray-600" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                No conversation selected
              </h2>
              <p className="text-gray-500">
                Choose a conversation from the list on the left to view messages,
                share player stats, or schedule calls.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Compose Modal */}
      <ComposeModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onSend={handleSendMessage}
        recipients={recipients}
      />
    </div>
  );
}
