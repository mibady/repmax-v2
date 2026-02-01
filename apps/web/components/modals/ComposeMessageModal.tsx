'use client';

import { useState } from 'react';

interface Recipient {
  id: string;
  initials: string;
  name: string;
  organization: string;
  role: string;
}

interface ComposeMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend?: (data: { recipient: Recipient | null; subject: string; message: string }) => void;
}

const suggestedRecipients: Recipient[] = [
  { id: '1', initials: 'CW', name: 'Coach Williams', organization: 'TCU', role: 'Head Coach' },
  { id: '2', initials: 'CW', name: 'Coach Wilson', organization: 'Duke', role: 'Assistant Coach' },
  { id: '3', initials: 'CW', name: 'Coach Willis', organization: 'Ohio State', role: 'Recruiter' },
];

export default function ComposeMessageModal({ isOpen, onClose, onSend }: ComposeMessageModalProps) {
  const [searchQuery, setSearchQuery] = useState('Coach W');
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(suggestedRecipients[0]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [showDropdown, setShowDropdown] = useState(true);

  const filteredRecipients = suggestedRecipients.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.organization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSend = () => {
    if (onSend) {
      onSend({ recipient: selectedRecipient, subject, message });
    }
    onClose();
  };

  const handleSelectRecipient = (recipient: Recipient) => {
    setSelectedRecipient(recipient);
    setSearchQuery(recipient.name);
    setShowDropdown(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Dimming Overlay */}
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative w-full max-w-[560px] bg-[#1F1F22] rounded-[12px] shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto border border-white/5">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
            <h2 className="text-white text-xl font-bold tracking-tight">New Message</h2>
            <button
              className="text-gray-400 hover:text-white transition-colors rounded-full p-1 hover:bg-white/5"
              onClick={onClose}
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex flex-col gap-5 p-6">
            {/* To: Field with Dropdown */}
            <div className="relative z-20">
              <label className="block text-sm font-medium text-gray-300 mb-1.5">To:</label>
              <div className="relative">
                <div className="flex items-center w-full rounded-lg bg-[#2A2A2E] border border-[#3F3F46] focus-within:border-primary focus-within:ring-1 focus-within:ring-primary overflow-hidden transition-all">
                  <span className="material-symbols-outlined text-gray-500 pl-3">search</span>
                  <input
                    className="w-full bg-transparent border-none text-white placeholder-gray-500 focus:ring-0 py-3 px-3"
                    placeholder="Search recipient..."
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                  />
                </div>

                {/* Auto-suggest Dropdown */}
                {showDropdown && filteredRecipients.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#252529] border border-[#3F3F46] rounded-lg shadow-xl overflow-hidden z-30">
                    <div className="py-1">
                      {filteredRecipients.map((recipient) => {
                        const isSelected = selectedRecipient?.id === recipient.id;
                        return (
                          <button
                            key={recipient.id}
                            className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors group ${
                              isSelected ? 'bg-primary/10 border-l-4 border-primary' : ''
                            }`}
                            onClick={() => handleSelectRecipient(recipient)}
                          >
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                isSelected
                                  ? 'bg-primary/20 text-primary'
                                  : 'bg-gray-700 text-gray-300'
                              }`}
                            >
                              {recipient.initials}
                            </div>
                            <div>
                              <p className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                                {recipient.name}
                              </p>
                              <p className={`text-xs ${isSelected ? 'text-gray-400' : 'text-gray-500'}`}>
                                {recipient.organization} • {recipient.role}
                              </p>
                            </div>
                            {isSelected && (
                              <span className="material-symbols-outlined text-primary ml-auto text-[20px]">check</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* NCAA Compliance Warning */}
            <div className="relative z-10 rounded-lg border border-primary/40 bg-primary/5 p-4 flex gap-4 items-start">
              <div className="flex-shrink-0 text-primary">
                <span className="material-symbols-outlined">warning</span>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-white text-sm font-bold">NCAA Compliance Check</p>
                <p className="text-gray-300 text-sm leading-snug">
                  Ensure message adheres to recruiting dead period regulations. Direct contact may be restricted.
                </p>
              </div>
            </div>

            {/* Subject Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Subject</label>
              <input
                className="w-full rounded-lg bg-[#2A2A2E] border border-[#3F3F46] text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary py-3 px-4 transition-all"
                placeholder="Enter subject line"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            {/* Message Area */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Message</label>
              <div className="w-full rounded-lg bg-[#2A2A2E] border border-[#3F3F46] focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all flex flex-col">
                <textarea
                  className="w-full bg-transparent border-none text-white placeholder-gray-500 focus:ring-0 p-4 h-[200px] resize-none"
                  placeholder="Type your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                {/* Attachment Link */}
                <div className="px-4 pb-4 pt-2 border-t border-white/5">
                  <button className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm font-medium group">
                    <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">
                      attach_file
                    </span>
                    Attach file
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 px-6 pb-6 pt-2">
            <button
              className="px-6 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="px-6 py-2.5 rounded-lg bg-primary hover:bg-[#bfa030] text-black font-semibold text-sm transition-colors shadow-lg shadow-primary/10 flex items-center gap-2"
              onClick={handleSend}
            >
              Send Message
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
