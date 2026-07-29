# Copilot Instructions — GenAI Practice (AI Chat App Backend)

## Stack
- Node.js + Express + TypeScript (strict mode on, do not weaken tsconfig)
- MongoDB + Mongoose
- Validation: Zod (env vars at boot, and request DTOs)
- Logging: Pino (`pino-http` for request logs, structured JSON, correlation ID via `x-request-id` header)
- Auth: `jose` for JWT (HS256), never `jsonwebtoken`
- Password hashing: bcryptjs, pre-save hook on the Mongoose model

## Architecture — strict layering, do not collapse layers

```text
src/

models/        Mongoose schemas only

schemas/       Zod validation schemas + exported z.infer DTO types

repositories/  raw Mongoose queries only — no business logic, no res/req

services/      business logic — calls repositories, throws AppError

controllers/   thin — parse req, call service, format res. No business logic.

routes/        HTTP wiring only (method + path + middleware + controller)

middlewares/   authMiddleware, validate(schema), errorHandler, notFoundHandler

utils/         AppError, asyncHandler, token.ts (jose sign/verify)

config/        env.ts (Zod-validated), db.ts, logger.ts
```

- Controllers never talk to Mongoose directly — always go through a service.
- Services never touch req/res — keep them framework-agnostic and testable.
- Every route handler is wrapped in asyncHandler — no manual try/catch in controllers.

## Error handling
- Expected/operational failures → throw new AppError(message, statusCode).
- Examples: 404 not found, 401 invalid credentials, 409 duplicate resource, 400 validation failure.
- Never let raw errors reach the client. errorHandler middleware (already wired last in app.ts) formats all responses as { success: false, message }, and only includes stack when env.NODE_ENV === "development".
- Log 5xx as logger.error, 4xx as logger.warn.

## Validation
- Every request body/query/params that comes from the client is validated with a Zod schema via the validate(schema) middleware before it reaches the controller.
- Derive TypeScript types from Zod with z.infer<typeof schema> — never hand-write a duplicate interface for the same shape.
- Env vars are validated once in src/config/env.ts — always import env from there, never read process.env directly anywhere else.

## Auth conventions (already implemented — follow this shape for new protected routes)
- JWT payload contains only userId and email — never password, never full user object.
- Tokens signed with jose, HS256, 7 day expiry, secret from env.JWT_SECRET.
- authMiddleware reads Authorization: Bearer <token>, verifies with jose, attaches { userId, email } to req.user, throws AppError(401, ...) on missing/invalid/expired token.
- Password field on the User model has select: false — must be explicitly .select("+password") when needed (login flow only).
- Login/register return { user: { id, email }, token } — never return the password hash under any circumstance.

## Logging
- Use the shared logger from src/config/logger.ts — never console.log.
- Request-level logs are automatic via pino-http; add explicit logger.info/warn/error inside services for meaningful business events (registration success, failed login, resource created/deleted).

## Server lifecycle
- server.ts wraps startup in an async function (no top-level await — tsconfig module target doesn't support it).
- Graceful shutdown on SIGTERM/SIGINT: close HTTP server, close Mongoose connection, force-exit after 10s if it hangs. Keep this pattern for any future long-lived connections (Redis, etc.) added later.

## What not to do
- Don't suggest jsonwebtoken, express-validator, or Winston — these are intentionally not used here.
- Don't put business logic in controllers or routes.
- Don't skip Zod validation on any new endpoint that accepts a body.
- Don't add features beyond what's asked (no refresh tokens / password reset / email verification unless explicitly requested).
