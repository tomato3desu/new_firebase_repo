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

const darknessLevel = ref(props.review.darknessLevel)
const accessLevel = ref(props.review.accessLevel)
const files = ref([])
const previewUrls = ref([])
const uploadedUrls = ref([])
const error = ref('')
const title = ref(null)
const description = ref(null)
const errorTitle = ref(null)
const errorDesc = ref(null)
const isActiveReviewBtn = computed(() => !errorTitle.value && !errorDesc.value && authStore.isLoggedIn)
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
                        @click="createNewReview"
                    >
                        追加
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>