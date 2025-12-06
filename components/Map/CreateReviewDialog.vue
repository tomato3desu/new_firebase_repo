<script setup>
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useAuthStore } from '~/composables/stores/auth'
import { useReviewStore } from '~/composables/stores/review'

const authStore = useAuthStore()
const reviewStore = useReviewStore()
const { $storage } = useNuxtApp()

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
const uploadedUrls = ref([])
const error = ref('')
const title = ref(null)
const description = ref(null)
const errorTitle = ref(null)
const errorDesc = ref(null)
const season = ref(null)
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

const MAX_IMAGES = 10

/**
 * inputのファイル変更時にpreviewUrlsを変更
 * @param event 
 */
const handleFileChange = (event) => {
    const selectedFiles = event.target.files
    if (!selectedFiles || selectedFiles.length === 0) return

    const newFiles = Array.from(selectedFiles)

    if (files.value.length + newFiles.length > MAX_IMAGES) {
        errorFile.value = `画像は最大${MAX_IMAGES}枚までです`
    }

    files.value = [...files.value, ...newFiles]
    previewUrls.value = files.value.map(file => URL.createObjectURL(file))
}

/**
 * レビューを作成
 */
const createNewReview = async () => {
    if (errorFile.value || errorTitle.value || errorDesc.value) return
    if (!title.value || !description.value || !season.value || !visitedDate.value || !visitedTime.value) return // バリデーションエラーがあれば即レス

    await addToStorage() // storageに追加

    // 作成するレビューの情報
    const addReviewInfo = {
        reviewedPinId: props.pinId,
        title: title.value,
        description: description.value,
        darknessLevel: darknessLevel.value,
        accessLevel: accessLevel.value,
        reviewImagePaths: uploadedUrls.value,
        season: season.value,
        visitedDate: visitedDate.value,
        visitedTime: visitedTime.value
    }

    const token = await authStore.getIdToken()
    const addedReview = await reviewStore.addReview(addReviewInfo, token)
    console.log(addedReview)
    close()
}

const addToStorage = async () => {
    if (!files.value || files.value.length === 0) return

    try {
        for (const file of files.value) {
            const uuid = crypto.randomUUID()
            const fileRef = storageRef($storage, `reviewImage/${uuid}.jpg`)

            await uploadBytes(fileRef, file)
            const url = await getDownloadURL(fileRef)
            uploadedUrls.value.push(url)
        }
    }
    catch (err) {
        error.value = err.message
    }
}

const close = () => {
    darknessLevel.value = 3
    accessLevel.value = 3
    files.value = []
    errorFile.value = ''
    previewUrls.value = []
    uploadedUrls.value = []
    error.value = ''
    title.value = null
    description.value = null
    errorTitle.value = null
    errorDesc.value = null
    season.value = null
    visitedDate.value = null
    visitedTime.value = null
    isOpen.value = false
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
            class="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
        >
            <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6 max-h-[80vh] overflow-y-auto">
                <h2 class="text-xl font-semibold mb-4">
                    レビュー作成
                </h2>

                <div class="mb-4 flex items-center justify-center">
                    <!-- TODO 星でレビューの評価を選択できる -->
                    <div>
                        <label class="block text-gray-700 text-sm font-medium mb-1">暗さ</label>
                        <select v-model="darknessLevel">
                            <option :value="1">
                                1
                            </option>
                            <option :value="2">
                                2
                            </option>
                            <option
                                :value="3"
                                selected
                            >
                                3
                            </option>
                            <option :value="4">
                                4
                            </option>
                            <option :value="5">
                                5
                            </option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-gray-700 text-sm font-medium mb-1">アクセス</label>
                        <select v-model="accessLevel">
                            <option :value="1">
                                1
                            </option>
                            <option :value="2">
                                2
                            </option>
                            <option
                                :value="3"
                                selected
                            >
                                3
                            </option>
                            <option :value="4">
                                4
                            </option>
                            <option :value="5">
                                5
                            </option>
                        </select>
                    </div>
                </div>
                <div>
                    <label class="block text-gray-700 text-sm font-medium mb-1">季節</label>
                    <select
                        v-model="season"
                        required
                    >
                        <option value="spring">
                            春
                        </option>
                        <option value="summer">
                            夏
                        </option>
                        <option value="autumn">
                            秋
                        </option>
                        <option value="winter">
                            冬
                        </option>
                    </select>
                </div>
                <div class="flex items-center mb-4">
                    <div>
                        <label class="block text-gray-700 text-sm font-medium mb-1">訪問日</label>
                        <input
                            v-model="visitedDate"
                            type="date"
                            required
                            class="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                        >
                    </div>
                    <div>
                        <label class="block text-gray-700 text-sm font-medium mb-1">訪問時間</label>
                        <input
                            v-model="visitedTime"
                            type="time"
                            required
                            class="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                        >
                    </div>
                </div>

                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-medium mb-1">タイトル</label>
                    <input
                        v-model="title"
                        type="text"
                        class="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                        placeholder="タイトルを入力"
                    >
                    <p
                        v-if="errorTitle"
                        class="text-red-400"
                    >
                        {{ errorTitle }}
                    </p>
                </div>

                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-medium mb-1">詳細</label>
                    <textarea
                        v-model="description"
                        type="text"
                        class="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                        placeholder="説明を入力"
                    />
                    <p
                        v-if="errorDesc"
                        class="text-red-400"
                    >
                        {{ errorDesc }}
                    </p>
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
                    <p
                        v-if="errorFile"
                        class="text-red-400"
                    >
                        {{ errorFile }}
                    </p>
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
                        class="px-4 py-2 rounded disabled:bg-blue-200  bg-blue-500 text-white hover:bg-blue-600 transition"
                        :disabled="!isActiveReviewBtn"
                        @click="createNewReview"
                    >
                        追加
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>