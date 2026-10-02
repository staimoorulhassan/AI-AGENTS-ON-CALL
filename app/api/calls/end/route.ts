export const dynamic = 'force-dynamic';

import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import {
  appendTransferAudit,
  getActiveCallById,
  markCallEnded,
} from '@/lib/store';

/**
 * End the current call. Available to the agent once they are handling the call
 * on the dashboard (or for an AI-handled call that should be wrapped up).
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const callId = typeof body?.callId === 'string' ? body.callId.trim() : '';
  if (!callId) {
    return NextResponse.json({ error: 'callId is required' }, { status: 400 });
  }

  const call = await getActiveCallById(callId);
  if (!call || call.status === 'ended') {
    return NextResponse.json(
      { error: 'No live call found to end' },
      { status: 404 },
    );
  }

  await markCallEnded(callId);
  const audit = await appendTransferAudit({
    id: randomUUID(),
    callId,
    mode: 'end',
    destination: 'dashboard',
    result: 'success',
    details:
      call.status === 'human'
        ? 'Agent ended the call from the dashboard.'
        : 'AI-handled call ended.',
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json({
    message: 'Call ended',
    transfer: audit,
  });
}
