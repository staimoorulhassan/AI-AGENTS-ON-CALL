import { NextResponse } from 'next/server';
import { getRuntimeConfig, hasRequiredVapiEnv, maskAssistantId } from '@/lib/env';

export async function GET() {
  const cfg = getRuntimeConfig();
  return NextResponse.json({
    appName: 'ai-agents-on-call',
    sipServer: cfg.sipServer,
    callerIdDefault: cfg.callerId,
    envStatus: {
      sipUsernameConfigured: Boolean(cfg.sipUsername),
      sipPasswordConfigured: Boolean(cfg.sipPassword),
      vapiReady: hasRequiredVapiEnv(),
      assistantIdConfigured: Boolean(cfg.vapiAssistantId),
    },
    assistantIdPreview: maskAssistantId(cfg.vapiAssistantId),
  });
}
