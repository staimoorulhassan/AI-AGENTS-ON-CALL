## Why
AI-AGENTS-ON-CALL needs a clear specification-first plan for outbound AI calling, VAPI integration, secure credential handling, and escalation to human agents. The system must support real operational flows without leaking secrets.

## What Changes
- Define outbound calling setup requirements for SIP server `sip.suii.us:5060`.
- Define VAPI AI integration requirements using environment-provided public/private credentials and assistant identity.
- Define transfer workflows for blind and attended transfer to human agents.
- Define security requirements to keep credentials out of source/docs and keep Caller ID blank by default.

## Impact
- Creates the canonical change artifacts for implementation planning.
- Enables traceable requirements and task execution for an outbound VoIP AI system.
- Reduces accidental secret exposure by making security controls explicit in specs.
