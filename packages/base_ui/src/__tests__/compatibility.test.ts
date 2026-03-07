import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

/**
 * Compatibility guard tests.
 *
 * These tests verify that all web-base packages maintain correct
 * peer dependency ranges so that consuming apps (React 18 or 19,
 * Tailwind v3 or v4) can use them without version conflicts.
 *
 * If these tests fail, it means someone narrowed a version range
 * that will break downstream apps.
 */

const packagesDir = path.resolve(__dirname, '../../../../packages')

function readPackageJson(pkgName: string): Record<string, unknown> {
  const filePath = path.join(packagesDir, pkgName, 'package.json')
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

function getPackageNames(): string[] {
  return fs
    .readdirSync(packagesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
}

describe('peer dependency compatibility', () => {
  const packages = getPackageNames()

  it.each(packages)(
    '%s accepts React 19 in peer deps (if it declares react)',
    (pkgName) => {
      const pkg = readPackageJson(pkgName)
      const peers = pkg.peerDependencies as Record<string, string> | undefined
      if (!peers?.react) return // package doesn't depend on React

      expect(peers.react).toMatch(/\|\|\s*\^19/)
    },
  )

  it.each(packages)(
    '%s accepts React 19 for react-dom in peer deps (if it declares react-dom)',
    (pkgName) => {
      const pkg = readPackageJson(pkgName)
      const peers = pkg.peerDependencies as Record<string, string> | undefined
      if (!peers?.['react-dom']) return

      expect(peers['react-dom']).toMatch(/\|\|\s*\^19/)
    },
  )
})

describe('package exports', () => {
  it('base_ui exports Tailwind v3 config entry point', () => {
    const pkg = readPackageJson('base_ui')
    const exports = pkg.exports as Record<string, string>
    expect(exports['./tailwind']).toBeDefined()
  })

  it('base_ui exports Tailwind v4 config entry point', () => {
    const pkg = readPackageJson('base_ui')
    const exports = pkg.exports as Record<string, string>
    expect(exports['./tailwind-v4']).toBeDefined()
  })
})

describe('public API completeness', () => {
  it('base_ui index exports createTailwindConfig (v3)', async () => {
    const mod = await import('../index')
    expect(mod.createTailwindConfig).toBeDefined()
    expect(typeof mod.createTailwindConfig).toBe('function')
  })

  it('base_ui index exports generateBrandCSS (v4-compatible)', async () => {
    const mod = await import('../index')
    expect(mod.generateBrandCSS).toBeDefined()
    expect(typeof mod.generateBrandCSS).toBe('function')
  })

  it('base_ui index exports generateTailwindV4Theme', async () => {
    const mod = await import('../index')
    expect(mod.generateTailwindV4Theme).toBeDefined()
    expect(typeof mod.generateTailwindV4Theme).toBe('function')
  })

  it('base_ui index exports BrandProvider', async () => {
    const mod = await import('../index')
    expect(mod.BrandProvider).toBeDefined()
  })

  it('base_ui index exports useBrand', async () => {
    const mod = await import('../index')
    expect(mod.useBrand).toBeDefined()
  })
})
