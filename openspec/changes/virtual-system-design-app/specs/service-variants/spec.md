## ADDED Requirements

### Requirement: Context menu for service configuration
Users SHALL be able to right-click on a service to access a context menu for variant selection.

#### Scenario: Opening the context menu
- **WHEN** a user right-clicks on a placed service
- **THEN** a context menu appears with available configuration options

#### Scenario: Selecting a service variant
- **WHEN** a user selects a variant from the context menu
- **THEN** the service node visually updates to reflect the new configuration

### Requirement: Service variants affect simulation behavior
Different service variants SHALL exhibit different performance characteristics during load simulation.

#### Scenario: Variant performance difference
- **WHEN** the same architecture runs with different variants of a service
- **THEN** the simulation produces different results based on variant characteristics