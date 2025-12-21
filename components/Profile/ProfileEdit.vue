<script setup>
import { useAuthStore } from '~/composables/stores/auth'
import { usePrefStore } from '~/composables/stores/prefecture'
import { useBookmarkStore } from '~/composables/stores/bookmark'
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'

const { user } = defineProps({
    user: Object
})

const authStore = useAuthStore()
const prefStore = usePrefStore()
const bookmarkStore = useBookmarkStore()
const { $storage } = useNuxtApp()

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
const isUploading = ref(null)
const uploadedUrl = ref(null)
const error = ref(null)
const isActiveUpdateBtn = computed(() => !isUploading.value && !nicknameError.value && !commentError.value)

/**
 * ファイル変更時にpreviewUrlを変更
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
 * tokenを取得してuserStoreのupdateProfileを実行
 * @param profileData 
 */
const sendToBackend = async (profileData) => {
    const token = await authStore.getIdToken()
    
    await authStore.updateProfile(profileData, token)
}

/**
 * 更新
 */
const updateProfile = async () => {
    // バリデーションエラーがあればreturn
    if (nicknameError.value || commentError.value) return
    isUploading.value = true
    error.value = false

    try {
        // 画像があればfirebase storageに保存
        if (cropper.value) {
            const oldImageUrl = authStore.loginUser.iconImagePath

            // Cropperからcanvasを取得
            const { canvas } = cropper.value.getResult()
            if (!canvas) {
                throw new Error('画像の切り抜きに失敗しました')
            }

            // canvasから画像生成
            canvas.toBlob(async (blob) => {
                if (!blob) {
                    throw new Error('blobの作成に失敗しました')
                }

                const fileName = `${Date.now()}-cropped.jpg`
                const fileRef = storageRef($storage, `profileImage/${fileName}`)

                // firebase storageに保存＆uploadedUrlにupload後のurlをセット
                await uploadBytes(fileRef, blob)
                const url = await getDownloadURL(fileRef)
                uploadedUrl.value = url

                console.log({
                    nickname: nickname.value,
                    comment: comment.value,
                    iconImagePath: uploadedUrl.value,
                    prefId: prefId.value
                })

                await sendToBackend({
                    nickname: nickname.value,
                    comment: comment.value,
                    iconImagePath: uploadedUrl.value,
                    prefId: prefId.value
                })

                currentProfile.value = authStore.loginUser // currentProfileを更新

                nickname.value = ''
                comment.value = ''
                uploadedUrl.value = null
                previewUrl.value = null
            }, 'image/jpg')

            // 古い画像があれば削除
            if (currentProfile.value.iconImagePath !== '' && oldImageUrl) {
                try {
                    const path = extractPathFromUrl(oldImageUrl)
                    const oldRef = storageRef($storage, path)
                    await deleteObject(oldRef)
                    console.log('古い画像を削除しました')
                }
                catch (deleteError) {
                    console.warn('古い画像の削除に失敗:', deleteError)
                }
            }
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

/**
 * urlを解析するメソッド
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

onMounted(() => {
    prefStore.setAllPrefs()
    bookmarkStore.fetchBookmarksByUserId(user?.id)
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
        <client-only>
            <p>
                ニックネーム：{{ currentProfile.nickname }}
            </p>
        </client-only>
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
        <client-only>
            <p>
                コメント：{{ currentProfile.comment }}
            </p>
        </client-only>
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
        <client-only>
            <p
                v-if="prefStore.prefsById[prefId]"
            >
                {{ prefStore.prefsById[prefId].name }}
            </p>
        </client-only>
        <client-only>
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
        </client-only>
        
        <client-only>
            <NuxtImg
                :src="currentProfile.iconImagePath || '/images/default_user.jpeg'"
                alt="プロフィール画像"
                class="w-32 h-32 object-cover rounded-sm my-4"
            />
        </client-only>
        <input
            type="file"
            accept="image/*"
            class="mb-4 w-full border p-2 rounded"
            @change="handleFileChange"
        >
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
        <button
            :disabled="!isActiveUpdateBtn"
            class="w-full bg-teal-400 hover:bg-teal-500 py-2 rounded disabled:opacity-50"
            @click="updateProfile"
        >
            {{ isUploading ? "更新中..." : "更新" }}
        </button>
        <p
            v-if="error"
            class="text-red-500 mt-3"
        >
            {{ error }}
        </p>
    </div>
</template>