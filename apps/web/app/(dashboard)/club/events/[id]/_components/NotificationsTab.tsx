'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, Send, Megaphone } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  body: string;
  notification_type: string;
  sent_at: string;
}

interface NotificationsTabProps {
  tournamentId: string;
}

export default function NotificationsTab({ tournamentId }: NotificationsTabProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState('general');

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/notifications`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setIsSending(true);
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notification_type: type,
          title,
          body,
          channels: ['in_app']
        }),
      });

      if (res.ok) {
        setTitle('');
        setBody('');
        fetchNotifications();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Send Notification Form */}
        <div className="lg:col-span-1">
          <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 sticky top-6">
            <h3 className="text-white font-bold mb-6 flex items-center gap-2">
              <Megaphone className="size-5 text-primary" />
              Broadcast Message
            </h3>
            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Message Type</label>
                <select 
                  value={type} 
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-[#1F1F22] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="general">General Update</option>
                  <option value="schedule_update">Schedule Change</option>
                  <option value="score_update">Score Update</option>
                  <option value="bracket_update">Bracket Update</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Subject</label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Field Change for Round 2"
                  className="w-full bg-[#1F1F22] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Message</label>
                <textarea 
                  required
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={4}
                  placeholder="Enter details for participants..."
                  className="w-full bg-[#1F1F22] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>
              <button 
                type="submit" 
                disabled={isSending}
                className="w-full bg-primary hover:bg-primary/90 text-black font-black py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSending ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
                Send to All Teams
              </button>
            </form>
          </div>
        </div>

        {/* Notification History */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-white font-bold mb-4">Sent Notifications</h3>
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" /></div>
          ) : notifications.length === 0 ? (
            <div className="bg-[#141414] border border-dashed border-white/10 rounded-2xl p-12 text-center text-gray-500 italic">
              No broadcast history for this tournament.
            </div>
          ) : (
            notifications.map((notif) => (
              <div key={notif.id} className="bg-[#141414] border border-white/5 rounded-2xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-white font-bold">{notif.title}</h4>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                      {new Date(notif.sent_at).toLocaleString()}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] font-black uppercase text-gray-400">
                    {notif.notification_type.replaceAll('_', ' ')}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">{notif.body}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
