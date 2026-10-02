## ADDED Requirements

### Requirement: Human handoff supports blind and attended transfer
The system SHALL support transferring a live AI-handled call to a real human agent in blind or attended modes.

#### Scenario: Blind transfer hands off immediately
- **GIVEN** an active AI-handled call and a valid transfer destination
- **WHEN** blind transfer is requested
- **THEN** the call is redirected to the human destination without agent consultation

#### Scenario: Attended transfer confirms before handoff
- **GIVEN** an active AI-handled call and a valid transfer destination
- **WHEN** attended transfer is requested
- **THEN** the system establishes the human leg first
- **AND** only bridges the original caller after the human agent accepts

### Requirement: Transfer attempts are auditable
The system SHALL record transfer attempts, mode, and result status for operational review.

#### Scenario: Transfer outcome is captured
- **GIVEN** a transfer operation completes or fails
- **WHEN** the operation ends
- **THEN** mode, destination, timestamp, and outcome are persisted in transfer audit data
