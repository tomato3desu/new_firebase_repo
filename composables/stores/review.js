import { defineStore } from 'pinia'

export const useReviewStore = defineStore('reviewStore', () => {
    const config = useRuntimeConfig()

    const reviewsById = ref({}) // key: reviewId, value: { reviewDto }
    const reviewsByPinId = ref({}) // key: pinId, value: [reviewId, reviewId]

    /**
     * ピンが削除されたときにピンに関連するレビューを全削除するメソッド
     * @param {number} pinId 
     */
    const deleteReviewsByPinId = (pinId) => {
        const deleteReviewIds = reviewsByPinId.value[pinId] || []
        delete reviewsByPinId.value[pinId]
        for (const deleteReviewId of deleteReviewIds) {
            delete reviewsById.value[deleteReviewId]
        }
    }

    /**
     * ピンを受け取ってレビュー配列を返す
     * @param {number} pinId 
     * @returns [{reviewDto1}, {reviewDto2}] 
     */
    const getReviewsByPin = async (pinId) => {
        if (reviewsByPinId.value[pinId]) { // キャッシュしてあればそのまま [{reviewDto1}, {reviewDto2}]の形でreturn
            const reviewIds = reviewsByPinId.value[pinId]
            return reviewIds.map(id => reviewsById.value[id])
        }

        const res = await $fetch(`${config.public.apiBase}/api/review/pin/${pinId}`, {
            method: 'GET'
        })

        // reviewsById, reviewsByPinIdにそれぞれセットして [{reviewDto1}, {reviewDto2}]の形でreturn
        let reviewIds = []
        for (const review of res) {
            const reviewId = review.id
            reviewsById.value[reviewId] = review
            reviewIds.push(reviewId)
        }

        reviewsByPinId.value[pinId] = reviewIds
        
        return reviewIds.map(id => reviewsById.value[id])
    }

    /**
     * レビューを追加するメソッド
     * @param {object} reviewInfo 
     * @param {string} token (firebase authのjwt token)
     * @returns 追加したレビュー
     */
    const addReview = async (reviewInfo, token) => {
        const res = await $fetch(`${config.public.apiBase}/api/review/add`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: reviewInfo
        })

        const pinId = res.reviewedPinId
        const reviewId = res.id

        if (!reviewsByPinId.value[pinId]) {
            reviewsByPinId.value[pinId] = []
        }
        reviewsByPinId.value[pinId].push(reviewId)
        reviewsById.value[reviewId] = res

        return res
    }

    /**
     * レビューをアップデートするメソッド
     * @param {object} reviewInfo 
     * @param {*} token (firebase authのjwt token)
     * @returns 
     */
    const updateReview = async (reviewInfo, token) => {
        const res = await $fetch(`${config.public.apiBase}/api/review/update`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: reviewInfo
        })

        reviewsById.value[res.id] = res

        return res
    }

    /**
     * レビューを削除
     * @param {number} reviewId 
     * @param {string} token (firebase authのjwt token)
     * @returns 削除後レビュー
     */
    const deleteReview = async (reviewId, token) => {
        await $fetch(`${config.public.apiBase}/api/review/delete/${reviewId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        })

        // ローカルから削除
        const review = reviewsById.value[reviewId]
        // if (!review) return

        const pinId = review.reviewedPinId
        reviewsByPinId.value[pinId] = reviewsByPinId.value[pinId]?.filter(id => id !== reviewId) || []
        delete reviewsById.value[reviewId]

        return review
    }

    return {
        reviewsById,
        reviewsByPinId,
        deleteReviewsByPinId,
        getReviewsByPin,
        addReview,
        updateReview,
        deleteReview
    }
}, {
    persist: true
})