# Project Overview
You are working in a NestJS backend project. It provides REST APIs for Users, Products, File Uploads, Authentication, and Scheduled Tasks.

# Tech Stack
- **Framework:** NestJS (`^11.0.1`)
- **Database ORM:** Prisma (`^5.10.1`) with PostgreSQL
- **Authentication:** Passport, JWT (`@nestjs/jwt ^11.0.0`)
- **Validation:** class-validator (`^0.14.2`), class-transformer (`^0.5.1`)
- **Documentation:** Swagger (`@nestjs/swagger ^11.2.0`)
- **Testing:** Jest (`^30.0.0`)

# Commands
- **Install:** `npm install`
- **Development:** `npm run start:dev`
- **Build:** `npm run build`
- **Lint:** `npm run lint`
- **Test:** `npm run test` (Unit), `npm run test:e2e` (E2E)
- **Database Migration:** `npx prisma migrate dev`
- **Database Generate:** `npx prisma generate`

# Module Structure & Naming Conventions
- Feature domains are grouped under `src/modules/` (e.g., `products`, `users`, `uploads`).
- Authentication and cross-cutting concerns are in dedicated directories (`src/auth/`, `src/services/`, `src/schedule/`).
- Global interceptors, filters, and middlewares are under `src/exceptions/`, `src/filters/`, and `src/middlewares/`.
- **Naming Conventions:** Kebab-case directories and files. Files suffix their type: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `*.spec.ts`.

# Architecture Conventions
- **Auth:** JWT Bearer Token based authentication with refresh tokens support (`passport-jwt`). User roles (`USER`, `ADMIN`) are enforced.
- **Database:** Prisma with PostgreSQL. Migrations are required for schema changes. Soft deletes are used (via `deletedAt`).
- **Cache / Security:** `@nestjs/throttler` is used for rate-limiting. CORS and Helmet are enabled globally.
- **Error Response:** Global filters (`AllExceptionsFilter`, `InvalidFormExceptionFilter`) standardize error responses. `ValidationPipe` is enabled globally with whitelist and transformation enabled.

# Documentation
- **API Contracts & Feature Specs:** Accessible locally via Swagger UI at `http://localhost:3000/api/docs` when the app is running.
