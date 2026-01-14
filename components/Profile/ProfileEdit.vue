<script setup>
import { useAuthStore } from '~/composables/stores/auth'
import { usePrefStore } from '~/composables/stores/prefecture'
import { useBookmarkStore } from '~/composables/stores/bookmark'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'

const { user } = defineProps({
    user: Object
})

const authStore = useAuthStore()
const prefStore = usePrefStore()
const bookmarkStore = useBookmarkStore()
const toast = useToast()
const config = useRuntimeConfig()

const currentProfile = ref({
    nickname: user?.nickname ?? null,
    comment: user?.comment ?? null,
    prefectureId: user?.prefectureId ?? null,
    iconImagePath: user?.iconImagePath ?? null
})

const nickname = ref('')
const nicknameError = ref('')
const comment = ref('')
const commentError = ref('')
const prefId = ref(currentProfile.value.prefectureId)

const file = ref(null)
const previewUrl = ref(null)
const cropper = ref(null)
const isUploading = ref(false)
const error = ref(null)
const isActiveUpdateBtn = computed(() => !isUploading.value && !nicknameError.value && !commentError.value)

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

/**
 * tokenを取得してuserStoreのupdateProfileを実行
 * @param profileData 
 */
const sendToBackend = async (profileData) => {
    try {
        const token = await authStore.getIdToken()
        await authStore.updateProfile(profileData, token)
    }
    catch (error) {
        toast.error({
            title: 'プロフィールの更新に失敗しました。時間をおいて再度お試しください',
            message: error?.response?._data?.message
        })
    }
}

/**
 * 更新
 */
const updateProfile = async () => {
    // バリデーションエラーがあればreturn
    if (nicknameError.value || commentError.value) return

    try {
        isUploading.value = true
        error.value = false
        // 画像があればfirebase storageに保存
        if (cropper.value) {
            // Cropperからcanvasを取得
            const { canvas } = cropper.value.getResult()
            if (!canvas) {
                throw new Error('画像の切り抜きに失敗しました')
            }

            // canvasから画像生成
            const blob = await new Promise((resolve, reject) => {
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob)
                    }
                    else {
                        reject(new Error('blobの作成に失敗しました'))
                    }
                }, 'image/jpg')
            })

            await sendToBackend({
                nickname: nickname.value,
                comment: comment.value,
                iconImage: blob,
                prefId: prefId.value
            })

            currentProfile.value = authStore.loginUser // currentProfileを更新

            nickname.value = ''
            comment.value = ''
            previewUrl.value = null
        }
        // なければ現在の画像パスをそのまま送信
        else {
            await sendToBackend({
                nickname: nickname.value,
                comment: comment.value,
                iconImagePath: null,
                prefId: prefId.value
            })

            nickname.value = ''
            comment.value = ''
        }

        currentProfile.value = authStore.loginUser // currentProfileを更新
    }
    catch (err) {
        error.value = err.message
    }
    finally {
        isUploading.value = false
    }
}

onMounted(() => {
    try {
        prefStore.setAllPrefs()
        bookmarkStore.fetchBookmarksByUserId(user?.id)
    }   
    catch (error) {
        toast.error({
            title: 'プロフィールの取得に失敗しました。時間をおいて再度お試しください',
            message: error?.response?._data?.message
        })
    }
})

// nicknameのバリデーションチェック
watch(nickname, () => {
    if (nickname.value.length > 16) {
        nicknameError.value = '16文字以内で入力してください'
    }
    else {
        nicknameError.value = ''
    }
})

// コメントのバリデーションチェック
watch(comment, () => {
    if (comment.value.length > 100) {
        commentError.value = '100文字以内で入力してください'
    }
    else {
        commentError.value = ''
    }
})
</script>

<template>
    <div class="max-w-80 mx-auto mt-10 p-6 text-slate-50 border border-slate-500 rounded-2xl shadow bg-gradient-to-br from-slate-900 from- via-slate-700 via- to-slate-400 to-">
        <h2 class="text-2xl font-bold mb-4 text-center">
            プロフィール
        </h2>

        <div class="flex justify-center items-center">
            <NuxtImg
                :src="currentProfile.iconImagePath
                    ? `${config.public.r2PublicUrl}/${currentProfile.iconImagePath}`
                    : '/images/default_user.jpeg'"
                alt="プロフィール画像"
                class="w-32 h-32 object-cover rounded-sm my-4"
            />
        </div>
        <p>
            ニックネーム：{{ currentProfile.nickname }}
        </p>
        <p
            v-if="nicknameError"
            class="text-red-500"
        >
            {{ nicknameError }}
        </p>
        <input
            v-model="nickname"
            type="text"
            placeholder="ニックネーム編集"
            class="text-slate-800 mb-4 w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-300"
        >
        <p>
            コメント：{{ currentProfile.comment }}
        </p>
        <p
            v-if="commentError"
            class="text-red-500"
        >
            {{ commentError }}
        </p>
        <textarea
            v-model="comment"
            placeholder="コメント編集"
            class="text-slate-800 mb-4 w-full border p-2 rounded focus:outline-none focus:ring focus:ring-blue-300"
        />
        <p
            v-if="prefStore.prefsById[prefId]"
        >
            {{ prefStore.prefsById[prefId].name }}
        </p>
        <div v-if="prefStore.prefsById">
            <select
                v-model="prefId"
                class="text-slate-800 rounded-sm focus:outline-none focus:ring focus:ring-blue-300"
            >
                <option
                    v-for="pref in prefStore.prefsById"
                    :key="pref.id"
                    :value="pref.id"
                >
                    {{ pref.name }}
                </option>
            </select>
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

            <!-- プレビュー -->
            <div
                v-if="previewUrl"
                class="mb-4"
            >
                <p class="font-semibold">
                    プレビュー:
                </p>
                <Cropper
                    ref="cropper"
                    :src="previewUrl"
                    :stencil-props="{
                        aspectRatio: 1,
                        movable: true,
                        resizable: true,
                    }"
                    class="rounded-lg shadow w-full z-0"
                />
            </div>
        </div>

        <button
            :disabled="!isActiveUpdateBtn"
            class="w-full bg-teal-400 hover:bg-teal-500 py-2 rounded disabled:opacity-50"
            @click="updateProfile"
        >
            更新
        </button>
        <div
            v-if="isUploading"
            class="mt-3 text-slate-50 text-center my-2 animate-pulse"
        >
            <p>更新中...</p>
        </div>
        <p
            v-if="error"
            class="text-red-500 mt-3"
        >
            {{ error }}
        </p>
    </div>
</template>