<script setup>
import { usePinStore } from '~/composables/stores/pin'
import { useAuthStore } from '~/composables/stores/auth'
import { usePrefStore } from '~/composables/stores/prefecture'

// ストア
const pinStore = usePinStore()
const authStore = useAuthStore()
const prefStore = usePrefStore()

const toast = useToast()

const isOpen = defineModel() // mapのv-model(isOpenPinAddDialog)とバインド

const props = defineProps({ // mapの:latlng(clickedLatLng)を受け取る
    latlng: {
        type: Object,
        required: false,
        default: null
    },
    address: {
        type: String,
        required: false,
        default: null
    },
    prefecture: {
        type: String,
        required: false,
        default: null
    }
})

const title = ref('')
const errorTitle = ref('')
const description = ref('')
const errorDesc = ref('')
const address = ref('')
const prefectureId = ref(null)
const isActiveAddBtn = computed(() => !errorTitle.value && !errorDesc.value && authStore.isLoggedIn)
const file = ref(null)
const previewUrl = ref(null)

const isAdding = ref(false)

const isImageModalOpen = ref(false)

const openImage = () => {
    isImageModalOpen.value = true
}

const isDragging = ref(false)

const handleFileChange = (event) => {
    const selectedFile = event.target.files[0]
    if (!selectedFile) return
    handleFiles(selectedFile)
    event.target.value = ''
}

const handleFileDrop = (event) => {
    isDragging.value = false

    const droppedFile = event.dataTransfer.files[0]
    if (!droppedFile) return

    handleFiles(droppedFile)
    event.target.value = ''
}

const handleFiles = (newFile) => {
    if (!newFile) return

    file.value = newFile
    previewUrl.value = URL.createObjectURL(file.value)
}

const removeImage = () => {
    file.value = null
    previewUrl.value = null
}

const addPin = async () => {
    if (!props.latlng) {
        toast.error({
            title: '位置情報の取得に失敗しました。時間をおいて再度お試しください'
        })
        return 
    }
    if (errorTitle.value || errorDesc.value || !title.value || !description.value || !address.value || !prefectureId.value) {
        toast.error({
            title: 'ピンの追加に失敗しました。',
            message: 'タイトル、詳細、住所、都道府県を入力してください'
        })
        return
    }
    
    isAdding.value = true

    const addPinInfo = {
        latitude: props.latlng.lat,
        longitude: props.latlng.lng,
        title: title.value,
        address: address.value,
        prefectureId: prefectureId.value,
        description: description.value,
        thumbnailImage: file.value
    }

    try {
        const token = await authStore.getIdToken()
        await pinStore.addPin(addPinInfo, token)
        toast.success({
            title: 'ピンの追加に成功しました'
        })
    }
    catch (err) {
        toast.error({
            title: 'ピンの追加に失敗しました。時間をおいて再度お試しください',
            message: err?.response?._data?.message
        })
    }
    finally {
        close()
    }
}

// const handleFileChange = (event) => {
//     const target = event.target
//     if (target.files && target.files[0]) {
//         file.value = target.files[0]
//         previewUrl.value = URL.createObjectURL(file.value)
//     }
// }

const close = () => {
    title.value = ''
    errorTitle.value = ''
    description.value = ''
    errorDesc.value = ''
    isOpen.value = false
    previewUrl.value = null
    // uploadedUrl.value = null
    isAdding.value = false
}

// バリデーションチェック
watch(title, (value) => {
    if (!value) {
        errorTitle.value = 'タイトルは必須です'
    }
    else if (value.length > 50) {
        errorTitle.value = '50文字以内で入力してください'
    }
    else {
        errorTitle.value = null
    }
})

watch(description, (value) => {
    if (!value) {
        errorDesc.value = '詳細を入力してください'
    }
    else if (value.length > 200) {
        errorDesc.value = '200文字以内で入力してください'
    }
    else {
        errorDesc.value = null
    }
})

// TODO address not nullのバリデーション作成

watch(isOpen, async (value) => {
    if (value) {
        try {
            await prefStore.setAllPrefs()
            address.value = props.address
            const tmpPrefId = prefStore.findPrefIdByName(props.prefecture) // props.prefectureからID検索
            prefectureId.value = tmpPrefId
        }
        catch (err) {
            toast.error({
                title: '都道府県情報の取得に失敗しました。時間をおいて再度お試しください',
                message: err?.response?._data?.message
            })
            return
        }
    }
})
</script>

<template>
    <div
        v-if="isOpen"
        class="fixed inset-0 top-16 flex items-center justify-center bg-black/50 z-50"
    >
        <div class="text-slate-50 bg-gradient-to-br from-slate-900 from- via-slate-700 via- to-slate-400 to- rounded-lg shadow-lg w-full max-w-md p-6 max-h-[80vh] overflow-y-auto">
            <h2 class="text-xl font-semibold mb-4">
                ピンを追加
            </h2>

            <div class="mb-4">
                <label class="blocktext-sm font-medium mb-1">タイトル</label>
                <p class="text-red-500">
                    {{ errorTitle }}
                </p>
                <input
                    v-model="title"
                    type="text"
                    class="text-slate-800 w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                    placeholder="タイトルを入力"
                    required
                >
            </div>

            <div class="mb-4">
                <label class="block text-sm font-medium mb-1">詳細</label>
                <p class="text-red-500">
                    {{ errorDesc }}
                </p>
                <textarea
                    v-model="description"
                    type="text"
                    class="text-slate-800 w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                    placeholder="説明を入力"
                    required
                />
            </div>

            <div
                v-if="props.address && props.prefecture"
                class="mb-4"
            >
                <select 
                    v-model="prefectureId" 
                    class="border rounded text-slate-800 focus:outline-none focus:ring focus:ring-blue-300 mb-2"
                >
                    <option
                        v-for="pref in prefStore.prefsById"
                        :key="pref.id"
                        :value="pref.id"
                    >
                        {{ pref.name }}
                    </option>
                </select>
                <input
                    v-model="address"
                    type="text"
                    class="w-full border rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring focus:ring-blue-300"
                    placeholder="住所"
                    required
                >
            </div>

            <div class="mb-4">
                <label class="block text-sm font-medium mb-2">
                    画像
                </label>

                <!-- アップロードエリア -->
                <label
                    class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition hover:bg-slate-100 border-slate-300"
                    @dragover.prevent
                    @dragenter.prevent="isDragging = true"
                    @dragleave.prevent="isDragging = false"
                    @drop.prevent="handleFileDrop"
                >
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        class="hidden"
                        @change="handleFileChange"
                    >

                    <div class="text-center text-slate-500">
                        <p class="text-sm">クリックして画像を選択</p>
                        <p class="text-xs">またはドラッグ＆ドロップ</p>
                    </div>
                </label>

                <!-- プレビュー -->
                <div
                    v-if="previewUrl"
                    class="relative group"
                >
                    <NuxtImg
                        :src="previewUrl"
                        class="w-full h-full object-cover rounded my-2"
                        @click="openImage"
                    />
                    <MapImagePreviewModal
                        v-model:is-open="isImageModalOpen"
                        :images="[previewUrl]"
                        :start-index="0"
                    />
                    <!-- 削除ボタン -->
                    <button
                        type="button"
                        class="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 text-xs items-center justify-center"
                        @click="removeImage"
                    >
                        ✕
                    </button>
                </div>
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
                    @click="addPin"
                >
                    {{ isAdding ? '追加中...' : '追加' }}
                </button>
            </div>
        </div>
    </div>
</template>
