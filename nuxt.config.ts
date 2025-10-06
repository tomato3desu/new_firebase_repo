// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: { enabled: true },
    modules: ['@nuxtjs/tailwindcss', '@nuxt/eslint', '@pinia/nuxt'],
    eslint: {
        config: {
            stylistic: {
                blockSpacing: true,
                indent: 4,
                semi: false
            }
        }
    },
    runtimeConfig: {
        public: {
            firebaseAuthApiKey: process.env.FIREBASE_AUTH_API_KEY
        }
    }
})