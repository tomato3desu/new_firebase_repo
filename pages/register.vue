<script setup>
import { useAuthStore } from '~/composables/stores/auth'

const authStore = useAuthStore()
const email = ref('')
const password = ref('')

const register = async() => {
    try {
        await authStore.register(email.value, password.value)
        alert("確認メールを送信しました。メール内のリンクをクリックし、登録を完了させてください")
    } catch(error) {
        console.log(error)
        alert('登録中にエラーが発生しました', error.message)
    } 
}
</script>

<template>
    <div>
        <input v-model="email" placeholder="email">
        <input v-model="password" placeholder="password" type="password">
        <button @click="register">登録</button>
    </div>
</template>