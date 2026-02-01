'use client';

import { useState } from 'react';

interface Message {
  id: string;
  sender: 'me' | 'them';
  senderName: string;
  text: string;
  time: string;
  avatar?: string;
  isRead?: boolean;
}

const messages: Message[] = [
  {
    id: '1',
    sender: 'them',
    senderName: 'Coach Williams',
    text: "Hey! I reviewed your tape. Impressive speed off the line.",
    time: '10:30 AM',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHGVMmleRvfIoCcAjTkMct0BZjKEWtbKOwi0CvDbxuf1CQsu17RTdZufJOhAlmt82HDtqJRnsgQFNcu6rKtzKPZziy0hb7EyXAqVv9Gux4i1FmZdmZjE0NXRmfiR1AmvADVHVfbs2m6TPprzdDVGSjr9cvLFzUuI8ZwqKmbVbhAerob8PgDSUzmrnJTIhbzbjRzCFI8nNCtm1ptJqv4qg13M9unOsWrSmaOoBJOJ6g2E30BpYIojR4MjyJyx-h0MPKNYEdpUX_XvE',
  },
  {
    id: '2',
    sender: 'me',
    senderName: 'Me',
    text: "Thanks Coach! I've been working specifically on my first step this off-season.",
    time: '10:42 AM',
    isRead: true,
  },
  {
    id: '3',
    sender: 'them',
    senderName: 'Coach Williams',
    text: 'It shows. When are you free for a quick call?',
    time: '10:45 AM',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVnugBfUte2mFmXSuSf77o-utjjm6KHJfHAt7T34elHhyqlvXTT14iY2WNVNXx-IA80tKWI5d7H0NUdvUhDJPWYO1k_x7J34vKPuR8fM9ptKxNK3PLOvG77QZhbmKBmrXYnxYAc4z0gJtK5Kb86__n1LTTz0eq1fFdo1jHuGhkAFHzyvD0F1_0vNccwxr_DWfrs_dRyF0bIhpDXVEeYpKFjwW1YcN9Tb3fhQVN9AvgRxiakXHW4JnHY5Vxx7H6ziAbuzTdMjObHd4',
  },
];

export default function ChatThreadPage() {
  const [messageText, setMessageText] = useState('');
  const [isTyping] = useState(true);

  const handleSend = () => {
    if (messageText.trim()) {
      // Handle send message
      setMessageText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-[#0F0F10] h-screen w-full flex flex-col font-sans antialiased overflow-hidden text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-[#141415] border-b border-[#2A2A2E] shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            <div
              className="h-12 w-12 rounded-full bg-cover bg-center bg-no-repeat ring-2 ring-[#2A2A2E]"
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDaIghdZECc8rCzkQOGeOyxi4UGPr0Q1r2zaBOg_94TuCiX4j71-0pr6e7LSZc1mI8d8d8NfO4ddzyhfK8Xvy3gFxqeJzyGjx6YPYnu4mSPVjQql3h8de864zIy61vbiXWDOJtdOK5vLaRThgLH8bbS-MVhCDv1A6L9PBfQFa6JxjyUF7Jr5GvIu4VmI-wxj8rc3DCRTJTP7fLWIQE8jiE_Fy1AD6EmkyMB4AoghjylO3F33QpamRcB73QjK4OV5eCh3QqmN6EQreE')`,
              }}
            />
            <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-[#141415]"></div>
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-white text-lg font-bold tracking-tight">Coach Williams</h1>
              <span className="bg-blue-600/20 text-blue-400 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-blue-500/30">
                TCU Recruiter
              </span>
            </div>
            <div className="flex items-center gap-1 group cursor-pointer w-fit">
              <span className="material-symbols-outlined text-primary text-sm">person</span>
              <span className="text-primary text-sm font-medium group-hover:underline">View Profile</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 text-gray-400">
          <button aria-label="Search" className="p-2 hover:bg-[#2A2A2E] rounded-full transition-colors">
            <span className="material-symbols-outlined">search</span>
          </button>
          <button aria-label="Options" className="p-2 hover:bg-[#2A2A2E] rounded-full transition-colors">
            <span className="material-symbols-outlined">more_vert</span>
          </button>
        </div>
      </header>

      {/* Message Area */}
      <main className="flex-1 overflow-y-auto px-6 py-6 bg-[#0F0F10] relative">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          {/* Date Separator */}
          <div className="flex justify-center my-2">
            <div className="bg-[#1F1F22] px-4 py-1 rounded-full text-xs font-medium text-gray-400 border border-[#2A2A2E]">
              Today
            </div>
          </div>

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-end gap-3 group ${message.sender === 'me' ? 'justify-end' : ''}`}
            >
              {/* Incoming avatar */}
              {message.sender === 'them' && message.avatar && (
                <div
                  className="h-8 w-8 rounded-full bg-cover bg-center shrink-0 mb-1 opacity-80"
                  style={{ backgroundImage: `url('${message.avatar}')` }}
                />
              )}

              <div className={`flex flex-col gap-1 max-w-[70%] ${message.sender === 'me' ? 'items-end' : ''}`}>
                {/* Header */}
                <div className={`flex items-baseline gap-2 ${message.sender === 'me' ? 'pr-1' : 'pl-1'} mb-0.5`}>
                  {message.sender === 'me' ? (
                    <>
                      <span className="font-mono text-[10px] text-gray-600">{message.time}</span>
                      <span className="text-xs font-medium text-gray-400">{message.senderName}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xs font-medium text-gray-400">{message.senderName}</span>
                      <span className="font-mono text-[10px] text-gray-600">{message.time}</span>
                    </>
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={`px-5 py-3 text-white text-[13px] leading-relaxed ${
                    message.sender === 'me'
                      ? 'bg-primary/10 border-l-2 border-primary rounded-2xl rounded-tr-sm'
                      : 'bg-[#1F1F22] rounded-2xl rounded-tl-sm shadow-sm'
                  }`}
                >
                  {message.text}
                </div>

                {/* Read receipt */}
                {message.sender === 'me' && message.isRead && (
                  <div className="flex items-center gap-1 mt-0.5 pr-1">
                    <span className="text-[10px] text-primary/60">Read</span>
                    <span className="material-symbols-outlined text-[14px] text-primary">done_all</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-end gap-3 mt-2 pl-11">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 italic">Coach Williams is typing...</span>
                <div className="flex gap-1 items-center bg-[#1F1F22] px-2 py-1.5 rounded-full h-6 w-10 justify-center">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '75ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Input Bar */}
      <footer className="bg-[#1A1A1A] border-t border-[#2A2A2E] p-4 shrink-0 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-3">
            {/* Utilities */}
            <button
              aria-label="Add attachment"
              className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-[#2A2A2E] transition-colors h-10 w-10 flex items-center justify-center shrink-0"
            >
              <span className="material-symbols-outlined">add_circle</span>
            </button>
            <button
              aria-label="Add emoji"
              className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-[#2A2A2E] transition-colors h-10 w-10 flex items-center justify-center shrink-0"
            >
              <span className="material-symbols-outlined">sentiment_satisfied</span>
            </button>

            {/* Input Field */}
            <div className="flex-1 relative">
              <textarea
                className="w-full bg-[#0F0F10] text-white text-sm placeholder-gray-500 rounded-xl px-4 py-3 border border-[#2A2A2E] focus:border-primary/50 focus:ring-1 focus:ring-primary/50 focus:outline-none resize-none overflow-hidden min-h-[44px]"
                placeholder="Type a message..."
                rows={1}
                style={{ height: '44px' }}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            {/* Send Button */}
            <button
              aria-label="Send message"
              className="bg-primary hover:bg-yellow-500 text-[#201d12] h-11 w-11 rounded-full flex items-center justify-center shadow-lg transition-colors shrink-0"
              onClick={handleSend}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                send
              </span>
            </button>
          </div>
          <div className="flex justify-center mt-2">
            <p className="text-[10px] text-gray-600">Press Enter to send, Shift + Enter for new line</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #141415;
        }
        ::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #444;
        }
      `}</style>
    </div>
  );
}
