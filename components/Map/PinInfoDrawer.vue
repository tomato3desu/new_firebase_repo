<script setup>
import { useReviewStore } from '~/composables/stores/review'

const reviewStore = useReviewStore()

const isOpen = defineModel()
const props = defineProps({
    pin: {
        type: Object,
        required: false,
        default: null
    }
})

const isOpenCreateReviewDialog = ref(false)
const pinId = ref(null)

const createReview = () => {
    isOpenCreateReviewDialog.value = true
    pinId.value = props.pin.pinId
}

const close = () => {
    isOpen.value = false
}
</script>

<template>
    <div
        v-if="isOpen"
        class="fixed left-0 top-16 z-50 flex"
    >
        <!-- Drawer本体 -->
        <div class="w-80 bg-white shadow-lg relative p-4 h-[calc(100vh-4rem)] overflow-y-auto">
            <!-- コンテンツ -->
            <div
                class="bg-cover bg-center rounded-lg h-32 flex flex-col justify-center"
                :style="props.pin?.thumbnailImagePath 
                    ? { backgroundImage: `url(${props.pin.thumbnailImagePath})` } 
                    : { backgroundImage: `url('images/saturn.png')` }"
            >
                <div class="text-white p-4 rounded-lg">
                    <h2 class="text-lg font-bold">
                        {{ props.pin?.title || 'タイトルなし' }}
                    </h2>
                    <p class="whitespace-pre-line">
                        {{ props.pin?.description || '説明なし' }}
                    </p>
                </div>
            </div>
            <div class="flex items-center justify-center">
                <button
                    class="text-lg text-sky-500"
                    :pin="pinId"
                    @click="createReview"
                >
                    レビュー作成
                </button>
            </div>
        </div>
        <div class="w-5 bg-gray-400 flex items-center justify-center">
            <button
                class="text-gray-700"
                @click="close"
            >
                ◀
            </button>
        </div>
    </div>
    <MapCreateReviewDialog v-model="isOpenCreateReviewDialog" :pinId="props.pin?.id"/>
</template>