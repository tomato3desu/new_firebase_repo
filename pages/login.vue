<script setup>
import { auth } from '@/plugins/firebase.client'
import { signInWithEmailAndPassword } from 'firebase/auth'

const email = ref('')
const password = ref('')

const login = async() => {
    const userCred = await signInWithEmailAndPassword(auth, email.value, password.value)
    if(!userCred.user.emailVerified){
        alert('認証が完了していません')
        return
    }
    const token = await userCred.user.getIdToken()
    await $fetch('/api/auth/login', {
        method: "POST",
        body: {
            token: token,
            uid: userCred.uid
        }
    })
}
</script>

<template>
    <div>
        <input v-model="email" placeholder="email">
        <input v-model="password" placeholder="password" type="password">
        <button @click="login">ログイン</button>
    </div>
</template>
