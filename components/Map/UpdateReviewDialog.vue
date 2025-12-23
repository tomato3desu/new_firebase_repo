<script setup>
import { useAuthStore } from '~/composables/stores/auth'
import { useReviewStore } from '~/composables/stores/review'
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'

const isOpen = defineModel()
const props = defineProps({
    reviewId: {
        type: Number,
        required: true
    }
})

const authStore = useAuthStore()
const reviewStore = useReviewStore()
const { $storage } = useNuxtApp()
const toast = useToast()

const review = computed(() => reviewStore.reviewsById[props.reviewId])

const darknessLevel = ref(review.value.review.darknessLevel)
const accessLevel = ref(review.value.review.accessLevel)
const season = ref(review.value.review.season)
const visitedDate = ref(review.value.review.visitedDate)
const visitedTime = ref(review.value.review.visitedTime)
const existReviewImages = ref(review.value.review.reviewImages)
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
const isUpdating = ref(false)

/**
 * inputのファイル変更時にpreviewUrlsを変更
 * @param event 
 */
const handleFileChange = (event) => {
    const selectedFiles = event.target.files
    if (!selectedFiles || selectedFiles.length === 0) return

    files.value = Array.from(selectedFiles) // fileList => arrayに変換して格納

    previewUrls.value = files.value.map(file => URL.createObjectURL(file))
}

/**
 * レビューを更新
 */
const updateReview = async () => {
    if (errorTitle.value || errorDesc.value) {
        toast.error({
            title: 'レビューの更新に失敗しました。',
            message: 'タイトル、詳細を入力してください'
        })
        return
    } // バリデーションエラーがあれば即レス

    isUpdating.value = true

    try {
        await addToStorage()
    }
    catch (error) {
        toast.error({
            title: 'レビューの更新に失敗しました。時間をおいて再度お試しください',
            message: error.message
        })
        close()
        return
    }

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
        reviewImagePaths: uploadedUrls.value,
        deleteReviewImages: deletingReviewImageIds.value
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

    // 削除画像があれば削除
    if (deletingReviewImages.value && deletingReviewImageIds.value) {
        try {
            for (const deleteImage of deletingReviewImages.value) {
                const imagePath = deleteImage.imagePath
                const path = extractPathFromUrl(imagePath)
                await deleteFromStorage(path)
            }
        }
        catch (error) {
            console.warn("古い画像の削除に失敗", error)
        }

        reviewStore.reviewsById[props.reviewId].review.reviewImages = reviewStore.reviewsById[props.reviewId].review.reviewImages.filter((reviewImage) => !deletingReviewImageIds.value.includes(reviewImage.id))
    }

    isUpdating.value = false
    close()
}

/**
 * レビューを削除
 */
const deleteReview = async () => {
    const isConfirm = window.confirm("本当に削除しますか？")
    if (isConfirm) {
        let deletedReview
        try {
            const reviewId = review.value.review.id
            const token = await authStore.getIdToken()
            deletedReview = await reviewStore.deleteReview(reviewId, token)
        }   
        catch (error) {
            toast.error({
                title: 'レビューの削除に失敗しました。時間をおいて再度お試しください',
                message: error?.response?._data?.message
            })
            return
        }

        // 画像を削除
        try {
            for (const reviewImage of deletedReview.review.reviewImages) {
                const reviewImagePath = extractPathFromUrl(reviewImage.imagePath)
                deleteFromStorage(reviewImagePath)
            }
        }
        catch (error) {
            console.warn("古い画像の削除に失敗", error)
        }

        close()
    }
}

/**
 * storageに追加
 */
const addToStorage = async () => {
    if (!files.value || files.value.length === 0) return

    for (const file of files.value) {
        const uuid = crypto.randomUUID()
        const fileRef = storageRef($storage, `reviewImage/${uuid}.jpg`)

        await uploadBytes(fileRef, file)
        const url = await getDownloadURL(fileRef)
        uploadedUrls.value.push(url)
    }
}

/**
 * 
 * @param path ストレージから削除
 */
const deleteFromStorage = async (path) => {
    const oldRef = storageRef($storage, path)
    await deleteObject(oldRef)
}

/**
 * 画面から画像を削除しdeletingReviewImages&deletingreviewImageIdsにpush
 * @param selectedReviewImage 
 */
const deleteReviewImage = (selectedReviewImage) => {
    existReviewImages.value = existReviewImages.value.filter(reviewImage => reviewImage !== selectedReviewImage)
    deletingReviewImages.value.push(selectedReviewImage)
    deletingReviewImageIds.value.push(selectedReviewImage.id)
}

/**
 * url解析
 * @param url 
 */
const extractPathFromUrl = (url) => {
    try {
        const decoded = decodeURIComponent(url)
        const start = decoded.indexOf('/o/') + 3
        const end = decoded.indexOf('?')
        return decoded.substring(start, end)
    }
    catch (e) {
        console.warn('URL解析失敗:', e)
        return null
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
    title.value = null
    description.value = null
    errorTitle.value = null
    errorDesc.value = null
    season.value = review.value?.review.season || ''
    visitedDate.value = review.value?.review.visitedDate || ''
    visitedTime.value = review.value?.review.visitedTime || ''
    existReviewImages.value = review.value?.review.reviewImages || []
    deletingReviewImages.value = []
    deletingReviewImageIds.value = []
    isOpen.value = false
    isUpdating.value = false
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
                    <label class="block text-sm font-medium mb-1">画像</label>
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