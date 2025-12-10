<script setup>
import { useAuthStore } from '~/composables/stores/auth'

definePageMeta({
    middleware: 'auth'
})

const authStore = useAuthStore()

const isLoggedIn = computed(() => authStore.isLoggedIn)
const email = computed(() => authStore.loginUserEmail)
const isOpenResetEmail = ref(false)

// メール変更用
const newEmail = ref(null)
const emailError = ref(null)
const password = ref(null)
const passwordError = ref(null)

// アカウント削除用
const currentPassword = ref(null)
const currentPasswordError = ref(null)

const openResetEmail = () => {
    isOpenResetEmail.value = true
}

const closeResetEmail = () => {
    newEmail.value = false
    emailError.value = false
    password.value = false
    passwordError.value = false
    isOpenResetEmail.value = false
}

const sendResetEmail = async () => {
    if (!isLoggedIn.value) return

    try {
        await authStore.updateEmailAddress(password.value, newEmail.value)
        alert('新しいメールアドレスに変更用メールを送信しました。メール確認後再度ログインしてください')
        closeResetEmail()
        authStore.logout()
    }
    catch (error) {
        console.error("メールアドレス変更用メールの送信に失敗しました", error)
    }
}

const sendResetPassword = async () => {
    if (!isLoggedIn.value) return

    try {
        await authStore.sendPasswordReset()
        alert("パスワード再設定メールを送信しました")
    }
    catch (error) {
        console.error("パスワードの変更に失敗しました", error)
    }
}

const deleteAccount = async () => {
    if (!currentPassword.value || currentPasswordError.value) return

    const isConfirm = window.confirm('本当にアカウントを削除しますか？')
    if (!isConfirm) return

    try {
        await authStore.deleteAccount(currentPassword.value)
    }
    catch {
        console.error("アカウント削除に失敗", error)
    }
}

// TODO watchでpasswordをバリデーションチェック
</script>

<template>
    <div class="min-h-screen bg-gray-50 flex justify-center p-6">
        <div class="w-full max-w-md bg-white p-6 rounded-lg shadow-md space-y-8">
            <!-- メールアドレス・パスワード設定 -->
            <section>
                <h2 class="text-xl font-bold mb-2 border-b pb-2">
                    メールアドレス・パスワード設定
                </h2>

                <p class="text-gray-600 mb-4">
                    現在のメール: <span class="font-semibold">{{ email }}</span>
                </p>

                <button
                    class="w-full bg-sky-500 text-white py-2 rounded-md hover:bg-sky-600 transition"
                    @click="openResetEmail"
                >
                    メールアドレスを変更
                </button>

                <div
                    v-if="isOpenResetEmail"
                    class="mt-4 space-y-4"
                >
                    <!-- 新しいメール -->
                    <div>
                        <label
                            for="newEmail"
                            class="block text-sm font-medium text-gray-700"
                        >新しいメールアドレス</label>
                        <input
                            id="newEmail"
                            v-model="newEmail"
                            placeholder="New Email"
                            required
                            class="mt-1 w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                        <p
                            v-if="emailError"
                            class="text-red-500 mt-1"
                        >
                            {{ emailError }}
                        </p>
                    </div>

                    <!-- パスワード -->
                    <div>
                        <label
                            for="password"
                            class="block text-sm font-medium text-gray-700"
                        >現在のパスワード</label>
                        <input
                            id="password"
                            v-model="password"
                            type="password"
                            placeholder="password"
                            required
                            class="mt-1 w-full px-4 py-2 border rounded-md focus:ring-sky-500 focus:border-sky-500"
                        >
                        <p
                            v-if="passwordError"
                            class="text-red-500 mt-1"
                        >
                            {{ passwordError }}
                        </p>
                    </div>

                    <button
                        class="w-full bg-teal-500 text-white py-2 rounded-md hover:bg-teal-600 transition"
                        @click="sendResetEmail"
                    >
                        メールアドレス変更メールを送信
                    </button>
                </div>

                <button
                    class="w-full mt-4 bg-yellow-400 text-white py-2 rounded-md hover:bg-yellow-500 transition"
                    @click="sendResetPassword"
                >
                    パスワードを再設定
                </button>
            </section>

            <hr>

            <!-- アカウント削除 -->
            <section>
                <h2 class="text-xl font-bold mb-2 border-b pb-2 text-red-500">
                    アカウント削除
                </h2>

                <label
                    for="currentPassword"
                    class="block text-sm font-medium text-gray-700"
                >現在のパスワード</label>
                <input
                    id="currentPassword"
                    v-model="currentPassword"
                    type="password"
                    placeholder="currentPassword"
                    required
                    class="mt-1 w-full px-4 py-2 border rounded-md focus:ring-red-500 focus:border-red-500"
                >
                <p
                    v-if="currentPasswordError"
                    class="text-red-500 mt-1"
                >
                    {{ currentPasswordError }}
                </p>

                <button
                    class="w-full mt-4 bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition"
                    @click="deleteAccount"
                >
                    アカウントを削除
                </button>
            </section>
        </div>
    </div>
</template>