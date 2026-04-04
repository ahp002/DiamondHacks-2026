export interface AgentResult {
  subtotal: number | null;
  deliveryFee: number | null;
  serviceFee: number | null;
  total: number | null;
  notes: string;
}

export type AgentStatus = 'idle' | 'running' | 'done' | 'error';

export interface AgentState {
  id: string;
  label: string;
  status: AgentStatus;
  result: AgentResult | null;
  error: string | null;
}
