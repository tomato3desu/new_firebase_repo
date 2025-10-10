<script setup>
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'

const { $storage } = useNuxtApp()

const file = ref(null)
const previewUrl = ref(null)
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

const uploadImage = async () => {
    if (!file.value) return
    isUploading.value = true
    error.value = false

    try {
        const fileRef = storageRef($storage, `profileImage/${file.value.name}`)
        await uploadBytes(fileRef, file.value)
        const url = await getDownloadURL(fileRef)
        uploadedUrl.value = url
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
            画像アップロード
        </h2>

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
                class="rounded-lg shadow w-full"
            >
        </div>

        <button
            :disabled="!file || isUploading"
            class="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded disabled:opacity-50"
            @click="uploadImage"
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