# API Routes

This directory contains proprietary API route implementations that are not included in this portfolio version.

## Routes

- OAuth routes (Google OAuth2 flow)
- Setup routes (multi-step wizard API)
- Leads routes (lead submission and processing)
- Webhook routes (generic webhook endpoint)
- Config routes (application configuration)
- Credentials routes (credential management)
- Branding routes (white-label configuration)
- Health routes (system health checks)
- CSRF routes (CSRF token generation)

## Architecture

RESTful API with versioned endpoints (`/api/v1/`), full TypeScript coverage, CSRF protection, rate limiting, and input sanitization.

---

**Portfolio Note**: The frontend components in `client/` demonstrate how these APIs are consumed and the user experience they enable.

