## ADDED Requirements

### Requirement: Credentials are excluded from source and documentation
The system SHALL enforce that runtime secrets are stored only in local environment files or secret managers and excluded from version control.

#### Scenario: Repository hygiene prevents secret commits
- **GIVEN** local runtime configuration includes real credentials in `.env`
- **WHEN** repository files are prepared for commit
- **THEN** `.env` is ignored by git
- **AND** `.env.example` contains placeholders only

### Requirement: Documentation never contains live credentials
The system SHALL keep all setup documentation free of real secret values.

#### Scenario: README uses placeholder values
- **GIVEN** project onboarding docs are generated
- **WHEN** environment configuration examples are displayed
- **THEN** only placeholder tokens are shown
- **AND** no live key values are present anywhere in docs
