# AI-AGENTS-ON-CALL

Outbound VoIP control panel with VAPI AI call handling and human transfer workflows, implemented from the OpenSpec change `add-vapi-outbound-voip-flow`.

## Stack

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- API route handlers under `app/api/*` as the service layer
- Lightweight file-backed runtime state for active calls and transfer audit (`data/*.json`)

## Implemented OpenSpec change

The following capability specs are implemented:

- `specs/outbound-calling-setup/spec.md`
- `specs/vapi-ai-integration/spec.md`
- `specs/call-transfer/spec.md`
- `specs/security-credentials/spec.md`

### Feature mapping

1. **Outbound Calling Setup**
   - Defaults SIP server to `sip.suii.us:5060` when `SIP_SERVER` is not set.
   - Reads `SIP_USERNAME` and `SIP_PASSWORD` from environment variables.
   - Caller ID input is **blank by default** and only set by user input.

2. **VAPI AI Integration**
   - Reads VAPI credentials from environment (`VAPI_PUBLIC_KEY`, `VAPI_PRIVATE_KEY`, `VAPI_ASSISTANT_ID`, `VAPI_CLI_KEY`).
   - Outbound call start uses the assistant defined by `VAPI_ASSISTANT_ID`.
   - API responses do not expose raw key values.

3. **Human Agent Transfer**
   - Supports **blind** and **attended** transfer modes.
   - Transfer attempts are persisted to audit records with timestamp, mode, destination, call id, and result.

4. **Security / Credentials**
   - `.env` is gitignored.
   - `.env.example` contains placeholders only.
   - No real credential values are committed in source or docs.

## Environment configuration

Create your local environment file from the template:

```bash
cp .env.example .env
```

`.env.example` keys:

```env
VAPI_PRIVATE_KEY=<your-vapi-private-key>
VAPI_PUBLIC_KEY=<your-vapi-public-key>
VAPI_ASSISTANT_ID=<your-vapi-assistant-id>
VAPI_CLI_KEY=<your-vapi-cli-key>
SIP_SERVER=sip.suii.us:5060
SIP_USERNAME=<your-sip-username>
SIP_PASSWORD=<your-sip-password>
CALLER_ID=
```

> `CALLER_ID` remains blank by default. The UI does not auto-fill it.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

> This localhost refers to the machine running this project.

## Build

```bash
npm run build
npm run start
```

## API/service layer

- `GET /api/config/status`
  - Returns SIP server, caller-id default state, and env readiness flags (without secrets).
- `POST /api/calls/start`
  - Starts an outbound AI-handled call using destination + optional user-supplied caller ID.
- `POST /api/calls/transfer`
  - Transfers a live call in `blind` or `attended` mode.
- `GET /api/transfers/audit`
  - Returns active calls and transfer audit trail.

## Outbound → AI → transfer flow

1. Load env config.
2. Validate destination and optional caller ID.
3. Start outbound call using SIP provider settings.
4. Bind call to the preconfigured VAPI assistant (`VAPI_ASSISTANT_ID`).
5. On escalation, transfer to human agent with selected mode:
   - **Blind**: immediate redirect.
   - **Attended**: establish human leg, then bridge.
6. Persist transfer audit event.

## OpenSpec artifacts

Current change folder:

- `openspec/changes/add-vapi-outbound-voip-flow/`

Artifacts:

- `proposal.md`
- `tasks.md`
- `progress.md`
- `specs/*/spec.md`

These remain the source of truth for evolution of this feature.
