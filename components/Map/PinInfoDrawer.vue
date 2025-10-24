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

const reviews = ref([])

const isOpenCreateReviewDialog = ref(false)
const pinId = ref(null)

const createReview = () => {
    isOpenCreateReviewDialog.value = true
    pinId.value = props.pin?.id
}

const close = () => {
    isOpen.value = false
    pinId.value = null
    reviews.value = []
}

// drawer が開いたタイミングで fetch
watch(
    () => isOpen.value,
    async (newVal) => {
        if (newVal && props.pin?.id) {
            reviews.value = await reviewStore.getReviewsByPin(props.pin.id)
        }
    }
)

// props.pin が後からセットされるケースにも対応
watch(
    () => props.pin,
    async (newPin) => {
        if (isOpen.value && newPin?.id) {
            reviews.value = await reviewStore.getReviewsByPin(newPin.id)
        }
    },
    { immediate: false }
)
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
                    @click="createReview"
                >
                    レビュー作成
                </button>
            </div>
            <div>
                <div
                    v-if="reviews.length === 0"
                    class="text-gray-400 text-center py-4"
                >
                    レビューがまだありません
                </div>
                <div
                    v-for="review in reviews"
                    :key="review.id"
                >
                    {{ review.title }}
                </div>
            </div>
        </div>
        <div class="w-5 flex items-center">
            <button
                class="text-gray-700 bg-gray-400 h-10 rounded-r-md"
                @click="close"
            >
                ◀
            </button>
        </div>
    </div>
    <MapCreateReviewDialog
        v-model="isOpenCreateReviewDialog"
        :pin-id="props.pin?.id"
    />
</template>