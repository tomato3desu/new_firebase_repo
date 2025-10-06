import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"

export default defineNuxtPlugin(() => {
    const runtimeConfig = useRuntimeConfig()

    const firebaseConfig = {
        apiKey: runtimeConfig.public.firebaseAuthApiKey,
        authDomain: "fir-auth-2b651.firebaseapp.com",
        projectId: "fir-auth-2b651",
        storageBucket: "fir-auth-2b651.firebasestorage.app",
        messagingSenderId: "661832924829",
        appId: "1:661832924829:web:466dca9206d6da37b29e74"
    }

    const app = initializeApp(firebaseConfig)
    const auth = getAuth(app)

    return { provide: { auth } }
})
