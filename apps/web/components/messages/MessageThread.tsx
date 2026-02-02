'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  ArrowLeft,
  User,
  Search,
  MoreVertical,
  Smile,
  Plus,
  Send,
  Check,
  CheckCheck,
  Loader2,
} from 'lucide-react';
import type { ThreadMessage } from '@/lib/hooks';

interface Conversation {
  id: string;
  contactName: string;
  contactAvatar?: string;
  role: string;
  organization?: string;
  recipientId: string;
}

interface MessageThreadProps {
  conversation: Conversation;
  messages?: ThreadMessage[];
  isLoading?: boolean;
  onBack?: () => void;
  onSendMessage?: (body: string) => Promise<void>;
}

export function MessageThread({
  conversation,
  messages = [],
  isLoading = false,
  onBack,
  onSendMessage,
}: MessageThreadProps) {
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      if (onSendMessage) {
        await onSendMessage(newMessage.trim());
      }
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getStatusIcon = (status: ThreadMessage['status']) => {
    switch (status) {
      case 'sent':
        return <Check className="w-3.5 h-3.5 text-gray-500" />;
      case 'delivered':
        return <CheckCheck className="w-3.5 h-3.5 text-gray-500" />;
      case 'read':
        return <CheckCheck className="w-3.5 h-3.5 text-[#d4af35]" />;
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.createdAt).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, ThreadMessage[]>);

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0F0F10]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272a] bg-[#0a0a0a]">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors lg:hidden"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
          )}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center">
              {conversation.contactAvatar ? (
                <Image
                  src={conversation.contactAvatar}
                  alt={conversation.contactName}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <span className="text-white font-medium text-sm">
                  {conversation.contactName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-white font-semibold">
                {conversation.contactName}
              </h2>
              <p className="text-gray-500 text-sm">
                {conversation.organization
                  ? `${conversation.organization} • ${conversation.role}`
                  : conversation.role}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors">
            <User className="w-5 h-5 text-gray-400" />
          </button>
          <button className="p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors">
            <Search className="w-5 h-5 text-gray-400" />
          </button>
          <button className="p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors">
            <MoreVertical className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-[#d4af35] animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-4">
              <Send className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-white font-medium mb-2">No messages yet</h3>
            <p className="text-gray-500 text-sm max-w-xs">
              Start the conversation by sending a message to{' '}
              {conversation.contactName}.
            </p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date}>
              {/* Date Separator */}
              <div className="flex items-center justify-center mb-4">
                <span className="px-3 py-1 bg-[#1a1a1a] rounded-full text-xs text-gray-500">
                  {formatDateHeader(date)}
                </span>
              </div>

              {dateMessages.map((message) => {
                const isMe = message.senderId === 'me';
                return (
                  <div
                    key={message.id}
                    className={`flex mb-4 ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${isMe ? 'order-2' : 'order-1'}`}>
                      <div
                        className={`px-4 py-3 rounded-2xl ${
                          isMe
                            ? 'bg-[#d4af35] text-[#201d12] rounded-br-md'
                            : 'bg-[#1F1F22] text-white rounded-bl-md'
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                      </div>
                      <div
                        className={`flex items-center gap-1.5 mt-1 ${
                          isMe ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <span className="text-xs text-gray-500">
                          {message.timestamp}
                        </span>
                        {isMe && (
                          <span className="flex items-center gap-0.5">
                            {getStatusIcon(message.status)}
                            {message.status === 'read' && (
                              <span className="text-xs text-[#d4af35]">Read</span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-[#27272a] bg-[#1A1A1A]">
        <div className="flex items-end gap-3">
          <button className="p-2 rounded-lg hover:bg-[#2a2a2d] transition-colors">
            <Plus className="w-5 h-5 text-gray-400" />
          </button>
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Press Enter to send, Shift + Enter for new line"
              rows={1}
              className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#27272a] rounded-xl text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-[#d4af35] resize-none min-h-[48px] max-h-[120px]"
              style={{ height: 'auto' }}
            />
          </div>
          <button className="p-2 rounded-lg hover:bg-[#2a2a2d] transition-colors">
            <Smile className="w-5 h-5 text-gray-400" />
          </button>
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || isSending}
            className="p-3 bg-[#d4af35] hover:bg-[#e5c246] rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 text-[#201d12] animate-spin" />
            ) : (
              <Send className="w-5 h-5 text-[#201d12]" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MessageThread;
