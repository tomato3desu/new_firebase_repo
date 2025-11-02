<script setup>
import { emit } from 'process'
import { useAuthStore } from '~/composables/stores/auth'
import { useUserStore } from '~/composables/stores/user'

const authStore = useAuthStore()
const userStore = useUserStore()

const props = defineProps({
    review: {
        type: Object,
        required: false,
        default: null
    }
})

const isOpenUpdateReviewDialog = ref(false)

// もっと見る制御
const showFull = ref(false)
const MAX_LENGTH = 120

const shouldTruncate = computed(() => props.review.description.length > MAX_LENGTH)
const truncatedText = computed(() => {
    if (!shouldTruncate.value) return props.review?.description || ''
    return showFull.value
        ? props.review?.description
        : props.review?.description?.slice(0, MAX_LENGTH) + '...'
})

const isEditParmitted = computed(() => authStore.loginUserId === props?.review.createdUserId)

const updateReview = () => {
    isOpenUpdateReviewDialog.value = true
}

const onReviewUpdated = (updatedReview) => {
    Object.assign(props.review, updatedReview)
}

const onReviewDeleted = (reviewId) => {
    
}
</script>

<template>
    <div class="rounded-sm border-b border-gray-300 flex flex-col">
        <!-- ユーザー情報 -->
        <div
            v-if="userStore.usersById[props.review.createdUserId]"
            class="flex items-center justify-between"
        >
            <NuxtImg
                :src=" userStore.usersById[props.review.createdUserId].iconImagePath || '/images/default_user.jpeg'"
                alt="icon"
                class="w-8 h-8 object-cover rounded-sm"
            />
            <p class="text-gray-700 font-medium text-sm truncate">
                {{ userStore.usersById[props.review.createdUserId].nickname }}
            </p>
            <button
                v-if="isEditParmitted"
                :review="props.review" 
                class="text-yellow-300"
                @click="updateReview"
            >
                編集
            </button>
        </div>
        <!-- 確認用ID -->
        <p>{{ props.review.id }}</p>
        <!-- タイトル -->
        <p class="text-base font-semibold text-gray-900 break-words whitespace-pre-wrap">
            {{ props.review.title }}
        </p>
        <!-- 評価 -->
        <div class="text-sm text-gray-600">
            <div class="flex">
                <p>暗さ：</p>
                <font-awesome-icon
                    v-for="n in props.review.darknessLevel"
                    :key="n"
                    icon="fa-solid fa-star"
                    class="text-yellow-400 h-4 w-4"
                />
                <font-awesome-icon
                    v-for="n in (5 - props.review.darknessLevel)"
                    :key="n"
                    icon="fa-solid fa-star"
                    class="text-gray-400 h-4 w-4"
                />
            </div>
            <div class="flex">
                <p>アクセス：</p>
                <font-awesome-icon
                    v-for="n in props.review.accessLevel"
                    :key="n"
                    icon="fa-solid fa-star"
                    class="text-yellow-400 h-4 w-4"
                />
                <font-awesome-icon
                    v-for="n in (5 - props.review.accessLevel)"
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
            v-if="props.review?.reviewImages"
            class="grid grid-cols-2 gap-2"
        >
            <NuxtImg
                v-for="reviewImage in props.review.reviewImages"
                :key="reviewImage.id"
                :src="reviewImage.imagePath"
                alt="review image"
                class="w-full h-24 object-cover rounded-none mb-2"
            />
        </div>
    </div>
    <MapUpdateReviewDialog
        v-model="isOpenUpdateReviewDialog"
        :review="props.review"
        @review-updated="onReviewUpdated"
        @review-deleted="onReviewDeleted"
    />
</template>