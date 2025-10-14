// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: { enabled: true },
    css: ['~/assets/css/tailwind.css'],
    modules: ['@nuxtjs/tailwindcss', '@nuxt/eslint', '@pinia/nuxt'],
    ssr: false,
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
            firebaseAuthApiKey: process.env.FIREBASE_AUTH_API_KEY,
            firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
            googleMapApiKey: process.env.GOOGLE_MAP_API_KEY,
            googleMapId: process.env.GOOGLE_MAP_ID
        }
    }
})