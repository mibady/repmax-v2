'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Mail } from 'lucide-react';
import { MessageThread } from '@/components/messages/MessageThread';
import { useConversation } from '@/lib/hooks';

export default function ChatThreadPage() {
  const params = useParams();
  const router = useRouter();
  const contactId = params.id as string;

  const {
    messages,
    contact,
    isLoading,
    error,
    sendMessage,
  } = useConversation(contactId);

  const handleBack = () => {
    router.push('/dashboard/messages');
  };

  const handleSendMessage = async (body: string) => {
    await sendMessage(body);
  };

  // Error state
  if (error) {
    return (
      <div className="bg-[#0F0F10] min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Unable to load conversation
          </h2>
          <p className="text-gray-500 mb-6">{error.message}</p>
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#d4af35] text-[#201d12] rounded-lg hover:bg-[#e5c246] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to messages
          </button>
        </div>
      </div>
    );
  }

  // Build conversation object for MessageThread
  const conversation = contact
    ? {
        id: contact.id,
        contactName: contact.name,
        contactAvatar: contact.avatar || undefined,
        role: contact.title
          ? `${contact.title}`
          : contact.role.charAt(0).toUpperCase() + contact.role.slice(1),
        organization: contact.organization,
        recipientId: contact.id,
      }
    : {
        id: contactId,
        contactName: 'Loading...',
        role: '',
        recipientId: contactId,
      };

  return (
    <div className="bg-[#0F0F10] h-screen w-full flex flex-col font-sans antialiased overflow-hidden text-white">
      <MessageThread
        conversation={conversation}
        messages={messages}
        isLoading={isLoading}
        onBack={handleBack}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
