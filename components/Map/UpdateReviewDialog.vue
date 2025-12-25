<script setup>
import { useAuthStore } from '~/composables/stores/auth'
import { useReviewStore } from '~/composables/stores/review'

const isOpen = defineModel()
const props = defineProps({
    reviewId: {
        type: Number,
        required: true
    }
})

const authStore = useAuthStore()
const reviewStore = useReviewStore()
const toast = useToast()

const config = useRuntimeConfig()

const review = computed(() => reviewStore.reviewsById[props.reviewId])

const darknessLevel = ref(review.value.review.darknessLevel)
const accessLevel = ref(review.value.review.accessLevel)
const season = ref(review.value.review.season)
const visitedDate = ref(review.value.review.visitedDate)
const visitedTime = ref(review.value.review.visitedTime)
const existReviewImages = ref(review.value.review.reviewImages)
const deleteReviewImageIds = ref([])
const files = ref([])
const previewUrls = ref([])
const uploadedUrls = ref([])
const error = ref('')
const title = ref('')
const description = ref('')
const errorTitle = ref(null)
const errorDesc = ref(null)
const isActiveReviewBtn = computed(() => !errorTitle.value && !errorDesc.value && authStore.isLoggedIn)
const isUpdating = ref(false)

const MAX_IMAGES = 10
const errorFile = ref(null)

/**
 * inputのファイル変更時にpreviewUrlsを変更
 * @param event 
 */
// const handleFileChange = (event) => {
//     const selectedFiles = event.target.files
//     if (!selectedFiles || selectedFiles.length === 0) return

//     files.value = Array.from(selectedFiles) // fileList => arrayに変換して格納

//     previewUrls.value = files.value.map(file => URL.createObjectURL(file))
// }

const handleFileChange = (event) => {
    const selectedFiles = event.target.files
    if (!selectedFiles || selectedFiles.length === 0) return

    const newFiles = Array.from(selectedFiles)

    if (files.value.length + newFiles.length + existReviewImages.value.length > MAX_IMAGES) {
        errorFile.value = `画像は最大${MAX_IMAGES}枚までです`
    }

    files.value = [...files.value, ...newFiles]
    previewUrls.value = files.value.map(file => URL.createObjectURL(file))
}

/**
 * レビューを更新
 */
const updateReview = async () => {
    if (errorTitle.value || errorDesc.value || errorFile.value) {
        toast.error({
            title: 'レビューの更新に失敗しました。',
            message: 'タイトル、詳細、画像を入力してください'
        })
        return
    } // バリデーションエラーがあれば即レス

    isUpdating.value = true

    // バックエンドに送信するreview情報
    const reviewInfo = {
        reviewId: review.value.review.id,
        title: title.value,
        description: description.value,
        darknessLevel: darknessLevel.value,
        accessLevel: accessLevel.value,
        season: season.value,
        visitedDate: visitedDate.value,
        visitedTime: visitedTime.value,
        reviewImages: files.value,
        deleteReviewImageIds: deleteReviewImageIds.value
    }

    try { 
        const token = await authStore.getIdToken()
        await reviewStore.updateReview(reviewInfo, token)

        toast.success({
            title: 'レビューの更新に成功しました'
        })
    }
    catch (error) {
        toast.error({
            title: 'レビューの更新に失敗しました。時間をおいて再度お試しください',
            message: error?.response?._data?.message
        })
    }
    finally {
        close()
    }
}

/**
 * ×ボタンをクリックしたときにクリックされた画像をdeleteReviewImageIdsにpush
 * @param selectedReviewImage 
 */
const deleteReviewImage = (selectedReviewImage) => {
    existReviewImages.value = existReviewImages.value.filter(reviewImage => reviewImage !== selectedReviewImage)
    deleteReviewImageIds.value.push(selectedReviewImage.id)
}

/**
 * レビューを削除
 */
const deleteReview = async () => {
    const isConfirm = window.confirm("本当に削除しますか？")
    if (isConfirm) {
        try {
            const reviewId = review.value.review.id
            const token = await authStore.getIdToken()
            await reviewStore.deleteReview(reviewId, token)
            toast.success({
                title: 'レビューの削除に成功しました'
            })
        }   
        catch (error) {
            toast.error({
                title: 'レビューの削除に失敗しました。時間をおいて再度お試しください',
                message: error?.response?._data?.message
            })
        }

        close()
    }
}

/**
 * 閉じる
 */
const close = () => {
    darknessLevel.value = review.value?.review.darknessLevel || ''
    accessLevel.value = review.value?.review.accessLevel || ''
    files.value = []
    previewUrls.value = []
    uploadedUrls.value = []
    error.value = ''
    title.value = ''
    description.value = ''
    errorTitle.value = null
    errorDesc.value = null
    season.value = review.value?.review.season || ''
    visitedDate.value = review.value?.review.visitedDate || ''
    visitedTime.value = review.value?.review.visitedTime || ''
    existReviewImages.value = review.value?.review.reviewImages || []
    deleteReviewImageIds.value = []
    isOpen.value = false
    isUpdating.value = false
    errorFile.value = null
}

// titleのバリデーションチェック
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

// descriptionのバリデーションチェック
watch(description, (value) => {
    if (!value) {
        errorDesc.value = '詳細を入力してください'
    }
    else if (value.length >= 3000) {
        errorDesc.value = '3000文字以内で入力してください'
    }
    else {
        errorDesc.value = null
    }
})

watch(() => files.value.length + existReviewImages.value.length, (value) => {
    if (value > MAX_IMAGES) {
        errorFile.value = `画像は最大${MAX_IMAGES}枚までです`
    }
    else {
        errorFile.value = null
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
                    レビュー編集
                </h2>

                <div class="mb-4 flex items-center justify-center">
                    <!-- TODO 星でレビューの評価を選択できる -->
                    <div>
                        <label class="block text-sm font-medium mb-1">暗さ</label>
                        <select 
                            v-model="darknessLevel"
                            class="text-slate-800 border rounded p-1 focus:outline-none focus:ring focus:ring-blue-300"
                        >
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
                        <label class="block text-sm font-medium mb-1">アクセス</label>
                        <select 
                            v-model="accessLevel"
                            class="text-slate-800 border rounded p-1 focus:outline-none focus:ring focus:ring-blue-300"
                        >
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
                    <label class="block text-sm font-medium mb-1">季節</label>
                    <select
                        v-model="season"
                        required
                        class="text-slate-800 border rounded p-1 focus:outline-none focus:ring focus:ring-blue-300"
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
                    <p>
                        {{ review.review.title }}
                    </p>
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
                    <p class="break-words">
                        {{ review.review.description }}
                    </p>
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

                <p class="text-sm text-slate-50 my-2">
                    既存画像
                </p>
                <div 
                    v-for="existReveiewImage in existReviewImages" 
                    :key="existReveiewImage.id"
                    class="mb-4 flex items-center justify-between"
                >
                    <NuxtImg
                        :src="`${config.public.r2PublicUrl}/${existReveiewImage.imagePath}`"
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
                    <label class="block text-sm font-medium mb-1">画像</label>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        class="mb-4 w-full border p-2 rounded"
                        @change="handleFileChange"
                    >
                    <p class="text-sm text-slate-50 my-2">
                        新規画像
                    </p>
                    <NuxtImg
                        v-for="previewUrl in previewUrls"
                        :key="previewUrl"
                        :src="previewUrl"
                        class="mb-4"
                    />
                </div>

                <div class="mb-4 text-red-500 text-lg">
                    {{ errorFile }}
                </div>

                <div class="flex justify-end space-x-3">
                    <button
                        class="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 transition"
                        @click="close"
                    >
                        キャンセル
                    </button>
                    <button
                        class="px-4 py-2 rounded bg-red-500 hover:bg-red-600 transition"
                        @click="deleteReview"
                    >
                        削除
                    </button>
                    <button
                        class="px-4 py-2 rounded disabled:bg-blue-200  bg-blue-500 hover:bg-blue-600 transition"
                        :disabled="!isActiveReviewBtn"
                        @click="updateReview"
                    >
                        {{ isUpdating ? '更新中...' : '更新' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>