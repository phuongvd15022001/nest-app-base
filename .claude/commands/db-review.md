---
description: Review database-facing changes - Prisma models, migrations, indexes, query paths, and transactions.
---

# Database Review

## Trigger

Use when reviewing database-facing backend changes: Prisma models, migrations, repositories, query logic, indexes, transactions, list endpoints, and Redis cache interaction.

## Steps

1. **Read the query path** - Identify endpoint, service method, repository call, Prisma model, migration, and cache keys.
2. **Schema review** - Apply the `postgresql` skill.
3. **Performance review** - Apply the `backend-query-cache-performance` skill.
4. **Cache review** - Apply the `redis-development` skill if Redis is involved.
5. **Safety review** - Confirm ownership scope, transactions, soft delete middleware coverage, raw-query safety, and broad `updateMany` / `deleteMany` filters.
6. **Report findings** - Classify blocker, should fix, and suggestion items.

## Definition Of Done

- Schema conventions are checked.
- Query and index fit are checked.
- N+1 risk is checked.
- Transaction boundaries are checked.
- Cache TTL and invalidation are checked where relevant.
- Findings include concrete fix directions.
