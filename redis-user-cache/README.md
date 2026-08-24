# Redis User Cache API

A production-style backend project demonstrating Redis caching with PostgreSQL, Prisma, Docker, and the Cache-Aside pattern.

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- Redis
- Docker & Docker Compose

## Features

- User CRUD APIs
- PostgreSQL as the source of truth
- Redis caching for user data
- Cache HIT and Cache MISS handling
- TTL-based cache expiration
- Cache invalidation after database writes
- Individual user caching using Redis Hashes
- Cache expiration using Redis TTL
- Notification Queue using Redis Lists
- Background Notification Worker
- Blocking queue consumption using `BRPOP`
- Retry mechanism for failed jobs
- Failed Jobs / Dead Letter Queue (DLQ)
- Retry attempt tracking
- Exponential Backoff for retries
- Dockerized application, PostgreSQL, and Redis
- Docker container networking
- Environment-based configuration

## Architecture

```text
          Client
                           |
                           v
                     Express API
                      /        \
                     /          \
                    v            v
              Redis Cache    Notification Queue
                  |             |
             HIT / MISS        BRPOP
                |                |
                v                v
           PostgreSQL      Notification Worker
                |                |
                v                v
           Redis Cache       Process Job
                                 |
                          +------+------+
                          |             |
                       Success        Failure
                          |             |
                          v             v
                       Done      Retry / Backoff
                                        |
                                  Max Retries?
                                   /       \
                                 No         Yes
                                 |           |
                                 v           v
                            Retry Queue     DLQ
```

## Cache Flow

1. Request arrives at GET /api/users.
2. Redis is checked for the users:all key.
3. On a cache hit, data is returned directly from Redis.
4. On a cache miss, data is fetched from PostgreSQL.
5. The result is stored in Redis with a TTL.
6. On create/update/delete operations, the cache key is invalidated.
7. Individual users are cached using Redis Hashes with keys such as user:<id>.

## Notification Queue Flow

1. Client sends a notification request to the API.
2. The API creates a notification job with a unique ID.
3. The job is pushed into the Redis List: notification_queue
4. The Notification Worker continuously listens to the queue using BRPOP.
5. When a job arrives, the worker processes the notification.
6. Successfully processed jobs are completed and removed from the queue.
7. Failed jobs increment their retry attempt counter.
8. Failed jobs are retried using exponential backoff.
9. After the maximum retry attempts are reached, the job is moved to the Dead Letter Queue.

## Retry & Exponential Backoff

- Failed notification jobs are retried with increasing delays.

- Attempt 1 → 1 second
- Attempt 2 → 2 seconds
- Attempt 3 → 4 seconds

- The retry delay follows:

- delay = BASE_DELAY × 2^(attempt - 1)

This prevents the worker from continuously retrying failed jobs immediately and helps reduce unnecessary load on external services.

## Dead Letter Queue (DLQ)

Jobs that fail after the maximum number of retries are moved to:

- notification_failed_queue

The DLQ allows failed jobs to be inspected, debugged, or manually reprocessed later without blocking the main notification queue.

## Getting Started

## API Endpoints

| Method | Endpoint             | Description                               |
| ------ | -------------------- | ----------------------------------------- |
| GET    | `/api/users`         | Get all users with Redis caching          |
| GET    | `/api/users/:id`     | Get a single users using Redis caching    |
| POST   | `/api/users`         | Create a user and invalidate cache        |
| PATCH  | `/api/users/:id`     | Update a user and invalidate cache        |
| DELETE | `/api/users/:id`     | Delete a user and invalidate cache        |
| POST   | `/api/notifications` | Add a notification job to the Redis queue |

## Redis Commands Used

- `GET`
- `SET`
- `DEL`
- `TTL`
- `EXPIRE`
- `HSET`
- `HGET`
- `HGETALL`
- `HEXISTS`
- `HLEN`
- `RPUSH`
- `LPOP`
- `BRPOP`
- `LLEN`
- `LRANGE`

## Key Concepts Demonstrated

- Redis cache-aside pattern
- Cache invalidation
- TTL (Time To Live)
- Redis Hashes
- Redis Lists
- Redis Queues
- Blocking Queue Consumption
- Background Workers
- Asynchronous Job Processing
- Retry Mechanism
- Retry Attempt Tracking
- Dead Letter Queue (DLQ)
- Exponential Backoff
- Docker container networking
- Prisma ORM integration
- PostgreSQL as the source of truth

## Highlights

This project demonstrates how Redis can be used beyond simple caching.

Redis is used as:

- A high-speed cache for frequently requested user data.
- A Redis Hash store for individual user objects.
- A queue for asynchronous notification jobs.
- A blocking queue consumed by a background worker.
- A retry mechanism for failed jobs.
- A Dead Letter Queue for permanently failed jobs.

PostgreSQL remains the source of truth for persistent user data, while Redis improves performance and enables asynchronous background processing.

The notification worker uses retry attempts and exponential backoff to handle temporary failures gracefully. Jobs that continue to fail after the maximum retry limit are moved to a Dead Letter Queue for later inspection or recovery.
