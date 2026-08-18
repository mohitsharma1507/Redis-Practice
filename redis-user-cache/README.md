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
- Dockerized application, PostgreSQL, and Redis
- Docker container networking
- Environment-based configuration

## Architecture

```text
Client
  |
  v
Express API
  |
  v
Redis Cache
  |        \
HIT         MISS
 |            \
 v             PostgreSQL
Response         |
                 v
             Redis Cache
                 |
                 v
              Response
```

## Cache Flow

1. Request arrives at `GET /api/users`.
2. Redis is checked for the `users:all` key.
3. On a cache hit, data is returned directly from Redis.
4. On a cache miss, data is fetched from PostgreSQL.
5. The result is stored in Redis with a TTL.
6. On create/update/delete operations, the cache key is invalidated.

## Getting Started

## API Endpoints

| Method | Endpoint     | Description                        |
| ------ | ------------ | ---------------------------------- |
| GET    | `/api/users` | Get all users with Redis caching   |
| GET    | `/api/users/:id` | Get a single users using Redis caching   |
| POST   | `/api/users` | Create a user and invalidate cache |
| PATCH  | `/api/users/:id` | Update a user and invalidate cache |
| DELETE   | `/api/users/:id` | Delete a user and invalidate cache |

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

## Key Concepts Demonstrated

- Redis cache-aside pattern
- Cache invalidation
- TTL (Time To Live)
- Redis Hashes
- Docker container networking
- Prisma ORM integration
- PostgreSQL as the source of truth

## Highlights

This project demonstrates how Redis can reduce repeated database queries by caching frequently requested data while keeping PostgreSQL as the source of truth. Cache invalidation ensures stale data is removed whenever the underlying database changes.
