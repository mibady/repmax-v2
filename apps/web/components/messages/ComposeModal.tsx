'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Search, Paperclip, AlertTriangle, Check, Send } from 'lucide-react';

interface Recipient {
  id: string;
  name: string;
  organization: string;
  role: string;
  avatar?: string;
  isCompliant: boolean;
}

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (message: {
    recipientId: string;
    subject: string;
    body: string;
    attachments: File[];
  }) => void;
  defaultRecipient?: Recipient;
  recipients?: Recipient[];
}

export function ComposeModal({
  isOpen,
  onClose,
  onSend,
  defaultRecipient,
  recipients = [],
}: ComposeModalProps) {
  const [recipient, setRecipient] = useState<Recipient | null>(defaultRecipient || null);
  const [recipientSearch, setRecipientSearch] = useState('');
  const [showRecipientDropdown, setShowRecipientDropdown] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setRecipient(defaultRecipient || null);
      setRecipientSearch('');
      setSubject('');
      setBody('');
      setAttachments([]);
    }
  }, [isOpen, defaultRecipient]);

  const filteredRecipients = recipients.filter(
    (r) =>
      r.name.toLowerCase().includes(recipientSearch.toLowerCase()) ||
      r.organization.toLowerCase().includes(recipientSearch.toLowerCase())
  );

  const handleSend = async () => {
    if (!recipient || !subject.trim() || !body.trim()) return;

    setIsSending(true);
    await onSend({
      recipientId: recipient.id,
      subject,
      body,
      attachments,
    });
    setIsSending(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-xl bg-[#1F1F22] rounded-xl shadow-2xl border border-[#3F3F46] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#3F3F46]">
          <h2 className="text-lg font-semibold text-white">New Message</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#2A2A2E] transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* NCAA Compliance Warning */}
        <div className="px-6 py-3 bg-amber-500/10 border-b border-amber-500/20 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-200">
            Ensure message adheres to{' '}
            <strong>recruiting dead period regulations</strong>. Direct contact
            may be restricted during certain periods.
          </p>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* Recipient Field */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              To
            </label>
            {recipient ? (
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#2A2A2E] border border-[#3F3F46] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#3F3F46] flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      {recipient.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </span>
                  </div>
                  <div>
                    <span className="text-white text-sm font-medium">
                      {recipient.name}
                    </span>
                    <span className="text-gray-500 text-sm ml-2">
                      {recipient.organization} • {recipient.role}
                    </span>
                  </div>
                  {recipient.isCompliant ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  )}
                </div>
                <button
                  onClick={() => setRecipient(null)}
                  className="p-1 hover:bg-[#3F3F46] rounded"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search coaches..."
                    value={recipientSearch}
                    onChange={(e) => {
                      setRecipientSearch(e.target.value);
                      setShowRecipientDropdown(true);
                    }}
                    onFocus={() => setShowRecipientDropdown(true)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#2A2A2E] border border-[#3F3F46] rounded-lg text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-[#d4af35]"
                  />
                </div>
                {showRecipientDropdown && recipients.length === 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-[#2A2A2E] border border-[#3F3F46] rounded-lg shadow-xl p-4 text-center">
                    <p className="text-sm text-gray-500">No recipients available</p>
                  </div>
                )}
                {showRecipientDropdown && filteredRecipients.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-[#2A2A2E] border border-[#3F3F46] rounded-lg shadow-xl max-h-48 overflow-y-auto">
                    {filteredRecipients.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => {
                          setRecipient(r);
                          setRecipientSearch('');
                          setShowRecipientDropdown(false);
                        }}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#3F3F46] transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#3F3F46] flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                              {r.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </span>
                          </div>
                          <div>
                            <span className="text-white text-sm font-medium">
                              {r.name}
                            </span>
                            <span className="text-gray-500 text-sm ml-2">
                              {r.organization} • {r.role}
                            </span>
                          </div>
                        </div>
                        {r.isCompliant ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Subject Field */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              Subject
            </label>
            <input
              type="text"
              placeholder="Enter subject..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#2A2A2E] border border-[#3F3F46] rounded-lg text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-[#d4af35]"
            />
          </div>

          {/* Message Body */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              Message
            </label>
            <textarea
              placeholder="Write your message..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 bg-[#2A2A2E] border border-[#3F3F46] rounded-lg text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-[#d4af35] resize-none"
            />
          </div>

          {/* Attachments */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#2A2A2E] rounded-lg transition-colors"
            >
              <Paperclip className="w-4 h-4" />
              Attach files
            </button>
            {attachments.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#2A2A2E] rounded-lg text-sm"
                  >
                    <span className="text-gray-300 truncate max-w-[150px]">
                      {file.name}
                    </span>
                    <button
                      onClick={() => removeAttachment(index)}
                      className="text-gray-500 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#3F3F46]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!recipient || !subject.trim() || !body.trim() || isSending}
            className="flex items-center gap-2 px-4 py-2 bg-[#d4af35] hover:bg-[#e5c246] text-[#201d12] font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <Send className="w-4 h-4" />
            {isSending ? 'Sending...' : 'Send Message'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ComposeModal;
