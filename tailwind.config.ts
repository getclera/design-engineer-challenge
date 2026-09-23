import type { Config } from "tailwindcss";

export default {
	darkMode: ["class", "media"],
	content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: "2rem",
			screens: {
				"2xl": "1400px",
			},
		},
		extend: {
			fontFamily: {
				sans: [
					"Be Vietnam Pro",
					"Be Vietnam Pro Fallback",
					"ui-sans-serif",
					"system-ui",
					"-apple-system",
					"BlinkMacSystemFont",
					"Segoe UI",
					"Roboto",
					"Helvetica Neue",
					"Arial",
					"sans-serif",
				],
				mono: [
					"var(--font-mono)",
					"ui-monospace",
					"SFMono-Regular",
					"Consolas",
					"Liberation Mono",
					"Menlo",
					"monospace",
				],
			},
			keyframes: {
				shine: {
					"0%": { transform: "translateX(-100%)" },
					"100%": { transform: "translateX(100%)" },
				},
				"bounce-slow": {
					"0%, 100%": { transform: "translateX(0)" },
					"50%": { transform: "translateX(4px)" },
				},
				blink: {
					"0%, 100%": { opacity: "1" },
					"50%": { opacity: "0" },
				},
				"fade-in": {
					"0%": { opacity: "0", transform: "translateY(-10px)" },
					"100%": { opacity: "1", transform: "translateY(0)" },
				},
				"success-pulse": {
					"0%, 100%": { backgroundColor: "rgba(220, 252, 231, 0.7)" },
					"50%": { backgroundColor: "rgba(220, 252, 231, 1)" },
				},
				flow: {
					"0%": { transform: "translateX(0%)", width: "30%" },
					"50%": { transform: "translateX(40%)", width: "30%" },
					"100%": { transform: "translateX(80%)", width: "30%" },
				},
				appear: {
					"0%": { opacity: "0", transform: "translateY(10px)" },
					"100%": { opacity: "1", transform: "translateY(0)" },
				},
				"appear-zoom": {
					"0%": { opacity: "0", transform: "scale(0.95)" },
					"100%": { opacity: "1", transform: "scale(1)" },
				},
				"accordion-down": {
					from: { height: "0" },
					to: { height: "var(--radix-accordion-content-height)" },
				},
				"accordion-up": {
					from: { height: "var(--radix-accordion-content-height)" },
					to: { height: "0" },
				},
				"slide-up-fade": {
					"0%": {
						opacity: "0",
						transform: "translateY(10px)",
					},
					"100%": {
						opacity: "1",
						transform: "translateY(0)",
					},
				},
				slideInRight: {
					from: {
						opacity: "0",
						transform: "translateX(30px)",
					},
					to: {
						opacity: "1",
						transform: "translateX(0)",
					},
				},
				slideInLeft: {
					from: {
						opacity: "0",
						transform: "translateX(-30px)",
					},
					to: {
						opacity: "1",
						transform: "translateX(0)",
					},
				},
				slideDown: {
					"0%": {
						opacity: "0",
						transform: "translateY(-40px) scale(0.95)",
					},
					"100%": {
						opacity: "1",
						transform: "translateY(0) scale(1)",
					},
				},
				fadeIn: {
					"0%": {
						opacity: "0",
					},
					"100%": {
						opacity: "1",
					},
				},
				"pulse-soft": {
					"0%, 100%": {
						opacity: "1",
						transform: "scale(1)",
					},
					"50%": {
						opacity: "0.9",
						transform: "scale(1.02)",
					},
				},
				"pulse-glow": {
					"0%, 100%": {
						opacity: "1",
						boxShadow: "0 0 8px 2px rgba(56, 189, 248, 0.2)",
					},
					"50%": {
						opacity: "0.95",
						boxShadow: "0 0 16px 4px rgba(56, 189, 248, 0.4)",
					},
				},
				"progress-fill": {
					"0%": { width: "0%" },
					"100%": { width: "var(--progress-width)" },
				},
				marquee: {
					"0%": { transform: "translateX(0)" },
					"100%": { transform: "translateX(-50%)" },
				},
				draw: {
					"0%": { strokeDashoffset: "1" },
					"100%": { strokeDashoffset: "0" },
				},
				meteor: {
					"0%": { transform: "rotate(215deg) translateX(0)", opacity: "1" },
					"70%": { opacity: "1" },
					"100%": {
						transform: "rotate(215deg) translateX(-500px)",
						opacity: "0",
					},
				},
				"scroll-left": {
					"0%": { transform: "translateX(0)" },
					"100%": { transform: "translateX(-50%)" },
				},
				"scroll-right": {
					"0%": { transform: "translateX(-50%)" },
					"100%": { transform: "translateX(0)" },
				},
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
				"slide-up": "slide-up-fade 0.3s ease-out",
				fadeIn: "fadeIn 0.5s ease-out",
				slideDown: "slideDown 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
				"pulse-soft": "pulse-soft 2s infinite",
				"pulse-slow": "pulse-glow 3s infinite ease-in-out",
				shine: "shine 2s infinite",
				"bounce-slow": "bounce-slow 2s infinite ease-in-out",
				blink: "blink 1s steps(1) infinite",
				"fade-in": "fade-in 0.5s ease-out forwards",
				"success-pulse": "success-pulse 2s ease-in-out 1",
				flow: "flow 2s ease-in-out infinite",
				"progress-fill": "progress-fill 1s ease-out forwards",
				"marquee-infinite": "marquee 30s linear infinite",
				draw: "draw 1s ease-in-out forwards",
				"meteor-effect": "meteor 5s linear infinite",
				"scroll-left": "scroll-left 80s linear infinite",
				"scroll-right": "scroll-right 90s linear infinite",
				appear: "appear 0.5s ease-out forwards",
				"appear-zoom": "appear-zoom 0.5s ease-out forwards",
				slideInRight: "slideInRight 0.5s ease-out",
				slideInLeft: "slideInLeft 0.5s ease-out",
				"slideInLeft-delay-1": "slideInLeft 0.5s ease-out 0.3s both",
				"slideInLeft-delay-2": "slideInLeft 0.5s ease-out 0.6s both",
				"slideInLeft-delay-3": "slideInLeft 0.5s ease-out 0.9s both",
				"slideInRight-delay-4": "slideInRight 0.5s ease-out 1.2s both",
				"slideInLeft-delay-5": "slideInLeft 0.5s ease-out 1.5s both",
			},
			backgroundImage: {
				"gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
			},
		},
	},
	plugins: [],
} satisfies Config;
