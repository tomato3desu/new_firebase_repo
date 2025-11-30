import { useAuthStore } from "~/composables/stores/auth"

export default defineNuxtRouteMiddleware((to, from) => {
    const authStore = useAuthStore()

    if (!authStore.loginUser) {
        return navigateTo('/login')
    }
})
