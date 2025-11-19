<script setup>
import { useAuthStore } from '~/composables/stores/auth'
import { useGoodStore } from '~/composables/stores/good'
import { useReviewStore } from '~/composables/stores/review'
import { useUserStore } from '~/composables/stores/user'

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

const isOpenUpdateReviewDialog = ref(false)

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

const isEditParmitted = computed(() => { // ログインユーザー＝ピン作成者ならtrue
    const user = authStore.loginUser
    const r = review.value.review
    if (!user || !user.id || !r) return false
    return user.id === r.createdUserId
})
const updateReview = () => {
    isOpenUpdateReviewDialog.value = true
}

const onGoodClicked = async () => {
    const reviewId = review.value.review.id
    await goodStore.toggleGood(reviewId)
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
</script>

<template>
    <div class="rounded-sm border-b border-gray-300 flex flex-col">
        <!-- ユーザー情報 -->
        <div
            v-if="userStore.usersById[review.review.createdUserId]"
            class="flex items-center justify-between"
        >
            <NuxtImg
                :src=" userStore.usersById[review.review.createdUserId].iconImagePath || '/images/default_user.jpeg'"
                alt="icon"
                class="w-8 h-8 object-cover rounded-sm"
            />
            <p class="text-gray-700 font-medium text-sm truncate">
                {{ userStore.usersById[review.review.createdUserId].nickname }}
            </p>
            <button
                v-if="isEditParmitted"
                :review="review" 
                class="text-yellow-300"
                @click="updateReview"
            >
                編集
            </button>
        </div>
        <!-- 確認用ID -->
        <p>{{ review.review.id }}</p>
        <!-- タイトル -->
        <p class="text-base font-semibold text-gray-900 break-words whitespace-pre-wrap">
            {{ review.review.title }}
        </p>
        <!-- 評価 -->
        <div class="text-sm text-gray-600">
            <div class="flex">
                <p>暗さ：</p>
                <font-awesome-icon
                    v-for="n in review.review.darknessLevel"
                    :key="n"
                    icon="fa-solid fa-star"
                    class="text-yellow-400 h-4 w-4"
                />
                <font-awesome-icon
                    v-for="n in (5 - review.review.darknessLevel)"
                    :key="n"
                    icon="fa-solid fa-star"
                    class="text-gray-400 h-4 w-4"
                />
            </div>
            <div class="flex">
                <p>アクセス：</p>
                <font-awesome-icon
                    v-for="n in review.review.accessLevel"
                    :key="n"
                    icon="fa-solid fa-star"
                    class="text-yellow-400 h-4 w-4"
                />
                <font-awesome-icon
                    v-for="n in (5 - review.review.accessLevel)"
                    :key="n"
                    icon="fa-solid fa-star"
                    class="text-gray-400 h-4 w-4"
                />
            </div>
        </div>
        <!-- 本文 -->
        <div class="text-gray-700 text-sm whitespace-pre-wrap break-words leading-relaxed">
            {{ truncatedText }}
            <button
                v-if="shouldTruncate"
                class="text-sky-500 ml-2 hover:underline text-xs"
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
                :src="reviewImage.imagePath"
                alt="review image"
                class="w-full h-24 object-cover rounded-none mb-2"
                @click="onImageClick(reviewImage)"
            />
        </div>
        <!-- good, good数 -->
        <div class="flex">
            <font-awesome-icon
                v-if="isGood"
                icon="fa-solid fa-thumbs-up"
                class="w-4 h-4 text-gray-700"
                @click="onGoodClicked"
            />
            <font-awesome-icon
                v-else
                icon="fa-solid fa-thumbs-up"
                class="w-4 h-4 text-gray-300"
                @click="onGoodClicked"
            />
            <p>{{ review.goodCount }}</p>
        </div>
    </div>
    <MapUpdateReviewDialog
        v-model="isOpenUpdateReviewDialog"
        :review-id="review.review.id"
    />
</template>