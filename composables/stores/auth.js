import { defineStore } from 'pinia'
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword } from 'firebase/auth'

export const useAuthStore = defineStore('auth', () => {
    const { $auth } = useNuxtApp()

    const loginUser = ref(null)
    const isLoggedIn = ref(false)

    const login = async(email, password) => {
        const userCred = await signInWithEmailAndPassword($auth, email, password)
        const user = userCred.user

        if(!user.emailVerified){
            throw new Error('メール認証を完了させてください')
        }

        const token = await user.getIdToken()

        const res = await $fetch('http://localhost:8080/api/auth/login', {
            method: "POST",
            body: { token: token }
        })

        loginUser.value = {
            id: res.id,
            nickname: res.nickname
        }
        isLoggedIn.value = true
    }

    const register = async(email, password) => {
        const userCred = await createUserWithEmailAndPassword($auth, email, password)
        await sendEmailVerification(userCred.user)
    }

    const logout = () => {
        loginUser.value = null
        isLoggedIn.value = false
        return $auth.signOut()
    }

    return {
        loginUser,
        isLoggedIn,
        login,
        register,
        logout
    }
})