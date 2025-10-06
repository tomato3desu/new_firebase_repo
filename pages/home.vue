<script setup>
import { useAuthStore } from '~/composables/stores/auth'

const authStore = useAuthStore()
</script>

<template>
    <p v-if="authStore.isLoggedIn">
        {{ authStore.loginUser.nickname }}さん。ようこそ！
    </p>
    <p v-else>
        ようこそ！
    </p>
</template>