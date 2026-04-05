'use client';

import { useState } from 'react';
import { AgentState } from '../types';
import AgentPill from './AgentPill';
import ResultCard from './ResultCard';

/* ──────────────────────────────────────────────
   AGENT DEFINITIONS
   Add or remove agents here. Each agent needs:
   - id:      unique slug
   - label:   display name
   - platform: string passed to the API route
   ────────────────────────────────────────────── */
const AGENT_CONFIGS = [
  { id: 'grubhub',  label: 'GrubHub',   platform: 'GrubHub' },
  { id: 'doordash', label: 'DoorDash',  platform: 'DoorDash' },
  { id: 'ubereats', label: 'Uber Eats', platform: 'Uber Eats' },
] as const;

function makeInitialAgents(): AgentState[] {
  return AGENT_CONFIGS.map(cfg => ({
    id: cfg.id,
    label: cfg.label,
    status: 'idle',
    result: null,
    error: null,
  }));
}

export default function SearchForm() {
  const [address, setAddress]       = useState('');
  const [restaurant, setRestaurant] = useState('');
  const [agents, setAgents]         = useState<AgentState[]>(makeInitialAgents());
  const [running, setRunning]       = useState(false);
  const [started, setStarted]       = useState(false);
  const [doneCount, setDoneCount]   = useState(0);

  function updateAgent(id: string, patch: Partial<AgentState>) {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, ...patch } : a));
  }

  async function runAgent(cfg: typeof AGENT_CONFIGS[number], addr: string, rest: string) {
    updateAgent(cfg.id, { status: 'running' });

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: cfg.platform, address: addr, restaurant: rest }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }

      updateAgent(cfg.id, { status: 'done', result: data.result });
    } catch (e) {
      updateAgent(cfg.id, {
        status: 'error',
        error: e instanceof Error ? e.message : 'Agent failed.',
      });
    }

    setDoneCount(c => c + 1);
  }

  async function handleSearch() {
    if (running) return;
    if (!address.trim() || !restaurant.trim()) return;

    setRunning(true);
    setStarted(true);
    setDoneCount(0);
    setAgents(makeInitialAgents());

    const promises = AGENT_CONFIGS.map((cfg, i) =>
      new Promise<void>(resolve =>
        setTimeout(async () => {
          await runAgent(cfg, address.trim(), restaurant.trim());
          resolve();
        }, i * 300)
      )
    );

    await Promise.all(promises);
    setRunning(false);
  }

  // Compute winner
  const completed = agents.filter(a => a.status === 'done' && a.result?.total != null);
  const minTotal  = completed.length
    ? Math.min(...completed.map(a => a.result!.total!))
    : null;

  const totalAgents = AGENT_CONFIGS.length;
  const allDone     = doneCount === totalAgents;

  const sortedAgents = started
    ? [...agents].sort((a, b) => {
        const ta = a.result?.total ?? Infinity;
        const tb = b.result?.total ?? Infinity;
        return ta - tb;
      })
    : [];

  return (
    <>
      {/* Input row */}
      <div className="flex flex-wrap gap-2.5 mb-2">
        <input
          type="text"
          placeholder="Delivery address (e.g. 123 Main St, San Diego, CA)"
          value={address}
          onChange={e => setAddress(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          className="flex-1 min-w-[200px] px-3.5 py-2.5 text-sm border-1 border-white/50 dark:border-white/55 rounded-full bg-white/55 dark:bg-gray-500 text-black placeholder-gray-400 focus:outline-none focus:border-gray-400 dark:focus:border-gray-400 transition-colors"
        />
        <input
          type="text"
          placeholder="Restaurant name (e.g. Chipotle)"
          value={restaurant}
          onChange={e => setRestaurant(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          className="flex-1 min-w-[200px] px-3.5 py-2.5 text-sm border-1 border-white/50 dark:border-white/55 rounded-full bg-white/55 dark:bg-gray-500 text-black placeholder-gray-400 focus:outline-none focus:border-gray-400 dark:focus:border-gray-400 transition-colors"
        />
        <button
          onClick={handleSearch}
          disabled={running}
          className="px-5 py-2.5 bg-[#ff3d00] border border-[#cc2200] dark:bg-gray-100 text-white dark:text-gray-400 text-sm font-medium rounded-full disabled:opacity-35 hover:opacity-80 transition-opacity cursor-pointer disabled:cursor-not-allowed whitespace-nowrap"
        >
          Compare prices
        </button>
      </div>

      {/* Agent pills */}
      {started && (
        <div className="flex flex-wrap gap-2 mb-4">
          {agents.map(a => <AgentPill key={a.id} agent={a} />)}
        </div>
      )}

      {/* Status bar */}
      <p className="text-[13px] text-gray-500 dark:text-gray-400 min-h-[20px] mb-4">
        {!started
          ? ''
          : running
          ? `${doneCount} of ${totalAgents} agents complete…`
          : allDone
          ? "Done. Here's the comparison:"
          : ''}
      </p>

      {/* Results */}
      {sortedAgents.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {sortedAgents.map(a => (
            <ResultCard
              key={a.id}
              agentState={a}
              isWinner={
                a.status === 'done' &&
                a.result?.total != null &&
                a.result.total === minTotal
              }
            />
          ))}
        </div>
      )}

      {/* Disclaimer */}
      {started && allDone && (
        <p className="text-[11px] text-gray-400 dark:text-gray-600 mt-6 leading-relaxed">
          Prices are estimates and may not reflect real-time availability. Fees vary by location,
          time, and membership status. Always confirm totals before placing an order.
        </p>
      )}
    </>
  );
}
