import svgLoader from 'vite-svg-loader'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',
	modules: ['@nuxtjs/i18n'],
	devtools: { enabled: true },
	css: ['~/assets/css/main.css'],

	// ru на «/», en на «/en». detectBrowserLanguage off — по умолчанию всегда русский.
	i18n: {
		// для абсолютных hreflang-ссылок; деплой-агент может переопределить через NUXT_PUBLIC_SITE_URL
		baseUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://akarmain.ru',
		defaultLocale: 'ru',
		strategy: 'prefix_except_default',
		detectBrowserLanguage: false,
		bundle: { optimizeTranslationDirective: false },
		locales: [
			{ code: 'ru', language: 'ru-RU', name: 'Русский', file: 'ru.json' },
			{ code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
		],
	},

	vite: { plugins: [svgLoader({ defaultImport: 'component' })] },

	app: {
		head: {
			title: 'akarmain.dev',
			link: [
				{ rel: 'preconnect', href: 'https://fonts.googleapis.com' },
				{ rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
			],
			// ponytail: prevent theme FOUC — runs before first paint
			script: [
				{ innerHTML: `try{var t=localStorage.getItem('akos-theme'),m=matchMedia('(prefers-color-scheme: light)').matches;if(t==='light'||(!t&&m))document.documentElement.setAttribute('data-theme','light');else document.documentElement.removeAttribute('data-theme')}catch(e){}` },
				{ innerHTML: `try{if('serviceWorker'in navigator){window.addEventListener('load',function(){navigator.serviceWorker.getRegistrations().then(function(r){return Promise.all(r.map(function(x){return x.unregister()}))}).then(function(){return window.caches?caches.keys().then(function(k){return Promise.all(k.map(function(x){return caches.delete(x)}))}):null}).catch(function(){})})}}catch(e){}` },
			],
		}
	},
})
