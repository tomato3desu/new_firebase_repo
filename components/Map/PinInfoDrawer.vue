<script setup>
import { useReviewStore } from '~/composables/stores/review'
import { useAuthStore } from '~/composables/stores/auth'
import { useUserStore } from '~/composables/stores/user'
import { usePinStore } from '~/composables/stores/pin'
import { useBookmarkStore } from '~/composables/stores/bookmark'
import { usePrefStore } from '~/composables/stores/prefecture'

const authStore = useAuthStore()
const reviewStore = useReviewStore()
const userStore = useUserStore()
const pinStore = usePinStore()
const bookmarkStore = useBookmarkStore()
const prefStore = usePrefStore()

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

const isOpenImageGallery = ref(false) // 画像ギャラリーの表示フラグ
const selectedGaralleryImages = ref([]) // 表示中の画像一覧
const selectedGaralleryIndex = ref(0) // 現在の選択index

const isBookmarked = computed(() => bookmarkStore.isBookmarkedByMe(pin.value.id))

// updateダイアログをopen
const updatePin = () => {
    isOpenUpdatePinDialog.value = true
}

// createダイアログをopen
const createReview = () => {
    if (!authStore.isLoggedIn) { // ログインしてなければ作成不可
        alert('レビューを作成するにはログインしてください')
        return
    }
    isOpenCreateReviewDialog.value = true
}

const onImageClicked = ({ clicked, allImages }) => {
    selectedGaralleryImages.value = allImages
    selectedGaralleryIndex.value = allImages.findIndex(i => i.id === clicked.id)
    isOpenImageGallery.value = true
}

const toggleBookmark = async () => {
    await bookmarkStore.toggleBookmark(pin.value.id)
}

const close = () => {
    emit('close')
}

// マウント時にpinに関連するユーザー、レビューをfetchする
onMounted(async () => {
    await userStore.fetchUserIfNeeded(pin.value.createdUserId)
    const fetchedReviews = await reviewStore.getReviewsByPin(pin.value.id)
    const userIds = fetchedReviews.map(r => r.createdUserId).filter(Boolean)
    await userStore.fetchUsersIfNeeded(userIds)
})
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
                        {{ pin.title }}
                    </h2>
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
                <font-awesome-icon 
                    v-if="isBookmarked"
                    icon="fa-solid fa-bookmark"
                    class="text-teal-400 w-4 h-4 absolute right-4"
                    @click="toggleBookmark"
                />
                <font-awesome-icon 
                    v-else
                    icon="fa-solid fa-bookmark"
                    class="text-gray-400 h-4 w-4 absolute right-4"
                    @click="toggleBookmark"
                />
            </div>
            <div>
                <a
                    :href="`https://www.google.com/maps?q=${pin.latitude},${pin.longitude}`"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="block text-sm text-sky-400"
                >
                    Googleマップで開く
                </a>
                <div class="flex">
                    <p>暗さ：</p>
                    <font-awesome-icon
                        icon="fa-solid fa-star"
                        class="text-yellow-400 h-4 w-4"
                    />
                    <p>{{ pin.avgDarkness?.toFixed(1) }}</p>
                </div>
                <div class="flex">
                    <p>アクセス：</p>
                    <font-awesome-icon
                        icon="fa-solid fa-star"
                        class="text-yellow-400 h-4 w-4"
                    />
                    <p>{{ pin.avgAccess?.toFixed(1) }}</p>
                </div>
                <p>レビュー数：{{ pin.reviewCount }}</p>
                <p>ブックマーク数：{{ pin.pinBookmarkCount }}</p>
                <p>{{ prefStore.prefsById[pin.prefectureId].name }}</p>
                <p>{{ pin.address }}</p>
                <p>{{ pin.description }}</p>
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
                    @image-clicked="onImageClicked"
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
    <MapImageGallery
        v-model="isOpenImageGallery"
        :review-images="selectedGaralleryImages"
        :start-index="selectedGaralleryIndex"
    />
    <MapCreateReviewDialog
        v-model="isOpenCreateReviewDialog"
        :pin-id="pin.id"
    />
    <MapUpdatePinDialog
        v-model="isOpenUpdatePinDialog"
        :pin-id="pin.id"
    />
</template>