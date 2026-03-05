import { describe, it, expect } from 'vitest'
import {
  ApiError,
  NetworkError,
  AuthError,
  NotFoundError,
  ConflictError,
  ServerError,
  RateLimitError,
  UnknownError,
} from '../errors/api-error'
import { normaliseError, isRetryable } from '../errors/normalise-error'
import { ErrorMessageMapper } from '../errors/error-message-mapper'

describe('Error hierarchy', () => {
  it('all error classes extend ApiError', () => {
    expect(new NetworkError()).toBeInstanceOf(ApiError)
    expect(new AuthError()).toBeInstanceOf(ApiError)
    expect(new NotFoundError()).toBeInstanceOf(ApiError)
    expect(new ConflictError()).toBeInstanceOf(ApiError)
    expect(new ServerError()).toBeInstanceOf(ApiError)
    expect(new RateLimitError()).toBeInstanceOf(ApiError)
    expect(new UnknownError()).toBeInstanceOf(ApiError)
  })

  it('has correct name and statusCode on each subclass', () => {
    expect(new AuthError().name).toBe('AuthError')
    expect(new AuthError().statusCode).toBe(401)
    expect(new NotFoundError().statusCode).toBe(404)
    expect(new ConflictError().statusCode).toBe(409)
    expect(new ServerError().statusCode).toBe(500)
    expect(new RateLimitError().statusCode).toBe(429)
  })

  it('preserves custom messages', () => {
    expect(new NetworkError('DNS failure').message).toBe('DNS failure')
    expect(new ServerError('DB down', 503).statusCode).toBe(503)
  })
})

describe('normaliseError', () => {
  it('passes through existing ApiError instances unchanged', () => {
    const err = new AuthError('already normalised')
    expect(normaliseError(err)).toBe(err)
  })

  it('maps Supabase 401 to AuthError', () => {
    const result = normaliseError({ code: 'not_authenticated', status: 401, message: 'JWT expired' })
    expect(result).toBeInstanceOf(AuthError)
    expect(result.message).toBe('JWT expired')
  })

  it('maps Supabase 404 to NotFoundError', () => {
    const result = normaliseError({ code: 'PGRST116', status: 404, message: 'Row not found' })
    expect(result).toBeInstanceOf(NotFoundError)
  })

  it('maps Supabase PGRST116 (406 from .single()) to NotFoundError', () => {
    // Supabase returns 406 Not Acceptable when .single() finds no row
    const result = normaliseError({ code: 'PGRST116', status: 406, message: 'JSON object requested, multiple (or no) rows returned' })
    expect(result).toBeInstanceOf(NotFoundError)
  })

  it('maps PGRST116 without status to NotFoundError', () => {
    const result = normaliseError({ code: 'PGRST116', message: 'no rows' })
    expect(result).toBeInstanceOf(NotFoundError)
  })

  it('maps unique constraint violation (23505) to ConflictError', () => {
    const result = normaliseError({ code: '23505', message: 'duplicate key' })
    expect(result).toBeInstanceOf(ConflictError)
  })

  it('maps 409 to ConflictError', () => {
    const result = normaliseError({ code: '', status: 409, message: 'conflict' })
    expect(result).toBeInstanceOf(ConflictError)
  })

  it('maps 429 to RateLimitError', () => {
    const result = normaliseError({ code: 'rate_limited', status: 429, message: 'slow down' })
    expect(result).toBeInstanceOf(RateLimitError)
  })

  it('maps 500+ to ServerError', () => {
    const result = normaliseError({ code: 'internal', status: 503, message: 'service unavailable' })
    expect(result).toBeInstanceOf(ServerError)
    expect(result.statusCode).toBe(503)
  })

  it('maps TypeError to NetworkError', () => {
    const result = normaliseError(new TypeError('Failed to fetch'))
    expect(result).toBeInstanceOf(NetworkError)
  })

  it('maps Error with "network" in message to NetworkError', () => {
    const result = normaliseError(new Error('network unreachable'))
    expect(result).toBeInstanceOf(NetworkError)
  })

  it('maps unknown strings to UnknownError', () => {
    const result = normaliseError('something went wrong')
    expect(result).toBeInstanceOf(UnknownError)
  })
})

describe('isRetryable', () => {
  it('returns true for NetworkError and ServerError', () => {
    expect(isRetryable(new NetworkError())).toBe(true)
    expect(isRetryable(new ServerError())).toBe(true)
  })

  it('returns false for non-retryable errors', () => {
    expect(isRetryable(new AuthError())).toBe(false)
    expect(isRetryable(new NotFoundError())).toBe(false)
    expect(isRetryable(new ConflictError())).toBe(false)
    expect(isRetryable(new RateLimitError())).toBe(false)
  })
})

describe('ErrorMessageMapper', () => {
  it('mapErrorToKey returns correct i18n keys', () => {
    expect(ErrorMessageMapper.mapErrorToKey(new NetworkError())).toBe('errors.network')
    expect(ErrorMessageMapper.mapErrorToKey(new AuthError())).toBe('errors.auth')
    expect(ErrorMessageMapper.mapErrorToKey(new NotFoundError())).toBe('errors.notFound')
    expect(ErrorMessageMapper.mapErrorToKey(new ConflictError())).toBe('errors.conflict')
    expect(ErrorMessageMapper.mapErrorToKey(new RateLimitError())).toBe('errors.rateLimit')
    expect(ErrorMessageMapper.mapErrorToKey(new ServerError())).toBe('errors.server')
    expect(ErrorMessageMapper.mapErrorToKey(new UnknownError())).toBe('errors.unknown')
  })

  it('mapError returns human-readable messages', () => {
    expect(ErrorMessageMapper.mapError(new NetworkError())).toContain('internet')
    expect(ErrorMessageMapper.mapError(new AuthError())).toContain('signed in')
    expect(ErrorMessageMapper.mapError(new NotFoundError())).toContain('not be found')
  })

  it('mapError falls back to error.message for UnknownError with custom message', () => {
    const err = new UnknownError('custom fallback')
    expect(ErrorMessageMapper.mapError(err)).toBe('custom fallback')
  })
})
