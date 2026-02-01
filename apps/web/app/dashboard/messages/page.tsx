'use client';

import { useState } from 'react';
import { Search, Plus, Mail } from 'lucide-react';
import { MessageThread } from '@/components/messages/MessageThread';
import { ComposeModal } from '@/components/messages/ComposeModal';

type MessageRole = 'recruiter' | 'parent' | 'athlete' | 'coach';
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
}

const ROLE_COLORS: Record<MessageRole, { bg: string; text: string }> = {
  recruiter: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  parent: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  athlete: { bg: 'bg-green-500/20', text: 'text-green-400' },
  coach: { bg: 'bg-[#d4af35]/20', text: 'text-[#d4af35]' },
};

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    contactName: 'Coach Williams',
    role: 'recruiter',
    organization: 'TCU',
    lastMessage: "Hey, looking forward to seeing the new highlight reel you mentioned. When can we schedule a call?",
    timestamp: '10:42 AM',
    unread: true,
    archived: false,
  },
  {
    id: '2',
    contactName: 'Mrs. Washington',
    role: 'parent',
    lastMessage: "Just wanted to check in about Marcus's upcoming campus visit. Do you need any additional documentation?",
    timestamp: 'Yesterday',
    unread: true,
    archived: false,
  },
  {
    id: '3',
    contactName: 'Coach Martinez',
    role: 'coach',
    organization: 'Oklahoma State',
    lastMessage: "Great game last Friday! Our staff was impressed with your performance. Let's talk soon.",
    timestamp: 'Yesterday',
    unread: false,
    archived: false,
  },
  {
    id: '4',
    contactName: 'David Chen',
    role: 'athlete',
    lastMessage: "Thanks for connecting! Would love to hear about your experience with the recruiting process.",
    timestamp: 'Dec 28',
    unread: false,
    archived: false,
  },
  {
    id: '5',
    contactName: 'Coach Thompson',
    role: 'recruiter',
    organization: 'Baylor',
    lastMessage: "Following up on our conversation. Have you made any decisions about official visits?",
    timestamp: 'Dec 27',
    unread: false,
    archived: true,
  },
];

export default function MessagesPage() {
  const [conversations] = useState(MOCK_CONVERSATIONS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [isComposeOpen, setIsComposeOpen] = useState(false);

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
  const unreadCount = conversations.filter((c) => c.unread && !c.archived).length;

  return (
    <div className="min-h-screen bg-[#050505] flex">
      {/* Sidebar - Conversation List */}
      <div className="w-[380px] border-r border-[#27272a] flex flex-col">
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
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center">
              <Mail className="w-10 h-10 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No conversations found</p>
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
                      <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-medium text-sm">
                          {conversation.contactName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)}
                        </span>
                      </div>

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
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <MessageThread
            conversation={selectedConversation}
            onBack={() => setSelectedId(null)}
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
        onSend={(message) => {
          console.log('Send message:', message);
          setIsComposeOpen(false);
        }}
      />
    </div>
  );
}
