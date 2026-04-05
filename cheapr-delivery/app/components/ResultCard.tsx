'use client';

import { AgentState } from '../types';

interface ResultCardProps {
  agentState: AgentState;
  isWinner: boolean;
}

function fmt(n: number | null): string {
  return n != null ? '$' + n.toFixed(2) : '—';
}

export default function ResultCard({ agentState, isWinner }: ResultCardProps) {
  const { label, result, error } = agentState;

  return (
    <div className={`flex-1 min-w-0 relative rounded-2xl p-4 border transition-colors ${
      isWinner ? 'border-[#ff3d00] border-2 bg-white/80' : 'border-black/10 bg-white/60'
    }`}>
      {isWinner && (
        <span className="inline-block text-[10px] font-bold bg-[#ff3d00]/10 text-[#cc2200] px-2.5 py-1 rounded-full mb-2">
          lowest price
        </span>
      )}

      <p className="text-[13px] font-semibold text-[#1a1a1a] mb-1">{label}</p>

      {error || !result ? (
        <p className="text-sm text-[#7a4000]">Unavailable</p>
      ) : (
        <>
          <p className={`text-3xl font-bold text-[#1a1a1a] mb-3`}>
            {fmt(result.total)}
          </p>
          <div className="text-[11px] text-[#7a4000] border-t border-black/8 pt-2 space-y-1">
            <div>Delivery: <strong className="text-[#1a1a1a]">{fmt(result.deliveryFee)}</strong></div>
            <div>Service: <strong className="text-[#1a1a1a]">{fmt(result.serviceFee)}</strong></div>
          </div>
        </>
      )}
    </div>
  );
}