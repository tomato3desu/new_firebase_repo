<script setup>
import { useAuthStore } from '~/composables/stores/auth'
import { useGoodStore } from '~/composables/stores/good'
import { useReviewStore } from '~/composables/stores/review'
import { useUserStore } from '~/composables/stores/user'
import { useRouter } from 'vue-router'

const router = useRouter()
const config = useRuntimeConfig()

const authStore = useAuthStore()
const userStore = useUserStore()
const reviewStore = useReviewStore()
const goodStore = useGoodStore()

const props = defineProps({
    reviewId: {
        type: Number,
        required: true,
    }
})

const emit = defineEmits(['image-clicked'])

const review = computed(() => reviewStore.reviewsById[props?.reviewId])
const isGood = computed(() => goodStore.myGoodReviews.includes(props.reviewId) ? true : false)
const season = computed(() => {
    const r = review.value?.review?.season

    if (!r) return ''

    if (r === 'spring') return '春'
    if (r === 'summer') return '夏'
    if (r === 'autumn') return '秋'
    return '冬'
})

const isOpenUpdateReviewDialog = ref(false)
const isOpenReviewReportDialog = ref(false)

// もっと見る制御
const showFull = ref(false)
const MAX_LENGTH = 120

const shouldTruncate = computed(() => review.value?.review.description.length > MAX_LENGTH)
const truncatedText = computed(() => {
    if (!shouldTruncate.value) return review.value?.review.description || ''
    return showFull.value
        ? review.value?.review.description
        : review.value?.review.description?.slice(0, MAX_LENGTH) + '...'
})

const isEditParmitted = computed(() => { // ログインユーザー＝ピン作成者ならtrue(管理者ならtrue)
    const user = authStore.loginUser
    const r = review.value.review
    if (!user || !user.id || !r) return false

    if (user.role === 'admin') return true

    return user.id === r.createdUserId
})

const updateReview = () => {
    isOpenUpdateReviewDialog.value = true
}

const onGoodClicked = async () => {
    const reviewId = review.value.review.id
    try {
        await goodStore.toggleGood(reviewId)
    }
    catch (error) {
        toast.error({
            title: '評価に失敗しました。時間を置いて再度お試しください',
            message: error?.response?._data?.message
        })
    }
}

const onReportClicked = () => {
    if (!authStore.loginUser) {
        alert('通報するにはログインしてください')
        return
    }
    isOpenReviewReportDialog.value = true
}

const openUserProfile = () => {
    router.push(`/user/${review.value.review.createdUserId}`)
}

/**
 * 画像クリック時にギャラリー表示するための情報をdrawerに伝える
 * @param reviewImage 
 */
const onImageClick = (reviewImage) => {
    emit('image-clicked', {
        clicked: reviewImage,
        allImages: review.value.review.reviewImages
    })
}

const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP')
}

const formatTime = (timeString) => {
    const [hour, min] = timeString.split(':')
    return `${hour}:${min}`
}
</script>

<template>
    <div 
        v-if="review && review.review"
        class="text-slate-50 border-b border-slate-50 flex flex-col px-2"
    >
        <!-- ユーザー情報 -->
        <div
            v-if="userStore.usersById[review.review.createdUserId]"
            class="flex items-center mt-2"
        >
            <NuxtImg
                :src="userStore.usersById[review.review.createdUserId].iconImagePath 
                    ? `${config.public.r2PublicUrl}/${userStore.usersById[review.review.createdUserId].iconImagePath}` 
                    : '/images/default_user.jpeg'"
                class="w-8 h-8 object-cover rounded-sm mr-4"
                @click="openUserProfile"
            />
            <p class="font-medium text-sm truncate">
                {{ userStore.usersById[review.review.createdUserId].nickname }}
            </p>
            <font-awesome-icon 
                v-if="isEditParmitted"
                icon="fa-solid fa-pen-to-square" 
                class="h-4 w-4 absolute right-4 hover:text-yellow-300"
                @click="updateReview"
            />
        </div>
        <!-- タイトル -->
        <p class="text-base font-medium break-words whitespace-pre-wrap">
            {{ review.review.title }}
        </p>
        <!-- 評価 -->
        <div>
            <div class="flex items-center">
                <font-awesome-icon 
                    icon="fa-solid fa-moon" 
                    class="h-4 w-4 mr-2"
                />
                <p>暗さ：</p>
                <font-awesome-icon
                    v-for="n in review?.review.darknessLevel"
                    :key="n"
                    icon="fa-solid fa-star"
                    class="text-yellow-300 h-4 w-4"
                />
                <font-awesome-icon
                    v-for="n in (5 - review.review.darknessLevel)"
                    :key="n"
                    icon="fa-solid fa-star"
                    class="h-4 w-4"
                />
            </div>
            <div class="flex items-center">
                <font-awesome-icon 
                    icon="fa-solid fa-route" 
                    class="h-4 w-4 mr-2"
                />
                <p>アクセス：</p>
                <font-awesome-icon
                    v-for="n in review.review.accessLevel"
                    :key="n"
                    icon="fa-solid fa-star"
                    class="text-yellow-300 h-4 w-4"
                />
                <font-awesome-icon
                    v-for="n in (5 - review?.review.accessLevel)"
                    :key="n"
                    icon="fa-solid fa-star"
                    class="h-4 w-4"
                />
            </div>
        </div>
        <!-- 季節 -->
        <div class="flex items-center">
            <font-awesome-icon 
                icon="fa-solid fa-arrows-spin" 
                class="h-4 w-4 mr-2"
            />
            <p>季節：{{ season }}</p>
        </div>
        <!-- 訪問日時 -->
        <div class="flex items-center">
            <font-awesome-icon 
                icon="fa-solid fa-clock" 
                class="h-4 w-4 mr-2"
            />
            <p>訪問日時：{{ formatDate(review.review.visitedDate) }} {{ formatTime(review.review.visitedTime) }}</p>
        </div>
        <!-- 本文 -->
        <div class="text-sm whitespace-pre-wrap break-words leading-relaxed">
            {{ truncatedText }}
            <button
                v-if="shouldTruncate"
                class="text-sky-300 ml-2 hover:underline text-xs"
                @click="showFull = !showFull"
            >
                {{ showFull ? '閉じる' : 'もっと見る' }}
            </button>
        </div>
        <!-- 画像一覧 -->
        <div
            v-if="review?.review.reviewImages"
            class="grid grid-cols-2 gap-2"
        >
            <NuxtImg
                v-for="reviewImage in review.review.reviewImages"
                :key="reviewImage.id"
                :src="`${config.public.r2PublicUrl}/${reviewImage.imagePath}`"
                class="w-full h-24 object-cover rounded-none mb-2"
                @click="onImageClick(reviewImage)"
            />
        </div>
        <!-- good, good数 -->
        <div class="flex items-center mb-1">
            <div class="flex items-center">
                <font-awesome-icon
                    v-if="isGood"
                    icon="fa-solid fa-thumbs-up"
                    class="w-4 h-4 text-yellow-300 mr-0.5"
                    @click="onGoodClicked"
                />
                <font-awesome-icon
                    v-else
                    icon="fa-solid fa-thumbs-up"
                    class="w-4 h-4 mr-0.5 hover:text-yellow-300"
                    @click="onGoodClicked"
                />
                <p class="mr-4">
                    {{ review.goodCount }}
                </p>
            </div>
            <!-- 通報ボタン -->
            <div>
                <font-awesome-icon 
                    icon="fa-solid fa-triangle-exclamation" 
                    class="w-4 h-4 hover:text-yellow-300"
                    @click="onReportClicked"
                />
            </div>
        </div>
    </div>
    <MapUpdateReviewDialog
        v-if="review"
        v-model="isOpenUpdateReviewDialog"
        :review-id="review.review.id"
    />
    <MapReviewReportDialog
        v-if="review"
        v-model="isOpenReviewReportDialog"
        :review-id="review.review.id"
    />
</template>