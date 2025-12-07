<script setup>
import { useReviewStore } from '~/composables/stores/review'
import { useAuthStore } from '~/composables/stores/auth'
import { useUserStore } from '~/composables/stores/user'
import { usePinStore } from '~/composables/stores/pin'
import { useBookmarkStore } from '~/composables/stores/bookmark'
import { useGoodStore } from '~/composables/stores/good'
import { useRouter } from 'vue-router'

const router = useRouter()

const authStore = useAuthStore()
const reviewStore = useReviewStore()
const userStore = useUserStore()
const pinStore = usePinStore()
const bookmarkStore = useBookmarkStore()
const goodStore = useGoodStore()

const props = defineProps({
    pinId: {
        type: Number,
        required: true
    }
})

const emit = defineEmits(['close', 'pin-deleted'])

const pin = computed(() => pinStore.pinsById[props.pinId] ?? null)

const reviewIds = computed(() => {
    const p = pin.value
    if (!p) return []
    return reviewStore.reviewsByPinId[p.id] ?? []
})

const isOpenUpdatePinDialog = ref(false)
const isOpenCreateReviewDialog = ref(false)
const isOpenPinReportDialog = ref(false)
const isEditParmitted = computed(() => { // ログインユーザー＝ピン作成者ならtrue
    const user = authStore.loginUser
    const p = pin.value
    if (!user || !user.id || !p) return false

    // 管理者なら常にOK
    if (user.role === 'admin') return true

    // 作成者ならOK
    return user.id === p.createdUserId
})
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

const openUserProfile = () => {
    router.push(`/user/${pin.value.createdUserId}`)
}

const onReportClicked = () => {
    isOpenPinReportDialog.value = true
}

const close = () => {
    emit('close')
}

// マウント時にpinに関連するユーザー、レビューをfetchする
onMounted(async () => {
    await userStore.fetchUserIfNeeded(pin.value.createdUserId)
    const fetchedReviews = await reviewStore.getReviewsByPin(pin.value.id)
    const userIds = fetchedReviews.map(r => r.review.createdUserId).filter(Boolean)
    await userStore.fetchUsersIfNeeded(userIds)
    await goodStore.fetchMyGoodReviews()
})
</script>

<template>
    <div
        class="fixed left-0 top-16 z-50 flex "
    >
        <!-- Drawer本体 -->
        <div
            v-if="pin"
            class="w-60 max-w-[calc(100vw-40px)] sm:w-80 bg-white shadow-lg relative h-[calc(100vh-4rem)] overflow-y-auto"
        >
            <!-- コンテンツ -->
            <!-- top -->
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
                <font-awesome-icon 
                    v-if="isBookmarked"
                    icon="fa-solid fa-bookmark"
                    class="text-teal-400 w-6 h-6 absolute top-4 right-4"
                    @click="toggleBookmark"
                />
                <font-awesome-icon 
                    v-else
                    icon="fa-solid fa-bookmark"
                    class="text-gray-400 h-6 w-6 absolute top-4 right-4"
                    @click="toggleBookmark"
                />
            </div>
            <!-- pin情報 -->
            <div
                v-if="userStore.usersById[pin.createdUserId]"
                class="flex items-center pl-2 mt-2"
            >
                <NuxtImg
                    :src=" userStore.usersById[pin.createdUserId].iconImagePath || '/images/default_user.jpeg'"
                    alt="icon"
                    class="w-8 h-8 object-cover rounded-sm mr-4"
                    @click="openUserProfile"
                />
                <p class="text-gray-700 mr-4 font-medium">
                    {{ userStore.usersById[pin.createdUserId].nickname }}
                </p>
                <font-awesome-icon 
                    v-if="isEditParmitted"
                    icon="fa-solid fa-pen-to-square" 
                    class="h-4 w-4 text-gray-700 absolute right-12"
                    @click="updatePin" 
                />
                <font-awesome-icon 
                    icon="fa-solid fa-triangle-exclamation" 
                    class="w-4 h-4 text-gray-700 absolute right-4"
                    @click="onReportClicked"
                />
            </div>
            <div class="pl-2">
                <div class="flex items-center justify-center">
                    <a
                        :href="`https://www.google.com/maps?q=${pin.latitude},${pin.longitude}`"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="inline-block text-sm text-sky-400 hover:underline"
                    >
                        Googleマップで開く
                    </a>
                </div>
                <div class="flex items-center">
                    <font-awesome-icon 
                        icon="fa-solid fa-moon" 
                        class="h-4 w-4 text-gray-700 mr-2"
                    />
                    <p class="mr-0.5">
                        暗さ：
                    </p>
                    <font-awesome-icon
                        icon="fa-solid fa-star"
                        class="text-yellow-400 h-4 w-4 mr-2"
                    />
                    <p>{{ pin.avgDarkness?.toFixed(1) }}</p>
                </div>
                <div class="flex items-center">
                    <font-awesome-icon 
                        icon="fa-solid fa-route" 
                        class="h-4 w-4 text-gray-700 mr-2"
                    />
                    <p class="mr-0.5">
                        アクセス：
                    </p>
                    <font-awesome-icon
                        icon="fa-solid fa-star"
                        class="text-yellow-400 h-4 w-4 mr-2"
                    />
                    <p>{{ pin.avgAccess?.toFixed(1) }}</p>
                </div>
                <div class="flex items-center">
                    <font-awesome-icon 
                        icon="fa-solid fa-comment" 
                        class="h-4 w-4 text-gray-700 mr-2"
                    />
                    <p class="mr-0.5">
                        レビュー数：{{ pin.reviewCount }}
                    </p>
                </div>
                <div class="flex items-center">
                    <font-awesome-icon 
                        icon="fa-solid fa-bookmark"
                        class="h-4 w-4 text-gray-700 mr-2"
                    />
                    <p class="mr-0.5">
                        ブックマーク数：{{ pin.pinBookmarkCount }}
                    </p>
                </div>
                <div class="flex items-center">
                    <font-awesome-icon 
                        icon="fa-solid fa-location-dot"
                        class="h-4 w-4 text-gray-700 mr-2" 
                    />
                    <p class="text-sm break-words">
                        {{ pin.address }}
                    </p>
                </div>
                <p>{{ pin.description }}</p>
            </div>
            <div class="flex items-center justify-center border-b">
                <button
                    class="text-lg text-sky-400 hover:underline mb-2"
                    @click="createReview"
                >
                    レビュー作成
                </button>
            </div>
            <!-- review -->
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
                class="text-gray-700 bg-gray-400 h-20 rounded-r-lg"
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
    <MapPinReportDrawer
        v-model="isOpenPinReportDialog"
        :pin-id="pin.id"
    />
</template>