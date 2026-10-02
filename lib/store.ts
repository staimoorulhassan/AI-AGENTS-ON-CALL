import { prisma } from '@/lib/db';

export interface ActiveCallData {
  id: string;
  destination: string;
  callerId: string;
  assistantId: string;
  startedAt: string;
  status: 'active' | 'human' | 'ended';
}

export interface TransferAuditData {
  id: string;
  callId: string;
  mode: string;
  destination: string;
  result: 'success' | 'failed';
  details: string;
  timestamp: string;
}

export async function listActiveCalls(): Promise<ActiveCallData[]> {
  const calls = await prisma.activeCall.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return calls.map((c: any) => ({
    id: c.id,
    destination: c.destination,
    callerId: c.callerId,
    assistantId: c.assistantId,
    startedAt: c.startedAt.toISOString(),
    status: c.status as 'active' | 'human' | 'ended',
  }));
}

export async function saveActiveCall(call: ActiveCallData) {
  await prisma.activeCall.create({
    data: {
      id: call.id,
      destination: call.destination,
      callerId: call.callerId,
      assistantId: call.assistantId,
      startedAt: new Date(call.startedAt),
      status: call.status,
    },
  });
  return call;
}

async function setCallStatus(callId: string, status: 'active' | 'human' | 'ended') {
  const existing = await prisma.activeCall.findUnique({ where: { id: callId } });
  if (!existing) return null;
  const updated = await prisma.activeCall.update({
    where: { id: callId },
    data: { status },
  });
  return {
    id: updated.id,
    destination: updated.destination,
    callerId: updated.callerId,
    assistantId: updated.assistantId,
    startedAt: updated.startedAt.toISOString(),
    status: updated.status as 'active' | 'human' | 'ended',
  };
}

export async function markCallHandledByHuman(callId: string) {
  return setCallStatus(callId, 'human');
}

export async function markCallEnded(callId: string) {
  return setCallStatus(callId, 'ended');
}

export async function getActiveCallById(callId: string): Promise<ActiveCallData | null> {
  const call = await prisma.activeCall.findUnique({ where: { id: callId } });
  if (!call) return null;
  return {
    id: call.id,
    destination: call.destination,
    callerId: call.callerId,
    assistantId: call.assistantId,
    startedAt: call.startedAt.toISOString(),
    status: call.status as 'active' | 'human' | 'ended',
  };
}

export async function listTransferAudit(): Promise<TransferAuditData[]> {
  const records = await prisma.transferAuditRecord.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return records.map((r: any) => ({
    id: r.id,
    callId: r.callId,
    mode: r.mode as string,
    destination: r.destination,
    result: r.result as 'success' | 'failed',
    details: r.details,
    timestamp: r.timestamp.toISOString(),
  }));
}

export async function appendTransferAudit(record: TransferAuditData) {
  await prisma.transferAuditRecord.create({
    data: {
      id: record.id,
      callId: record.callId,
      mode: record.mode,
      destination: record.destination,
      result: record.result,
      details: record.details,
      timestamp: new Date(record.timestamp),
    },
  });
  return record;
}
