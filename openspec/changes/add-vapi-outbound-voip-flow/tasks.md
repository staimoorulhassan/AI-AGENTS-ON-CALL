## 1. Outbound Calling Setup
- [ ] 1.1 Define SIP connection settings contract (server, username, password, caller ID behavior)
- [ ] 1.2 Define dialplan routing requirements for outbound AI calls
- [ ] 1.3 Define validation rules for caller ID and destination number formatting

## 2. VAPI AI Integration
- [ ] 2.1 Define environment-based credential loading rules (no hardcoded keys)
- [ ] 2.2 Define assistant selection behavior via `VAPI_ASSISTANT_ID`
- [ ] 2.3 Define call initiation and status expectations for pre-configured VAPI agents

## 3. Human Agent Transfer
- [ ] 3.1 Define blind transfer behavior and fallback paths
- [ ] 3.2 Define attended transfer behavior and bridging expectations
- [ ] 3.3 Define transfer audit event requirements

## 4. Security and Secret Hygiene
- [ ] 4.1 Define repository-level secret handling rules
- [ ] 4.2 Define startup/configuration checks for missing credentials
- [ ] 4.3 Define default behavior for blank caller ID and non-persistence of raw credentials in docs

## 5. Documentation and Onboarding
- [ ] 5.1 Add setup instructions for `.env` and `.env.example`
- [ ] 5.2 Add architecture-level flow description (outbound → AI → transfer)
- [ ] 5.3 Add implementation checklist references to specs
