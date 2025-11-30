import { useAuthStore } from "~/composables/stores/auth"

export default defineNuxtRouteMiddleware((to, from) => {
    const authStore = useAuthStore()

    if (!authStore.loginUser) {
        return navigateTo('/404')
    }

    if (authStore.loginUser.role !== 'admin') {
        return navigateTo('/404')
    }
})