<script setup>
import { useAuthStore } from '~/composables/stores/auth'
import { useReviewStore } from '~/composables/stores/review'
import StarRating from './StarRating.vue'

const authStore = useAuthStore()
const reviewStore = useReviewStore()
const toast = useToast()

const isOpen = defineModel()
const props = defineProps({
    pinId: {
        type: Number,
        default: null
    }
})

const darknessLevel = ref(3)
const accessLevel = ref(3)
const files = ref([])
const errorFile = ref('')
const previewUrls = ref([])
const error = ref('')
const title = ref(null)
const description = ref(null)
const errorTitle = ref(null)
const errorDesc = ref(null)
const visitedDate = ref(null)
const visitedTime = ref(null)
const isActiveReviewBtn = computed(() => 
    !errorFile.value
    && !errorTitle.value 
    && !errorDesc.value
    && season.value
    && visitedDate.value
    && visitedTime.value 
    && authStore.isLoggedIn
)
const isAdding = ref(false)

const MAX_IMAGES = 10

const season = ref(null)

const seasons = [
    { label: '春', value: 'spring' },
    { label: '夏', value: 'summer' },
    { label: '秋', value: 'autumn' },
    { label: '冬', value: 'winter' }
]

const isImageModalOpen = ref(false)
const startIndex = ref(0)

const openImage = (index) => {
    startIndex.value = index
    isImageModalOpen.value = true
}

const isDragging = ref(false)

const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files)
    if (!selectedFiles || selectedFiles.length === 0) return
    handleFiles(selectedFiles)
    event.target.value = ''
}

const handleFileDrop = (event) => {
    isDragging.value = false

    const droppedFiles = Array.from(event.dataTransfer.files)
    if (!droppedFiles.length) return

    handleFiles(droppedFiles)
    event.target.value = ''
}

const handleFiles = (newFiles) => {
    const remaining = MAX_IMAGES - files.value.length

    if (remaining <= 0) {
        errorFile.value = `画像は最大${MAX_IMAGES}枚までです`
        return
    }

    const filesToAdd = newFiles
        .filter(file => file.type.startsWith('image/'))
        .slice(0, remaining)

    files.value.push(...filesToAdd)
    previewUrls.value = files.value.map(file =>
        URL.createObjectURL(file)
    )

    errorFile.value
        = newFiles.length > remaining
            ? `画像は最大${MAX_IMAGES}枚までです`
            : ''
}

const removeImage = (index) => {
    files.value.splice(index, 1)
    previewUrls.value.splice(index, 1)
    errorFile.value = ''
}

/**
 * レビューを作成
 */
const createNewReview = async () => {
    if (errorFile.value || errorTitle.value || errorDesc.value) return
    if (!title.value || !description.value || !season.value || !visitedDate.value || !visitedTime.value) return // バリデーションエラーがあれば即レス
    isAdding.value = true

    // 作成するレビューの情報
    const addReviewInfo = {
        reviewedPinId: props.pinId,
        title: title.value,
        description: description.value,
        darknessLevel: darknessLevel.value,
        accessLevel: accessLevel.value,
        reviewImages: files.value,
        season: season.value,
        visitedDate: visitedDate.value,
        visitedTime: visitedTime.value
    }

    try {
        const token = await authStore.getIdToken()
        await reviewStore.addReview(addReviewInfo, token)
        toast.success({
            title: 'レビューの作成に成功しました'
        })
    }   
    catch (err) {
        toast.error({
            title: 'レビューの作成に失敗しました。',
            message: err?.response?._data?.message
        })
    }
    finally {
        close()
    }
}

const close = () => {
    darknessLevel.value = 3
    accessLevel.value = 3
    files.value = []
    errorFile.value = ''
    previewUrls.value = []
    error.value = ''
    title.value = null
    description.value = null
    errorTitle.value = null
    errorDesc.value = null
    season.value = null
    visitedDate.value = null
    visitedTime.value = null
    isOpen.value = false
    isAdding.value = false
}

watch(title, (value) => {
    if (!value) {
        errorTitle.value = 'タイトルは必須です'
    }
    else if (value.length >= 40) {
        errorTitle.value = '1~40文字で入力してください'
    }
    else {
        errorTitle.value = null
    }
})

watch(description, (value) => {
    if (!value) {
        errorDesc.value = '詳細を入力してください'
    }
    else if (value.length >= 2000) {
        errorDesc.value = '1~2000文字で入力してください'
    }
    else {
        errorDesc.value = null
    }
})
</script>

<template>
    <div>
        <div
            v-if="isOpen"
            class="fixed inset-0 top-16 flex items-center justify-center bg-black/50 z-50"
        >
            <div class="text-slate-50 bg-gradient-to-br from-slate-900 from- via-slate-700 via- to-slate-400 to- rounded-lg shadow-lg w-full max-w-md p-6 max-h-[80vh] overflow-y-auto">
                <h2 class="text-xl font-semibold mb-4">
                    レビュー作成
                </h2>

                <div class="mb-4 flex flex-col gap-2 justify-center">
                    <StarRating 
                        v-model="darknessLevel"
                        label="暗さ"
                    />
                    <StarRating 
                        v-model="accessLevel"
                        label="アクセス"
                    />
                </div>
                <div>
                    <label class="block text-sm font-medium mb-2">季節</label>

                    <div class="flex gap-2">
                        <label
                            v-for="item in seasons"
                            :key="item.value"
                            class="px-4 py-2 rounded border cursor-pointer transition text-sm select-none"
                            :class="season === item.value
                                ? 'bg-yellow-400 text-slate-50 border-yellow-400'
                                : 'bg-slate-50 text-slate-800 border-slate-300 hover:bg-slate-300'"
                        >
                            <input
                                v-model="season"
                                type="radio"
                                class="hidden"
                                :value="item.value"
                            >
                            {{ item.label }}
                        </label>
                    </div>
                </div>
                <div class="flex items-center my-4 gap-2">
                    <div>
                        <label class="block text-sm font-medium mb-1">訪問日</label>
                        <input
                            v-model="visitedDate"
                            type="date"
                            required
                            class="text-slate-800 w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                        >
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">訪問時間</label>
                        <input
                            v-model="visitedTime"
                            type="time"
                            required
                            class="text-slate-800 w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                        >
                    </div>
                </div>

                <div class="mb-4">
                    <label class="block text-sm font-medium mb-1">タイトル</label>
                    <input
                        v-model="title"
                        type="text"
                        class="text-slate-800 w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                        placeholder="タイトルを入力"
                    >
                    <p
                        v-if="errorTitle"
                        class="text-red-500"
                    >
                        {{ errorTitle }}
                    </p>
                </div>

                <div class="mb-4">
                    <label class="block text-sm font-medium mb-1">詳細</label>
                    <textarea
                        v-model="description"
                        type="text"
                        class="text-slate-800 w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                        placeholder="説明を入力"
                    />
                    <p
                        v-if="errorDesc"
                        class="text-red-500"
                    >
                        {{ errorDesc }}
                    </p>
                </div>

                <div class="mb-4">
                    <label class="block text-sm font-medium mb-2">
                        画像（最大10枚）
                    </label>

                    <!-- アップロードエリア -->
                    <label
                        class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition hover:bg-slate-100"
                        :class="errorFile ? 'border-red-500' : 'border-slate-300'"
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

                    <!-- エラー -->
                    <p
                        v-if="errorFile"
                        class="text-red-500 text-sm mt-1"
                    >
                        {{ errorFile }}
                    </p>

                    <!-- プレビュー -->
                    <div
                        v-if="previewUrls.length"
                        class="grid grid-cols-3 gap-3 mt-4"
                    >
                        <div
                            v-for="(url, index) in previewUrls"
                            :key="url"
                            class="relative group"
                        >
                            <NuxtImg
                                :src="url"
                                class="w-full h-24 object-cover rounded"
                                @click="openImage(index)"
                            />

                            <MapImagePreviewModal
                                v-model:isOpen="isImageModalOpen"
                                :images="previewUrls"
                                :start-index="startIndex"
                            />

                            <!-- 削除ボタン -->
                            <button
                                type="button"
                                class="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 text-xs items-center justify-center"
                                @click="removeImage(index)"
                            >
                                ✕
                            </button>
                        </div>
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
                        class="px-4 py-2 rounded disabled:bg-blue-200  bg-blue-500 text-white hover:bg-blue-600 transition"
                        :disabled="!isActiveReviewBtn"
                        @click="createNewReview"
                    >
                        {{ isAdding ? '追加中...' : '追加' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>