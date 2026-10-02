export type TransferMode = 'blind' | 'attended';

export interface ActiveCall {
  id: string;
  destination: string;
  callerId: string;
  assistantId: string;
  startedAt: string;
  status: 'active' | 'transferred';
}

export interface TransferAuditRecord {
  id: string;
  callId: string;
  mode: TransferMode;
  destination: string;
  result: 'success' | 'failed';
  details: string;
  timestamp: string;
}
