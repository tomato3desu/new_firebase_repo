<script setup>
import { usePinStore } from '~/composables/stores/pin'
import { useAuthStore } from '~/composables/stores/auth'
import { useReviewStore } from '~/composables/stores/review'
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'

const pinStore = usePinStore()
const authStore = useAuthStore()
const reviewStore = useReviewStore()
const { $storage } = useNuxtApp()
const toast = useToast()

const isOpen = defineModel()
const props = defineProps({
    pinId: {
        type: Number,
        required: true
    }
})

const pin = computed(() => pinStore.pinsById[props.pinId])

const title = ref('')
const errorTitle = ref('')
const description = ref('')
const errorDesc = ref('')
const isActiveAddBtn = computed(() => !errorTitle.value && !errorDesc.value && authStore.isLoggedIn)
const file = ref(null)
const previewUrl = ref(null)
const uploadedUrl = ref(null)
const error = ref(null)

const isUpdating = ref(false)

/**
 * update時に行う処理
 */
const updatePin = async () => {
    if (errorTitle.value || errorDesc.value) {
        toast.error({
            title: 'ピンの更新に失敗しました。',
            message: 'タイトル、詳細を入力してください'
        })
        return
    } // バリデーションエラーがあれば即レス

    isUpdating.value = true

    const oldImagePath = pin.value?.thumbnailImagePath // 古い画像を退避
    if (file.value) {
        try {
            await addToStorage()
        }
        catch (error) {
            toast.error({
                title: '画像のアップロードに失敗しました。時間をおいて再度お試しください',
                message: error.message
            })
            close()
            return
        }
    }
    // update情報
    const updatePinInfo = {
        id: pin.value.id,
        title: title.value,
        description: description.value,
        thumbnailImagePath: uploadedUrl.value
    }

    try {
        const token = await authStore.getIdToken()
        await pinStore.updatePin(updatePinInfo, token)
        toast.success({
            title: 'ピンの更新に成功しました。'
        })
        // 元の画像を削除
        if (uploadedUrl.value && oldImagePath) await deleteThumbnailImage(oldImagePath) 
    }
    catch (error) {
        toast.error({
            title: 'ピンの更新に失敗しました。時間をおいて再度お試しください',
            message: error?.response?._data?.message
        })
    }
    finally {
        close()
    }
}

/**
 * ピン削除時に行う処理
 */
const deletePin = async () => {
    const isConfirm = window.confirm("本当に削除しますか？")
    if (isConfirm) {
        let deletedPin
        try {
            const token = await authStore.getIdToken()
            deletedPin = await pinStore.deletePin(pin.value.id, token) // pinStoreのdeletePinを実行（pinstoreから削除)

            toast.success({
                title: 'ピンの削除に成功しました。'
            })
        }   
        catch (error) {
            toast.error({
                title: 'ピンの削除に失敗しました。時間をおいて再度お試しください',
                message: error?.response?._data?.message
            })
            return
        }
        
        // firebase storageから画像削除
        // thubnailImage 削除
        if (deletedPin?.thumbnailImagePath) {
            await deleteThumbnailImage(deletedPin.thumbnailImagePath)
        }
        // reviews/imagepath 全削除
        await deleteReviewImages(deletedPin)

        reviewStore.deleteReviewsByPinId(deletedPin.id) // reviewStoreからreview削除
        close()
    }
}

/**
 * inputの画像の変更に合わせてpreviewUrlを変更
 * @param event 
 */
const handleFileChange = (event) => {
    const target = event.target
    if (target.files && target.files[0]) {
        file.value = target.files[0]
        previewUrl.value = URL.createObjectURL(file.value)
    }
}

/**
 * storageにfileの画像を追加
 */
const addToStorage = async () => {
    if (!file.value) return
        
    const fileName = `${Date.now()}-pinStore.jpg`
    const fileRef = storageRef($storage, `pinImage/${fileName}`)

    await uploadBytes(fileRef, file.value)
    const url = await getDownloadURL(fileRef)
    uploadedUrl.value = url
}

/**
 * ピンのthumbnailImageをstorageから削除
 * @param thumbnailImagePath 
 */
const deleteThumbnailImage = async (thumbnailImagePath) => {
    try {
        const path = extractPathFromUrl(thumbnailImagePath)
        const oldRef = storageRef($storage, path)
        await deleteObject(oldRef)
    }
    catch (error) {
        console.warn('古い画像の削除に失敗しました', error)
    }
}

/**
 * pinに関連するreviewのreviewImagesを全削除
 * @param deletedPin 
 */
const deleteReviewImages = async (deletedPin) => {
    const reviewIds = reviewStore.reviewsByPinId[deletedPin.id] // [reviewId1, reviewId2, ...]

    if (reviewIds && reviewIds.length > 0) {
        for (const reviewId of reviewIds) {
            const review = reviewStore.reviewsById[reviewId]
            if (review?.reviewImages && review.reviewImages.length > 0) {
                for (const reviewImage of review.reviewImages) {
                    try {
                        const path = extractPathFromUrl(reviewImage.imagePath)
                        const oldRef = storageRef($storage, path)
                        await deleteObject(oldRef)
                    }
                    catch (error) {
                        console.warn('古い画像の削除に失敗しました', error)
                    }
                }
            }
        }
    }
}

// URLからパスをデコード
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
    isUpdating.value = false
}

// titleのバリデーションチェック
watch(title, (value) => {
    if (value.length > 20) {
        errorTitle.value = '20文字以内で入力してください'
    }
    else {
        errorTitle.value = null
    }
})

// descriptionのバリデーションチェック
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
        class="fixed inset-0 top-16 flex items-center justify-center bg-black/50 z-50"
    >
        <div class="text-slate-50 bg-gradient-to-br from-slate-900 from- via-slate-700 via- to-slate-400 to- rounded-lg shadow-lg w-full max-w-md p-6 max-h-[80vh] overflow-y-auto">
            <h2 class="text-xl font-semibold mb-4">
                ピンを編集
            </h2>

            <div class="mb-4">
                <p>
                    {{ pin.title }}
                </p>
                <label class="block text-sm font-medium mb-1">タイトル</label>
                <p
                    v-if="errorTitle"
                    class="text-red-500"
                >
                    {{ errorTitle }}
                </p>
                <input
                    v-model="title"
                    type="text"
                    class="text-slate-800 w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                    placeholder="タイトルを入力"
                >
            </div>

            <div class="mb-4">
                <p class="break-words">
                    {{ pin.description }}
                </p>
                <label class="block text-sm font-medium mb-1">詳細</label>
                <p
                    v-if="errorDesc"
                    class="text-red-500"
                >
                    {{ errorDesc }}
                </p>
                <textarea
                    v-model="description"
                    type="text"
                    class="text-slate-800 w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                    placeholder="説明を入力"
                />
            </div>

            <div class="mb-4">
                <NuxtImg
                    v-if="pin?.thumbnailImagePath"
                    :src="pin.thumbnailImagePath"
                    class="mb-4"
                />
                <label class="block text-sm font-medium mb-1">画像</label>
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
                    class="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition"
                    @click="deletePin"
                >
                    削除
                </button>
                <button
                    class="px-4 py-2 rounded disabled:bg-blue-200 bg-blue-500 text-white hover:bg-blue-600 transition"
                    :disabled="!isActiveAddBtn"
                    @click="updatePin"
                >
                    {{ isUpdating ? '更新中...' : '更新' }}
                </button>
            </div>
        </div>
    </div>
</template>