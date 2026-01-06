<script setup>
import { useAuthStore } from '~/composables/stores/auth'

const authStore = useAuthStore()

const email = ref('')
const emailError = ref('')

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

watch(email, (value) => {
    if (!value) {
        emailError.value = 'メールアドレスを入力してください'
    }
    else if (!emailRegex.test(value)) {
        emailError.value = '正しいメールアドレスを入力してください'
    }
    else {
        emailError.value = ''
    }
})

const isLoading = ref(false)

const sendResetPasswordMail = async () => {
    if (emailError.value || !email.value) {
        alert('入力内容を確認してください')
        return
    }
    isLoading.value = true

    try {
        console.log("sendPasswordReset", email.value)
        await authStore.sendPasswordReset(email.value)
        alert('パスワード再設定用のメールを送信しました')
    }
    catch (error) {
        alert('メールアドレスが正しくありません')
    }
    finally {
        isLoading.value = false
    }
}

const cancel = () => {
    email.value = ''
    emailError.value = ''
    navigateTo('/login')
}
</script>

<template>
    <div class="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <div class="text-slate-50 bg-gradient-to-tl from-slate-900 from- via-slate-700 via- to-slate-400 to- p-8 rounded-lg shadow-lg w-80 max-w-[calc(100vw-16px)] md:w-96 z-50">
            <p class="text-2xl font-bold mb-6 text-center">
                パスワード再設定
            </p>
            <form @submit.prevent="sendResetPasswordMail">
                <div class="mb-4">
                    <label
                        for="email"
                        class="block text-sm font-medium text-slate-200 mb-2"
                    >
                        メールアドレス
                    </label>
                    <input
                        id="email"
                        v-model="email"
                        type="email"
                        class="w-full px-4 py-2 border border-slate-600 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        placeholder="メールアドレスを入力してください"
                    >
                    <p
                        v-if="emailError"
                        class="text-red-500 mt-2"
                    >
                        {{ emailError }}
                    </p>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <button
                        type="button"
                        class="bg-gray-400 hover:bg-gray-600 text-white px-6 py-2 rounded-md transition-colors duration-200"
                        @click="cancel"
                    >
                        戻る
                    </button>
                    <button
                        type="submit"
                        class="bg-sky-500 hover:bg-sky-600 text-white px-6 py-2 rounded-md transition-colors duration-200"
                        :disabled="isLoading"
                    >
                        送信
                    </button>
                </div>
                <div
                    v-if="isLoading"
                    class="text-center text-slate-50 p-2 animate-pulse"
                >
                    Now Loading...
                </div>
            </form>
        </div>
    </div>
</template>