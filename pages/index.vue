<script setup>
import { useAuthStore } from '~/composables/stores/auth';


const authStore = useAuthStore()

</script>

<template>
    <div>
        <p class="text-2xl text-red-300">tomato</p>
        <p v-if="authStore.isLoggedIn">{{ authStore.loginUser.nickname }}さん。ようこそ！</p>
        <p v-else>ようこそ！</p>
        <NuxtLink to="/register">新規登録</NuxtLink>
        <NuxtLink to="/login">ログイン</NuxtLink>
    </div>
</template>