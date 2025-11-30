<script setup>
import { useAuthStore } from '~/composables/stores/auth'

definePageMeta({
    middleware: 'auth'
})

const authStore = useAuthStore()

const isLoggedIn = computed(() => authStore.isLoggedIn)
const email = ref(authStore.getFirebaseEmail())
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
    <div>
        <div class="p-4">
            <h2>メールアドレス・パスワード設定</h2>
            <p>{{ email }}</p>
            <button
                @click="openResetEmail"
            >
                emailを変更
            </button>
            <div v-if="isOpenResetEmail">
                <div class="mb-4">
                    <label
                        for="email"
                        class="block text-sm font-medium text-gray-700"
                    >新しいメールアドレス</label>
                    <input
                        id="newEmail"
                        v-model="newEmail"
                        placeholder="New Email"
                        required
                        class="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
                    >
                    <p
                        v-if="emailError"
                        class="text-red-600"
                    >
                        {{ emailError }}
                    </p>
                </div>
                <div class="relative mb-6">
                    <label
                        for="password"
                        class="block text-sm font-medium text-gray-700"
                    >現在のパスワードを入力</label>
                    <input
                        id="password"
                        v-model="password"
                        placeholder="password"
                        type="password"
                        required
                        class="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
                    >
                    <p
                        v-if="passwordError"
                        class="text-red-700"
                    >
                        {{ passwordError }}
                    </p>
                    <button
                        @click="sendResetEmail"
                    >
                        メールアドレスを変更
                    </button>
                </div>
            </div>
            <div>
                <button
                    @click="sendResetPassword"
                >
                    パスワードを再設定
                </button>
            </div>
        </div>

        <div>
            <h2>アカウントを削除</h2>
            <label
                for="currentPassword"
                class="block text-sm font-medium text-gray-700"
            >現在のパスワードを入力</label>
            <input
                id="currentPassword"
                v-model="currentPassword"
                placeholder="currentPassword"
                type="password"
                required
                class="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm"
            >
            <p
                v-if="currentPasswordError"
                class="text-red-700"
            >
                {{ currentPasswordError }}
            </p>
            <button
                @click="deleteAccount"
            >
                削除
            </button>
        </div>
    </div>
</template>