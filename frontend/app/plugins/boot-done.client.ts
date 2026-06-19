// ponytail: fires after hydration so the boot overlay knows the site is ready
export default defineNuxtPlugin(() => {
  window.dispatchEvent(new Event('akos:ready'))
})
