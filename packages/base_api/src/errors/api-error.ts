/**
 * Base error class for all API errors.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
  ) {
    super(message)
    this.name = 'ApiError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

/** Network-level failure (timeout, DNS, CORS). Retryable. */
export class NetworkError extends ApiError {
  constructor(message = 'Network error') {
    super(message)
    this.name = 'NetworkError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

/** 401 — not authenticated. */
export class AuthError extends ApiError {
  constructor(message = 'Authentication required') {
    super(message, 401)
    this.name = 'AuthError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

/** 404 — resource not found. */
export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(message, 404)
    this.name = 'NotFoundError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

/** 409 — conflict (duplicate key, concurrent update). */
export class ConflictError extends ApiError {
  constructor(message = 'Conflict') {
    super(message, 409)
    this.name = 'ConflictError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

/** 5xx — server-side failure. Retryable. */
export class ServerError extends ApiError {
  constructor(message = 'Server error', statusCode = 500) {
    super(message, statusCode)
    this.name = 'ServerError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

/** 429 — too many requests. */
export class RateLimitError extends ApiError {
  constructor(message = 'Rate limit exceeded') {
    super(message, 429)
    this.name = 'RateLimitError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

/** Fallback for unexpected errors. */
export class UnknownError extends ApiError {
  constructor(message = 'An unexpected error occurred') {
    super(message)
    this.name = 'UnknownError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
