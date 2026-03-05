import { setupServer } from 'msw/node'

/**
 * Shared MSW server instance for base_api tests.
 * Import this and call server.use(...handlers) in each test file.
 */
export const server = setupServer()
