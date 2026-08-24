---
name: backend-query-cache-performance
description: Backend performance guidance for PostgreSQL and Prisma queries, indexing, pagination, N+1 prevention, Redis cache, and request-path efficiency.
metadata:
  stack: postgresql, prisma, redis, performance
---

# Backend Query And Cache Performance

Use this skill when reviewing list endpoints, heavy reads, cache additions, or slow backend behavior.

## Query Review

- Confirm the endpoint applies ownership scope where the contract requires it. The only scope column in this project is `Product.userId`; there is no tenant or company dimension.
- Confirm list endpoints paginate with `skip` / `take`, and that the `count` uses the same `where`.
- Check that filter and sort columns have appropriate `@@index` / `@@unique` entries.
- Check that dynamic sort fields are whitelisted through `Prisma.<Model>ScalarFieldEnum`, not taken raw from the DTO.
- Check that `include` / `select` is explicit and returns only what the contract needs.
- Use `include` or batched `in` lookups for relation data.

## N+1 Prevention

Bad pattern:

```typescript
for (const order of orders) {
  order.items = await this.itemsRepository.findAll({ where: { orderId: order.id } });
}
```

Better patterns:

- Load the relation in one query with `include: { items: true }` when response size is bounded.
- Fetch related rows in one batch with `where: { orderId: { in: orderIds } }`, then group in memory.
- Use `select` to return summary fields instead of full nested data when list endpoints do not need detail data.

## Cache Review

- Cache only data that is safe to reuse for the same scope.
- Include filter dimensions in cache keys.
- Give every key a TTL.
- Invalidate affected keys after writes.
- Keep cached response payloads compatible with DTOs.

## Request-Path Efficiency

- Do not run expensive scans in request handlers.
- Do not perform one external call per row in a list response.
- Move non-critical side effects to an event or queue if the project already has that pattern.

## Checklist

- [ ] List endpoints paginate.
- [ ] Filters and sort columns are indexed.
- [ ] Query avoids N+1 behavior.
- [ ] Cache key includes scope and filters.
- [ ] Cache has TTL.
- [ ] Write paths invalidate cache.
- [ ] Response does not load unnecessary relation data.
