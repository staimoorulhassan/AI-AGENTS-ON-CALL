import { promises as fs } from 'fs';
import path from 'path';
import { ActiveCall, TransferAuditRecord } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const CALLS_FILE = path.join(DATA_DIR, 'active-calls.json');
const AUDIT_FILE = path.join(DATA_DIR, 'transfer-audit.json');

async function ensureFile(filePath: string) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, '[]', 'utf8');
  }
}

async function readJsonArray<T>(filePath: string): Promise<T[]> {
  await ensureFile(filePath);
  const raw = await fs.readFile(filePath, 'utf8');
  try {
    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeJsonArray<T>(filePath: string, value: T[]) {
  await ensureFile(filePath);
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), 'utf8');
}

export async function listActiveCalls() {
  return readJsonArray<ActiveCall>(CALLS_FILE);
}

export async function saveActiveCall(call: ActiveCall) {
  const calls = await listActiveCalls();
  calls.unshift(call);
  await writeJsonArray(CALLS_FILE, calls);
  return call;
}

export async function markCallTransferred(callId: string) {
  const calls = await listActiveCalls();
  const index = calls.findIndex((c) => c.id === callId);
  if (index === -1) return null;
  const updated = { ...calls[index], status: 'transferred' as const };
  calls[index] = updated;
  await writeJsonArray(CALLS_FILE, calls);
  return updated;
}

export async function getActiveCallById(callId: string) {
  const calls = await listActiveCalls();
  return calls.find((c) => c.id === callId) ?? null;
}

export async function listTransferAudit() {
  return readJsonArray<TransferAuditRecord>(AUDIT_FILE);
}

export async function appendTransferAudit(record: TransferAuditRecord) {
  const records = await listTransferAudit();
  records.unshift(record);
  await writeJsonArray(AUDIT_FILE, records);
  return record;
}
