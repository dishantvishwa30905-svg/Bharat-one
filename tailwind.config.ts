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
        navy: {
          DEFAULT: '#0D1B3D',
          50: '#E8ECF5',
          100: '#C5CEEA',
          200: '#8B9CD4',
          500: '#3355A0',
          700: '#1A2E6B',
          900: '#0D1B3D',
        },
        saffron: {
          DEFAULT: '#FF8C00',
          50: '#FFF4E0',
          100: '#FFE0A3',
          200: '#FFCC66',
          500: '#FF8C00',
          600: '#E07C00',
          700: '#C06A00',
        },
        indiaGreen: {
          DEFAULT: '#138808',
          50: '#E8F5E9',
          100: '#C8E6C9',
          500: '#138808',
          600: '#0D6E05',
          700: '#0A5504',
        },
        chakraBlue: '#000088',
      },
      fontFamily: {
        jakarta: ['var(--font-jakarta)', 'sans-serif'],
        inter: ['var(--font-inter)', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideIn: { from: { transform: 'translateX(-10px)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } },
        pulseSoft: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.7' } },
      },
    },
  },
  plugins: [],
}
export default config
