import { defineStore } from 'pinia'
import { usePinStore } from './pin'

export const useReviewStore = defineStore('reviewStore', () => {
    const config = useRuntimeConfig()
    const pinStore = usePinStore()

    const reviewsById = ref({}) // key: reviewId, value: { reviewDto }
    const reviewsByPinId = ref({}) // key: pinId, value: [reviewId, reviewId]
    const fetchedAt = ref({}) // key: revewId, value: datetime

    /**
     * キャッシュの期限を判定するメソッド
     * @param {number} userId 
     * @returns boolean 期限切れ：true 期限内：false
     */
    const judgeExpired = (userId) => {
        const lastFetched = fetchedAt.value[userId]
        const isExpired = !lastFetched || (Date.now() - lastFetched > 5 * 60 * 1000) // 5分経過
        return isExpired
    }

    /**
     * ピンが削除されたときにピンに関連するレビューを全削除するメソッド
     * @param {number} pinId 
     */
    const deleteReviewsByPinId = (pinId) => {
        const deleteReviewIds = reviewsByPinId.value[pinId] || []
        delete reviewsByPinId.value[pinId]
        for (const deleteReviewId of deleteReviewIds) {
            delete reviewsById.value[deleteReviewId]
            delete fetchedAt.value[deleteReviewId]
        }
    }

    /**
     * ピンを受け取ってレビュー配列を返す
     * @param {number} pinId 
     * @returns [{reviewDto1}, {reviewDto2}] 
     */
    const getReviewsByPin = async (pinId) => {
        const reviewIds = reviewsByPinId.value[pinId]

        const hasCache = reviewIds && reviewIds.length > 0 // キャッシュがあるか

        const hasExpired = hasCache && reviewIds.some(id => judgeExpired(id)) // キャッシュ内のレビューが一つでも期限切れなら再取得

        // キャッシュがあり、すべて期限内ならキャッシュ利用
        if (hasCache && !hasExpired) {
            return reviewIds.map(id => reviewsById.value[id])
        }

        const res = await $fetch(`${config.public.apiBase}/api/review/pin/${pinId}`, {
            method: 'GET'
        })

        // reviewsById, reviewsByPinIdにそれぞれセットして [{reviewDto1}, {reviewDto2}]の形でreturn
        const newReviewIds = []
        for (const review of res) {
            const reviewId = review.review.id
            reviewsById.value[reviewId] = review
            fetchedAt.value[reviewId] = Date.now()
            newReviewIds.push(reviewId)
        }

        reviewsByPinId.value[pinId] = newReviewIds

        return newReviewIds.map(id => reviewsById.value[id])
    }

    /**
     * reviewIdsからreviewをfetchしてセットする
     * @param {*} reviewIds 
     * @returns 
     */
    const fetchReviewsByIds = async (reviewIds) => {
        let missCashe = false
        for (const reviewId of reviewIds) {
            const hasCache = reviewsById.value[reviewId] ?? false
            if (!hasCache) {
                missCashe = true
                break
            }
        }

        const hasExpired = reviewIds.some(id => judgeExpired(id))
        if (!missCashe && !hasExpired) return

        const res = await $fetch(`${config.public.apiBase}/api/review/fetch/ids`, {
            method: 'POST',
            body: reviewIds
        })

        for (const review of res) {
            const reviewId = review.review.id
            reviewsById.value[reviewId] = review
            fetchedAt.value[reviewId] = Date.now()
        }
    }

    /**
     * レビューを追加するメソッド
     * @param {object} reviewInfo 
     * @param {string} token (firebase authのjwt token)
     * @returns 追加したレビュー
     */
    const addReview = async (reviewInfo, token) => {
        const formData = new FormData()
        formData.append('reviewedPinId', reviewInfo.reviewedPinId)
        formData.append('title', reviewInfo.title)
        formData.append('description', reviewInfo.description)
        formData.append('darknessLevel', reviewInfo.darknessLevel)
        formData.append('accessLevel', reviewInfo.accessLevel)
        formData.append('season', reviewInfo.season)
        formData.append('visitedDate', reviewInfo.visitedDate)
        formData.append('visitedTime', reviewInfo.visitedTime)

        if (reviewInfo.reviewImages && Array.isArray(reviewInfo.reviewImages)) {
            reviewInfo.reviewImages.forEach(file => {
                formData.append('reviewImages', file)
            })
        }

        const res = await $fetch(`${config.public.apiBase}/api/review/add`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData
        })

        const pinId = res.review.reviewedPinId
        const reviewId = res.review.id

        if (!reviewsByPinId.value[pinId]) {
            reviewsByPinId.value[pinId] = []
        }
        reviewsByPinId.value[pinId].push(reviewId)
        reviewsById.value[reviewId] = res
        fetchedAt.value[reviewId] = Date.now()

        await pinStore.refreshPin(pinId) // pin情報を更新

        return res
    }

    /**
     * レビューをアップデートするメソッド
     * @param {object} reviewInfo 
     * @param {*} token (firebase authのjwt token)
     * @returns 
     */
    const updateReview = async (reviewInfo, token) => {
        const formData = new FormData()
        formData.append('reviewId', reviewInfo.reviewId)
        formData.append('title', reviewInfo.title)
        formData.append('description', reviewInfo.description)
        formData.append('darknessLevel', reviewInfo.darknessLevel)
        formData.append('accessLevel', reviewInfo.accessLevel)
        formData.append('season', reviewInfo.season)
        formData.append('visitedDate', reviewInfo.visitedDate)
        formData.append('visitedTime', reviewInfo.visitedTime)

        if (reviewInfo.reviewImages && Array.isArray(reviewInfo.reviewImages)) {
            reviewInfo.reviewImages.forEach(file => {
                formData.append('reviewImages', file)
            })
        }

        if (reviewInfo.deleteReviewImages && Array.isArray(reviewInfo.deleteReviewImages)) {
            reviewInfo.deleteReviewImages.forEach(id => {
                formData.append('deleteReviewImageIds', id)
            })
        }

        const res = await $fetch(`${config.public.apiBase}/api/review/update`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: formData
        })

        const reviewId = res.review.id
        reviewsById.value[reviewId] = res
        fetchedAt.value[reviewId] = Date.now()

        await pinStore.refreshPin(res.review.reviewedPinId) // pin情報を更新

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

        // キャッシュから削除
        const review = reviewsById.value[reviewId]

        const pinId = review.review.reviewedPinId
        reviewsByPinId.value[pinId] = reviewsByPinId.value[pinId]?.filter(id => id !== reviewId) || []
        delete reviewsById.value[reviewId]
        delete fetchedAt.value[reviewId]

        await pinStore.refreshPin(pinId) // pin情報を更新

        return review
    }

    /**
     * 
     * @param {number} reviewId 
     */
    const refreshReview = async (reviewId) => {
        const res = await $fetch(`${config.public.apiBase}/api/review/${reviewId}`, {
            method: 'GET'
        })

        reviewsById.value[reviewId] = res
        fetchedAt.value[reviewId] = Date.now()
    }

    return {
        reviewsById,
        reviewsByPinId,
        deleteReviewsByPinId,
        getReviewsByPin,
        fetchReviewsByIds,
        addReview,
        updateReview,
        deleteReview,
        refreshReview
    }
}, {
    persist: false
})