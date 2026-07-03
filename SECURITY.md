# Security Policy

## Supported Versions

Only the latest production deployment of Forge receives security updates.

## Reporting a Vulnerability

If you discover a security vulnerability, please report it privately to **security@forge.dev**.

**Do not** report security issues through public GitHub issues or public channels.

### What to include

- Type of vulnerability
- Steps to reproduce
- Affected version/deployment
- Any proof of concept (if available)

### Response timeline

- **24 hours**: Acknowledgment of receipt
- **7 days**: Initial assessment and remediation plan
- **30 days**: Target resolution timeline for critical issues

## Security Practices

- All passwords are hashed with bcrypt (cost factor 12)
- JWT access tokens expire after 15 minutes
- Refresh tokens are httpOnly cookies, 7-day expiry
- Database connection uses TLS via Prisma Accelerate
- File uploads are validated for type and size (10 MB max)
- User content is sanitized with DOMPurify before rendering
- All API endpoints validate input with Zod schemas
- Suspended accounts cannot authenticate or access data
- CORS restricted to known client origins

## Disclosure

We believe in coordinated disclosure. We will publicly acknowledge verified reports after a fix is deployed and users have had reasonable time to update.

## Scope

The following are in scope:
- forge.dev (production)
- api.forge.dev (API)

The following are out of scope:
- Third-party services (Prisma Accelerate, Vercel, etc.)
- Social engineering attacks
- Physical attacks
- Self-XSS

Thank you for helping keep Forge and its users safe.
