<script setup>
import { usePinStore } from '~/composables/stores/pin'
import { useAuthStore } from '~/composables/stores/auth'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'

// ストア
const pinStore = usePinStore()
const authStore = useAuthStore()

const { $storage } = useNuxtApp()

const isOpen = defineModel() // mapのv-model(isOpenPinAddDialog)とバインド

const props = defineProps({ // mapの:latlng(clickedLatLng)を受け取る
    latlng: {
        type: Object,
        required: false,
        default: null
    }
})

const emit = defineEmits(['pin-added'])

const title = ref(null)
const description = ref(null)
const files = ref([])
const previewUrls = ref([])
const uploadedUrls = ref([])
const error = ref(null)

const addPin = async () => {
    if (!props.latlng) return

    await addToStorage()

    const addPinInfo = {
        latitude: props.latlng.lat,
        longitude: props.latlng.lng,
        title: title.value,
        description: description.value,
        pinImages: uploadedUrls.value
    }

    const token = await authStore.getIdToken()
    const addedPin = await pinStore.addPin(addPinInfo, token)
    console.log(addedPin)
    emit('pin-added', addedPin)
    close()
}

const handleFileChange = (event) => {
    const selectedFiles = event.target.files
    if (!selectedFiles || selectedFiles.length === 0) return

    files.value = Array.from(selectedFiles)

    previewUrls.value = files.value.map(file => URL.createObjectURL(file))
}

const addToStorage = async () => {
    if (!files.value || files.value.length === 0) return
        
    try {
        for (const file of files.value) {
            const fileRef = storageRef($storage, `pinImage/${file.name}`)

            await uploadBytes(fileRef, file)
            const url = await getDownloadURL(fileRef)
            uploadedUrls.value.push(url)
            console.log(uploadedUrls.value)
        }
    }
    catch (err) {
        uploadedUrls.value = null
        error.value = err.message
    }
}

const close = () => {
    title.value = null
    description.value = null
    isOpen.value = false
    files.value = []
    previewUrls.value = []
    uploadedUrls.value = []
}
</script>

<template>
    <div
        v-if="isOpen"
        class="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
    >
        <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6 max-h-[80vh] overflow-y-auto">
            <h2 class="text-xl font-semibold mb-4">
                ピンを追加
            </h2>

            <div class="mb-4">
                <label class="block text-gray-700 text-sm font-medium mb-1">タイトル</label>
                <input
                    v-model="title"
                    type="text"
                    class="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                    placeholder="タイトルを入力"
                >
            </div>

            <div class="mb-4">
                <label class="block text-gray-700 text-sm font-medium mb-1">詳細</label>
                <input
                    v-model="description"
                    type="text"
                    class="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                    placeholder="説明を入力"
                >
            </div>

            <div class="mb-4">
                <label class="block text-gray-700 text-sm font-medium mb-1">画像</label>
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    class="mb-4 w-full border p-2 rounded"
                    @change="handleFileChange"
                >
                <NuxtImg
                    v-for="previewUrl in previewUrls"
                    :key="previewUrl"
                    :src="previewUrl"
                    class="mb-4"
                />
            </div>

            <div class="flex justify-end space-x-3">
                <button
                    class="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 transition"
                    @click="close"
                >
                    キャンセル
                </button>
                <button
                    class="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition"
                    @click="addPin"
                >
                    追加
                </button>
            </div>
        </div>
    </div>
</template>
