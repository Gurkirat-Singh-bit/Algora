import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'dsa-bg': 'var(--dsa-bg)',
        'dsa-surface': 'var(--dsa-surface)',
        'dsa-card': 'var(--dsa-card)',
        'dsa-panel': 'var(--dsa-panel)',
        'dsa-border': 'var(--dsa-border)',
        'dsa-primary': 'var(--dsa-primary)',
        'dsa-primary-container': 'var(--dsa-primary-container)',
        'dsa-primary-dim': 'var(--dsa-primary-dim)',
        'dsa-active': 'var(--dsa-active)',
        'dsa-compare': 'var(--dsa-compare)',
        'dsa-found': 'var(--dsa-found)',
        'dsa-delete': 'var(--dsa-delete)',
        'dsa-insert': 'var(--dsa-insert)',
        'dsa-text': 'var(--dsa-text)',
        'dsa-muted': 'var(--dsa-muted)',
        'dsa-outline': 'var(--dsa-outline)',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'Geist Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 8px 24px rgba(0, 245, 212, 0.06)',
        'glow-strong': '0 8px 32px rgba(0, 245, 212, 0.18)',
      },
    },
  },
  darkMode: ['class', '[data-color-scheme="dark"]'],
  plugins: [],
}

export default config
