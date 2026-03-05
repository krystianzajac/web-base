import type { Config } from 'tailwindcss'
import { createTailwindConfig } from '@web-base/base-ui/tailwind'
import { exampleBrand } from './src/brand'

const brandConfig = createTailwindConfig(exampleBrand)

const config: Config = {
  ...brandConfig,
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../packages/base_ui/src/**/*.{js,ts,jsx,tsx}',
  ],
}

export default config
