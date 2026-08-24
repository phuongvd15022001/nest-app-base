# Generate API

**Type:** Workflow

## Trigger

Use when scaffolding a NestJS REST resource or extending an existing module with new endpoint behavior.

## Input

`/generate-api <resource-name>`

## Delegation

Run each step named below through that subagent with the Agent tool (`subagent_type`), and wait for its result before the next step. Do not read the agent file and play the role yourself - the point of the split is that each agent gets a clean context and its own tool limits.

## Steps

1. **Inspect existing patterns** - Use `.claude/skills/sourcebase-reuse-first/SKILL.md` to find similar modules, controllers, services, repositories, DTOs, Prisma models, migrations, and tests.
2. **Define contract** - Use `.claude/skills/rest-api-contract/SKILL.md` to list method, path, auth, request DTO, response DTO, errors, and pagination.
3. **Design module** - the `backend-architect` subagent decides whether to create a new feature module or extend an existing one.
4. **Implement scaffold** - the `backend-developer` subagent creates only the files needed by the accepted contract.
5. **Add tests** - the `backend-tester` subagent adds service and endpoint tests for the scaffolded behavior.
6. **Review** - the `backend-reviewer` subagent checks validation, authorization, raw model exposure, database rules, and query safety.

## Scaffold Checklist

- [ ] Module follows the existing feature-module pattern (`controller`, `service`, `repository`, `dto/`, `*.spec.ts`).
- [ ] Controller path matches project route naming.
- [ ] Request DTOs use validation decorators; list DTOs extend `BasePaginationDto`.
- [ ] Response DTOs are explicit and applied through `TransformInterceptor`.
- [ ] New Prisma models use `Int @id @default(autoincrement())`, `createdAt`/`updatedAt`, and `deletedAt` when soft delete applies.
- [ ] Schema changes go through `prisma migrate dev`, with the reverse migration documented.
- [ ] Tests cover success and key failures.
