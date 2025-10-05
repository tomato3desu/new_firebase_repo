<script setup>
import { signInWithEmailAndPassword } from 'firebase/auth'

const { $auth } = useNuxtApp()
const email = ref('')
const password = ref('')

const login = async() => {
    let userCred;
    try {
        userCred = await signInWithEmailAndPassword($auth, email.value, password.value) 
    } catch(error) {
        console.log(error)
        alert('メールアドレスまたはパスワードが違います')
        return
    }
    const user = userCred.user
    
    if(!user.emailVerified){
        alert('認証が完了していません')
        return
    }
    try {
        const token = await user.getIdToken()
        const res = await $fetch('http://localhost:8080/api/auth/login', {
            method: "POST",
            body: {
                token: token
            }
        })
        console.log(res.nickname)
    } catch(error) {
        console.log(error)
        alert("ログインエラー", error.message)
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
