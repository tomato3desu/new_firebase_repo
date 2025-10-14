<script setup>
import { useAuthStore } from '~/composables/stores/auth'

const authStore = useAuthStore()
const isLoggedIn = computed(() => authStore.isLoggedIn)
const user = computed(() => authStore.loginUser)

const logout = () => {
    authStore.logout()
}
</script>

<template>
    <div class="bg-white border-b-4 shadow-md border-gray-300 h-16 flex items-center justify-between px-6 sticky top-0 z-50">
        <p class="text-4xl font-bit text-emerald-300">
            tomato
        </p>
        <div class=" flex items-center justify-between gap-6 px-6">
            <NuxtLink
                v-if="!isLoggedIn"
                to="/login"
                class="text-2xl text-sky-400"
            >ログイン</NuxtLink>
            <button
                v-else
                class="text-2xl text-red-400"
                @click="logout"
            >
                ログアウト
            </button>

            <NuxtLink
                v-if="!isLoggedIn"
                to="/register"
                class="text-2xl text-emerald-400"
            >新規登録</NuxtLink>
            <NuxtLink
                v-else
                to="/"
                class="text-2xl text-yellow-300"
            >{{ user.nickname }}</NuxtLink>
        </div>
    </div>
</template>