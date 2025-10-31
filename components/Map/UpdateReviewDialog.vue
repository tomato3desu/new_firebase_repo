<script setup>
import { useAuthStore } from '~/composables/stores/auth'
import { usePinStore } from '~/composables/stores/pin'
import { useReviewStore } from '~/composables/stores/review'

const isOpen = defineModel()
const props = defineProps({
    review: {
        type: Object,
        required: false,
        default: null
    }
})

const authStore = useAuthStore()
const pinStore = usePinStore()
const reviewStore = useReviewStore()

const darknessLevel = ref(props.review.darknessLevel)
const accessLevel = ref(props.review.accessLevel)
const season = ref(props.review.season)
const visitedDate = ref(props.review.visitedDate)
const visitedTime = ref(props.review.visitedTime)
const existReviewImages = ref(props.review.reviewImages)
const deletingReviewImages = ref([])
const deletingReviewImageIds = ref([])
const files = ref([])
const previewUrls = ref([])
const uploadedUrls = ref([])
const error = ref('')
const title = ref(null)
const description = ref(null)
const errorTitle = ref(null)
const errorDesc = ref(null)
const isActiveReviewBtn = computed(() => !errorTitle.value && !errorDesc.value && authStore.isLoggedIn)

const handleFileChange = (event) => {
    const selectedFiles = event.target.files
    if (!selectedFiles || selectedFiles.length === 0) return

    files.value = Array.from(selectedFiles) // fileList => arrayに変換して格納

    previewUrls.value = files.value.map(file => URL.createObjectURL(file))
}

const updateReview = async () => {
    if (errorTitle.value || errorDesc.value) return

    await addToStorage()

    const reviewInfo = {
        reviewId: props.review.id,
        title: title.value,
        description: description.value,
        darknessLevel: darknessLevel.value,
        accessLevel: accessLevel.value,
        season: season.value,
        visitedDate: visitedDate.value,
        visitedTime: visitedTime.value,
        reviewImagePaths: uploadedUrls.value,
        deleteReviewImages: deletingReviewImageIds.value
    }
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
        console.error("画像の保存に失敗しました", err.message)
        error.value = err.message
    }
}

const deleteFromStorage = async () => {
    // TODO ストレージから画像を削除
}

// ×ボタンクリックで画面から画像を削除
const deleteReviewImage = (selectedReviewImage) => {
    existReviewImages.value = existReviewImages.value.filter(reviewImage => reviewImage !== selectedReviewImage)
    deletingReviewImages.value.push(selectedReviewImage)
    deletingReviewImageIds.value.push(selectedReviewImage.id)
    console.log(existReviewImages.value)
    console.log(deletingReviewImages.value)
}

const close = () => {
    darknessLevel.value = ''
    accessLevel.value = ''
    files.value = []
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
    existReviewImages.value = []
    deletingReviewImages.value = []
    deletingReviewImageIds.value = []
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
    else if (value.length >= 3000) {
        errorDesc.value = '1~3000文字で入力してください'
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
                    レビュー編集
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
                    <p class="text-gray-500">
                        {{ props.review.title }}
                    </p>
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
                    <p>{{ props.review.description }}</p>
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

                <div 
                    v-for="existReveiewImage in existReviewImages" 
                    :key="existReveiewImage.id"
                    class="mb-4 flex items-center justify-between"
                >
                    <NuxtImg
                        :src="existReveiewImage.imagePath"
                        class="mb-4"
                    />
                    <button 
                        class="text-4xl text-red-500"
                        @click="deleteReviewImage(existReveiewImage)"
                    >
                        ×
                    </button>
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
                        class="px-4 py-2 rounded disabled:bg-blue-200  bg-blue-500 text-white hover:bg-blue-600 transition"
                        :disabled="!isActiveReviewBtn"
                        @click="updateReview"
                    >
                        追加
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>