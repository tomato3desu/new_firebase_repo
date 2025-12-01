<script setup>
import { useAuthStore } from '~/composables/stores/auth'
import { useReportStore } from '~/composables/stores/report'
import { useReviewStore } from '~/composables/stores/review'
import { useUserStore } from '~/composables/stores/user'
import { ref as storageRef, deleteObject } from 'firebase/storage'

definePageMeta({
    middleware: 'admin'
})

const authStore = useAuthStore()
const reportStore = useReportStore()
const reviewStore = useReviewStore()
const userStore = useUserStore()

const { $storage } = useNuxtApp()

const user = computed(() => authStore.loginUser)
const isDisplayPermitted = computed(() => user.value.role === 'admin')

const userReportIds = computed(() => reportStore.displayUserReportsId || [])
const reviewReportIds = computed(() => reportStore.displayReviewReportsId || [])

// reportIdからuserIdを特定
const userIds = computed(() => {
    const ids = userReportIds.value.map(id => reportStore.userReportsById[id])
    return [...new Set(ids)]
})

// reportIdからreviewIdを特定
const reviewIds = computed(() => {
    const ids = reviewReportIds.value.map(id => reportStore.reviewReportsById[id].reviewId)
    return [...new Set(ids)]
})

const selectedUserId = ref(null)
const selectedUser = ref(null)
const selectedReviewId = ref(null)
const selectedReviewReportId = ref(null)

const showUser = async (reportId) => {
    const userId = reportStore.userReportsById[reportId].userId
    selectedUserId.value = userId
    await userStore.fetchUserIfNeeded(userId)
    selectedUser.value = userStore.usersById[userId]
}

const closeUser = () => {
    selectedUserId.value = null
    selectedUser.value = null
}

const showReview = (reviewId, reportId) => {
    selectedReviewId.value = reviewId
    selectedReviewReportId.value = reportId
}

const closeReview = () => {
    selectedReviewId.value = null
    selectedReviewReportId.value = null
}

const banUser = async () => {
    const isConfirm = window.confirm("本当にBANしますか？")
    if (isConfirm) {
        const token = await authStore.getIdToken()
        const bannedUser = selectedUser.value
        await reportStore.banUser(bannedUser.id, token)
        closeUser()
    }
}

/**
 * レビューを削除
 */
const deleteReview = async () => {
    const isConfirm = window.confirm("本当に削除しますか？")
    if (isConfirm) {
        const token = await authStore.getIdToken()
        const deletedReview = await reviewStore.deleteReview(selectedReviewId.value, token)
        reportStore.displayReviewReportsId = reportStore.displayReviewReportsId.filter((id) => id !== selectedReviewReportId.value)
        closeReview()

        // 画像を削除
        for (const reviewImage of deletedReview.review.reviewImages) {
            const reviewImagePath = extractPathFromUrl(reviewImage.imagePath)
            deleteFromStorage(reviewImagePath)
        }
    }
}

/**
 * 
 * @param path ストレージから削除
 */
const deleteFromStorage = async (path) => {
    try {
        const oldRef = storageRef($storage, path)
        await deleteObject(oldRef)
        console.log("古い画像の削除に成功", oldRef)
    }
    catch (error) {
        console.log("古い画像の削除に失敗", error)
    }
}

/**
 * url解析
 * @param url 
 */
const extractPathFromUrl = (url) => {
    try {
        const decoded = decodeURIComponent(url)
        const start = decoded.indexOf('/o/') + 3
        const end = decoded.indexOf('?')
        return decoded.substring(start, end)
    }
    catch (e) {
        console.warn('URL解析失敗:', e)
        return null
    }
}

onMounted(async () => {
    const token = await authStore.getIdToken()
    await reportStore.fetchPendingUserReports(token)
    console.log(userIds.value)
    await reportStore.fetchPendingReviewReports(token)
    console.log(reviewIds.value)
    await reviewStore.fetchReviewsByIds(reviewIds.value)
})
</script>

<template>
    <div v-if="isDisplayPermitted">
        <!-- user -->
        <div>
            <p class="text-3xl p-4 m-4">
                ユーザー通報
            </p>
            <table class="min-w-full bg-white shadow rounded-lg overflow-hidden">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="py-3 px-4 text-left">
                            id
                        </th>
                        <th class="py-3 px-4 text-left">
                            reporterId
                        </th>
                        <th class="py-3 px-4 text-left">
                            userId
                        </th>
                        <th class="py-3 px-4 text-left">
                            status
                        </th>
                        <th class="py-3 px-4 text-left">
                            createdAt
                        </th>
                        <th class="py-3 px-4 text-left">
                            reason
                        </th>
                        <th class="py-3 px-4 text-left break-words">
                            comment
                        </th>
                        <th class="py-3 px-4 text-left" />
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="reportId of userReportIds"
                        :key="reportId"
                    >
                        <td class="py-2 px-4">
                            {{ reportStore.userReportsById[reportId].id }}
                        </td>
                        <td class="py-2 px-4">
                            {{ reportStore.userReportsById[reportId].reporterId }}
                        </td>
                        <td class="py-2 px-4">
                            {{ reportStore.userReportsById[reportId].userId }}
                        </td>
                        <td class="py-2 px-4">
                            {{ reportStore.userReportsById[reportId].status }}
                        </td>
                        <td class="py-2 px-4">
                            {{ reportStore.userReportsById[reportId].createdAt }}
                        </td>
                        <td class="py-2 px-4">
                            {{ reportStore.userReportsById[reportId].reason }}
                        </td>
                        <td class="py-2 px-4">
                            {{ reportStore.userReportsById[reportId].comment }}
                        </td>
                        <td class="py-2 px-4 text-sky-500">
                            <button @click="showUser(reportId)">
                                showUser
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div
            v-if="selectedUser"
            class="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
        >
            <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6 max-h-[80vh] overflow-y-auto">
                <ProfileEdit
                    :user="selectedUser"
                />
                <div class="flex gap-4">
                    <button
                        class="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 transition"
                        @click="closeUser"
                    >
                        閉じる
                    </button>
                    <button
                        class="px-4 py-2 rounded bg-red-500 hover:bg-gray-600 transition"
                        @click="banUser"
                    >
                        アカウント停止
                    </button>
                </div>
            </div>
        </div>
        <!-- review -->
        <div>
            <p class="text-3xl p-4 m-4">
                レビュー通報
            </p>
            <table class="min-w-full bg-white shadow rounded-lg overflow-hidden">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="py-3 px-4 text-left">
                            id
                        </th>
                        <th class="py-3 px-4 text-left">
                            reporterId
                        </th>
                        <th class="py-3 px-4 text-left">
                            reviewId
                        </th>
                        <th class="py-3 px-4 text-left">
                            status
                        </th>
                        <th class="py-3 px-4 text-left">
                            createdAt
                        </th>
                        <th class="py-3 px-4 text-left">
                            reason
                        </th>
                        <th class="py-3 px-4 text-left break-words">
                            comment
                        </th>
                        <th class="py-3 px-4 text-left" />
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="reportId of reviewReportIds"
                        :key="reportId"
                    >
                        <td class="py-2 px-4">
                            {{ reportStore.reviewReportsById[reportId].id }}
                        </td>
                        <td class="py-2 px-4">
                            {{ reportStore.reviewReportsById[reportId].reporterId }}
                        </td>
                        <td class="py-2 px-4">
                            {{ reportStore.reviewReportsById[reportId].reviewId }}
                        </td>
                        <td class="py-2 px-4">
                            {{ reportStore.reviewReportsById[reportId].status }}
                        </td>
                        <td class="py-2 px-4">
                            {{ reportStore.reviewReportsById[reportId].createdAt }}
                        </td>
                        <td class="py-2 px-4">
                            {{ reportStore.reviewReportsById[reportId].reason }}
                        </td>
                        <td class="py-2 px-4">
                            {{ reportStore.reviewReportsById[reportId].comment }}
                        </td>
                        <td class="py-2 px-4 text-sky-500">
                            <button @click="showReview(reportStore.reviewReportsById[reportId].reviewId, reportId)">
                                showReview
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div
            v-if="selectedReviewId"
            class="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
        >
            <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6 max-h-[80vh] overflow-y-auto">
                <MapPinReviewCard
                    :review-id="selectedReviewId"
                />
                <div class="flex gap-4">
                    <button
                        class="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 transition"
                        @click="closeReview"
                    >
                        閉じる
                    </button>
                    <button
                        class="px-4 py-2 rounded bg-red-500 hover:bg-gray-600 transition"
                        @click="deleteReview"
                    >
                        削除
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>