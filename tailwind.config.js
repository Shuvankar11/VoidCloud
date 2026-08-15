/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cloud: {
          950: '#030712', // Deepest Obsidian Space
          900: '#080D1A', // Rich Slate Navy
          850: '#0E1424', // Elevated Surface
          800: '#141D30', // Card Surface
          750: '#1A253D', // Hover Surface
          700: '#233150', // Border Primary
          600: '#334468', // Border Muted
          500: '#64748B',
          400: '#94A3B8',
          300: '#CBD5E1',
          200: '#E2E8F0',
          100: '#F1F5F9',
        },
        azure: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8', // Primary Bright Accent
          500: '#0EA5E9', // Core Cloud Azure
          600: '#0284C7', // Deep Sapphire
          700: '#0369A1',
        },
        shield: {
          400: '#34D399',
          500: '#10B981', // Safe Emerald
          600: '#059669',
        },
        frost: {
          silver: '#E2E8F0',
          white: '#FFFFFF',
          glow: 'rgba(56, 189, 248, 0.15)',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'marquee': 'marquee 35s linear infinite',
        'marquee-fast': 'marquee 20s linear infinite',
        'cloud-spin': 'cloudSpin 24s linear infinite',
        'float-slow': 'floatSlow 7s ease-in-out infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        cloudSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      backgroundImage: {
        'cloud-grid': 'linear-gradient(to right, rgba(56, 189, 248, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 189, 248, 0.03) 1px, transparent 1px)',
        'azure-gradient': 'linear-gradient(135deg, #38BDF8 0%, #0284C7 50%, #2563EB 100%)',
        'cloud-glow': 'radial-gradient(circle at 50% 50%, rgba(14, 165, 233, 0.12), transparent 70%)',
      },
    },
  },
  plugins: [],
}
