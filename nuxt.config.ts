// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',
	modules: ['shadcn-nuxt'],
	devtools: { enabled: true },
	css: ['~/assets/css/main.css'],
	app: {
		head: {
			title: 'akarmain.dev',
			// ponytail: prevent theme FOUC — runs before first paint
			script: [
				{ innerHTML: `try{var t=localStorage.getItem('akos-theme'),m=matchMedia('(prefers-color-scheme: light)').matches;if(t==='light'||(!t&&m))document.documentElement.setAttribute('data-theme','light');else document.documentElement.removeAttribute('data-theme')}catch(e){}` },
				{ innerHTML: `try{if('serviceWorker'in navigator){window.addEventListener('load',function(){navigator.serviceWorker.getRegistrations().then(function(r){return Promise.all(r.map(function(x){return x.unregister()}))}).then(function(){return window.caches?caches.keys().then(function(k){return Promise.all(k.map(function(x){return caches.delete(x)}))}):null}).catch(function(){})})}}catch(e){}` },
			],
		}
	},

	vite: {
		plugins: [tailwindcss()]
	},
	shadcn: {
		prefix: '',
		componentDir: '@/components/ui'
	}
})
