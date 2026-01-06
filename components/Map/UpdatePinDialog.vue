<script setup>
import { usePinStore } from '~/composables/stores/pin'
import { useAuthStore } from '~/composables/stores/auth'
import { useReviewStore } from '~/composables/stores/review'

const pinStore = usePinStore()
const authStore = useAuthStore()
const reviewStore = useReviewStore()
const toast = useToast()

const config = useRuntimeConfig()

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
const error = ref(null)

const isUpdating = ref(false)

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

    // update情報
    const updatePinInfo = {
        id: pin.value.id,
        title: title.value,
        description: description.value,
        thumbnailImage: file.value
    }

    try {
        const token = await authStore.getIdToken()
        await pinStore.updatePin(updatePinInfo, token)
        toast.success({
            title: 'ピンの更新に成功しました。'
        })
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
        }
        finally {
            close()
        }
        
        reviewStore.deleteReviewsByPinId(deletedPin.id) // reviewStoreからreview削除
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

            <div>
                <p class="text-sm font-medium">
                    現在の画像
                </p>
                <NuxtImg
                    :src="`${config.public.r2PublicUrl}/${pin.thumbnailImagePath}`"
                    class="mb-4 mt-2 rounded"
                    @click="openImage"
                />
                <MapImagePreviewModal
                    v-model:is-open="isImageModalOpen"
                    :images="[`${config.public.r2PublicUrl}/${pin.thumbnailImagePath}`]"
                    :start-index="0"
                />
            </div>

            <div class="mb-4">
                <label class="block text-sm font-medium mb-2">
                    新規画像
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

                <!-- エラー -->
                <!-- <p
                    v-if="errorFile"
                    class="text-red-500 text-sm mt-1"
                >
                    {{ errorFile }}
                </p> -->

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