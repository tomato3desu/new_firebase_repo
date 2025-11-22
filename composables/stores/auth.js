import { defineStore } from 'pinia'
import { createUserWithEmailAndPassword, 
    sendEmailVerification, 
    signInWithEmailAndPassword, 
    getAuth, 
    onAuthStateChanged, 
    sendPasswordResetEmail,
    verifyBeforeUpdateEmail,
    EmailAuthProvider,
    reauthenticateWithCredential,
    deleteUser } from 'firebase/auth'
import { useUserStore } from './user'

export const useAuthStore = defineStore('authStore', () => {
    const { $auth } = useNuxtApp()
    const config = useRuntimeConfig()

    const loginUser = ref(null)
    const isLoggedIn = ref(false)
    
    /**
     * ログイン処理
     * @param {string} email 
     * @param {string} password 
     * @returns 
     */
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

        // メール認証が済んでいない場合
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

        loginUser.value = data
        // userStoreにuser情報を保存
        const userStore = useUserStore()
        userStore.usersById[data.id] = data
        
        isLoggedIn.value = true
    }

    /**
     * firebase authでユーザー登録＆メール送信
     * @param {string} email 
     * @param {string} password 
     */
    const register = async (email, password) => {
        const userCred = await createUserWithEmailAndPassword($auth, email, password)
        console.log("登録成功")
        await sendEmailVerification(userCred.user)
        console.log("メール送信成功")
    }

    /**
     * パスワードリセットメール送信
     * @returns 
     */
    const sendPasswordReset = async () => {
        const email = getFirebaseEmail()
        if (!email) {
            throw new Error("メールアドレスを取得できませんでした")
        }

        try {
            await sendPasswordResetEmail($auth, email)
            return true
        }
        catch (error) {
            console.error("パスワードリセットエラー", error)
            throw new Error("パスワードリセットメールの送信に失敗しました")
        }
    }

    /**
     * メールアドレス変更メールを送信
     * @param {string} currentPassword 
     * @param {string} newEmail 
     */
    const updateEmailAddress = async (currentPassword, newEmail) => {
        if (!loginUser.value) throw new Error("ログインしていません")
        
        const email = getFirebaseEmail()
        // 再認証
        const credential = EmailAuthProvider.credential(email, currentPassword)
        await reauthenticateWithCredential($auth.currentUser, credential)

        // メールアドレス変更用メールを送信
        await verifyBeforeUpdateEmail($auth.currentUser, newEmail)
    }

    /**
     * アカウント削除
     */
    const deleteAccount = async (currentPassword) => {
        const user = $auth.currentUser

        if (!user) throw new Error("ログインしていません")

        const email = getFirebaseEmail()
        if (!email) throw new Error("メールアドレスが取得できません")

        try {
            // 再認証
            const credential = EmailAuthProvider.credential(email, currentPassword)
            await reauthenticateWithCredential(user, credential)

            const token = await getIdToken()

            // Firebase authから削除
            await deleteUser(user)

            // バックエンドに送信
            const res = await $fetch(`${config.public.apiBase}/api/auth/delete/user`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if (res !== undefined) { 
                throw new Error('削除失敗')
            }

            logout()
        }
        catch (error) {
            console.error("アカウント削除エラー", error)
        }
    }

    /**
     * プロフィール情報をアップデート
     * @param {object} updateInfo 
     * @param {string} token 
     */
    const updateProfile = async (updateInfo, token) => {
        try {
            const res = await $fetch(`${config.public.apiBase}/api/auth/updateProfile`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: updateInfo
            })

            loginUser.value = res
        }
        catch (e) {
            console.error("ユーザー情報の更新に失敗しました", e)
        }
    }

    const logout = () => {
        loginUser.value = null
        isLoggedIn.value = false
        return $auth.signOut()
    }

    const getIdToken = async () => {
        const auth = getAuth()
        let user = auth.currentUser
        if (!user) {
        // Firebase がユーザー情報を復元するのを待つ
            user = await new Promise((resolve) => {
                const unsubscribe = onAuthStateChanged(auth, (u) => {
                    unsubscribe()
                    resolve(u)
                })
            })
        }
        if (!user) throw new Error('No authenticated user')
        return await user.getIdToken()
    }

    const getFirebaseEmail = () => {
        return $auth.currentUser?.email || null
    }

    return {
        loginUser,
        isLoggedIn,
        login,
        register,
        sendPasswordReset,
        updateEmailAddress,
        deleteAccount,
        updateProfile,
        logout,
        getIdToken,
        getFirebaseEmail
    }
},
{
    persist: true
}
)