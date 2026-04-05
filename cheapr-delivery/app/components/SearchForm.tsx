'use client';

import { useState } from 'react';
import { AgentState } from '../types';
import AgentPill from './AgentPill';
import ResultCard from './ResultCard';

const SUPABASE_URL = 'https://ucoxxqwbxshpoechnesk.supabase.co';
const SUPABASE_KEY = 'sb_publishable_9KALTSNrmaE2G1qHlL5oSA_cv0PaqxC';
const CACHE_MINUTES = 30;

function normalize(str: string) { return str.trim().toLowerCase(); }

async function getCached(address: string, restaurant: string): Promise<AgentState[] | null> {
  const cutoff = new Date(Date.now() - CACHE_MINUTES * 60 * 1000).toISOString();
  const params = new URLSearchParams({
    address:     `eq.${normalize(address)}`,
    restaurant:  `eq.${normalize(restaurant)}`,
    searched_at: `gte.${cutoff}`,
    order:       'searched_at.desc',
  });
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/price_lookups?${params}`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.length) return null;
    return data.map((row: any) => ({
      id:     row.platform.toLowerCase().replace(' ', ''),
      label:  row.platform,
      status: 'done' as const,
      result: {
        subtotal:    row.subtotal,
        deliveryFee: row.delivery_fee,
        serviceFee:  row.service_fee,
        total:       row.total,
        notes:       row.notes,
      },
      error: null,
    }));
  } catch { return null; }
}

async function saveResult(address: string, restaurant: string, platform: string, result: AgentState['result']) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/price_lookups`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        platform,
        address:      normalize(address),
        restaurant:   normalize(restaurant),
        subtotal:     result?.subtotal,
        delivery_fee: result?.deliveryFee,
        service_fee:  result?.serviceFee,
        total:        result?.total,
        notes:        result?.notes,
        searched_at:  new Date().toISOString(),
      }),
    });
  } catch (e) { console.error('Supabase save error:', e); }
}

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
  const [fromCache, setFromCache]   = useState(false);

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
      if (data.result?.total != null) {
        await saveResult(addr, rest, cfg.platform, data.result);
      }
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

    // Check Supabase cache first
    const cached = await getCached(address.trim(), restaurant.trim());
    if (cached && cached.length > 0) {
      setAgents(cached);
      setDoneCount(AGENT_CONFIGS.length);
      setFromCache(true);
      setRunning(false);
      return;
    }
    setFromCache(false);

    setAgents(makeInitialAgents());

    const promises = AGENT_CONFIGS.map(cfg =>
      runAgent(cfg, address.trim(), restaurant.trim())
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
          className="flex-1 min-w-[200px] px-3.5 py-2.5 text-sm border-1 border-transparent rounded-full bg-white/55 text-black placeholder-gray-400 focus:outline-none focus:border-[#b36200] transition-colors"
        />
        <input
          type="text"
          placeholder="Restaurant name (e.g. Chipotle)"
          value={restaurant}
          onChange={e => setRestaurant(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          className="flex-1 min-w-[200px] px-3.5 py-2.5 text-sm border-1 border-transparent rounded-full bg-white/55 text-black placeholder-gray-400 focus:outline-none focus:border-[#b36200] transition-colors"
        />
        <button
          onClick={handleSearch}
          disabled={running}
          className="px-5 py-2.5 bg-[#ff3d00] border border-transparent text-white text-sm font-bold rounded-full disabled:opacity-35 hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:cursor-not-allowed whitespace-nowrap"
        >
          Compare prices
        </button>
      </div>

      {/* Agent pills */}
      {started && (
        <div className="flex flex-row gap-2.5 w-full">
          {agents.map(a => <AgentPill key={a.id} agent={a} />)}
        </div>
      )}

      {/* Status bar */}
      <p className="text-[13px] text-[#b36200] min-h-[20px] my-2">
        {!started
          ? ''
          : running
          ? `${doneCount} of ${totalAgents} agents complete…`
          : allDone
          ? fromCache
            ? "Loaded from cache. Here's the comparison:"
            : "Done! Here's the comparison:"
          : ''}
      </p>

      {/* Savings callout */}
      {allDone && completed.length > 1 && minTotal !== null && (
        <div className="mb-4 px-4 py-3 rounded-full bg-white/60 border border-transparent inline-flex items-center gap-2">
          <span style={{fontSize: '16px'}}>🎉</span>
          <p className="text-sm font-semibold text-[#1a1a1a]">
            You save <span className="text-[#ff3d00]">${(Math.max(...completed.map(a => a.result!.total!)) - minTotal).toFixed(2)}</span> by choosing the cheapest option!
          </p>
        </div>
      )}

      {/* Results */}
      {sortedAgents.length > 0 && (
        <div className="flex flex-row gap-2.5 w-screen -ml-10 px-6">
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
        <p className="text-[11px] text-[#b36200] mt-3 leading-relaxed w-screen">
          Prices are estimates and may not reflect real-time availability. Fees vary by location,
          time, and membership status. Always confirm totals before placing an order.
        </p>
      )}
    </>
  );
}
