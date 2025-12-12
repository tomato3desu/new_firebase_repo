<script setup>
import { useReviewStore } from '~/composables/stores/review'
import { useAuthStore } from '~/composables/stores/auth'
import { useUserStore } from '~/composables/stores/user'
import { usePinStore } from '~/composables/stores/pin'
import { useBookmarkStore } from '~/composables/stores/bookmark'
import { useGoodStore } from '~/composables/stores/good'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

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

const selectedReviewId = ref(null)
const selectedSeason = ref(null) // null = 全件 / 'spring' / 'summer' / 'autumn' / 'winter'

const filteredReviewIds = computed(() => {
    const p = pin.value
    if (!p) return []

    const ids = reviewStore.reviewsByPinId[p.id] ?? []

    // season = all なら全件
    if (selectedSeason.value === 'all') return ids
    // selectedReviewIdがあり、seasonがなければ selectedReviewIdのみの配列を返す
    // selectedReviewIdよりseasonを優先させるため
    if (!selectedSeason.value && selectedReviewId.value && ids.includes(selectedReviewId.value)) return [selectedReviewId.value]
    // どちらもなければidsが返る（初期状態）
    if (!selectedSeason.value) return ids

    return ids.filter(id => {
        const r = reviewStore.reviewsById[id]
        return r && r.review.season === selectedSeason.value
    })
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

watch(
    () => route.query.reviewId,
    (newVal) => {
        if (newVal) {
            selectedReviewId.value = Number(newVal)
        }
        else {
            selectedReviewId.value = null
        }
    },
    { immediate: true }
)
</script>

<template>
    <div
        class="fixed left-0 top-16 z-40 flex "
    >
        <!-- Drawer本体 -->
        <div
            v-if="pin"
            class="w-80 max-w-[calc(100vw-40px)] bg-gradient-to-tl from-slate-900 from- via-slate-700 via- to-slate-400 to- shadow-lg relative h-[calc(100vh-4rem)] overflow-y-auto"
        >
            <!-- コンテンツ -->
            <!-- top -->
            <div
                class="bg-cover bg-center rounded-none h-32 flex flex-col justify-center"
                :style="pin.thumbnailImagePath
                    ? { backgroundImage: `url(${pin.thumbnailImagePath})` }
                    : { backgroundImage: `url('images/saturn.png')` }"
            >
                <div class="text-slate-50 p-4 rounded-lg">
                    <h2 class="text-lg font-bold">
                        {{ pin.title }}
                    </h2>
                </div>
                <font-awesome-icon 
                    v-if="isBookmarked"
                    icon="fa-solid fa-bookmark"
                    class="text-yellow-300 w-6 h-6 absolute top-4 right-4"
                    @click="toggleBookmark"
                />
                <font-awesome-icon 
                    v-else
                    icon="fa-solid fa-bookmark"
                    class="text-slate-50 hover:text-yellow-300 h-6 w-6 absolute top-4 right-4"
                    @click="toggleBookmark"
                />
            </div>
            <!-- pin情報 -->
            <div
                v-if="userStore.usersById[pin.createdUserId]"
                class="flex items-center px-2 mt-2 text-slate-50"
            >
                <NuxtImg
                    :src=" userStore.usersById[pin.createdUserId].iconImagePath || '/images/default_user.jpeg'"
                    alt="icon"
                    class="w-8 h-8 object-cover rounded-sm mr-4"
                    @click="openUserProfile"
                />
                <p class=" mr-4 font-medium">
                    {{ userStore.usersById[pin.createdUserId].nickname }}
                </p>
                <font-awesome-icon 
                    v-if="isEditParmitted"
                    icon="fa-solid fa-pen-to-square" 
                    class="h-4 w-4 absolute right-12 hover:text-yellow-300"
                    @click="updatePin" 
                />
                <font-awesome-icon 
                    icon="fa-solid fa-triangle-exclamation" 
                    class="w-4 h-4 absolute right-4 hover:text-yellow-300"
                    @click="onReportClicked"
                />
            </div>
            <div class="pl-2 text-slate-50">
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
                        class="h-4 w-4 mr-2"
                    />
                    <p class="mr-0.5">
                        暗さ：
                    </p>
                    <font-awesome-icon
                        icon="fa-solid fa-star"
                        class="text-yellow-300 h-4 w-4 mr-2"
                    />
                    <p>{{ pin.avgDarkness?.toFixed(1) }}</p>
                </div>
                <div class="flex items-center">
                    <font-awesome-icon 
                        icon="fa-solid fa-route" 
                        class="h-4 w-4 mr-2"
                    />
                    <p class="mr-0.5">
                        アクセス：
                    </p>
                    <font-awesome-icon
                        icon="fa-solid fa-star"
                        class="text-yellow-300 h-4 w-4 mr-2"
                    />
                    <p>{{ pin.avgAccess?.toFixed(1) }}</p>
                </div>
                <div class="flex items-center">
                    <font-awesome-icon 
                        icon="fa-solid fa-comment" 
                        class="h-4 w-4 mr-2"
                    />
                    <p class="mr-0.5">
                        レビュー数：{{ pin.reviewCount }}
                    </p>
                </div>
                <div class="flex items-center">
                    <font-awesome-icon 
                        icon="fa-solid fa-bookmark"
                        class="h-4 w-4 mr-2"
                    />
                    <p class="mr-0.5">
                        ブックマーク数：{{ pin.pinBookmarkCount }}
                    </p>
                </div>
                <div class="flex items-center">
                    <font-awesome-icon 
                        icon="fa-solid fa-location-dot"
                        class="h-4 w-4 mr-2" 
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
                <div class="p-2">
                    <button 
                        class="bg-slate-50 hover:bg-slate-300 px-2 py-0.5 my-2 rounded-md"
                        @click="selectedSeason = 'all'"
                    >
                        all
                    </button>
                    <div class="text-slate-800 grid grid-cols-3 md:grid-cols-4 items-center gap-2">
                        <button
                            class="bg-slate-50 hover:bg-slate-300 px-1 py-0.5 rounded-md"
                            @click="selectedSeason = 'spring'"
                        >
                            spring
                        </button>
                        <button 
                            class="bg-slate-50 hover:bg-slate-300 px-1 py-0.5 rounded-md"
                            @click="selectedSeason = 'summer'"
                        >
                            summer
                        </button>
                        <button 
                            class="bg-slate-50 hover:bg-slate-300 px-1 py-0.5 rounded-md"
                            @click="selectedSeason = 'autumn'"
                        >
                            autumn
                        </button>
                        <button 
                            class="bg-slate-50 hover:bg-slate-300 px-1 py-0.5 rounded-md"
                            @click="selectedSeason = 'winter'"
                        >
                            winter
                        </button>
                    </div>
                </div>
                <div
                    v-if="!filteredReviewIds || filteredReviewIds.length === 0"
                    class="text-slate-50 text-center py-4"
                >
                    レビューがまだありません
                </div>
                <MapPinReviewCard
                    v-for="reviewId in filteredReviewIds"
                    :key="reviewId"
                    :review-id="reviewId"
                    @image-clicked="onImageClicked"
                />
            </div>
        </div>
        <div class="w-5 flex items-center">
            <button
                class="bg-slate-300 hover:bg-slate-500 text-slate-800 h-20 rounded-r-lg"
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