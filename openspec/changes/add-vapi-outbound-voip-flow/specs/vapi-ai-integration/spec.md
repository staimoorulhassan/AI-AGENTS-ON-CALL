## ADDED Requirements

### Requirement: VAPI credentials and assistant identity are environment-driven
The system SHALL read VAPI keys and assistant identifiers from environment variables and SHALL NOT embed credentials in code or docs.

#### Scenario: VAPI environment variables are loaded
- **GIVEN** `VAPI_PUBLIC_KEY`, `VAPI_PRIVATE_KEY`, `VAPI_ASSISTANT_ID`, and `VAPI_CLI_KEY` are defined in runtime environment
- **WHEN** the VAPI integration boots
- **THEN** the integration uses those values for initialization
- **AND** raw values are not logged

### Requirement: Outbound calls are handled by pre-configured VAPI AI agents
The system SHALL route outbound call handling to the VAPI assistant defined by `VAPI_ASSISTANT_ID`.

#### Scenario: Outbound call is delegated to configured assistant
- **GIVEN** a valid destination number and an initialized VAPI client
- **WHEN** an outbound call starts
- **THEN** the active assistant is the one referenced by `VAPI_ASSISTANT_ID`
- **AND** call lifecycle events remain traceable for transfer decisions
