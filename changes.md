# TaskPro Changes Log

## Table of Contents

- [Phase 0: Foundation, Security, And Correctness](#phase-0-foundation-security-and-correctness)
  - [P0-01: Remove Hardcoded Secrets](#p0-01-remove-hardcoded-secrets)
  - [P0-02: Add .env.example And .gitignore Updates](#p0-02-add-envexample-and-gitignore-updates)
  - [P0-03: Add ownerUserId To Task Entity](#p0-03-add-owneruserid-to-task-entity)
  - [P0-04: User-Scoped Task Repository](#p0-04-user-scoped-task-repository)
  - [P0-05: Task DTOs (Request/Response Separation)](#p0-05-task-dtos-requestresponse-separation)
  - [P0-06: Custom Exceptions](#p0-06-custom-exceptions)
  - [P0-07: Global Exception Handler](#p0-07-global-exception-handler)
  - [P0-08: Request Validation](#p0-08-request-validation)
  - [P0-09: TaskService Rewrite (Ownership Enforced)](#p0-09-taskservice-rewrite-ownership-enforced)
  - [P0-10: TaskController Rewrite](#p0-10-taskcontroller-rewrite)
  - [P0-11: UserController Cleanup](#p0-11-usercontroller-cleanup)
  - [P0-12: User Entity Simplification](#p0-12-user-entity-simplification)
  - [P0-13: Actuator Health Endpoint](#p0-13-actuator-health-endpoint)
  - [P0-14: pom.xml Dependency Updates](#p0-14-pomxml-dependency-updates)
  - [P0-15: Task Ownership Unit Tests](#p0-15-task-ownership-unit-tests)
- [Phase 1: Multi-Module Backend Restructure](#phase-1-multi-module-backend-restructure)
  - [P1-01: Parent POM Conversion](#p1-01-parent-pom-conversion)
  - [P1-02: common-dto Module](#p1-02-common-dto-module)
  - [P1-03: Old Monolith Source Removed](#p1-03-old-monolith-source-removed)
- [Phase 2: User-Service Extraction](#phase-2-user-service-extraction)
  - [P2-01: User-Service Module And POM](#p2-01-user-service-module-and-pom)
  - [P2-02: User Entity (MongoDB)](#p2-02-user-entity-mongodb)
  - [P2-03: User Repository](#p2-03-user-repository)
  - [P2-04: JwtService (Token Generation With userId Claim)](#p2-04-jwtservice-token-generation-with-userid-claim)
  - [P2-05: UserService](#p2-05-userservice)
  - [P2-06: AuthController (Signup/Login/Logout)](#p2-06-authcontroller-signuploginlogout)
  - [P2-07: UserController (Profile Endpoints)](#p2-07-usercontroller-profile-endpoints)
  - [P2-08: Security Config And JWT Filter](#p2-08-security-config-and-jwt-filter)
  - [P2-09: Global Exception Handler](#p2-09-global-exception-handler)
  - [P2-10: User-Service Application Config](#p2-10-user-service-application-config)
  - [P2-11: User-Service Unit Tests](#p2-11-user-service-unit-tests)
- [Phase 3: Task-Service Extraction](#phase-3-task-service-extraction)
  - [P3-01: Task-Service Module And POM](#p3-01-task-service-module-and-pom)
  - [P3-02: Task Entity (PostgreSQL/JPA)](#p3-02-task-entity-postgresqljpa)
  - [P3-03: Task Repository (Spring Data JPA)](#p3-03-task-repository-spring-data-jpa)
  - [P3-04: JwtService (Local Validation Only)](#p3-04-jwtservice-local-validation-only)
  - [P3-05: JWT Authentication Filter (Stateless, No User DB)](#p3-05-jwt-authentication-filter-stateless-no-user-db)
  - [P3-06: TaskService](#p3-06-taskservice)
  - [P3-07: TaskController](#p3-07-taskcontroller)
  - [P3-08: Security Config](#p3-08-security-config)
  - [P3-09: Global Exception Handler](#p3-09-global-exception-handler)
  - [P3-10: Task-Service Application Config](#p3-10-task-service-application-config)
  - [P3-11: Task-Service Unit Tests](#p3-11-task-service-unit-tests)

---

## Phase 0: Foundation, Security, And Correctness

### P0-01: Remove Hardcoded Secrets

| Item | Detail |
|------|--------|
| Files | `application.properties`, `application-mongo.yml`, `application-cassandra.yml` |
| Before | MongoDB URI, JWT secret, Weather API key hardcoded with real values |
| After | All secrets use `${ENV_VAR:default}` pattern |
| Why | Committed secrets are a security risk; must be rotated and externalized |
| Now | App reads config from environment variables; safe to commit config files |

---

### P0-02: Add .env.example And .gitignore Updates

| Item | Detail |
|------|--------|
| Files | `backend/.env` (new), `.gitignore` |
| Before | No env template; `.env` files not ignored |
| After | `.env` with placeholder values; `.gitignore` excludes `.env` and `backend/target/` |
| Why | Developers need a reference for required env vars without exposing real values |
| Now | New devs can copy `.env.example` to `.env` and fill in real values |

---

### P0-03: Add ownerUserId To Task Entity

| Item | Detail |
|------|--------|
| File | `entity/Task.java` |
| Before | No ownership field; tasks were loosely linked via `@DBRef` list on User |
| After | `ownerUserId` (String, indexed) added; `completedAt` field added; explicit getters removed (Lombok handles) |
| Why | Every task must belong to exactly one user for data isolation |
| Now | Tasks are independently queryable by owner without joining User collection |

---

### P0-04: User-Scoped Task Repository

| Item | Detail |
|------|--------|
| File | `repository/TaskRepository.java` |
| Before | Only inherited `MongoRepository` methods (`findAll`, `findById`) — no user filtering |
| After | Added: `findByOwnerUserId`, `findByIdAndOwnerUserId`, `findByOwnerUserIdAndStatus`, `findByOwnerUserIdAndPriority`, `findByOwnerUserIdAndStatusAndPriority`, `deleteByIdAndOwnerUserId` |
| Why | Database-level filtering ensures no user can accidentally access another user's tasks |
| Now | All task queries are scoped to a specific user at the repository layer |

---

### P0-05: Task DTOs (Request/Response Separation)

| Item | Detail |
|------|--------|
| Files | `dto/TaskRequest.java` (new), `dto/TaskResponse.java` (new) |
| Before | `Task` entity used directly in controller request/response |
| After | `TaskRequest` for input (with validation), `TaskResponse` for output (no internal IDs like ObjectId exposed) |
| Why | Exposing entities creates tight coupling and leaks internal details |
| Now | API contract is decoupled from persistence model; ID returned as String |

---

### P0-06: Custom Exceptions

| Item | Detail |
|------|--------|
| Files | `exception/ResourceNotFoundException.java` (new), `exception/AccessDeniedException.java` (new), `exception/DuplicateResourceException.java` (new) |
| Before | Generic `RuntimeException("Task not found")` thrown everywhere |
| After | Typed exceptions that map to specific HTTP statuses |
| Why | Enables clean global error handling with consistent API responses |
| Now | 404, 403, 409 responses are produced automatically from exception type |

---

### P0-07: Global Exception Handler

| Item | Detail |
|------|--------|
| File | `exception/GlobalExceptionHandler.java` (new) |
| Before | No centralized error handling; controllers returned mixed error formats (plain text, ResponseEntity) |
| After | `@RestControllerAdvice` handles all exceptions → `ApiErrorResponse` JSON |
| Why | Frontend and API consumers need consistent error structure |
| Now | Every error returns: `{status, error, message, path, timestamp, fieldErrors}` |

---

### P0-08: Request Validation

| Item | Detail |
|------|--------|
| Files | `dto/SignupRequest.java`, `dto/LoginRequest.java`, `dto/TaskRequest.java` |
| Before | No validation annotations; manual null checks in controller |
| After | `@NotBlank`, `@Size`, `@Email`, `@Pattern` on all request DTOs |
| Why | Bad input should be rejected before reaching service/repository layer |
| Now | Invalid requests return 400 with specific field-level error messages |

---

### P0-09: TaskService Rewrite (Ownership Enforced)

| Item | Detail |
|------|--------|
| File | `service/TaskService.java` |
| Before | `getAllTasksForUser()` called `findAll()`; `updateTask`/`deleteTask` had no ownership check |
| After | Every method takes `ownerUserId`; uses `findByIdAndOwnerUserId`; returns `TaskResponse` DTOs |
| Why | Security: user A must never read/modify user B's tasks |
| Now | Wrong-owner access throws `ResourceNotFoundException` (appears as if task doesn't exist) |

---

### P0-10: TaskController Rewrite

| Item | Detail |
|------|--------|
| File | `controller/TaskController.java` |
| Before | Mixed `ObjectId` path variables; accepted raw `Task` entity in request body |
| After | String path variables with validation; `@Valid @RequestBody TaskRequest`; extracts userId from auth context; returns `TaskResponse` |
| Why | Clean API contract; ownership derived from JWT, never from request body |
| Now | All endpoints enforce auth → userId → ownership chain |

---

### P0-11: UserController Cleanup

| Item | Detail |
|------|--------|
| File | `controller/UserController.java` |
| Before | Returned mixed types (`ResponseEntity<?>` with plain text errors); manual null checks for login |
| After | Uses `@Valid`; throws typed exceptions (`DuplicateResourceException`, `ResourceNotFoundException`); proper HTTP status codes (201 for signup) |
| Why | Consistent error handling via global exception handler |
| Now | Signup returns 201 + 409 on duplicate; login returns 401 on bad creds (handled by global handler) |

---

### P0-12: User Entity Simplification

| Item | Detail |
|------|--------|
| File | `entity/User.java` |
| Before | Had `@DBRef List<Task> tasks`; no audit fields; explicit getters/setters |
| After | Removed task list; added `createdAt`, `updatedAt` (Instant), `status` (ACTIVE/LOCKED/DELETED); Lombok handles accessors |
| Why | Tasks own themselves via `ownerUserId`; User no longer needs to track tasks directly |
| Now | User is a clean identity/auth entity; ready for future service split |

---

### P0-13: Actuator Health Endpoint

| Item | Detail |
|------|--------|
| Files | `application.properties`, `config/SecurityConfig.java` |
| Before | Only custom `/public/health-check` endpoint |
| After | Spring Actuator enabled; `/actuator/health`, `/actuator/info`, `/actuator/metrics` exposed; health/info permitted without auth |
| Why | Production systems need standardized health checks for monitoring and orchestration |
| Now | `GET /actuator/health` returns system health without authentication |

---

### P0-14: pom.xml Dependency Updates

| Item | Detail |
|------|--------|
| File | `pom.xml` |
| Before | Had unused `spring-boot-starter-data-cassandra`; no validation/actuator; no Lombok annotation processor config |
| After | Added `spring-boot-starter-validation`, `spring-boot-starter-actuator`; removed Cassandra; configured `maven-compiler-plugin` with Lombok processor; configured `spring-boot-maven-plugin` to exclude Lombok |
| Why | Validation needs the starter; actuator for health; Lombok processor needed for clean compilation |
| Now | `mvn compile` succeeds cleanly; validation annotations work at runtime |

---

### P0-15: Task Ownership Unit Tests

| Item | Detail |
|------|--------|
| File | `src/test/java/.../service/TaskServiceTest.java` (new) |
| Before | No tests |
| After | 9 unit tests covering: create sets ownerUserId, get/update/delete reject wrong owner, search scoped by user, completedAt tracking |
| Why | Ownership enforcement is a security-critical feature that must be verified |
| Now | `mvn test` → 9 tests pass, confirming user isolation works correctly |

---

## Phase 1: Multi-Module Backend Restructure

### P1-01: Parent POM Conversion

| Item | Detail |
|------|--------|
| File | `backend/pom.xml` |
| Before | Single Spring Boot application POM with all dependencies for the monolith |
| After | Parent POM with `<packaging>pom</packaging>`; declares three modules: `common-dto`, `user-service`, `task-service`; manages shared dependency versions (Lombok, JJWT); configures `maven-compiler-plugin` and `spring-boot-maven-plugin` in `<pluginManagement>` |
| Why | Multi-module Maven structure lets each service build independently while sharing version management |
| Now | `mvn clean install` from `backend/` builds all three modules in reactor order |

---

### P1-02: common-dto Module

| Item | Detail |
|------|--------|
| Files | `common-dto/pom.xml`, `common-dto/src/main/java/com/ciscotraining/taskpro/common/dto/` (6 classes), `common-dto/src/main/java/com/ciscotraining/taskpro/common/exception/` (3 classes) |
| Before | DTOs and exceptions lived inside the monolith's package |
| After | Standalone Maven JAR module (no Spring Boot app class); contains `ApiErrorResponse`, `AuthResponse`, `LoginRequest`, `SignupRequest`, `TaskRequest`, `TaskResponse`, `ResourceNotFoundException`, `AccessDeniedException`, `DuplicateResourceException` |
| Why | Shared contract classes must not live in a service; allows both user-service and task-service to depend on the same API objects without depending on each other |
| Now | `common-dto` has no Spring Boot dependency—only `jakarta.validation-api` and `jackson-annotations` |

---

### P1-03: Old Monolith Source Removed

| Item | Detail |
|------|--------|
| Removed | `backend/src/` (all monolith Java sources, resources, test classes), `backend/target/`, old log files |
| Before | Monolith source existed alongside new modules |
| After | Only multi-module structure remains; no leftover monolith code |
| Why | Prevents confusion about which code is active; enforces the service split |
| Now | `backend/` contains only `pom.xml`, `.mvn/`, `mvnw`, `mvnw.cmd`, and the three module directories |

---

## Phase 2: User-Service Extraction

### P2-01: User-Service Module And POM

| Item | Detail |
|------|--------|
| File | `user-service/pom.xml` |
| Before | User code was in the monolith |
| After | Standalone Spring Boot module; depends on `common-dto`, `spring-boot-starter-web`, `starter-validation`, `starter-actuator`, `starter-data-mongodb`, `starter-security`, and JJWT libraries |
| Why | User-service needs its own build lifecycle and dependency set |
| Now | `mvn package -pl user-service` produces a runnable Spring Boot JAR |

---

### P2-02: User Entity (MongoDB)

| Item | Detail |
|------|--------|
| File | `user-service/src/.../user/entity/User.java` |
| Before | User entity lived in monolith package `com.ciscotraining.taskPro.entity` |
| After | Moved to `com.ciscotraining.taskpro.user.entity`; same MongoDB `@Document(collection = "users")` model with `ObjectId` id, indexed `userName`, `email`, `password`, `roles`, `createdAt`, `updatedAt`, `status` |
| Why | Entity stays service-specific (not in common-dto); user-service owns user persistence |
| Now | User entity is only visible inside user-service |

---

### P2-03: User Repository

| Item | Detail |
|------|--------|
| File | `user-service/src/.../user/repository/UserRepository.java` |
| Before | Shared `UserRepository` in monolith |
| After | `MongoRepository<User, ObjectId>` with `findByUserName` and `deleteByUserName` |
| Why | User-service owns user data access exclusively |
| Now | No other service can import or use this repository |

---

### P2-04: JwtService (Token Generation With userId Claim)

| Item | Detail |
|------|--------|
| File | `user-service/src/.../user/service/JwtService.java` |
| Before | Monolith JwtService generated tokens with `subject=username` and `roles` claim only |
| After | Generates tokens with `subject=username`, `userId` claim (ObjectId hex string), and `roles` claim; exposes `getJwtExpiration()` for response building |
| Why | Adding `userId` to JWT allows downstream services (task-service) to identify the user without calling user-service; this is the key microservice decoupling enabler |
| Now | Login/signup tokens contain `{sub: "username", userId: "hexId", roles: [...]}` |

---

### P2-05: UserService

| Item | Detail |
|------|--------|
| File | `user-service/src/.../user/service/UserService.java` |
| Before | Monolith service with `saveNewUser`, `saveAdmin`, `getAll` |
| After | Cleaner service: `createUser(userName, email, encodedPassword)` builds User with audit timestamps; `findByUserName`, `findById`, `saveUser`, `deleteByUserName` |
| Why | Service layer is focused; password encoding happens in controller (separation of concerns); timestamps set automatically |
| Now | No more boolean-return error swallowing; exceptions propagate cleanly |

---

### P2-06: AuthController (Signup/Login/Logout)

| Item | Detail |
|------|--------|
| File | `user-service/src/.../user/controller/AuthController.java` |
| Before | Monolith `UserController` at `/user/signup` and `/user/login` returned `{token, userName}` |
| After | New controller at `/api/auth/signup`, `/api/auth/login`, `/api/auth/logout`; returns richer `AuthResponse` with `accessToken`, `expiresIn`, and `user` summary (id, username, roles); logout is a placeholder for future Redis session invalidation |
| Why | New API path matches the plan's gateway routing (`/api/auth/**`); richer response gives frontend user context without a second API call |
| Now | Signup returns 201; login returns 200; both include user identity in response |

---

### P2-07: UserController (Profile Endpoints)

| Item | Detail |
|------|--------|
| File | `user-service/src/.../user/controller/UserController.java` |
| Before | Monolith had GET/PUT/DELETE at `/user` with mixed behavior |
| After | New paths: `GET /api/users/me`, `PUT /api/users/me`, `DELETE /api/users/me`; returns user profile without password hash |
| Why | Matches plan API design; never exposes sensitive fields |
| Now | Authenticated user can view/update/delete their own profile |

---

### P2-08: Security Config And JWT Filter

| Item | Detail |
|------|--------|
| Files | `user-service/src/.../user/config/SecurityConfig.java`, `user-service/src/.../user/security/JwtAuthenticationFilter.java`, `user-service/src/.../user/security/UserDetailsServiceImpl.java` |
| Before | Monolith security config with monolith routes |
| After | Permits `/api/auth/signup`, `/api/auth/login`, `/actuator/health`, `/actuator/info` without auth; all other requests require valid JWT; `UserDetailsServiceImpl` now maps roles to `ROLE_` authorities |
| Why | User-service needs its own security boundary; only auth endpoints are public |
| Now | JWT filter validates tokens and sets Spring Security context for protected routes |

---

### P2-09: Global Exception Handler

| Item | Detail |
|------|--------|
| File | `user-service/src/.../user/exception/GlobalExceptionHandler.java` |
| Before | Shared handler in monolith |
| After | Service-specific `@RestControllerAdvice` handling `ResourceNotFoundException`, `AccessDeniedException`, `DuplicateResourceException`, `MethodArgumentNotValidException`, `BadCredentialsException`, and generic `Exception` |
| Why | Each service needs its own exception-to-HTTP mapping; uses shared `ApiErrorResponse` from common-dto |
| Now | Consistent error JSON for all user-service endpoints |

---

### P2-10: User-Service Application Config

| Item | Detail |
|------|--------|
| File | `user-service/src/main/resources/application.yml` |
| Before | Monolith used `application.properties` with single DB config |
| After | YAML config: `spring.application.name=user-service`, MongoDB URI pointing to `taskpro_users` database, port `8081`, JWT secret/expiration from env vars, Actuator endpoints exposed |
| Why | Each service runs on its own port; user-service owns its own database (`taskpro_users`) |
| Now | User-service starts on port 8081 with its own MongoDB database |

---

### P2-11: User-Service Unit Tests

| Item | Detail |
|------|--------|
| File | `user-service/src/test/java/.../user/service/UserServiceTest.java` |
| Before | No user-service-specific tests |
| After | 5 unit tests: `createUser` saves correctly, `findByUserName` returns user when exists, returns empty when not, `deleteByUserName` delegates to repository, `saveUser` sets updatedAt |
| Why | Core user operations need test coverage before integration |
| Now | `mvn test -pl user-service` → 5 tests pass |

---

## Phase 3: Task-Service Extraction

### P3-01: Task-Service Module And POM

| Item | Detail |
|------|--------|
| File | `task-service/pom.xml` |
| Before | Task code was in the monolith using MongoDB |
| After | Standalone Spring Boot module; depends on `common-dto`, `spring-boot-starter-web`, `starter-validation`, `starter-actuator`, `starter-data-jpa`, `starter-security`, PostgreSQL driver, JJWT, and H2 for tests |
| Why | Task-service uses PostgreSQL (per plan section 6.8) for relational querying, indexes, and future reporting |
| Now | `mvn package -pl task-service` produces a runnable Spring Boot JAR |

---

### P3-02: Task Entity (PostgreSQL/JPA)

| Item | Detail |
|------|--------|
| File | `task-service/src/.../task/entity/Task.java` |
| Before | MongoDB `@Document` with `ObjectId` primary key |
| After | JPA `@Entity` with `@Table(name = "tasks")`; UUID primary key (`@GeneratedValue(strategy = GenerationType.UUID)`); database indexes on `ownerUserId`, `(ownerUserId, status)`, `(ownerUserId, priority)`; `@PrePersist` and `@PreUpdate` lifecycle callbacks for timestamps |
| Why | PostgreSQL with UUID IDs enables relational queries, better indexing, and easier cross-service event references |
| Now | Task IDs are UUIDs (e.g., `"d4f5a1b2-..."`); Hibernate auto-creates schema via `ddl-auto: update` |

---

### P3-03: Task Repository (Spring Data JPA)

| Item | Detail |
|------|--------|
| File | `task-service/src/.../task/repository/TaskRepository.java` |
| Before | `MongoRepository<Task, ObjectId>` with MongoDB query methods |
| After | `JpaRepository<Task, UUID>` with same query method signatures adapted for UUID: `findByOwnerUserId`, `findByIdAndOwnerUserId`, `findByOwnerUserIdAndStatus`, `findByOwnerUserIdAndPriority`, `findByOwnerUserIdAndStatusAndPriority`, `deleteByIdAndOwnerUserId` |
| Why | Spring Data JPA derives SQL queries automatically; same ownership-scoped pattern as before |
| Now | All task queries are user-scoped at the repository layer using PostgreSQL |

---

### P3-04: JwtService (Local Validation Only)

| Item | Detail |
|------|--------|
| File | `task-service/src/.../task/service/JwtService.java` |
| Before | Monolith JwtService handled both generation and validation |
| After | Task-service JwtService only validates and extracts claims; does NOT generate tokens; extracts `username`, `userId`, and `roles` from JWT; `isTokenValid(token)` checks expiration without needing a `UserDetails` lookup |
| Why | Task-service trusts the JWT signature (same shared secret) without calling user-service; this is the core microservice decoupling pattern |
| Now | Task-service never touches the user database |

---

### P3-05: JWT Authentication Filter (Stateless, No User DB)

| Item | Detail |
|------|--------|
| File | `task-service/src/.../task/security/JwtAuthenticationFilter.java` |
| Before | Monolith filter loaded `UserDetails` from MongoDB to validate token |
| After | Task-service filter validates JWT signature + expiration directly; extracts `userId` as principal and `username` as credentials; maps roles to Spring Security authorities; does NOT call any UserDetailsService or database |
| Why | This eliminates the cross-service dependency; task-service authenticates purely from JWT claims |
| Now | `SecurityContextHolder.getContext().getAuthentication().getPrincipal()` returns the userId string |

---

### P3-06: TaskService

| Item | Detail |
|------|--------|
| File | `task-service/src/.../task/service/TaskService.java` |
| Before | Monolith TaskService used `ObjectId` and MongoDB repository |
| After | Uses `UUID` IDs and JPA repository; `@Transactional` for write operations; `@Transactional(readOnly = true)` for reads; same ownership logic: create sets `ownerUserId`, get/update/delete verify ownership, search filters by user |
| Why | Same security guarantees with PostgreSQL backend; transactions ensure data consistency |
| Now | All task operations are user-scoped and transactional |

---

### P3-07: TaskController

| Item | Detail |
|------|--------|
| File | `task-service/src/.../task/controller/TaskController.java` |
| Before | Monolith controller called `userService.findByUserName()` to get userId from authentication |
| After | Extracts `userId` directly from `authentication.getPrincipal()` (set by JWT filter); no UserService dependency; path variable IDs parsed as UUID |
| Why | Controller no longer needs to call user-service or access user database; userId comes from JWT claims |
| Now | Endpoints: GET/POST `/api/tasks`, GET/PUT/DELETE `/api/tasks/{id}`, GET `/api/tasks/search` |

---

### P3-08: Security Config

| Item | Detail |
|------|--------|
| File | `task-service/src/.../task/config/SecurityConfig.java` |
| Before | Monolith security config covered both user and task routes |
| After | Permits `/actuator/health` and `/actuator/info` without auth; requires authentication for `/api/tasks/**`; no `AuthenticationManager` or `PasswordEncoder` beans (not needed for validation-only service) |
| Why | Task-service only validates tokens, never authenticates users directly |
| Now | Simpler security config with no user-related beans |

---

### P3-09: Global Exception Handler

| Item | Detail |
|------|--------|
| File | `task-service/src/.../task/exception/GlobalExceptionHandler.java` |
| Before | Shared handler in monolith |
| After | Service-specific handler for `ResourceNotFoundException`, `MethodArgumentNotValidException`, `IllegalArgumentException` (invalid UUID), and generic `Exception` |
| Why | Task-service doesn't need `DuplicateResourceException` or `BadCredentialsException` handlers |
| Now | Consistent `ApiErrorResponse` JSON for all task-service error cases |

---

### P3-10: Task-Service Application Config

| Item | Detail |
|------|--------|
| File | `task-service/src/main/resources/application.yml` |
| Before | Monolith used MongoDB for everything |
| After | PostgreSQL datasource config (`jdbc:postgresql://localhost:5432/taskpro_tasks`), Hibernate dialect, `ddl-auto: update`, port `8082`, JWT secret from env var (same secret as user-service for signature verification), Actuator endpoints |
| Why | Task-service owns its own PostgreSQL database (`taskpro_tasks`); runs on separate port |
| Now | Task-service starts on port 8082 with PostgreSQL |

---

### P3-11: Task-Service Unit Tests

| Item | Detail |
|------|--------|
| Files | `task-service/src/test/java/.../task/service/TaskServiceTest.java`, `task-service/src/test/resources/application.yml` |
| Before | Tests lived in monolith using MongoDB mocks |
| After | 9 unit tests with Mockito: create sets ownerUserId, get/update/delete reject wrong owner, search scoped by user, completedAt set on completion, completedAt cleared on reopen; test config uses H2 in-memory database |
| Why | Ownership enforcement must be verified; H2 allows tests to run without external PostgreSQL |
| Now | `mvn test -pl task-service` → 9 tests pass |

---

