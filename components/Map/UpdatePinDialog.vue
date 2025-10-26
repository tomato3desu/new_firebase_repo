<script setup>
import { usePinStore } from '~/composables/stores/pin'
import { useAuthStore } from '~/composables/stores/auth'
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'

const pinStore = usePinStore()
const authStore = useAuthStore()
const { $storage } = useNuxtApp()

const isOpen = defineModel()
const props = defineProps({
    pin: {
        type: Object,
        required: false,
        default: null
    }
})
const emit = defineEmits(['pin-updated'])

const title = ref('')
const errorTitle = ref('')
const description = ref('')
const errorDesc = ref('')
const isActiveAddBtn = computed(() => !errorTitle.value && !errorDesc.value && authStore.isLoggedIn)
const file = ref(null)
const previewUrl = ref(null)
const uploadedUrl = ref(null)
const error = ref(null)

const updatePin = async () => {
    if (errorTitle.value || errorDesc.value) return

    if (file.value) await addToStorage()

    const updatePinInfo = {
        id: props.pin.id,
        title: title.value,
        description: description.value,
        thumbnailImagePath: uploadedUrl.value
    }

    try {
        const token = await authStore.getIdToken()
        const updatedPin = await pinStore.updatePin(updatePinInfo, token)
        console.log('更新完了', updatedPin)
        // TODO 元の画像を削除
        if (uploadedUrl.value) await deleteImage()
        emit('pin-updated', updatedPin)
        close()
    }
    catch (error) {
        console.error('更新失敗', error)
    }
}

const handleFileChange = (event) => {
    const target = event.target
    if (target.files && target.files[0]) {
        file.value = target.files[0]
        previewUrl.value = URL.createObjectURL(file.value)
    }
}

const addToStorage = async () => {
    if (!file.value) return
        
    try {
        const fileName = `${Date.now()}-pinStore.jpg`
        const fileRef = storageRef($storage, `pinImage/${fileName}`)

        await uploadBytes(fileRef, file.value)
        const url = await getDownloadURL(fileRef)
        uploadedUrl.value = url
        console.log(uploadedUrl.value)
    }
    catch (err) {
        uploadedUrl.value = null
        error.value = err.message
    }
}

const deleteImage = async () => {
    try {
        const path = extractPathFromUrl(props.pin.thumbnailImagePath)
        const oldRef = storageRef($storage, path)
        await deleteObject(oldRef)
        console.log('古い画像の削除に成功しました', oldRef)
    }
    catch (error) {
        console.log('古い画像の削除に失敗しました', error)
    }
}

// URLからパスをデコード
const extractPathFromUrl = (url) => {
    const decoded = decodeURIComponent(url)
    const matches = decoded.match(/\/o\/(.+)\?/)
    return matches ? matches[1] : null
}

const close = () => {
    isOpen.value = false
    title.value = ''
    errorTitle.value = ''
    description.value = ''
    errorDesc.value = ''
    file.value = null
    previewUrl.value = null
    uploadedUrl.value = null
    error.value = null
}

watch(title, (value) => {
    if (value.length > 20) {
        errorTitle.value = '20文字以内で入力してください'
    }
    else {
        errorTitle.value = null
    }
})

watch(description, (value) => {
    if (value.length > 200) {
        errorDesc.value = '200文字以内で入力してください'
    }
    else {
        errorDesc.value = null
    }
})
</script>

<template>
    <div
        v-if="isOpen"
        class="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
    >
        <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6 max-h-[80vh] overflow-y-auto">
            <h2 class="text-xl font-semibold mb-4">
                ピンを編集
            </h2>

            <div class="mb-4">
                <p class="text-gray-500">
                    {{ props.pin.title }}
                </p>
                <label class="block text-gray-700 text-sm font-medium mb-1">タイトル</label>
                <p
                    v-if="errorTitle"
                    class="text-red-600"
                >
                    {{ errorTitle }}
                </p>
                <input
                    v-model="title"
                    type="text"
                    class="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                    placeholder="タイトルを入力"
                >
            </div>

            <div class="mb-4">
                <p class="text-gray-500">
                    {{ props.pin.description }}
                </p>
                <label class="block text-gray-700 text-sm font-medium mb-1">詳細</label>
                <p
                    v-if="errorDesc"
                    class="text-red-600"
                >
                    {{ errorDesc }}
                </p>
                <textarea
                    v-model="description"
                    type="text"
                    class="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                    placeholder="説明を入力"
                />
            </div>

            <div class="mb-4">
                <NuxtImg
                    v-if="props.pin?.thumbnailImagePath"
                    :src="props.pin.thumbnailImagePath"
                    class="mb-4"
                />
                <label class="block text-gray-700 text-sm font-medium mb-1">画像</label>
                <input
                    type="file"
                    accept="image/*"
                    class="mb-4 w-full border p-2 rounded"
                    @change="handleFileChange"
                >
                <NuxtImg
                    v-if="previewUrl"
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
                    class="px-4 py-2 rounded disabled:bg-blue-200 bg-blue-500 text-white hover:bg-blue-600 transition"
                    :disabled="!isActiveAddBtn"
                    @click="updatePin"
                >
                    更新
                </button>
            </div>
        </div>
    </div>
</template>