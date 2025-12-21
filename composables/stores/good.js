import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import { useReviewStore } from './review'

export const useGoodStore = defineStore('goodStore', () => {
    const config = useRuntimeConfig()
    const authStore = useAuthStore()
    const reviewStore = useReviewStore()

    const myGoodReviews = ref([]) // ログインユーザーがいいねしたレビューID

    /**
     * ログインユーザーがgoodしたレビューのidを取得してmyGoodReviewsに格納
     * @returns 
     */
    const fetchMyGoodReviews = async () => {
        if (!authStore.isLoggedIn) return

        const token = await authStore.getIdToken()

        const res = await $fetch(`${config.public.apiBase}/api/good/reviews`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        myGoodReviews.value = res
    }

    /**
     * いいねを登録、削除する関数
     * @param {number} reviewId 
     * return
     */
    const toggleGood = async (reviewId) => {
        if (!authStore.isLoggedIn) {
            alert('ログインしてください')
            return
        }

        const token = await authStore.getIdToken()
        const isAlreadyGood = myGoodReviews.value.includes(reviewId)
        if (isAlreadyGood) {
            myGoodReviews.value = myGoodReviews.value.filter((id) => id !== reviewId)
        }
        else {
            myGoodReviews.value.push(reviewId)
        }

        try {
            await $fetch(`${config.public.apiBase}/api/good/toggle/${reviewId}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            await reviewStore.refreshReview(reviewId)
        }
        catch (error) {
            // ロールバック
            if (isAlreadyGood) {
                myGoodReviews.value.push(reviewId)
            }
            else {
                myGoodReviews.value = myGoodReviews.value.filter((id) => id !== reviewId)
            }

            throw error
        }
    }

    return {
        myGoodReviews,
        toggleGood,
        fetchMyGoodReviews
    }
}, {
    persist: true
})