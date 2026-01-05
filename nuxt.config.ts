// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: { enabled: true },
    css: ['~/assets/css/tailwind.css'],
    modules: ['@nuxtjs/tailwindcss', '@nuxt/eslint', '@pinia/nuxt', '@nuxt/image', 'nuxt-toast'],
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
        firebaseAdmin: {
            projectId: process.env.FIREBASE_AUTH_PROJECT_ID,
            clientEmail: process.env.FIREBASE_AUTH_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_AUTH_PRIVATE_KEY,
        },
        public: {
            firebaseAuthApiKey: process.env.FIREBASE_AUTH_API_KEY,
            // firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
            googleMapApiKey: process.env.GOOGLE_MAP_API_KEY,
            googleMapId: process.env.GOOGLE_MAP_ID,
            apiBase: process.env.API_BASE_URL,
            r2PublicUrl: process.env.R2_PUBLIC_URL,
            // recaptcha
            recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY,
        }
    }
})