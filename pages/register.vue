<script setup>
import { auth } from '@/plugins/firebase.client'
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'

const email = ref('')
const password = ref('')

const register = async() => {
    const userCred = await createUserWithEmailAndPassword(auth, email.value, password.value)
    await sendEmailVerification(userCred.user)
    alert("確認メールを送信しました。メール内のリンクをクリックし、登録を完了させてください")
}
</script>

<template>
    <div>
        <input v-model="email" placeholder="email">
        <input v-model="password" placeholder="password" type="password">
        <button @click="register">登録</button>
    </div>
</template>