'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

type StatusResponse = {
  sipServer: string;
  callerIdDefault: string;
  envStatus: {
    sipUsernameConfigured: boolean;
    sipPasswordConfigured: boolean;
    vapiReady: boolean;
    assistantIdConfigured: boolean;
  };
  assistantIdPreview: string;
};

type ActiveCall = {
  id: string;
  destination: string;
  callerId: string;
  assistantIdPreview: string;
  startedAt: string;
  status: 'active' | 'transferred';
};

type TransferAudit = {
  id: string;
  callId: string;
  mode: 'blind' | 'attended';
  destination: string;
  result: 'success' | 'failed';
  details: string;
  timestamp: string;
};

const emptyMessage = { info: '', error: '' };

export default function HomePage() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [callerId, setCallerId] = useState('');
  const [destination, setDestination] = useState('');
  const [callId, setCallId] = useState('');
  const [transferDestination, setTransferDestination] = useState('');
  const [transferMode, setTransferMode] = useState<'blind' | 'attended'>('blind');
  const [activeCalls, setActiveCalls] = useState<ActiveCall[]>([]);
  const [audit, setAudit] = useState<TransferAudit[]>([]);
  const [message, setMessage] = useState(emptyMessage);
  const [loading, setLoading] = useState(false);

  async function loadState() {
    const [statusRes, auditRes] = await Promise.all([
      fetch('/api/config/status', { cache: 'no-store' }),
      fetch('/api/transfers/audit', { cache: 'no-store' }),
    ]);

    if (statusRes.ok) {
      const cfg = (await statusRes.json()) as StatusResponse;
      setStatus(cfg);
      // Explicit requirement: default remains blank and user initialized only.
      setCallerId('');
    }

    if (auditRes.ok) {
      const payload = (await auditRes.json()) as {
        audit: TransferAudit[];
        activeCalls: ActiveCall[];
      };
      setAudit(payload.audit);
      setActiveCalls(payload.activeCalls);
      const firstActive = payload.activeCalls.find((c) => c.status === 'active');
      setCallId(firstActive?.id ?? '');
    }
  }

  useEffect(() => {
    void loadState();
  }, []);

  const activeCallOptions = useMemo(
    () => activeCalls.filter((c) => c.status === 'active'),
    [activeCalls],
  );

  async function startCall(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage(emptyMessage);
    try {
      const response = await fetch('/api/calls/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination, callerId }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setMessage({ info: '', error: payload.error ?? 'Unable to start call' });
        return;
      }
      setMessage({
        info: `Call ${payload.call.id} started with assistant ${payload.call.assistantId}`,
        error: '',
      });
      setDestination('');
      await loadState();
    } finally {
      setLoading(false);
    }
  }

  async function transferCall(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage(emptyMessage);
    try {
      const response = await fetch('/api/calls/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId, mode: transferMode, destination: transferDestination }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setMessage({ info: '', error: payload.error ?? 'Unable to transfer call' });
        return;
      }
      setMessage({
        info: `Transfer ${payload.transfer.id} completed (${payload.transfer.mode})`,
        error: '',
      });
      setTransferDestination('');
      await loadState();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <h1>AI Agents On Call</h1>
      <p className="muted">
        Outbound VoIP dialer with VAPI AI handoff and human transfer controls.
      </p>

      <section className="card">
        <h2>Outbound Calling Setup</h2>
        <div className="grid">
          <div>
            <label>SIP server</label>
            <input value={status?.sipServer ?? 'sip.suii.us:5060'} readOnly />
            <small className="muted">Defaults to sip.suii.us:5060 when no override is set.</small>
          </div>
          <div>
            <label>SIP_USERNAME configured</label>
            <input value={status?.envStatus.sipUsernameConfigured ? 'Yes' : 'No'} readOnly />
          </div>
          <div>
            <label>SIP_PASSWORD configured</label>
            <input value={status?.envStatus.sipPasswordConfigured ? 'Yes' : 'No'} readOnly />
          </div>
          <div>
            <label>Caller ID (blank by default)</label>
            <input
              value={callerId}
              onChange={(e) => setCallerId(e.target.value)}
              placeholder="Leave blank unless user sets one"
            />
          </div>
        </div>
      </section>

      <section className="card">
        <h2>VAPI AI Integration</h2>
        <div className="grid">
          <div>
            <label>VAPI env readiness</label>
            <input value={status?.envStatus.vapiReady ? 'Ready' : 'Missing env keys'} readOnly />
          </div>
          <div>
            <label>Assistant ID from env</label>
            <input
              value={
                status?.assistantIdPreview || 'Not configured'
              }
              readOnly
            />
          </div>
          <div>
            <label>Assistant selected</label>
            <input
              value={status?.envStatus.assistantIdConfigured ? 'Yes (VAPI_ASSISTANT_ID)' : 'No'}
              readOnly
            />
          </div>
        </div>
      </section>

      <section className="card">
        <h2>Start AI-handled Outbound Call</h2>
        <form onSubmit={startCall}>
          <div className="grid">
            <div>
              <label>Destination number</label>
              <input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="+15551234567"
                required
              />
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <button disabled={loading}>Start call</button>
          </div>
        </form>
      </section>

      <section className="card">
        <h2>Transfer to Human Agent</h2>
        <form onSubmit={transferCall}>
          <div className="grid">
            <div>
              <label>Active call</label>
              <select value={callId} onChange={(e) => setCallId(e.target.value)} required>
                <option value="">Select active call</option>
                {activeCallOptions.map((call) => (
                  <option key={call.id} value={call.id}>
                    {call.id.slice(0, 8)}… → {call.destination}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Transfer mode</label>
              <select
                value={transferMode}
                onChange={(e) => setTransferMode(e.target.value as 'blind' | 'attended')}
              >
                <option value="blind">Blind</option>
                <option value="attended">Attended</option>
              </select>
            </div>
            <div>
              <label>Human destination</label>
              <input
                value={transferDestination}
                onChange={(e) => setTransferDestination(e.target.value)}
                placeholder="+15557654321"
                required
              />
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <button disabled={loading}>Transfer call</button>
          </div>
        </form>
      </section>

      <section className="card">
        <h2>Transfer audit</h2>
        {audit.length === 0 ? (
          <p className="muted">No transfer records yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Call ID</th>
                <th>Mode</th>
                <th>Destination</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {audit.map((record) => (
                <tr key={record.id}>
                  <td>{new Date(record.timestamp).toLocaleString()}</td>
                  <td>{record.callId.slice(0, 8)}…</td>
                  <td>{record.mode}</td>
                  <td>{record.destination}</td>
                  <td>{record.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {message.info ? <div className="notice">{message.info}</div> : null}
      {message.error ? <div className="error">{message.error}</div> : null}
    </main>
  );
}
