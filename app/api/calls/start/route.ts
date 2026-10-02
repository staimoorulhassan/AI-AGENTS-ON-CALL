export const dynamic = 'force-dynamic';

import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { getRuntimeConfig, hasRequiredVapiEnv, maskAssistantId } from '@/lib/env';
import { saveActiveCall } from '@/lib/store';
import { callerIdSchema, destinationSchema } from '@/lib/validation';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const destinationResult = destinationSchema.safeParse(body?.destination);
  if (!destinationResult.success) {
    return NextResponse.json(
      { error: destinationResult.error.issues?.[0]?.message ?? 'Invalid destination' },
      { status: 400 },
    );
  }

  const callerIdResult = callerIdSchema.safeParse(body?.callerId ?? '');
  if (!callerIdResult.success) {
    return NextResponse.json(
      { error: callerIdResult.error.issues?.[0]?.message ?? 'Invalid caller ID' },
      { status: 400 },
    );
  }

  const cfg = getRuntimeConfig();
  if (!cfg.sipUsername || !cfg.sipPassword) {
    return NextResponse.json(
      { error: 'SIP_USERNAME and SIP_PASSWORD must be configured in environment' },
      { status: 503 },
    );
  }

  if (!hasRequiredVapiEnv()) {
    return NextResponse.json(
      { error: 'VAPI environment is incomplete (PUBLIC/PRIVATE/ASSISTANT/CLI keys required)' },
      { status: 503 },
    );
  }

  const call = {
    id: randomUUID(),
    destination: destinationResult.data,
    callerId: callerIdResult.data,
    assistantId: maskAssistantId(cfg.vapiAssistantId),
    startedAt: new Date().toISOString(),
    status: 'active' as const,
  };

  await saveActiveCall(call);

  return NextResponse.json({
    message: 'Outbound call started with pre-configured VAPI assistant',
    call,
  });
}
