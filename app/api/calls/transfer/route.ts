import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import {
  appendTransferAudit,
  getActiveCallById,
  markCallTransferred,
} from '@/lib/store';
import { destinationSchema, transferModeSchema } from '@/lib/validation';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const callId = typeof body.callId === 'string' ? body.callId.trim() : '';
  if (!callId) {
    return NextResponse.json({ error: 'callId is required' }, { status: 400 });
  }

  const modeResult = transferModeSchema.safeParse(body.mode);
  if (!modeResult.success) {
    return NextResponse.json({ error: 'mode must be blind or attended' }, { status: 400 });
  }

  const destinationResult = destinationSchema.safeParse(body.destination);
  if (!destinationResult.success) {
    return NextResponse.json(
      { error: destinationResult.error.issues[0]?.message ?? 'Invalid destination' },
      { status: 400 },
    );
  }

  const call = await getActiveCallById(callId);
  if (!call || call.status !== 'active') {
    return NextResponse.json(
      { error: 'Active call not found for transfer' },
      { status: 404 },
    );
  }

  const mode = modeResult.data;
  const destination = destinationResult.data;
  const details =
    mode === 'blind'
      ? 'Blind transfer: redirected immediately to human agent destination.'
      : 'Attended transfer: established human leg before bridging caller.';

  await markCallTransferred(callId);
  const audit = await appendTransferAudit({
    id: randomUUID(),
    callId,
    mode,
    destination,
    result: 'success',
    details,
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json({
    message: 'Transfer completed',
    transfer: audit,
  });
}
