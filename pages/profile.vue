<script setup>
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useAuthStore } from '~/composables/stores/auth'

const { $storage } = useNuxtApp()
const authStore = useAuthStore()

const isLoggedIn = computed(() => authStore.isLoggedIn)
const loginUser = computed(() => authStore.loginUser)

const nickname = ref(loginUser.value?.nickname || '')
const comment = ref(loginUser.value?.comment || '')

const file = ref(null)
const previewUrl = ref(loginUser.value?.iconImagePath || null)
const error = ref(null)
const isSaving = ref(false)

const handleFileChange = (event) => {
    const target = event.target
    if (target.files && target.files[0]) {
        file.value = target.files[0]
        previewUrl.value = URL.createObjectURL(file.value)
    }
}

const updateProfile = async () => {
    if (!isLoggedIn.value) {
        error.value = 'ログインしてください'
        return
    }

    isSaving.value = true
    error.value = null
    let iconUrl = loginUser.value?.iconImagePath || null

    try {
        if (file.value) {
            const fileRef = storageRef($storage, `profileImage/${file.value.name}`)
            await uploadBytes(fileRef, file.value)
            iconUrl = await getDownloadURL(fileRef)
        }
        const token = await authStore.getIdToken()
        console.log(iconUrl)

        const payload = {
            nickname: nickname.value,
            comment: comment.value,
            icon_image_path: iconUrl
        }

        console.log(token)
        console.log(payload)
    }
    catch (err) {
        console.error(err)
    }
    finally {
        isSaving.value = false
    }
}
</script>

<template>
    <div class="max-w-md mx-auto mt-10 p-6 border rounded shadow">
        <p class="text-xl font-bold mb-4">
            プロフィール編集
        </p>

        <div>
            <!-- Nickname -->
            <label class="block mb-2 font-semibold">ニックネーム</label>
            <input
                v-model="nickname"
                type="text"
                class="w-full border rounded p-2 mb-4"
            >

            <!-- Comment -->
            <label class="block mb-2 font-semibold">コメント</label>
            <input
                v-model="comment"
                type="text"
                class="w-full border rounded p-2 mb-4"
            >

            <!-- Image -->
            <label class="block mb-2 font-semibold">アイコン画像</label>
            <input
                type="file"
                accept="image/*"
                class="mb-4 w-full border p-2 rounded"
                @change="handleFileChange"
            >

            <div
                v-if="previewUrl"
                class="mb-4"
            >
                <p class="font-semibold">
                    プレビュー:
                </p>
                <img
                    :src="previewUrl"
                    alt="Preview"
                    class="w-32 h-32 object-cover rounded-full"
                >
            </div>

            <!-- Error -->
            <p
                v-if="error"
                class="text-red-500 mb-2"
            >
                {{ error }}
            </p>

            <!-- Save Button -->
            <button
                :disabled="isSaving"
                class="w-full bg-emerald-500 text-white py-2 rounded"
                @click="updateProfile"
            >
                {{ isSaving ? '保存中...' : '変更を保存' }}
            </button>
        </div>
    </div>
</template>