/** Runs before any test file; must set env before modules import `@infrastructure/config/env`. */
process.env.NODE_ENV = 'test'
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-ci-and-local-min-32chars'
}
