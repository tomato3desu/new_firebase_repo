<script setup>
import { useAuthStore } from '~/composables/stores/auth'

const authStore = useAuthStore()

const email = ref('')
const password = ref('')

const emailError = ref('')
const passwordError = ref('')

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

watch(password, (value) => {
    if (!value) {
        passwordError.value = 'パスワードを入力してください'
    }
    else if (value.length < 8 || value.length > 20) {
        passwordError.value = 'パスワードは8~20文字で入力してください'
    }
    else {
        passwordError.value = ''
    }
})

const login = async () => {
    if (emailError.value || passwordError.value || !email.value || !password.value) {
        alert('入力内容を確認してください')
        return
    }

    try {
        await authStore.login(email.value, password.value)
        console.log('ログイン成功', authStore.loginUser)
        await navigateTo('/')
    }
    catch (error) {
        console.log(error)
        alert(error)
    }
}

const cancel = () => {
    email.value = ''
    password.value = ''
    emailError.value = ''
    passwordError.value = ''

    navigateTo('/')
}
</script>

<template>
    <div class="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <div class="text-slate-50 bg-gradient-to-tl from-slate-900 from- via-slate-700 via- to-slate-400 to- p-8 rounded-lg shadow-lg w-80 max-w-[calc(100vw-16px)] md:w-96 z-50">
            <p class="text-2xl font-bold mb-6 text-center">
                ログイン
            </p>
            <form @submit.prevent="login">
                <div class="mb-4">
                    <label
                        for="email"
                        class="block text-sm font-medium"
                    >メールアドレス</label>
                    <input
                        id="email"
                        v-model="email"
                        placeholder="email"
                        required
                        class="text-slate-800 mt-1 w-full px-4 py-2 focus:outline-none focus:ring focus:ring-blue-300 rounded-md shadow-sm"
                    >
                    <p
                        v-if="emailError"
                        class="text-red-500"
                    >
                        {{ emailError }}
                    </p>
                </div>
                <div class="relative mb-6">
                    <label
                        for="password"
                        class="block text-sm font-medium"
                    >パスワード</label>
                    <input
                        id="password"
                        v-model="password"
                        placeholder="password"
                        type="password"
                        required
                        class="text-slate-800 mt-1 w-full px-4 py-2 focus:outline-none focus:ring focus:ring-blue-300 rounded-md shadow-sm"
                    >
                    <p
                        v-if="passwordError"
                        class="text-red-500"
                    >
                        {{ passwordError }}
                    </p>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <button
                        class="w-full bg-gray-400 py-2 px-4 rounded-md shadow hover:bg-gray-600"
                        @click="cancel"
                    >
                        キャンセル
                    </button>
                    <button
                        type="submit"
                        class="w-full bg-sky-500 py-2 px-4 rounded-md shadow hover:bg-sky-600"
                    >
                        ログイン
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>
