## ADDED Requirements

### Requirement: Outbound SIP configuration
The system SHALL support outbound dialing through a configurable SIP provider and default to `sip.suii.us:5060` when no override is provided.

#### Scenario: SIP server default is applied
- **GIVEN** no explicit SIP server override is configured
- **WHEN** outbound calling settings are loaded
- **THEN** the SIP server value is `sip.suii.us:5060`

#### Scenario: SIP authentication is supplied via environment
- **GIVEN** `SIP_USERNAME` and `SIP_PASSWORD` are present in environment variables
- **WHEN** the dialer initializes
- **THEN** it uses those values for SIP authentication
- **AND** it does not require secrets in source files

### Requirement: Caller ID defaults to blank user input
The system SHALL initialize Caller ID as a blank input and require explicit user entry to set a caller ID.

#### Scenario: Caller ID remains blank by default
- **GIVEN** a new outbound calling configuration
- **WHEN** the configuration UI is shown
- **THEN** the Caller ID field is empty
- **AND** no fallback caller ID is auto-filled by application code
