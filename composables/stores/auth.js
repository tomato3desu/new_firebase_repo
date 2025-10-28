import { defineStore } from 'pinia'
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, getAuth } from 'firebase/auth'

export const useAuthStore = defineStore('auth', () => {
    const { $auth } = useNuxtApp()
    const config = useRuntimeConfig()

    const loginUser = ref(null) // 表示用user情報
    const isLoggedIn = ref(false)

    const login = async (email, password) => {
        let userCred
        try {
            userCred = await signInWithEmailAndPassword($auth, email, password)
        }
        catch (error) {
            console.log(error)
            throw new Error('メールアドレスまたはパスワードが違います')
        }
        const user = userCred.user

        if (!user.emailVerified) {
            await sendEmailVerification(user)
            throw new Error('確認メールを再度を送信しました。メール認証を完了させてください')
        }

        const token = await user.getIdToken()

        const res = await fetch(`${config.public.apiBase}/api/auth/login`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })

        if (!res.ok) {
            console.error('ログイン失敗', await res.text())
            return
        }

        const data = await res.json()

        loginUser.value = {
            id: data.id,
            nickname: data.nickname,
            iconImagePath: data.iconImagePath,
            comment: data.comment,
            prefecture: {
                id: data.prefecture.id,
                name: data.prefecture.name,
                latitude: data.prefecture.latitude,
                longitude: data.prefecture.longitude
            },
            role: data.role
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

    const getIdToken = async () => {
        const auth = getAuth()
        const user = auth.currentUser
        if (!user) throw new Error('No authenticated user')
        return await user.getIdToken()
    }

    return {
        loginUser,
        isLoggedIn,
        login,
        register,
        logout,
        getIdToken
    }
},
{
    persist: true
}
)