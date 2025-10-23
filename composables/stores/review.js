import { defineStore } from 'pinia'

export const useReviewStore = defineStore('reviewStore', () => {
    const reviewsByPinId = ref({}) // key: pinId, value: {review}

    const getReviewsByPin = async (pinId, force = false) => {
        if (!force && reviewsByPinId.value[pinId]) return // 明示的にforce = trueを指定しない場合、初回以外はfetchしない
        const res = await $fetch(`http://localhost:8080/api/review/pin/${pinId}`)
        reviewsByPinId.value[pinId] = res
    }

    const addReview = async (reviewInfo, token) => {
        const res = await $fetch('http://localhost:8080/api/review/add', {
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
        getReviewsByPin,
        addReview
    }
})