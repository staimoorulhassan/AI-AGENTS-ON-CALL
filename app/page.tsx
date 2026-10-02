'use client';

import { FormEvent, useEffect, useState } from 'react';

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

type CallStatus = 'active' | 'human' | 'ended';

type ActiveCall = {
  id: string;
  destination: string;
  callerId: string;
  assistantIdPreview: string;
  startedAt: string;
  status: CallStatus;
};

type TransferAudit = {
  id: string;
  callId: string;
  mode: string;
  destination: string;
  result: 'success' | 'failed';
  details: string;
  timestamp: string;
};

const emptyMessage = { info: '', error: '' };

function handlerLabel(status: CallStatus) {
  if (status === 'active') return 'AI assistant';
  if (status === 'human') return 'Agent (you)';
  return 'Ended';
}

export default function HomePage() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [callerId, setCallerId] = useState('');
  const [destination, setDestination] = useState('');
  const [activeCalls, setActiveCalls] = useState<ActiveCall[]>([]);
  const [audit, setAudit] = useState<TransferAudit[]>([]);
  const [message, setMessage] = useState(emptyMessage);
  const [loading, setLoading] = useState(false);
  const [busyCallId, setBusyCallId] = useState('');

  async function loadState() {
    try {
      const [statusRes, auditRes] = await Promise.all([
        fetch('/api/config/status', { cache: 'no-store' }),
        fetch('/api/transfers/audit', { cache: 'no-store' }),
      ]);

      if (statusRes?.ok) {
        const cfg = (await statusRes.json()) as StatusResponse;
        setStatus(cfg);
        setCallerId('');
      }

      if (auditRes?.ok) {
        const payload = (await auditRes.json()) as {
          audit: TransferAudit[];
          activeCalls: ActiveCall[];
        };
        setAudit(payload?.audit ?? []);
        setActiveCalls(payload?.activeCalls ?? []);
      }
    } catch (err) {
      console.error('Failed to load state:', err);
    }
  }

  useEffect(() => {
    void loadState();
  }, []);

  const liveCalls = (activeCalls ?? []).filter((c: any) => c?.status !== 'ended');

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
      if (!response?.ok) {
        setMessage({ info: '', error: payload?.error ?? 'Unable to start call' });
        return;
      }
      setMessage({
        info: `Call ${payload?.call?.id ?? 'unknown'} started — handled by the AI assistant.`,
        error: '',
      });
      setDestination('');
      await loadState();
    } catch (err: any) {
      setMessage({ info: '', error: err?.message ?? 'Network error' });
    } finally {
      setLoading(false);
    }
  }

  async function takeOverCall(callId: string) {
    setBusyCallId(callId);
    setMessage(emptyMessage);
    try {
      const response = await fetch('/api/calls/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId }),
      });
      const payload = await response.json();
      if (!response?.ok) {
        setMessage({ info: '', error: payload?.error ?? 'Unable to take over call' });
        return;
      }
      setMessage({
        info: 'You are now handling this call. The AI assistant has left — same call, no number change.',
        error: '',
      });
      await loadState();
    } catch (err: any) {
      setMessage({ info: '', error: err?.message ?? 'Network error' });
    } finally {
      setBusyCallId('');
    }
  }

  async function endCall(callId: string) {
    setBusyCallId(callId);
    setMessage(emptyMessage);
    try {
      const response = await fetch('/api/calls/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId }),
      });
      const payload = await response.json();
      if (!response?.ok) {
        setMessage({ info: '', error: payload?.error ?? 'Unable to end call' });
        return;
      }
      setMessage({ info: 'Call ended.', error: '' });
      await loadState();
    } catch (err: any) {
      setMessage({ info: '', error: err?.message ?? 'Network error' });
    } finally {
      setBusyCallId('');
    }
  }

  return (
    <main className="container">
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: 4 }}>AI Agents On Call</h1>
      <p className="muted" style={{ marginBottom: 20 }}>
        Outbound VoIP dialer. Calls start with the VAPI AI assistant; an agent can take over the
        same call from the dashboard at any time.
      </p>

      <section className="card">
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 12 }}>Outbound Calling Setup</h2>
        <div className="grid">
          <div>
            <label>SIP server</label>
            <input value={status?.sipServer ?? 'sip.suii.us:5060'} readOnly />
            <small className="muted">Defaults to sip.suii.us:5060 when no override is set.</small>
          </div>
          <div>
            <label>SIP_USERNAME configured</label>
            <input value={status?.envStatus?.sipUsernameConfigured ? 'Yes' : 'No'} readOnly />
          </div>
          <div>
            <label>SIP_PASSWORD configured</label>
            <input value={status?.envStatus?.sipPasswordConfigured ? 'Yes' : 'No'} readOnly />
          </div>
          <div>
            <label>Caller ID (blank by default)</label>
            <input
              value={callerId}
              onChange={(e: any) => setCallerId(e?.target?.value ?? '')}
              placeholder="Leave blank unless user sets one"
            />
          </div>
        </div>
      </section>

      <section className="card">
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 12 }}>VAPI AI Integration</h2>
        <div className="grid">
          <div>
            <label>VAPI env readiness</label>
            <input value={status?.envStatus?.vapiReady ? 'Ready' : 'Missing env keys'} readOnly />
          </div>
          <div>
            <label>Assistant ID from env</label>
            <input value={status?.assistantIdPreview || 'Not configured'} readOnly />
          </div>
          <div>
            <label>Assistant selected</label>
            <input
              value={status?.envStatus?.assistantIdConfigured ? 'Yes (VAPI_ASSISTANT_ID)' : 'No'}
              readOnly
            />
          </div>
        </div>
      </section>

      <section className="card">
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 12 }}>Start AI-handled Outbound Call</h2>
        <form onSubmit={startCall}>
          <div className="grid">
            <div>
              <label>Destination number</label>
              <input
                value={destination}
                onChange={(e: any) => setDestination(e?.target?.value ?? '')}
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
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 4 }}>Live Calls</h2>
        <p className="muted" style={{ marginBottom: 12 }}>
          Take over a call to have the AI leave and handle the same call yourself. The call is never
          transferred to another number.
        </p>
        {liveCalls.length === 0 ? (
          <p className="muted">No live calls. Start an outbound call above.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Started</th>
                <th>Destination</th>
                <th>Handled by</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {liveCalls.map((call: any) => (
                <tr key={call?.id}>
                  <td suppressHydrationWarning>
                    {new Date(call?.startedAt ?? '').toLocaleString('en-US', { timeZone: 'UTC' })}
                  </td>
                  <td>{call?.destination ?? ''}</td>
                  <td>
                    <span className={call?.status === 'human' ? 'badge badge-human' : 'badge badge-ai'}>
                      {handlerLabel(call?.status)}
                    </span>
                  </td>
                  <td>
                    {call?.status === 'active' ? (
                      <button
                        type="button"
                        onClick={() => takeOverCall(call?.id)}
                        disabled={busyCallId === call?.id}
                      >
                        Take over call
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => endCall(call?.id)}
                      disabled={busyCallId === call?.id}
                      style={{ marginLeft: call?.status === 'active' ? 8 : 0 }}
                    >
                      End call
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="card">
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 12 }}>Handoff log</h2>
        {(audit?.length ?? 0) === 0 ? (
          <p className="muted">No handoff records yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Call ID</th>
                <th>Action</th>
                <th>Result</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {(audit ?? []).map((record: any) => (
                <tr key={record?.id}>
                  <td suppressHydrationWarning>
                    {new Date(record?.timestamp ?? '').toLocaleString('en-US', { timeZone: 'UTC' })}
                  </td>
                  <td>{(record?.callId ?? '').slice(0, 8)}…</td>
                  <td>{record?.mode === 'end' ? 'Call ended' : 'Agent takeover'}</td>
                  <td>{record?.result ?? ''}</td>
                  <td className="muted">{record?.details ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {message?.info ? <div className="notice">{message.info}</div> : null}
      {message?.error ? <div className="error">{message.error}</div> : null}
    </main>
  );
}
