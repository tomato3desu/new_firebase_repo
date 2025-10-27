import { defineStore } from 'pinia'

export const useReviewStore = defineStore('reviewStore', () => {
    const config = useRuntimeConfig()

    const reviewsByPinId = ref({}) // key: pinId, value: [reviews]

    // pinが削除されたときpinが保持するreviewをすべて削除するためのメソッド
    const deleteReviewsByPinId = (pinId) => delete reviewsByPinId.value[pinId]

    const getReviewsByPin = async (pinId, force = false) => {
        if (!force && reviewsByPinId.value[pinId]) { // 明示的にforce = trueを指定しない場合、初回以外はfetchしない
            return reviewsByPinId.value[pinId]
        } 

        try {
            const res = await $fetch(`${config.public.apiBase}/api/review/pin/${pinId}`)
            reviewsByPinId.value[pinId] = Array.isArray(res) ? res : []
        }
        catch (e) {
            console.error('レビュー取得エラー', e)
            reviewsByPinId.value[pinId] = []
        }

        return reviewsByPinId.value[pinId]
    }

    const addReview = async (reviewInfo, token) => {
        const res = await $fetch(`${config.public.apiBase}/api/review/add`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: reviewInfo
        })

        const pinId = reviewInfo.reviewedPinId
        if (!reviewsByPinId.value[pinId]) reviewsByPinId.value[pinId] = []
        reviewsByPinId.value[pinId].push(res)

        return res
    }

    return {
        reviewsByPinId,
        deleteReviewsByPinId,
        getReviewsByPin,
        addReview,
    }
})