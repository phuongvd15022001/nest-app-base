---
name: backend-security-review
description: Backend security review checklist for auth, authorization, input validation, output shaping, logging, file handling, and configuration hygiene.
metadata:
  stack: backend-security, nestjs
---

# Backend Security Review

Use this skill when reviewing backend code or designing endpoints that handle protected data.

## Auth And Authorization

- Protected endpoints must use the project guard pattern.
- Role or ownership checks must happen before returning data.
- Tenant, company, or user scope must be applied in database queries.
- Do not trust IDs from the request without checking access rights.

## Input Validation

- All body, query, and params input must go through DTO validation.
- Validate numeric IDs with `ParseIntPipe` on route params and `@IsNumber()` + `@Type(() => Number)` in DTOs.
- Whitelist dynamic sort and filter fields.
- Validate file metadata and size before processing uploads.

## Output Shaping

- Do not return raw Prisma model objects from controllers. Shape responses with a response DTO and `TransformInterceptor`, and keep `password` / `refreshToken` out of `select`.
- Do not expose internal fields, audit data, or credential material.
- Use response DTOs for stable contracts.
- Keep error messages useful but not revealing of internal implementation details.

## Logging

- Logs may include request IDs, route names, and business identifiers.
- Logs must not include credential material, session headers, or full request bodies with sensitive fields.
- Log expected business failures at a lower level than system failures.

## Data Safety

- Use `$transaction` for multi-table writes.
- Check ownership before updates and deletes.
- Prefer soft delete when the model is registered in `SOFT_DELETE_MODEL_NAMES`.
- Avoid broad `updateMany` / `deleteMany` operations without explicit filters.
- Never interpolate user input into `$queryRawUnsafe` / `$executeRawUnsafe`; use tagged-template `$queryRaw` parameters.
- Remember that raw queries bypass the soft-delete middleware.

## Checklist

- [ ] Guards are present where required.
- [ ] Ownership or role checks are explicit.
- [ ] DTO validation covers external input.
- [ ] Query sort fields are whitelisted.
- [ ] Responses are shaped through DTOs.
- [ ] Logs avoid credential material.
- [ ] Writes cannot affect records outside the intended scope.
