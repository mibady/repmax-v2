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
} from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

interface Conversation {
  id: string;
  contactName: string;
  contactAvatar?: string;
  role: string;
  organization?: string;
}

interface MessageThreadProps {
  conversation: Conversation;
  onBack?: () => void;
}

const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    senderId: 'other',
    content:
      "Hey! I saw your highlight reel from last Friday's game. Really impressive footwork on that third-down conversion.",
    timestamp: '10:30 AM',
    status: 'read',
  },
  {
    id: '2',
    senderId: 'me',
    content:
      "Thank you, Coach! I've been working hard on my route running this season. My position coach has been drilling me on those quick cuts.",
    timestamp: '10:35 AM',
    status: 'read',
  },
  {
    id: '3',
    senderId: 'other',
    content:
      "It definitely shows. I'd love to talk more about your recruiting process. When would be a good time for a call this week?",
    timestamp: '10:38 AM',
    status: 'read',
  },
  {
    id: '4',
    senderId: 'me',
    content:
      "I'm available Thursday or Friday afternoon after practice. Usually done by 5pm CST. Would either of those work for you?",
    timestamp: '10:42 AM',
    status: 'delivered',
  },
];

export function MessageThread({ conversation, onBack }: MessageThreadProps) {
  const [messages, setMessages] = useState(MOCK_MESSAGES);
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
    const message: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      content: newMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      }),
      status: 'sent',
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage('');

    // Simulate send delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    setMessages((prev) =>
      prev.map((m) => (m.id === message.id ? { ...m, status: 'delivered' } : m))
    );
    setIsSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'sent':
        return <Check className="w-3.5 h-3.5 text-gray-500" />;
      case 'delivered':
        return <CheckCheck className="w-3.5 h-3.5 text-gray-500" />;
      case 'read':
        return <CheckCheck className="w-3.5 h-3.5 text-[#d4af35]" />;
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
        {/* Date Separator */}
        <div className="flex items-center justify-center">
          <span className="px-3 py-1 bg-[#1a1a1a] rounded-full text-xs text-gray-500">
            Today
          </span>
        </div>

        {messages.map((message) => {
          const isMe = message.senderId === 'me';
          return (
            <div
              key={message.id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] ${
                  isMe ? 'order-2' : 'order-1'
                }`}
              >
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
            <Send className="w-5 h-5 text-[#201d12]" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default MessageThread;
