## 13. Sprint Simulation

This is a suggested sprint sequence. Exact timing can change.

| Sprint | Focus | Outcome |
| --- | --- | --- |
| Sprint 1 | Foundation cleanup | Secrets removed, env config, task ownership fixed |
| Sprint 2 | Multi-module setup | `common-dto`, `user-service`, `task-service` created |
| Sprint 3 | User-service | Signup/login/profile running independently |
| Sprint 4 | Task-service | Task CRUD/search running independently |
| Sprint 5 | Gateway/frontend | Frontend calls gateway, full app flow works |
| Sprint 6 | Redis sessions | Refresh/logout/session lifecycle works |
| Sprint 7 | Docker Compose | Full system starts locally |
| Sprint 8 | Kafka activity | Task events produce visible activity/analytics |
| Sprint 9 | Analytics | Dashboard uses analytics-service |
| Sprint 10 | External API | Weather planning context and calendar export |
| Sprint 11 | AI v1 | Task breakdown and priority suggestion |
| Sprint 12 | Kubernetes | Local Kubernetes deployment |
| Sprint 13 | CI/CD/observability | Automated quality gates and operational polish |

## 14. Jira Epic And Story Simulation

### Epic TP-EPIC-001: Foundation And Security Baseline

Objective:

Prepare the current backend for safe migration by fixing secrets, configuration, task ownership, validation, and error handling.

Business value:

The system becomes safer, easier to debug, and ready for service extraction.

#### TP-001: Remove Secrets From Committed Configuration

Type: Story

As a developer, I want secrets to be loaded from environment variables so that credentials are not exposed in source control.

Acceptance criteria:

- No real database URI, API key, or JWT secret is committed.
- Application reads MongoDB URI from env var for user data.
- Application reads PostgreSQL connection settings from env vars for task data once task-service is extracted.
- Application reads JWT secret from env var.
- Application reads Weather API key from env var.
- Application reads Calendar integration config from env vars when provider sync is added.
- `.env.example` contains placeholder values only.
- `.env` is included in `.gitignore`.

Notes:

- Rotate all already-exposed secrets before using them again.

#### TP-002: Add Standard Application Profiles

Type: Story

As a developer, I want clear local/dev/test/prod profiles so that configuration is predictable across environments.

Acceptance criteria:

- `application.yml` contains shared defaults only.
- `application-local.yml` supports local development.
- `application-test.yml` supports automated tests.
- Runtime profile can be selected with `SPRING_PROFILES_ACTIVE`.

#### TP-003: Add Task Ownership Field

Type: Story

As a user, I want my tasks to belong only to me so that other users cannot see or change my task data.

Acceptance criteria:

- Task model includes `ownerUserId`.
- New task creation sets `ownerUserId` from authenticated user context.
- Request body cannot override `ownerUserId`.
- Existing task queries are updated to filter by `ownerUserId`.

#### TP-004: Enforce Task Ownership On Read/Update/Delete

Type: Story

As a user, I want task access to be restricted to my account so that my private tasks remain private.

Acceptance criteria:

- `GET /tasks/{id}` returns `404` or `403` for another user's task.
- `PUT /tasks/{id}` cannot update another user's task.
- `DELETE /tasks/{id}` cannot delete another user's task.
- Search only returns current user's tasks.
- Tests cover cross-user access attempts.

#### TP-005: Add Request Validation

Type: Story

As a frontend developer, I want invalid requests to fail clearly so that forms can show useful error messages.

Acceptance criteria:

- Signup validates username/password/email.
- Login validates username/password.
- Task create validates title/status/priority.
- Invalid input returns `400`.
- Error response includes field-level validation messages.

#### TP-006: Add Global Exception Handling

Type: Story

As a developer, I want API errors to follow one shape so that debugging and frontend handling are easier.

Acceptance criteria:

- Add global exception handler.
- Standard error response includes timestamp, status, error code, message, path, and correlation id if available.
- Duplicate username returns `409`.
- Unauthorized access returns `401`.
- Forbidden ownership access returns `403` or safe `404`.

#### TP-007: Add Actuator Health Check

Type: Story

As an operator, I want health endpoints so that Docker/Kubernetes can verify service status.

Acceptance criteria:

- Actuator dependency is added.
- `/actuator/health` is available.
- MongoDB health is visible for user-service/current monolith.
- PostgreSQL health is visible once task-service is extracted.
- Redis health is visible when Redis is enabled.

### Epic TP-EPIC-002: Backend Microservice Structure

Objective:

Split the monolith into a multi-module backend with shared DTO contracts and independently runnable services.

#### TP-008: Create Backend Parent Maven Project

Type: Story

As a developer, I want a parent Maven project so that all backend modules share versioning and dependency management.

Acceptance criteria:

- Backend root has parent `pom.xml`.
- Modules are declared for `common-dto`, `user-service`, `task-service`, and `api-gateway`.
- Java version is centralized.
- Spring Boot version is centralized.

#### TP-009: Create `common-dto` Module

Type: Story

As a service developer, I want shared DTOs in a common module so that services use consistent API contracts.

Acceptance criteria:

- `common-dto` builds as a jar.
- It contains request/response DTOs.
- It contains event DTOs.
- It contains shared enums.
- It does not contain entities or repositories.
- It does not start a Spring Boot application.

#### TP-010: Move Auth DTOs To `common-dto`

Type: Story

As a service developer, I want auth request/response DTOs shared cleanly so that frontend-facing contracts stay consistent.

Acceptance criteria:

- Signup request exists in common DTO.
- Login request exists in common DTO.
- Auth response exists in common DTO.
- DTO package names are consistent.

#### TP-011: Move Task DTOs To `common-dto`

Type: Story

As a task-service developer, I want task request/response DTOs so that entities are not exposed directly.

Acceptance criteria:

- `CreateTaskRequest` exists.
- `UpdateTaskRequest` exists.
- `TaskResponse` exists.
- `TaskSearchRequest` or query model exists if needed.
- Entity classes are not returned directly from controllers.

### Epic TP-EPIC-003: User-Service

Objective:

Create an independently runnable user-service that owns identity, authentication, roles, and profile data.

#### TP-012: Create User-Service Application

Type: Story

As a developer, I want user-service to run separately so that user ownership is independent from task management.

Acceptance criteria:

- User-service has its own Spring Boot application class.
- User-service starts on its own port.
- User-service has its own application config.
- User-service connects to user MongoDB collection/database.

#### TP-013: Implement Signup In User-Service

Type: Story

As a new user, I want to sign up so that I can start using TaskPro.

Acceptance criteria:

- Signup creates user.
- Password is BCrypt hashed.
- Duplicate username is rejected.
- Duplicate email is rejected if email is required unique.
- Response returns user summary and auth tokens.

#### TP-014: Implement Login In User-Service

Type: Story

As a returning user, I want to log in so that I can access my tasks.

Acceptance criteria:

- Login validates credentials.
- Invalid credentials return `401`.
- Successful login returns access token.
- JWT contains `userId`, `username`, and `roles`.
- Password hash is never returned.

#### TP-015: Implement User Profile Endpoint

Type: Story

As a user, I want to view my profile so that the frontend can show my account details.

Acceptance criteria:

- `GET /users/me` returns current user summary.
- Requires valid token.
- Does not expose password hash.

#### TP-016: Implement User Update Endpoint

Type: Story

As a user, I want to update my profile so that my account details stay current.

Acceptance criteria:

- `PUT /users/me` updates allowed fields.
- Username/email uniqueness is enforced.
- Password update is handled separately or explicitly.

### Epic TP-EPIC-004: Task-Service

Objective:

Create an independently runnable task-service that owns all task data and task workflows.

#### TP-017: Create Task-Service Application

Type: Story

As a developer, I want task-service to run separately so that task management is independently deployable.

Acceptance criteria:

- Task-service has its own Spring Boot application class.
- Task-service starts on its own port.
- Task-service has its own config.
- Task-service connects to PostgreSQL.
- Task-service uses Spring Data JPA repositories.

#### TP-018: Implement JWT Validation In Task-Service

Type: Story

As a backend service, I want to validate JWT locally so that task-service does not call user-service for every request.

Acceptance criteria:

- Task-service validates JWT signature.
- Task-service rejects expired tokens.
- Task-service extracts `userId`, `username`, and `roles`.
- Task-service uses `userId` for task ownership.

#### TP-019: Implement Create Task

Type: Story

As a user, I want to create a task so that I can track work.

Acceptance criteria:

- `POST /tasks` creates task.
- `ownerUserId` is set from token.
- Request validates title/status/priority.
- Response returns `TaskResponse`.
- `task.created` event can be published later.

#### TP-020: Implement List/Search Tasks

Type: Story

As a user, I want to filter and search my tasks so that I can find relevant work quickly.

Acceptance criteria:

- `GET /tasks` returns only current user's tasks.
- Search supports status.
- Search supports priority.
- Search supports text query if implemented.
- Search supports due-date filters later.

#### TP-021: Implement Update Task

Type: Story

As a user, I want to update my task so that task details stay accurate.

Acceptance criteria:

- User can update only owned task.
- Status changes update timestamps.
- Completing a task sets `completedAt`.
- Invalid enum values return `400`.

#### TP-022: Implement Delete Task

Type: Story

As a user, I want to delete my task so that I can remove irrelevant work.

Acceptance criteria:

- User can delete only owned task.
- Delete returns `204`.
- Attempt to delete another user's task is blocked.

### Epic TP-EPIC-005: API Gateway And Frontend Connection

Objective:

Make the frontend communicate through a single gateway while services remain internal.

#### TP-023: Create API Gateway

Type: Story

As a frontend developer, I want one backend URL so that the frontend does not manage microservice routing.

Acceptance criteria:

- Gateway app starts independently.
- Gateway routes auth requests to user-service.
- Gateway routes user requests to user-service.
- Gateway routes task requests to task-service.

#### TP-024: Configure Gateway CORS

Type: Story

As a frontend developer, I want CORS configured centrally so that browser requests work reliably.

Acceptance criteria:

- Frontend origin is allowed in local profile.
- Allowed methods include GET, POST, PUT, PATCH, DELETE, OPTIONS.
- Authorization header is allowed.
- Credentials policy is intentional and documented.

#### TP-025: Update Frontend API Config

Type: Story

As a frontend developer, I want API base URL to come from environment config so that local and deployed environments are easy to switch.

Acceptance criteria:

- Frontend uses `VITE_API_BASE_URL`.
- Local default points to gateway.
- Existing login/signup/task flows work through gateway.

### Epic TP-EPIC-006: Redis Sessions

Objective:

Add session lifecycle support using Redis.

#### TP-026: Store Refresh Sessions In Redis

Type: Story

As a user, I want my login session to be tracked so that refresh and logout work securely.

Acceptance criteria:

- Login creates Redis session.
- Session has TTL.
- Refresh requires valid Redis session.
- Session stores user id and expiry metadata.

#### TP-027: Implement Refresh Token Endpoint

Type: Story

As a user, I want my session to refresh automatically so that I do not log in repeatedly.

Acceptance criteria:

- Refresh endpoint returns a new access token.
- Expired/invalid refresh token returns `401`.
- Refresh token rotation is documented or implemented.

#### TP-028: Implement Logout

Type: Story

As a user, I want to log out so that my session is no longer usable.

Acceptance criteria:

- Logout deletes current Redis session.
- Deleted session cannot refresh access token.
- Frontend clears local auth state.

#### TP-029: Implement Active Session List

Type: Story

As a user, I want to view active sessions so that I can identify old logins.

Acceptance criteria:

- `GET /auth/sessions` returns current user's sessions.
- Response includes session id, created time, expiry time, and optional device metadata.
- User can revoke a selected session.

### Epic TP-EPIC-007: Docker Compose Platform

Objective:

Run the complete system locally with one command.

#### TP-030: Add Dockerfiles

Type: Story

As a developer, I want Dockerfiles for services so that each app can be built consistently.

Acceptance criteria:

- User-service Dockerfile exists.
- Task-service Dockerfile exists.
- Gateway Dockerfile exists.
- Frontend Dockerfile exists.
- Images build successfully.

#### TP-031: Add Docker Compose

Type: Story

As a developer, I want Docker Compose so that local microservice setup is simple.

Acceptance criteria:

- Compose starts MongoDB.
- Compose starts PostgreSQL.
- Compose starts Redis.
- Compose starts Kafka.
- Compose starts backend services.
- Compose starts frontend.
- Gateway is reachable from host machine.

#### TP-032: Add Compose Health Checks

Type: Story

As a developer, I want health checks so that dependent services start reliably.

Acceptance criteria:

- MongoDB health check exists.
- PostgreSQL health check exists.
- Redis health check exists.
- Backend services expose health endpoints.
- Service startup order uses health where practical.

### Epic TP-EPIC-008: Kafka Events And Activity

Objective:

Introduce visible event-driven behavior.

#### TP-033: Add Kafka Event DTOs

Type: Story

As a service developer, I want standard event DTOs so that producers and consumers agree on event shape.

Acceptance criteria:

- Event envelope exists.
- Task event payloads exist.
- User event payloads exist.
- Event version is included.

#### TP-034: Publish Task Events

Type: Story

As a system, I want task-service to publish task events so that other services can react asynchronously.

Acceptance criteria:

- Creating task publishes `task.created`.
- Updating task publishes `task.updated`.
- Completing task publishes `task.completed`.
- Deleting task publishes `task.deleted`.
- Event includes user id and task id.

#### TP-035: Build Activity Consumer

Type: Story

As a user, I want to see recent task activity so that I understand what changed.

Acceptance criteria:

- Consumer reads task events.
- Activity records are stored.
- API returns activity feed.
- Frontend can display activity feed.

#### TP-036: Add Kafka Idempotency

Type: Story

As a backend system, I want duplicate events to be handled safely so that retries do not corrupt analytics.

Acceptance criteria:

- Event id is checked before processing.
- Redis or database stores processed event ids.
- Duplicate event does not create duplicate activity/analytics.

### Epic TP-EPIC-009: Analytics

Objective:

Provide productivity insights using event-driven data.

#### TP-037: Create Analytics Service

Type: Story

As a user, I want productivity stats so that I can understand my work habits.

Acceptance criteria:

- Analytics-service starts independently.
- Consumes task events.
- Stores aggregated stats.
- Provides summary endpoint.

#### TP-038: Add Dashboard Analytics API

Type: Story

As a frontend developer, I want analytics APIs so that dashboard stats come from backend data.

Acceptance criteria:

- API returns total tasks.
- API returns completed tasks.
- API returns overdue tasks.
- API returns completion rate.

#### TP-039: Show Analytics In Frontend

Type: Story

As a user, I want to see task analytics on my dashboard so that the app feels intelligent and useful.

Acceptance criteria:

- Dashboard shows backend analytics.
- Loading/error states exist.
- Analytics match backend data.

### Epic TP-EPIC-010: External API Integration

Objective:

Use external APIs in a way that improves task planning.

#### TP-040: Implement Weather Planning API

Type: Story

As a user, I want weather context on my dashboard so that I can plan my day better.

Acceptance criteria:

- Backend calls the configured Weather API.
- Weather API key is loaded from env var.
- Failures return graceful fallback.
- Weather responses are cached in Redis by location and time window.
- Frontend can consume weather planning data.

#### TP-041: Add Calendar Export For Tasks

Type: Story

As a user, I want to add a task to my calendar so that important due dates are visible outside TaskPro.

Acceptance criteria:

- Task with due date can be exported as an `.ics` calendar event.
- Calendar event includes task title, description, and due date.
- Frontend shows an "Add to calendar" action for due-date tasks.
- Future Google/Microsoft Calendar sync remains behind a provider abstraction.

### Epic TP-EPIC-011: AI Productivity Features

Objective:

Add useful AI capabilities that make TaskPro impressive and practical.

#### TP-042: Add AI Provider Abstraction

Type: Story

As a developer, I want an AI provider interface so that the app can use no-cost mock/rule-based AI now and a real provider later without rewriting business code.

Acceptance criteria:

- Interface exists for AI operations.
- Mock/rule-based implementation exists.
- No paid AI API is called in the initial implementation.
- Real provider can be configured later only after explicit approval.
- Feature can be disabled with config.

#### TP-043: Implement AI Task Breakdown

Type: Story

As a user, I want AI to break a large goal into smaller tasks so that I can start faster.

Acceptance criteria:

- Endpoint accepts goal text.
- Response returns suggested tasks.
- User can choose which suggestions to create.
- Errors are handled gracefully.

#### TP-044: Implement AI Priority Suggestion

Type: Story

As a user, I want suggested priority so that I can organize tasks faster.

Acceptance criteria:

- Endpoint accepts title, description, and due date.
- Response returns suggested priority and reason.
- User can accept or ignore suggestion.

#### TP-045: Implement Weekly AI Summary

Type: Story

As a user, I want a weekly productivity summary so that I can reflect on progress.

Acceptance criteria:

- Summary uses current user's task data only.
- Summary includes completed, overdue, and high-priority highlights.
- AI response is cached or stored for a period.

### Epic TP-EPIC-012: Kubernetes

Objective:

Deploy the microservice system to local Kubernetes.

#### TP-046: Add Kubernetes Manifests

Type: Story

As a developer, I want Kubernetes manifests so that the system can run in a production-like local cluster.

Acceptance criteria:

- Deployment manifests exist.
- Service manifests exist.
- ConfigMaps exist.
- Secret templates exist without real secrets.

#### TP-047: Add Readiness And Liveness Probes

Type: Story

As an operator, I want Kubernetes probes so that unhealthy services can be detected.

Acceptance criteria:

- Each backend service has liveness probe.
- Each backend service has readiness probe.
- Probes use Actuator health endpoints.

#### TP-048: Add Ingress For Gateway

Type: Story

As a frontend user, I want one exposed gateway URL so that the app can be accessed from the browser.

Acceptance criteria:

- Gateway ingress exists.
- Frontend can reach gateway.
- Internal services are not publicly exposed unnecessarily.

### Epic TP-EPIC-013: CI/CD And Quality

Objective:

Automate tests, builds, and quality checks.

#### TP-049: Add GitHub Actions Backend Workflow

Type: Story

As a developer, I want backend tests to run automatically so that broken code is caught early.

Acceptance criteria:

- Workflow runs Maven test.
- Workflow runs on pull request.
- Failed tests fail the workflow.

#### TP-050: Add Frontend Build Workflow

Type: Story

As a developer, I want frontend build checks so that UI build issues are caught early.

Acceptance criteria:

- Workflow runs frontend install.
- Workflow runs lint if available.
- Workflow runs build.

#### TP-051: Add Docker Build Workflow

Type: Story

As a developer, I want Docker images to build in CI so that deployment packaging is validated.

Acceptance criteria:

- Docker build runs for backend services.
- Docker build runs for frontend.
- Build failure blocks merge.

#### TP-052: Add Optional Jenkins Pipeline

Type: Story

As a learner, I want a Jenkins pipeline so that I can demonstrate enterprise CI/CD concepts.

Acceptance criteria:

- `Jenkinsfile` exists.
- Pipeline stages include checkout, backend tests, frontend build, Docker build.
- Jenkins setup is documented.

### Epic TP-EPIC-014: Observability And Resilience

Objective:

Make the system debuggable and stable.

#### TP-053: Add Correlation IDs

Type: Story

As a developer, I want correlation IDs so that logs across services can be traced.

Acceptance criteria:

- Gateway creates or forwards correlation id.
- Services log correlation id.
- Error responses include correlation id.

#### TP-054: Add Structured Logging

Type: Story

As a developer, I want structured logs so that debugging distributed flows is easier.

Acceptance criteria:

- Logs include service name.
- Logs include request path.
- Logs include correlation id.
- Sensitive fields are not logged.

#### TP-055: Add External API Resilience

Type: Story

As a user, I want the app to continue working even when an external API fails.

Acceptance criteria:

- External API calls have timeout.
- Failures return fallback.
- Circuit breaker or retry is used where appropriate.
- Failures are logged safely.

## 15. Definition Of Done

For backend stories:

- Code compiles.
- Unit tests pass.
- Integration tests added for risky behavior.
- API returns standard error response.
- Logs avoid secrets and password data.
- Config uses environment variables.
- Endpoint is documented.
- Ownership/security rules are tested where relevant.

For frontend stories:

- UI handles loading state.
- UI handles error state.
- UI works with gateway URL.
- Build passes.
- Auth state behavior is checked.

For infrastructure stories:

- Local instructions are documented.
- Health checks are available.
- No real secrets are committed.
- Startup has been tested locally.

## 16. Testing Strategy

### 16.1 Unit Tests

Use for:

- Service logic.
- Validation helpers.
- JWT claims extraction.
- Task ownership checks.
- AI mock provider.

### 16.2 Integration Tests

Use for:

- Repository behavior.
- Controller behavior.
- Auth flow.
- Task CRUD ownership.
- Redis session flow.
- Kafka producer/consumer flow.

Recommended tools:

- Testcontainers for MongoDB, PostgreSQL, Redis, and Kafka when practical.

### 16.3 Contract Tests

Use for:

- Gateway to service route assumptions.
- Shared DTO compatibility.
- Event schema compatibility.

### 16.4 End-To-End Tests

Use for:

- Signup.
- Login.
- Create task.
- Update task.
- Complete task.
- Logout.

## 17. Security Requirements

### 17.1 Authentication

- Passwords must be BCrypt hashed.
- Access tokens must expire quickly.
- Refresh tokens must be revocable.
- Logout must invalidate refresh session.
- JWT secret must not be committed.

### 17.2 Authorization

- Task operations must be user-scoped.
- Admin endpoints must require `ADMIN`.
- Service-to-service internal endpoints should not be public without protection.

### 17.3 Data Protection

- Password hash must never be returned.
- Tokens must not be logged.
- API keys must not be logged.
- Error messages must not leak stack traces to frontend.

### 17.4 Rate Limiting

Recommended later:

- Login rate limit by username and IP.
- AI endpoint rate limit.
- External API usage limit.

## 18. Frontend Impact Plan

### 18.1 API Base URL

Change frontend from hardcoded backend URL to env variable:

```text
VITE_API_BASE_URL=http://localhost:8080
```

### 18.2 Auth Response Shape

Frontend should eventually expect:

```json
{
  "accessToken": "...",
  "expiresIn": 900,
  "user": {
    "id": "...",
    "username": "...",
    "roles": ["USER"]
  }
}
```

If refresh token is stored in HttpOnly cookie, frontend does not manually store refresh token.

### 18.3 New UI Opportunities

Future dashboard sections:

- Today's tasks.
- Overdue tasks.
- Productivity stats.
- Recent activity.
- AI suggestions.
- Due-date warnings.
- Active sessions page.

## 19. Interview Explanation Guide

### 19.1 Simple Architecture Explanation

TaskPro started as a monolithic Spring Boot backend. I am migrating it into a microservice architecture with separate user and task services. The frontend talks to an API Gateway. User-service owns authentication and JWT issuing with MongoDB-backed user data. Task-service owns task data in PostgreSQL and validates JWT locally. Redis is used for sessions and token lifecycle. Kafka is used for event-driven analytics and activity feed. Docker Compose runs the full system locally, and Kubernetes manifests simulate production deployment.

### 19.2 Why API Gateway

The gateway gives the frontend one URL and keeps service routing internal. It centralizes CORS and later can handle rate limiting, request IDs, and authentication filters.

### 19.3 Why Redis

Redis is used for short-lived operational data: refresh sessions, logout, rate limits, idempotency keys, and cache. This is better than using Redis only as a simple cache.

### 19.4 Why Kafka

Kafka is used for asynchronous product features. When a task is created or completed, task-service publishes an event. Other services consume that event to build analytics, activity feed, notifications, or AI insights.

### 19.5 Why Not OAuth First

OAuth2/OIDC is useful for social login and delegated authorization, but the first production-grade milestone is JWT access tokens with Redis-backed refresh sessions. OAuth can be added later without blocking the microservice split.

## 20. Confirmed Owner Decisions

These decisions are confirmed and should be treated as the current source of truth for implementation.

| Decision | Final choice | Status |
| --- | --- | --- |
| Add API Gateway? | Yes. Add `api-gateway` as the fourth initial backend module. | Confirmed |
| Database per service | User-service uses MongoDB. Task-service uses PostgreSQL. | Confirmed |
| AI provider | No paid/real AI provider for now. Start with mock/rule-based AI-style features. | Confirmed |
| External APIs | Keep Weather API and add Calendar functionality. | Confirmed |
| Documentation structure | Keep the professional roadmap in `plan.md` only for now. | Confirmed |

### 20.1 Working Assumptions

These are recommended defaults unless the owner changes them later.

| Topic | Working assumption |
| --- | --- |
| CI/CD | GitHub Actions first, Jenkins optional later |
| Refresh token storage | Redis sessions first, HttpOnly cookie support later |
| Future services | Analytics first, notification second, AI third |
| Calendar implementation | `.ics` export first, Google/Microsoft Calendar sync later |

## 21. Recommended Next Action

Start with Phase 0.

First implementation batch:

1. Rotate and remove committed secrets.
2. Add env-based config.
3. Add task ownership field.
4. Update all task repository/service queries to filter by owner.
5. Add validation and global exception handling.
6. Add Actuator health.
7. Add tests for task ownership.

After Phase 0 passes, start the Maven multi-module split.
V