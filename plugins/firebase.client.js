import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";


export default defineNuxtPlugin(() => {
    const runtimeConfig = useRuntimeConfig()

    const firebaseConfig = {
    apiKey: runtimeConfig.public.firebaseAuthApiKey,
    authDomain: "spring-nuxt-auth.firebaseapp.com",
    projectId: "spring-nuxt-auth",
    storageBucket: "spring-nuxt-auth.firebasestorage.app",
    messagingSenderId: "434727826873",
    appId: "1:434727826873:web:fd03bd3d2915ca6e34b268"
    };

    const app = initializeApp(firebaseConfig)
    const auth = getAuth(app)

    return { provide: { auth } }
})

