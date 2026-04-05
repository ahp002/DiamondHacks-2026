'use client';

import { AgentState } from '../types';

interface AgentPillProps {
  agent: AgentState;
}

const dotClass: Record<AgentState['status'], string> = {
  idle:    'bg-gray-300 dark:bg-gray-600',
  running: 'bg-amber-400 animate-pulse',
  done:    'bg-green-500',
  error:   'bg-red-500',
};

export default function AgentPill({ agent }: AgentPillProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full dark:border-white/10 bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400">
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotClass[agent.status]}`} />
      {agent.label}
    </div>
  );
}
