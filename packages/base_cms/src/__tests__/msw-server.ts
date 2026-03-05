import { setupServer } from 'msw/node'

/** Shared MSW server instance for base_cms tests. */
export const server = setupServer()
