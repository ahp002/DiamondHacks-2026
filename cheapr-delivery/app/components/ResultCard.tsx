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
    <div
      className={`relative rounded-xl p-5 border transition-colors ${
        isWinner
          ? 'border-green-500 dark:border-green-600'
          : 'border-black/10 dark:border-white/10'
      } bg-white dark:bg-gray-900`}
    >
      {isWinner && (
        <span className="absolute top-3 right-4 text-[11px] font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400 px-2.5 py-0.5 rounded-full">
          lowest price
        </span>
      )}

      <p className="text-[15px] font-medium mb-1">{label}</p>

      {error || !result ? (
        <>
          <p className="text-base text-gray-400 dark:text-gray-500 mb-2">Unavailable</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 border-t border-black/5 dark:border-white/5 pt-2.5 mt-2.5 leading-relaxed">
            {error ?? 'No data returned.'}
          </p>
        </>
      ) : (
        <>
          <p className="text-2xl font-medium mb-2">
            {fmt(result.total)}
            <span className="text-sm font-normal text-gray-400 dark:text-gray-500 ml-1">estimated total</span>
          </p>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-gray-500 dark:text-gray-400">
            <span>Subtotal <strong className="text-gray-900 dark:text-gray-100 font-medium">{fmt(result.subtotal)}</strong></span>
            <span>Delivery <strong className="text-gray-900 dark:text-gray-100 font-medium">{fmt(result.deliveryFee)}</strong></span>
            <span>Service fee <strong className="text-gray-900 dark:text-gray-100 font-medium">{fmt(result.serviceFee)}</strong></span>
          </div>

          {result.notes && (
            <p className="text-xs text-gray-400 dark:text-gray-500 border-t border-black/5 dark:border-white/5 pt-2.5 mt-2.5 leading-relaxed">
              {result.notes}
            </p>
          )}
        </>
      )}
    </div>
  );
}
