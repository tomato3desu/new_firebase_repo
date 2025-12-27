<script setup>
import { useAuthStore } from '~/composables/stores/auth'

definePageMeta({
    middleware: 'auth'
})

const toast = useToast()

const authStore = useAuthStore()

const isLoggedIn = computed(() => authStore.isLoggedIn)
const email = computed(() => authStore.loginUserEmail)
const isOpenResetEmail = ref(false)

// メール変更用
const newEmail = ref('')
const emailError = ref('')
const password = ref('')
const passwordError = ref('')

// アカウント削除用
const isOpenDeleteAccount = ref(false)
const currentPassword = ref('')
const currentPasswordError = ref('')

const openResetEmail = () => {
    isOpenResetEmail.value = true
}

const closeResetEmail = () => {
    newEmail.value = ''
    emailError.value = ''
    password.value = ''
    passwordError.value = ''
    isOpenResetEmail.value = false
}

const sendResetEmail = async () => {
    if (!isLoggedIn.value) return

    try {
        await authStore.updateEmailAddress(password.value, newEmail.value)
        toast.success({
            title: "新しいメールアドレスに変更用メールを送信しました",
            description: "メール確認後再度ログインしてください",
        })
        closeResetEmail()
        authStore.logout()
    }
    catch (error) {
        toast.error({
            title: "メールアドレス変更用メールの送信に失敗しました",
            description: error.message,
        })
    }
}

const sendResetPassword = async () => {
    if (!isLoggedIn.value) return

    try {
        await authStore.sendPasswordReset()
        toast.success({
            title: "パスワード再設定メールを送信しました",
            description: "パスワード変更後再度ログインしてください",
        })
    }
    catch (error) {
        toast.error({
            title: "パスワード再設定メールの送信に失敗しました",
            description: error.message,
        })
    }
}

const openDeleteAccount = () => {
    isOpenDeleteAccount.value = true
}

const closeDeleteAccount = () => {
    currentPassword.value = ''
    currentPasswordError.value = ''
    isOpenDeleteAccount.value = false
}

const deleteAccount = async () => {
    if (!currentPassword.value || currentPasswordError.value) return

    const isConfirm = window.confirm('本当にアカウントを削除しますか？')
    if (!isConfirm) return

    try {
        await authStore.deleteAccount(currentPassword.value)
    }
    catch (error) {
        toast.error({
            title: "アカウント削除に失敗しました",
            description: error.message,
        })
    }
}

// TODO watchでpasswordをバリデーションチェック
</script>

<template>
    <div class="min-h-screen bg-slate-300 flex justify-center p-6">
        <div class="text-slate-50 bg-gradient-to-tl from-slate-900 from- via-slate-700 via- to-slate-400 to- w-full max-w-md p-6 rounded-lg shadow-md space-y-8">
            <!-- メールアドレス・パスワード設定 -->
            <section>
                <h2 class="text-xl font-bold mb-2 border-b pb-2">
                    メールアドレス・パスワード設定
                </h2>

                <p class="mb-4">
                    現在のメール: <span class="font-semibold">{{ email }}</span>
                </p>

                <button
                    v-if="!isOpenResetEmail"
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
                            class="block text-sm font-medium"
                        >新しいメールアドレス</label>
                        <input
                            id="newEmail"
                            v-model="newEmail"
                            placeholder="New Email"
                            required
                            class="text-slate-800 mt-1 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
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
                            class="block text-sm font-medium"
                        >現在のパスワード</label>
                        <input
                            id="password"
                            v-model="password"
                            type="password"
                            placeholder="password"
                            required
                            class="text-slate-800 mt-1 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                        >
                        <p
                            v-if="passwordError"
                            class="text-red-500 mt-1"
                        >
                            {{ passwordError }}
                        </p>
                    </div>

                    <button
                        v-if="isOpenResetEmail"
                        class="w-full mt-4 bg-gray-400 text-white py-2 rounded-md hover:bg-gray-500 transition"
                        @click="closeResetEmail"
                    >
                        閉じる
                    </button>

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
                <button
                    v-if="!isOpenDeleteAccount"
                    class="w-full mt-4 bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition"
                    @click="openDeleteAccount"
                >
                    アカウントを削除
                </button>

                <div v-if="isOpenDeleteAccount">
                    <label
                        for="currentPassword"
                        class="block text-sm font-medium"
                    >現在のパスワード</label>
                    <input
                        id="currentPassword"
                        v-model="currentPassword"
                        type="password"
                        placeholder="currentPassword"
                        required
                        class="text-slate-800 mt-1 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                    >
                    <p
                        v-if="currentPasswordError"
                        class="text-red-500 mt-1"
                    >
                        {{ currentPasswordError }}
                    </p>
                    <button
                        class="w-full mt-4 bg-gray-400 text-white py-2 rounded-md hover:bg-gray-500 transition"
                        @click="closeDeleteAccount"
                    >
                        閉じる
                    </button>
                    <button
                        class="w-full mt-4 bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition"
                        @click="deleteAccount"
                    >
                        アカウントを削除
                    </button>
                </div>
            </section>
        </div>
    </div>
</template>