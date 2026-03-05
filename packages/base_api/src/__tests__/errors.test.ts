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
import { classifyError, isRetryable } from '../errors/error-classifier'
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

describe('classifyError', () => {
  it('passes through existing ApiError instances', () => {
    const err = new AuthError('already classified')
    expect(classifyError(err)).toBe(err)
  })

  it('classifies Supabase-like 401 error as AuthError', () => {
    const result = classifyError({ code: 'not_authenticated', status: 401, message: 'JWT expired' })
    expect(result).toBeInstanceOf(AuthError)
    expect(result.message).toBe('JWT expired')
  })

  it('classifies Supabase-like 404 error as NotFoundError', () => {
    const result = classifyError({ code: 'PGRST116', status: 404, message: 'Row not found' })
    expect(result).toBeInstanceOf(NotFoundError)
  })

  it('classifies 409 / unique violation as ConflictError', () => {
    const result = classifyError({ code: '23505', message: 'duplicate key' })
    expect(result).toBeInstanceOf(ConflictError)
  })

  it('classifies 429 as RateLimitError', () => {
    const result = classifyError({ code: 'rate_limited', status: 429, message: 'slow down' })
    expect(result).toBeInstanceOf(RateLimitError)
  })

  it('classifies 500+ as ServerError', () => {
    const result = classifyError({ code: 'internal', status: 503, message: 'service unavailable' })
    expect(result).toBeInstanceOf(ServerError)
    expect(result.statusCode).toBe(503)
  })

  it('classifies plain Error with "network" keyword as NetworkError', () => {
    const result = classifyError(new Error('network timeout'))
    expect(result).toBeInstanceOf(NetworkError)
  })

  it('classifies unknown strings as UnknownError', () => {
    const result = classifyError('something went wrong')
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
