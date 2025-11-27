<script setup>
import { useAuthStore } from '~/composables/stores/auth'
import { useReportStore } from '~/composables/stores/report'
import { useReviewStore } from '~/composables/stores/review'
import { ref as storageRef, deleteObject } from 'firebase/storage'

const authStore = useAuthStore()
const reportStore = useReportStore()
const reviewStore = useReviewStore()

const { $storage } = useNuxtApp()

const user = computed(() => authStore.loginUser)
const isDisplayPermitted = computed(() => user.value.role === 'admin')

const reportIds = computed(() => reportStore.disPlayReportsId || [])

const reviewIds = computed(() => {
    const ids = reportIds.value.map(id => reportStore.ReviewReportsById[id].reviewId)
    return [...new Set(ids)]
})

const selectedReviewId = ref(null)
const selectedReportId = ref(null)

const showReview = (reviewId, reportId) => {
    selectedReviewId.value = reviewId
    selectedReportId.value = reportId
}

const close = () => {
    selectedReviewId.value = null
    selectedReportId.value = null
}

/**
 * レビューを削除
 */
const deleteReview = async () => {
    const isConfirm = window.confirm("本当に削除しますか？")
    if (isConfirm) {
        const token = await authStore.getIdToken()
        const deletedReview = await reviewStore.deleteReview(selectedReviewId.value, token)
        reportStore.disPlayReportsId = reportStore.disPlayReportsId.filter((id) => id !== selectedReportId.value)
        close()

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
    await reportStore.fetchPendingReports(token)
    console.log(reviewIds.value)
    await reviewStore.fetchReviewsByIds(reviewIds.value)
})
</script>

<template>
    <div v-if="isDisplayPermitted">
        <div>
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
                        v-for="reportId of reportIds"
                        :key="reportId"
                    >
                        <td class="py-2 px-4">
                            {{ reportStore.ReviewReportsById[reportId].id }}
                        </td>
                        <td class="py-2 px-4">
                            {{ reportStore.ReviewReportsById[reportId].reporterId }}
                        </td>
                        <td class="py-2 px-4">
                            {{ reportStore.ReviewReportsById[reportId].reviewId }}
                        </td>
                        <td class="py-2 px-4">
                            {{ reportStore.ReviewReportsById[reportId].status }}
                        </td>
                        <td class="py-2 px-4">
                            {{ reportStore.ReviewReportsById[reportId].createdAt }}
                        </td>
                        <td class="py-2 px-4">
                            {{ reportStore.ReviewReportsById[reportId].reason }}
                        </td>
                        <td class="py-2 px-4">
                            {{ reportStore.ReviewReportsById[reportId].comment }}
                        </td>
                        <td class="py-2 px-4 text-sky-500">
                            <button @click="showReview(reportStore.ReviewReportsById[reportId].reviewId, reportId)">
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
                        @click="close"
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