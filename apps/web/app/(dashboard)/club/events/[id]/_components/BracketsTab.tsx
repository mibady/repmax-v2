'use client';

import { useState } from 'react';
import { useBrackets } from '@/lib/hooks/use-brackets';
import { Loader2 } from 'lucide-react';

interface Registration {
  id: string;
  team_name: string | null;
  payment_status: string;
}

interface Bracket {
  id: string;
  name: string;
  bracket_type: string;
  status: string;
}

interface BracketsTabProps {
  tournamentId: string;
  registrations: Registration[];
}

export default function BracketsTab({ tournamentId, registrations }: BracketsTabProps) {
  const { brackets, isLoading, createBracket } = useBrackets(tournamentId);
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('Main Bracket');
  const [bracketType, setBracketType] = useState<"single_elim" | "double_elim" | "round_robin" | "pool_play" | "pool_to_bracket">('single_elim');
  const [submitting, setSubmitting] = useState(false);

  // Simple seeding: just take all approved registrations
  const approvedRegs = registrations.filter(r => r.payment_status === 'approved');

  async function handleCreate() {
    if (approvedRegs.length < 2) {
      alert('Need at least 2 approved registrations to create a bracket.');
      return;
    }

    setSubmitting(true);
    try {
      const seeds = approvedRegs.map((reg, idx) => ({
        registrationId: reg.id,
        teamName: reg.team_name || 'Unnamed Team',
        seed: idx + 1
      }));

      await createBracket({
        name,
        bracket_type: bracketType,
        seeds,
        pool_size: bracketType.includes('pool') ? 4 : undefined,
        advance_count: bracketType === 'pool_to_bracket' ? 2 : undefined
      });
      setIsAdding(false);
    } catch (err) {
      console.error(err);
      alert('Failed to create bracket. Check console for details.');
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Tournament Brackets</h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">add_chart</span>
            Generate Bracket
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-[#1F1F22] border border-white/5 rounded-xl p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Bracket Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#141414] text-white border border-white/10 rounded-lg px-4 py-2.5 outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">Bracket Type</label>
              <select
                value={bracketType}
                onChange={(e) => setBracketType(e.target.value as "single_elim" | "double_elim" | "round_robin" | "pool_play" | "pool_to_bracket")}
                className="w-full bg-[#141414] text-white border border-white/10 rounded-lg px-4 py-2.5 outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="single_elim">Single Elimination</option>
                <option value="double_elim">Double Elimination</option>
                <option value="round_robin">Round Robin</option>
                <option value="pool_play">Pool Play</option>
                <option value="pool_to_bracket">Pool to Bracket</option>
              </select>
            </div>
          </div>

          <div className="bg-[#141414] border border-white/5 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">Seeding Summary</h4>
            <p className="text-gray-400 text-sm mb-4">
              Generating bracket for {approvedRegs.length} approved teams. Teams will be seeded based on registration date.
            </p>
            <div className="flex flex-wrap gap-2">
              {approvedRegs.map((reg, idx) => (
                <span key={reg.id} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-gray-300">
                  {idx + 1}. {reg.team_name}
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setIsAdding(false)}
              className="px-5 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={submitting || approvedRegs.length < 2}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {submitting ? <Loader2 className="size-4 animate-spin" /> : 'Generate Now'}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {brackets.length === 0 ? (
          <div className="py-12 text-center bg-[#141414] border border-dashed border-white/10 rounded-xl">
            <span className="material-symbols-outlined text-gray-600 text-4xl mb-2">account_tree</span>
            <p className="text-gray-500">No brackets generated yet</p>
          </div>
        ) : (
          brackets.map((bracket: Bracket) => (
            <div key={bracket.id} className="bg-[#141414] border border-white/5 rounded-xl p-6 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-2xl">
                    {bracket.bracket_type === 'round_robin' ? 'sync' : 'account_tree'}
                  </span>
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg">{bracket.name}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">
                      {bracket.bracket_type.replaceAll('_', ' ')}
                    </span>
                    <span className="size-1 rounded-full bg-gray-700"></span>
                    <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded ${
                      bracket.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                    }`}>
                      {bracket.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => alert('Bracket visualization coming soon!')}
                  className="px-4 py-2 text-xs font-bold text-white bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                >
                  View Bracket
                </button>
                <button 
                  onClick={() => alert('Bracket activation coming soon!')}
                  className="px-4 py-2 text-xs font-bold text-primary bg-primary/10 border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors"
                >
                  Set Active
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
