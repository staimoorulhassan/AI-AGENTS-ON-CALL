# AI-AGENTS-ON-CALL

Spec-driven scaffold for an outbound VoIP calling platform where pre-configured Vapi AI agents handle calls and can transfer to human agents.

## Spec Kit Choice

This project uses **OpenSpec** as the framework.

Why OpenSpec was selected:
- It is the better-known spec-driven framework and matches the requested preference.
- It provides a clear, lightweight change workflow with `proposal.md`, `tasks.md`, and per-capability `spec.md` files under `openspec/changes/`.
- It is a strong fit for feature-by-feature planning before implementation code exists.

## Project Structure

```text
AI-AGENTS-ON-CALL/
├─ .env                  # local runtime secrets (gitignored)
├─ .env.example          # placeholder values only
├─ .gitignore
├─ README.md
└─ openspec/
   ├─ README.md
   └─ changes/
      └─ add-vapi-outbound-voip-flow/
         ├─ proposal.md
         ├─ tasks.md
         ├─ progress.md
         └─ specs/
            ├─ outbound-calling-setup/spec.md
            ├─ vapi-ai-integration/spec.md
            ├─ call-transfer/spec.md
            └─ security-credentials/spec.md
```

## Environment Configuration

Copy the template and fill values in your local `.env`:

```bash
cp .env.example .env
```

Template keys:

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

### Security Rules
- Never commit `.env`.
- Keep real credentials out of source code and docs.
- Use placeholder values in `.env.example` only.
- Caller ID starts blank by default and must be explicitly set by the user.

## Outbound Calling + Transfer Flow

1. Load SIP config (`SIP_SERVER`, `SIP_USERNAME`, `SIP_PASSWORD`) from environment.
2. Start outbound call leg through SIP provider (`sip.suii.us:5060` by default).
3. Hand call control to the pre-configured Vapi assistant identified by `VAPI_ASSISTANT_ID`.
4. Continue AI-led conversation.
5. If escalation is required, transfer to a human agent:
   - **Blind transfer**: immediate handoff.
   - **Attended transfer**: human leg is connected first, then bridged.
6. Record transfer mode and outcome for auditability.

## Working with OpenSpec in this Repo

Use the active change at:

- `openspec/changes/add-vapi-outbound-voip-flow/`

Recommended progression:
1. Refine `proposal.md` if scope changes.
2. Keep requirements in `specs/*/spec.md` as the source of truth.
3. Move implementation steps through `tasks.md`.
4. Update `progress.md` as work advances.

## Notes

- This repository currently contains the spec scaffold and environment templates, not full runtime code.
- The specs are intentionally implementation-agnostic so backend/telephony stacks can be chosen later.
