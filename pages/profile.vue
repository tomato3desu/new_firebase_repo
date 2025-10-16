<script setup>
import { useAuthStore } from '~/composables/stores/auth'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'

const authStore = useAuthStore()
const { $storage } = useNuxtApp()

const currentProfile = computed(() => authStore.loginUser || {
    nickname: '',
    comment: '',
    iconImagePath: ''
})

const nickname = ref('')
const comment = ref('')

const file = ref(null)
const previewUrl = ref(null)
const cropper = ref(null)
const isUploading = ref(null)
const uploadedUrl = ref(null)
const error = ref(null)

const handleFileChange = (event) => {
    const target = event.target
    if (target.files && target.files[0]) {
        file.value = target.files[0]
        previewUrl.value = URL.createObjectURL(file.value)
    }
}

const sendToBackend = async (profileData) => {
    const token = await authStore.getIdToken()
    try {
        const res = await $fetch('http://localhost:8080/api/auth/updateProfile', {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: profileData
        })

        authStore.loginUser = res
    }
    catch (err) {
        console.error('エラー', err)
    }
}

const updateProfile = async () => {
    isUploading.value = true
    error.value = false

    try {
        if (cropper.value) {
            // Cropperからcanvasを取得
            const { canvas } = cropper.value.getResult()
            if (!canvas) {
                throw new Error('画像の切り抜きに失敗しました')
            }

            canvas.toBlob(async (blob) => {
                if (!blob) {
                    throw new Error('blobの作成に失敗しました')
                }

                const fileName = `${Date.now()}-cropped.jpg`
                const fileRef = storageRef($storage, `profileImage/${fileName}`)

                await uploadBytes(fileRef, blob)
                const url = await getDownloadURL(fileRef)
                uploadedUrl.value = url

                await sendToBackend({
                    nickname: nickname.value,
                    comment: comment.value,
                    iconImagePath: uploadedUrl.value
                })

                nickname.value = ''
                comment.value = ''
                previewUrl.value = null
            }, 'image/jpg')
        }
        else {
            await sendToBackend({
                nickname: nickname.value,
                comment: comment.value,
                iconImagePath: uploadedUrl.value
            })

            nickname.value = ''
            comment.value = ''
        }
    }
    catch (err) {
        error.value = err.message
    }
    finally {
        isUploading.value = false
    }
}
</script>

<template>
    <div class="max-w-md mx-auto mt-10 p-6 border rounded-2xl shadow">
        <h2 class="text-2xl font-bold mb-4 text-center">
            プロフィール
        </h2>
        <p
            v-if="currentProfile.nickname"
            class="text-gray-500"
        >
            ニックネーム：{{ currentProfile.nickname }}
        </p>
        <input
            v-model="nickname"
            type="text"
            placeholder="ニックネーム編集"
            class="mb-4 w-full border p-2 rounded"
        >
        <p
            v-if="currentProfile.comment"
            class="text-gray-500"
        >
            コメント：{{ currentProfile.comment }}
        </p>
        <textarea
            v-model="comment"
            placeholder="コメント編集"
            class="mb-4 w-full border p-2 rounded"
        />
        <img
            v-if="currentProfile?.iconImagePath"
            :src="currentProfile.iconImagePath"
            alt="プロフィール画像"
            class="w-32 h-32 object-cover rounded-none mb-4"
        >
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
            <Cropper
                ref="cropper"
                :src="previewUrl"
                :stencil-props="{
                    aspectRatio: 1,
                    movable: true,
                    resizable: true,
                }"
                class="rounded-lg shadow w-full z-0"
            />
        </div>
        <button
            :disabled="isUploading"
            class="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded disabled:opacity-50"
            @click="updateProfile"
        >
            {{ isUploading ? "アップロード中..." : "アップロード" }}
        </button>
        <p
            v-if="error"
            class="text-red-500 mt-3"
        >
            {{ error }}
        </p>
        <div
            v-if="uploadedUrl"
            class="mt-6"
        >
            <p class="font-semibold">
                アップロード完了！
            </p>
            <a
                :href="uploadedUrl"
                target="_blank"
                class="text-blue-600 underline break-all"
            >
                {{ uploadedUrl }}
            </a>
        </div>
    </div>
</template>