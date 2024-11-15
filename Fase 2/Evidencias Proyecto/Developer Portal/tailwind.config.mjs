/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			fontFamily: {
				montserrat: ['Montserrat', 'sans-serif'],
				nunito: ['Nunito', 'sans-serif'],
				fira: ['Fira Code', 'monospace'],
			},
			keyframes: {
				fontColorsAnimated: {
					'0%, 100%': { 'color': 'rgb(49 46 129)' },
					'25%': { 'color': 'rgb(165 180 252)' },
					'50%': { 'color': 'rgb(167 139 250)' },
					'75%': { 'color': 'rgb(76 29 149)' }
				},
				"fontColorsAnimatedWhite": {
					'0%, 100%': { 'color': 'rgb(254 205 211)' },
					'25%': { 'color': 'rgb(225 29 72)' },
					'50%': { 'color': 'rgb(219 39 119)' },
					'75%': { 'color': 'rgb(251 207 232)' }
				}
			},
			animation: {
				fontColorsAnimated: 'fontColorsAnimated 15s ease-in-out infinite',
				fontColorsAnimatedWhite: 'fontColorsAnimatedWhite 15s ease-in-out infinite',
			}
		},
	},
	plugins: [
		require('tailwindcss-animated')
	],
}
