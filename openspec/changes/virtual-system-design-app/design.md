## Context

This is a greenfield project to build a virtual system design application for AWS microservice architectures. The application targets architects and developers who need to experiment with system designs without the cost and risk of actual cloud deployments.

## Goals / Non-Goals

**Goals:**
- Provide an interactive canvas for visually composing AWS microservice architectures
- Enable service configuration through intuitive right-click context menus
- Simulate realistic load patterns to validate architectural decisions
- Identify failure points and suggest corrective architectural patterns
- Export validated designs as deployable Docker Compose configurations

**Non-Goals:**
- Actual AWS cloud deployment or infrastructure management
- Real-time synchronization with AWS accounts
- Cost estimation or billing integration
- Multi-user collaboration features
- Version control for architecture designs

## Decisions

**Decision: Use React with TypeScript for the frontend**
- Provides type safety for complex drag-and-drop interactions
- Rich ecosystem for canvas/graphics libraries (React Flow)
- Alternative considered: Vue.js - rejected due to smaller ecosystem for complex interactions

**Decision: Implement load simulation client-side with Web Workers**
- Eliminates need for backend infrastructure
- Enables instant feedback during simulation
- Alternative considered: Backend simulation service - rejected due to added complexity and latency

**Decision: Store AWS service definitions as JSON configuration**
- Enables easy updates to service capabilities without code changes
- Supports future extension of service catalogue
- Alternative considered: Hardcoded service definitions - rejected for maintainability

**Decision: Generate Docker Compose v3 format for exports**
- Industry standard for local container orchestration
- Supports all necessary networking features for microservices
- Alternative considered: Kubernetes manifests - rejected as overkill for local testing

**Decision: Use HTML5 Canvas via React Flow for the design canvas**
- Handles complex node/edge relationships automatically
- Built-in support for drag-and-drop and context menus
- Alternative considered: Custom canvas implementation - rejected as reinventing solved problems

## Risks / Trade-offs

[Client-side simulation accuracy] → Validate simulation models against documented AWS service limitations
[Browser performance with large architectures] → Implement viewport culling and service grouping features
[Complex service interdependencies] → Limit initial release to common service patterns, expand iteratively