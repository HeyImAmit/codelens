# CodeLens — Distributed Coding & AI Platform

CodeLens is a distributed coding platform with interactive code execution, asynchronous Java sandboxing, pgvector-backed DSA RAG retrieval, and AI tutoring.

---

## System Architecture

```
                      +-------------------+
                      | React + Vite App  | (Port 5173)
                      +---------+---------+
                                |
                                v
                      +-------------------+
                      | Express API Server| (Port 5000)
                      +----+----+----+----+
                           |    |    |
           +---------------+    |    +---------------+
           v                    v                    v
+--------------------+ +-----------------+ +--------------------+
| PostgreSQL + Vector| |  Redis (Cache/  | |  RabbitMQ Queue    |
| (pg17, Port 5433)  | |  Rate Limiter)  | |  (Port 5672)       |
+--------------------+ +-----------------+ +---------+----------+
                                                     |
                                                     v
                                           +--------------------+
                                           | Java Worker        |
                                           +---------+----------+
                                                     |
                                                     v
                                           +--------------------+
                                           | Docker Java Sandbox|
                                           +--------------------+
```

---

## Deployment & Local Setup

### 1. Prerequisites
- **Node.js**: v20+
- **Docker & Docker Compose**: installed and running
- **Java Sandbox Image**: `codelens-java-runner:1.0`

### 2. Environment Configuration
Copy `.env.example` to `.env` in the `backend/` directory:
```bash
cp backend/.env.example backend/.env
```
Fill in your `GROQ_API_KEY`.

### 3. Quick Start with Docker Compose
To run all infrastructure services (Postgres + pgvector, Redis, RabbitMQ, API, Worker):
```bash
docker compose up -d
```

### 4. Database Seeding & Knowledge Ingestion
Once PostgreSQL is running:
```bash
cd backend
npm run db:seed       # Seeds 55 DSA problems and test cases (Idempotent)
npm run rag:ingest     # Generates pgvector knowledge embeddings (Idempotent)
```

### 5. Running Standalone Services Locally
If running backend and worker locally against Docker infrastructure:
```bash
# Start API
npm start

# Start Worker
npm run worker
```

---

## Health Checks & Observability

- **Liveness Probe**: `GET http://localhost:5000/health/live`
  - Returns `{"status": "ok", "service": "api"}` immediately.
- **Readiness Probe**: `GET http://localhost:5000/health/ready`
  - Probes PostgreSQL (`SELECT 1`), Redis ping, RabbitMQ connection, and checks active worker consumer counts.

---

## Operational Troubleshooting

### Problem: "Submissions stuck in Queued / PENDING"
When a submission is created but never transitions to `RUNNING` or `ACCEPTED`:

1. **Check RabbitMQ Service**:
   ```bash
   curl -s http://localhost:5000/health/ready
   ```
   Check the `dependencies.rabbitmq.status` field.
2. **Check Active Worker Consumers**:
   Inspect the `workers` object in `/health/ready`.
   - If `workers.status === "no_active_workers"` (or `activeConsumers: 0`), **the execution worker is not running!**
3. **Start or Restart Worker**:
   ```bash
   npm run worker
   ```
4. **Inspect Worker Logs**:
   Look for structured JSON logs with `"service": "worker"`. Verify worker shows `WORKER_RECEIVED`, `STATUS_RUNNING`, and `FINAL_VERDICT`.
