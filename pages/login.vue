<script setup>
import { useAuthStore } from '~/composables/stores/auth';

const authStore = useAuthStore()

const email = ref('')
const password = ref('')

const login = async() => {
    try {
        await authStore.login(email.value, password.value)
        console.log('ログイン成功', authStore.loginUser)
    } catch(error) {
        console.log(error)
        alert('メールアドレスまたはパスワードが違います')
    }
}
</script>

<template>
    <div>
        <input v-model="email" placeholder="email">
        <input v-model="password" placeholder="password" type="password">
        <button @click="login">ログイン</button>
    </div>
</template>
