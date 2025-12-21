import { defineStore } from 'pinia'

export const useUserStore = defineStore('userStore', () => {
    const config = useRuntimeConfig()
    const usersById = ref({}) // key: userId, value: {userDto}
    const fetchedAt = ref({}) // key: userId, value: datetime

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
     * ユーザーがキャッシュされていなければ&古く(五分以上経過)なければusersByIdにセットする
     * @param {number} userId 
     * @returns 
     */
    const fetchUserIfNeeded = async (userId) => {
        const isExpired = judgeExpired(userId)
        if (usersById.value[userId] && !isExpired) return // キャッシュされいる＆期限切れでなければ即レス

        const res = await $fetch(`${config.public.apiBase}/api/user/${userId}`)
        usersById.value[userId] = res
        fetchedAt.value[userId] = Date.now()
    }

    /**
     * まとめてユーザー情報を取ってくる
     * @param {number[]} userIds 
     * @returns 
     */
    const fetchUsersIfNeeded = async (userIds) => {
        let missingIds = userIds.filter((id) => id && !usersById.value[id]) // usersByIdにないIDのみをフィルター
        missingIds = missingIds.filter((id) => judgeExpired(id)) // 期限切れのIDのみ残す
        if (missingIds.length === 0) return // IDが残ってないなら即レス

        const res = await $fetch(`${config.public.apiBase}/api/user/users`, {
            method: 'POST',
            body: { userIds: missingIds },
        })

        res.forEach((u) => {
            usersById.value[u.id] = u // usersByIdにセット
            fetchedAt.value[u.id] = Date.now() // fetchedAtにセット
        })
    }

    return {
        usersById,
        fetchUserIfNeeded,
        fetchUsersIfNeeded,
    }
}, {
    persist: false
})