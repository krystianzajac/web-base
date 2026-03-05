import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => '/',
  redirect: vi.fn(),
}))

// Mock next/link — renders as a plain <a> in tests
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: { href: string; children: React.ReactNode; [k: string]: unknown }) => (
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

// Mock next/image — renders as a plain <img> in tests
vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    fill: _fill,
    ...props
  }: { src: string; alt: string; fill?: boolean; [k: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img src={src} alt={alt} {...props} />
  ),
}))
