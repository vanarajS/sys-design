## ADDED Requirements

### Requirement: Automatic failure point identification
The system SHALL automatically detect and highlight architectural failures during load simulation.

#### Scenario: Detecting service overload
- **WHEN** a service exceeds its configured capacity during simulation
- **THEN** the system highlights the failing service and pauses simulation

#### Scenario: Cascade failure detection
- **WHEN** a service failure causes dependent services to fail
- **THEN** the system identifies and displays the failure cascade path

### Requirement: Failure metrics collection
The system SHALL collect and display metrics about failures including timing, affected services, and error types.

#### Scenario: Reviewing failure details
- **WHEN** a simulation completes with failures
- **THEN** users can access detailed failure logs with timestamps and service states