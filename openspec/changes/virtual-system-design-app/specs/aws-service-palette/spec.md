## ADDED Requirements

### Requirement: Service catalogue contains AWS services
The system SHALL maintain a catalogue of AWS services with their capabilities and configuration options.

#### Scenario: Displaying available services
- **WHEN** the application loads
- **THEN** the service palette displays categorized AWS services

#### Scenario: Service capability information
- **WHEN** a user selects a service from the palette
- **THEN** the system displays the service's supported capabilities and default configurations

### Requirement: Service metadata includes simulation parameters
Each AWS service in the catalogue SHALL include parameters required for load simulation including throughput limits and latency characteristics.

#### Scenario: Accessing simulation parameters
- **WHEN** the load simulator initializes a service instance
- **THEN** it retrieves the service's throughput limits and latency characteristics from the catalogue