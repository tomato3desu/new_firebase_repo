<script setup>
import { useAuthStore } from '~/composables/stores/auth'
import { usePrefStore } from '~/composables/stores/prefecture'
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'

const config = useRuntimeConfig()
const authStore = useAuthStore()
const prefStore = usePrefStore()
const { $storage } = useNuxtApp()

const currentProfile = ref({
    nickname: '',
    comment: '',
    prefecture: {
        id: 13,
        name: '',
        latitude: '',
        longitude: ''
    },
    iconImagePath: ''
})

const prefs = prefStore.prefs

const nickname = ref('')
const nicknameError = ref('')
const comment = ref('')
const commentError = ref('')
const prefId = ref(currentProfile.value.prefecture.id)

const file = ref(null)
const previewUrl = ref(null)
const cropper = ref(null)
const isUploading = ref(null)
const uploadedUrl = ref(null)
const error = ref(null)
const isActiveUpdateBtn = computed(() => !isUploading.value && !nicknameError.value && !commentError.value)

const handleFileChange = (event) => {
    const target = event.target
    if (target.files && target.files[0]) {
        file.value = target.files[0]
        previewUrl.value = URL.createObjectURL(file.value)
    }
}

const sendToBackend = async (profileData) => {
    const token = await authStore.getIdToken()
    try {
        const res = await $fetch(`${config.public.apiBase}/api/auth/updateProfile`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: profileData
        })

        authStore.loginUser = res
    }
    catch (err) {
        console.error('エラー', err)
    }
}

const updateProfile = async () => {
    if (nicknameError.value || commentError.value) return
    isUploading.value = true
    error.value = false

    try {
        // 画像があればfirebase storageに保存
        if (cropper.value) {
            const oldImageUrl = authStore.loginUser?.iconImagePath

            // Cropperからcanvasを取得
            const { canvas } = cropper.value.getResult()
            if (!canvas) {
                throw new Error('画像の切り抜きに失敗しました')
            }

            canvas.toBlob(async (blob) => {
                if (!blob) {
                    throw new Error('blobの作成に失敗しました')
                }

                const fileName = `${Date.now()}-cropped.jpg`
                const fileRef = storageRef($storage, `profileImage/${fileName}`)

                await uploadBytes(fileRef, blob)
                const url = await getDownloadURL(fileRef)
                uploadedUrl.value = url

                await sendToBackend({
                    nickname: nickname.value,
                    comment: comment.value,
                    iconImagePath: uploadedUrl.value,
                    prefId: prefId.value
                })

                nickname.value = ''
                comment.value = ''
                previewUrl.value = null
            }, 'image/jpg')

            if (currentProfile.value.iconImagePath !== '') {
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
                iconImagePath: uploadedUrl.value,
                prefId: prefId.value
            })

            nickname.value = ''
            comment.value = ''
        }
    }
    catch (err) {
        error.value = err.message
    }
    finally {
        isUploading.value = false
    }
}

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
})

watch(nickname, () => {
    if (nickname.value.length > 16) {
        nicknameError.value = '16文字以内で入力してください'
    }
    else {
        nicknameError.value = ''
    }
})

watch(comment, () => {
    if (comment.value.length > 100) {
        commentError.value = '100文字以内で入力してください'
    }
    else {
        commentError.value = ''
    }
})

watch(() => authStore.loginUser,
    (newVal) => {
        if (newVal) {
            currentProfile.value = authStore.loginUser
            if (newVal.prefecture?.id) {
                prefId.value = newVal.prefecture.id
            }
        }
        else {
            currentProfile.value = {
                nickname: '',
                comment: '',
                prefecture: {
                    id: 13,
                    name: '',
                    latitude: '',
                    longitude: ''
                },
                iconImagePath: ''
            }

            prefId.value = 13
        }
    },
    { immediate: true }
)
</script>

<template>
    <div class="max-w-md mx-auto mt-10 p-6 border rounded-2xl shadow">
        <h2 class="text-2xl font-bold mb-4 text-center">
            プロフィール
        </h2>
        <client-only>
            <p
                class="text-gray-500"
            >
                ニックネーム：{{ currentProfile.nickname }}
            </p>
        </client-only>
        <p
            v-if="nicknameError"
            class="text-red-600"
        >
            {{ nicknameError }}
        </p>
        <input
            v-model="nickname"
            type="text"
            placeholder="ニックネーム編集"
            class="mb-4 w-full border p-2 rounded"
        >
        <client-only>
            <p
                class="text-gray-500"
            >
                コメント：{{ currentProfile.comment }}
            </p>
        </client-only>
        <p
            v-if="commentError"
            class="text-red-600"
        >
            {{ commentError }}
        </p>
        <textarea
            v-model="comment"
            placeholder="コメント編集"
            class="mb-4 w-full border p-2 rounded"
        />
        <client-only>
            <p
                class="text-gray-500"
            >
                {{ currentProfile.prefecture.name }}
            </p>
        </client-only>
        <client-only>
            <div v-if="prefs && prefs.length > 0">
                <select
                    v-model="prefId"
                    name="pref"
                >
                    <option
                        v-for="pref in prefs"
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
                class="w-32 h-32 object-cover rounded-none mb-4"
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
            class="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded disabled:opacity-50"
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
        <div
            v-if="uploadedUrl"
            class="mt-6"
        >
            <p class="font-semibold">
                更新完了！
            </p>
            <a
                :href="uploadedUrl"
                target="_blank"
                class="text-blue-600 underline break-all"
            >
                {{ uploadedUrl }}
            </a>
        </div>
    </div>
</template>