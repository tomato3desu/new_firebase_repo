import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"

export default defineNuxtPlugin(() => {
    const runtimeConfig = useRuntimeConfig()

    const firebaseConfig = {
        apiKey: runtimeConfig.public.firebaseAuthApiKey,
        authDomain: runtimeConfig.public.firebaseAuthDomain,
        projectId: runtimeConfig.public.firebaseAuthProjectId,
        messagingSenderId: runtimeConfig.public.firebaseAuthMessagingSenderId,
        appId: runtimeConfig.public.firebaseAuthAppId,
    }

    const app = initializeApp(firebaseConfig)
    const auth = getAuth(app)

    return {
        provide: {
            auth,
        }
    }
})
