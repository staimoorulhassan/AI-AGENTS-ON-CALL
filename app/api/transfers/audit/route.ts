import { NextResponse } from 'next/server';
import { listTransferAudit, listActiveCalls } from '@/lib/store';

export async function GET() {
  const [audit, activeCalls] = await Promise.all([
    listTransferAudit(),
    listActiveCalls(),
  ]);

  return NextResponse.json({
    audit,
    activeCalls,
  });
}
