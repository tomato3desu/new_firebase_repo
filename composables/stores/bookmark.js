import { defineStore } from "pinia"
import { useAuthStore } from "./auth"
import { usePinStore } from "./pin"

export const useBookmarkStore = defineStore('bookmarkStore', () => {
    const config = useRuntimeConfig()
    const authStore = useAuthStore()
    const pinStore = usePinStore()

    const bookmarkedPinsByUserId = ref({}) // key: userId, value: [pinId1, pinId2]
    const mybookmarkedPinIds = computed(() => { // ログインユーザーのブックマーク
        const user = authStore.loginUser
        if (!user || !user.id) return []
        return bookmarkedPinsByUserId.value[user.id] || []
    })

    /**
     * userIdからブックマークしたピンをget
     * @param {number} userId 
     * @returns 
     */
    const fetchBookmarksByUserId = async (userId) => {
        if (!userId) return
        try {
            const res = await $fetch(`${config.public.apiBase}/api/bookmark/pins/${userId}`, {
                method: 'GET'
            })
            // res: [ { pinId: 1 }, { pinId: 2 } ... ]
            bookmarkedPinsByUserId.value[userId] = res.map(r => r.pinId)
        }
        catch (e) {
            console.error('Failed to fetch bookmarks:', e)
        }
    }

    const toggleBookmark = async (pinId) => {
        if (!authStore.isLoggedIn) {
            alert('ログインしてください')
            return
        }

        const token = await authStore.getIdToken()
        const userId = authStore.loginUser.id
        const currentList = bookmarkedPinsByUserId.value[userId] || []
        const isBookmarked = currentList.includes(pinId)

        // 即時UI反映
        if (isBookmarked) {
            bookmarkedPinsByUserId.value[userId] = currentList.filter(id => id !== pinId)
        }
        else {
            bookmarkedPinsByUserId.value[userId] = [...currentList, pinId]
        }

        try {
            await $fetch(`${config.public.apiBase}/api/bookmark/toggle/${pinId}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            await pinStore.refreshPin(pinId) // pin情報を更新
        }
        catch (e) {
            console.error('Toggle bookmark failed:', e)
            // エラー時ロールバック
            if (isBookmarked) {
                bookmarkedPinsByUserId.value[userId] = [...currentList, pinId]
            }
            else {
                bookmarkedPinsByUserId.value[userId] = currentList.filter(id => id !== pinId)
            }
        }
    }

    const isBookmarkedByMe = (pinId) => {
        return mybookmarkedPinIds.value.includes(pinId)
    }

    return {
        bookmarkedPinsByUserId,
        mybookmarkedPinIds,
        fetchBookmarksByUserId,
        toggleBookmark,
        isBookmarkedByMe
    }
}, {
    persist: true
})