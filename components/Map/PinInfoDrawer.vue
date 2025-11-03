<script setup>
import { useReviewStore } from '~/composables/stores/review'
import { useAuthStore } from '~/composables/stores/auth'
import { useUserStore } from '~/composables/stores/user'
import { usePinStore } from '~/composables/stores/pin'

const authStore = useAuthStore()
const reviewStore = useReviewStore()
const userStore = useUserStore()
const pinStore = usePinStore()

const props = defineProps({
    pinId: {
        type: Number,
        required: true
    }
})

const emit = defineEmits(['close', 'pin-deleted'])

const pin = computed(() => pinStore.pinsById[props.pinId])

const reviewIds = computed(() => reviewStore.reviewsByPinId[pin.value?.id])

const isOpenUpdatePinDialog = ref(false)
const isOpenCreateReviewDialog = ref(false)
const isEditParmitted = computed(() => authStore.loginUserId === pin.value.createdUserId) // ログインユーザー＝ピン作成者ならtrue

// updateダイアログをopen
const updatePin = () => {
    isOpenUpdatePinDialog.value = true
}

// update時にprops.pinをupdate後のpin情報に入れ替える // TODO props.pin -> props.pinIdに合わせて変更
// const onPinUpdated = (updatedPin) => {
//     Object.assign(props.pin, updatedPin)
// }

// ピン削除時にmapコンポーネントに伝達
// const onPinDeleted = (deletedPinId) => { // TODO props.pin -> props.pinIdに合わせて変更
//     emit('pin-deleted', deletedPinId)
// }

// createダイアログをopen
const createReview = () => {
    if (!authStore.isLoggedIn) { // ログインしてなければ作成不可
        alert('レビューを作成するにはログインしてください')
        return
    }
    isOpenCreateReviewDialog.value = true
}

// レビュー追加時にreviewsに追加して即時反映
// const onReviewAdded = (addedReview) => {
//     reviews.value.push(addedReview)
// }

const close = () => {
    emit('close')
}

onMounted(async () => {
    await userStore.fetchUserIfNeeded(pin.value.createdUserId)
    const fetchedReviews = await reviewStore.getReviewsByPin(pin.value.id)
    const userIds = fetchedReviews.map(r => r.createdUserId).filter(Boolean)
    await userStore.fetchUsersIfNeeded(userIds)
})

// drawer が開いたタイミングで fetch
// watch(
//     () => isOpen.value,
//     async (newVal) => {
//         if (newVal && props.pinId) {
//             await userStore.fetchUserIfNeeded(pin.value.createdUserId)
//             const fetchedReviews = await reviewStore.getReviewsByPin(pin.value.id)
//             const userIds = fetchedReviews.map(r => r.createdUserId).filter(Boolean)
//             await userStore.fetchUsersIfNeeded(userIds)
//             reviews.value = fetchedReviews
//             console.log("isOpen", pin.value)
//         }
//     }
    
// )

// props.pin が後からセットされるケースにも対応(一旦コメントアウト 後からセットしないかも)
// watch(
//   () => props.pinId,
//   async (newId) => {
//     if (newId) {
//       const fetchedReviews = await reviewStore.getReviewsByPin(newId)
//       const userIds = fetchedReviews.map(r => r.createdUserId)
//       await userStore.fetchUsersIfNeeded(userIds)
//       reviews.value = fetchedReviews
//       console.log("props.pinId", pin.value)
//     }
//   },
//   { immediate: true }
// )
</script>

<template>
    <div
        class="fixed left-0 top-16 z-50 flex "
    >
        <!-- Drawer本体 -->
        <div
            v-if="pin"
            class="w-80 sm:w-[calc(max-28px)] bg-white shadow-lg relative h-[calc(100vh-4rem)] overflow-y-auto"
        >
            <!-- コンテンツ -->
            <div
                class="bg-cover bg-center rounded-none h-32 flex flex-col justify-center"
                :style="pin.thumbnailImagePath
                    ? { backgroundImage: `url(${pin.thumbnailImagePath})` }
                    : { backgroundImage: `url('images/saturn.png')` }"
            >
                <div class="text-white p-4 rounded-lg">
                    <h2 class="text-lg font-bold">
                        {{ pin.title || 'タイトルなし' }}
                    </h2>
                    <p class="whitespace-pre-line">
                        {{ pin.description || '説明なし' }}
                    </p>
                </div>
            </div>
            <div
                v-if="userStore.usersById[pin.createdUserId]"
                class="flex items-center"
            >
                <NuxtImg
                    :src=" userStore.usersById[pin.createdUserId].iconImagePath || '/images/default_user.jpeg'"
                    alt="icon"
                    class="w-8 h-8 object-cover rounded-sm"
                />
                <p>{{ userStore.usersById[pin.createdUserId].nickname }}</p>
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
                    :pin="pin"
                    @click="updatePin"
                >
                    編集
                </button>
            </div>
            <div>
                <div
                    v-if="!reviewIds || reviewIds.length === 0"
                    class="text-gray-400 text-center py-4"
                >
                    レビューがまだありません
                </div>
                <MapPinReviewCard
                    v-for="reviewId in reviewIds"
                    :key="reviewId"
                    :review-id="reviewId"
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
        :pin-id="pin.id"
    />
    <MapUpdatePinDialog
        v-model="isOpenUpdatePinDialog"
        :pin-id="pin.id"
    />
</template>