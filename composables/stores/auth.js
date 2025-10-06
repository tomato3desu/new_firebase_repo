import { defineStore } from 'pinia'
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword } from 'firebase/auth'

export const useAuthStore = defineStore('auth', () => {
    const { $auth } = useNuxtApp()

    const loginUser = ref(null)
    const isLoggedIn = ref(false)

    const login = async (email, password) => {
        let userCred
        try {
            userCred = await signInWithEmailAndPassword($auth, email, password)
        }
        catch (error) {
            throw new Error('メールアドレスまたはパスワードが違います')
        }
        const user = userCred.user

        if (!user.emailVerified) {
            await sendEmailVerification(user)
            throw new Error('確認メールを再度を送信しました。メール認証を完了させてください')
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

    const register = async (email, password) => {
        const userCred = await createUserWithEmailAndPassword($auth, email, password)
        console.log("登録成功")
        await sendEmailVerification(userCred.user)
        console.log("メール送信成功")
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