# Running TaskPro Locally

A step-by-step guide to get the entire TaskPro application running on your local machine.

---

## What Is TaskPro?

TaskPro is a task management application with:

- A **React frontend** (Vite + Material UI) running on port `5173`
- A **user-service** (Spring Boot + MongoDB) running on port `8081` — handles signup, login, JWT issuing, and user profiles
- A **task-service** (Spring Boot + PostgreSQL) running on port `8082` — handles task CRUD, search, and ownership

---

## Prerequisites

Make sure you have the following installed before proceeding.

| Tool       | Minimum Version               | How to Check        |
| ---------- | ----------------------------- | ------------------- |
| Java (JDK) | 17                            | `java -version`     |
| Maven      | 3.8+ (or use included `mvnw`) | `mvn -version`      |
| Node.js    | 18+                           | `node -v`           |
| npm        | 9+                            | `npm -v`            |
| MongoDB    | 6+                            | `mongosh --version` |
| PostgreSQL | 14+                           | `psql --version`    |

### Installing Prerequisites (macOS)

```bash
# Java 17
brew install openjdk@17

# Node.js (includes npm)
brew install node

# MongoDB
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# PostgreSQL
brew install postgresql@16
brew services start postgresql@16
```

---

## Step 1: Clone the Repository

```bash
git clone <your-repo-url> task-pro
cd task-pro
```

---

## Step 2: Set Up MongoDB (for user-service)

The user-service stores users in MongoDB. By default, it connects to `mongodb://localhost:27017/taskpro_users`.

1. Make sure MongoDB is running:

```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Start it if not running
brew services start mongodb-community
```

2. (Optional) Create the database manually. MongoDB will auto-create it on first write, but you can verify connectivity:

```bash
mongosh
> use taskpro_users
> db.stats()
> exit
```

No username/password is required for local development by default.

---

## Step 3: Set Up PostgreSQL (for task-service)

The task-service stores tasks in PostgreSQL. By default, it connects to `jdbc:postgresql://localhost:5432/taskpro_tasks` with username `taskpro` and password `taskpro`.

1. Make sure PostgreSQL is running:

```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# Start it if not running
brew services start postgresql@16
```

2. Create the database and user:

```bash
# Connect to PostgreSQL
psql postgres
```

Then run these SQL commands:

```sql
CREATE USER taskpro WITH PASSWORD 'taskpro';
CREATE DATABASE taskpro_tasks OWNER taskpro;
GRANT ALL PRIVILEGES ON DATABASE taskpro_tasks TO taskpro;
\q
```

3. Verify the connection works:

```bash
psql -U taskpro -d taskpro_tasks -h localhost
# Enter password: taskpro
# Type \q to exit
```

> **Note:** The task-service uses Hibernate's `ddl-auto: update`, so all tables are created automatically when the service starts. You do NOT need to create tables manually.

---

## Step 4: Build the Backend

The backend is a multi-module Maven project. You need to build all modules from the `backend/` directory.

```bash
cd backend
./mvnw clean install
```

This builds three modules in order:

1. `common-dto` — shared DTOs and exceptions
2. `user-service` — the authentication service
3. `task-service` — the task management service

If the build succeeds, you will see `BUILD SUCCESS` at the end.

> **Troubleshooting:** If `./mvnw` does not have execute permissions, run `chmod +x mvnw` first.

---

## Step 5: Start the User Service

Open a new terminal window/tab:

```bash
cd backend/user-service
../mvnw spring-boot:run
```

You should see output like:

```
Started UserServiceApplication in X seconds
Tomcat started on port 8081
```

### Verify it's running:

```bash
curl http://localhost:8081/actuator/health
```

Expected response:

```json
{ "status": "UP" }
```

---

## Step 6: Start the Task Service

Open another new terminal window/tab:

```bash
cd backend/task-service
../mvnw spring-boot:run
```

You should see output like:

```
Started TaskServiceApplication in X seconds
Tomcat started on port 8082
```

### Verify it's running:

```bash
curl http://localhost:8082/actuator/health
```

Expected response:

```json
{ "status": "UP" }
```

---

## Step 7: Start the Frontend

Open another new terminal window/tab:

```bash
cd frontend
npm install
npm run dev
```

You should see output like:

```
  VITE v8.x.x  ready in X ms

  ➜  Local:   http://localhost:5173/
```

Open your browser and go to **http://localhost:5173**

---

## Step 8: Load Test Data (Optional)

The project includes a script to create 5 sample users with tasks. This is useful for testing.

> **Important:** Both the user-service and task-service must be running before you run this script. The script currently calls `http://localhost:8082/taskpro` — you may need to adjust the `BASE_URL` in the script to match your setup (see the "Current API Routing" note below).

```bash
chmod +x test_data.sh
./test_data.sh
```

### Test Credentials

After running the script, you can log in with any of these users:

| Username | Password     |
| -------- | ------------ |
| alice    | Password123! |
| bob      | Password123! |
| carol    | Password123! |
| dave     | Password123! |
| eve      | Password123! |

---

## API Endpoints Reference

### User Service (port 8081)

| Method | Endpoint           | Description             | Auth Required |
| ------ | ------------------ | ----------------------- | ------------- |
| POST   | `/api/auth/signup` | Create a new user       | No            |
| POST   | `/api/auth/login`  | Login and get JWT token | No            |
| GET    | `/api/users`       | Get user profile        | Yes           |

### Task Service (port 8082)

| Method | Endpoint                | Description                      | Auth Required |
| ------ | ----------------------- | -------------------------------- | ------------- |
| GET    | `/api/tasks`            | Get all tasks for logged-in user | Yes           |
| GET    | `/api/tasks/{id}`       | Get a specific task              | Yes           |
| POST   | `/api/tasks`            | Create a new task                | Yes           |
| PUT    | `/api/tasks/{id}`       | Update a task                    | Yes           |
| DELETE | `/api/tasks/{id}`       | Delete a task                    | Yes           |
| GET    | `/api/tasks/search?...` | Search tasks                     | Yes           |

### Using the API Manually

**Sign up:**

```bash
curl -X POST http://localhost:8081/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"userName":"testuser","email":"test@example.com","password":"Password123!"}'
```

**Login (save the token):**

```bash
TOKEN=$(curl -s -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"userName":"testuser","password":"Password123!"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

echo $TOKEN
```

**Create a task:**

```bash
curl -X POST http://localhost:8082/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"My First Task","description":"Testing locally","status":"PENDING","priority":"HIGH","dueDate":"2026-08-01T10:00:00"}'
```

**Get all tasks:**

```bash
curl http://localhost:8082/api/tasks \
  -H "Authorization: Bearer $TOKEN"
```

---

## Environment Variables

Both services use sensible defaults for local development. You can override them with environment variables if needed.

### User Service

| Variable            | Default                                   | Description                  |
| ------------------- | ----------------------------------------- | ---------------------------- |
| `MONGODB_URI`       | `mongodb://localhost:27017/taskpro_users` | MongoDB connection string    |
| `MONGODB_DATABASE`  | `taskpro_users`                           | Database name                |
| `USER_SERVICE_PORT` | `8081`                                    | Service port                 |
| `JWT_SECRET`        | (built-in default)                        | JWT signing secret           |
| `JWT_EXPIRATION`    | `900000` (15 min)                         | Token expiry in milliseconds |

### Task Service

| Variable            | Default                                          | Description                                  |
| ------------------- | ------------------------------------------------ | -------------------------------------------- |
| `POSTGRES_URL`      | `jdbc:postgresql://localhost:5432/taskpro_tasks` | PostgreSQL JDBC URL                          |
| `POSTGRES_USER`     | `taskpro`                                        | Database username                            |
| `POSTGRES_PASSWORD` | `taskpro`                                        | Database password                            |
| `TASK_SERVICE_PORT` | `8082`                                           | Service port                                 |
| `JWT_SECRET`        | (built-in default)                               | JWT signing secret (must match user-service) |

### Setting Environment Variables

```bash
# Example: override PostgreSQL password
export POSTGRES_PASSWORD=mysecretpassword

# Then start the service
cd backend/task-service
../mvnw spring-boot:run
```

---

## Running Tests

### Backend Unit Tests

```bash
cd backend
./mvnw test
```

The task-service tests use an in-memory H2 database, so no external database is needed for tests.

### Frontend Linting

```bash
cd frontend
npm run lint
```

---

## Important Notes

### JWT Secret Must Match

Both the user-service and task-service must use the same JWT secret. The user-service signs the JWT token, and the task-service validates it. By default, both use the same built-in development secret, so this works out of the box locally.

### Frontend API Routing

The frontend (`src/apiClient.js`) is currently configured to call `http://localhost:8082/taskpro` as the base URL. This assumes an API gateway or a servlet context-path that is not yet implemented.

**To make the current setup work end-to-end:**

- For **task operations** (create, read, update, delete tasks): the frontend calls the task-service directly on port 8082
- For **authentication** (login, signup): these need to reach the user-service on port 8081

Since there is no API gateway yet, you may need to update `frontend/src/apiClient.js` to call each service on its correct port, or add a reverse proxy (like nginx) to route traffic.

### Database Auto-Creation

- **PostgreSQL:** Tables are auto-created by Hibernate when the task-service starts (due to `ddl-auto: update`)
- **MongoDB:** Collections are auto-created when the first document is inserted

### Ports Summary

| Service         | Port | URL                   |
| --------------- | ---- | --------------------- |
| Frontend (Vite) | 5173 | http://localhost:5173 |
| User Service    | 8081 | http://localhost:8081 |
| Task Service    | 8082 | http://localhost:8082 |

---

## Stopping Everything

1. **Frontend:** Press `Ctrl+C` in the terminal running `npm run dev`
2. **User Service:** Press `Ctrl+C` in the terminal running the user-service
3. **Task Service:** Press `Ctrl+C` in the terminal running the task-service
4. **Databases (optional):**

```bash
brew services stop mongodb-community
brew services stop postgresql@16
```

---

## Troubleshooting

| Problem                                          | Solution                                                                         |
| ------------------------------------------------ | -------------------------------------------------------------------------------- |
| `Port 8081 already in use`                       | Kill the process: `lsof -ti:8081 \| xargs kill`                                  |
| `Port 8082 already in use`                       | Kill the process: `lsof -ti:8082 \| xargs kill`                                  |
| `Connection refused` on MongoDB                  | Make sure MongoDB is running: `brew services start mongodb-community`            |
| `Connection refused` on PostgreSQL               | Make sure PostgreSQL is running: `brew services start postgresql@16`             |
| `FATAL: role "taskpro" does not exist`           | Create the user — see Step 3 above                                               |
| `FATAL: database "taskpro_tasks" does not exist` | Create the database — see Step 3 above                                           |
| `BUILD FAILURE` during Maven build               | Make sure you're using Java 17: `java -version`                                  |
| `mvnw: Permission denied`                        | Run `chmod +x backend/mvnw`                                                      |
| `npm install` fails                              | Delete `node_modules` and `package-lock.json`, then try again                    |
| Frontend shows CORS error                        | Make sure both backend services are running; CORS allows `http://localhost:5173` |
| Login works but tasks don't load                 | Check that both services use the same JWT secret (default is fine)               |
