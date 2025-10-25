<script setup>
import { useReviewStore } from '~/composables/stores/review'
import { useAuthStore } from '~/composables/stores/auth'
import { usePinStore } from '~/composables/stores/pin'

const authStore = useAuthStore()
const pinStore = usePinStore()
const reviewStore = useReviewStore()

const isOpen = defineModel()
const props = defineProps({
    pin: {
        type: Object,
        required: false,
        default: null
    }
})

const emit = defineEmits(['pin-deleted'])

const reviews = ref([])

const isOpenUpdatePinDialog = ref(false)
const isOpenCreateReviewDialog = ref(false)
const pinId = computed(() => props.pin.id)
const isEditParmitted = computed(() => authStore.loginUser?.id === props.pin?.createdUser.id)

const updatePin = () => {
    isOpenUpdatePinDialog.value = true
}

const deletePin = async () => {
    const isConfirm = window.confirm("本当に削除しますか？")
    if (isConfirm) {
        const token = await authStore.getIdToken()
        await pinStore.deletePin(pinId.value, token)
        
        emit('pin-deleted', props.pin.id)
    }
}

const createReview = () => {
    if (!authStore.isLoggedIn) {
        alertLogin()
        return
    }
    isOpenCreateReviewDialog.value = true
}

const close = () => {
    isOpen.value = false
    reviews.value = []
}

const alertLogin = () => {
    alert('レビューを作成するにはログインしてください')
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
        <div class="w-80 bg-white shadow-lg relative h-[calc(100vh-4rem)] overflow-y-auto">
            <!-- コンテンツ -->
            <div
                class="bg-cover bg-center rounded-none h-32 flex flex-col justify-center"
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
            <div class="flex items-center">
                <NuxtImg
                    :src="props.pin?.createdUser?.iconImagePath || '/images/default_user.jpeg'"
                    alt="icon"
                    class="w-8 h-8 object-cover rounded-sm"
                />
                <p>{{ props.pin?.createdUser?.nickname }}</p>
            </div>
            <div class="flex items-center justify-center">
                <button
                    class="text-lg text-sky-500"
                    @click="createReview"
                >
                    レビュー作成
                </button>
            </div>
            <div v-if="isEditParmitted">
                <button
                    class="text-lg text-yellow-300"
                    @click="updatePin"
                >
                    編集
                </button>
                <button
                    class="text-lg text-red-600"
                    @click="deletePin"
                >
                    削除
                </button>
            </div>
            <div>
                <div
                    v-if="reviews.length === 0"
                    class="text-gray-400 text-center py-4"
                >
                    レビューがまだありません
                </div>
                <MapPinReviewCard
                    v-for="review in reviews"
                    :key="review.id"
                    :review="review"
                />
            </div>
        </div>
        <div class="w-5 flex items-center">
            <button
                class="text-gray-700 bg-gray-400 h-20 rounded-r-md"
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