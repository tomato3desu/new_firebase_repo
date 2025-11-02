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

        try {
            const res = await $fetch(`${config.public.apiBase}/api/user/${userId}`)
            usersById.value[userId] = res
            fetchedAt.value[userId] = Date.now()
        }
        catch (e) {
            console.error('ユーザー取得エラー:', e)
        }
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
        
        console.log("missingIdsだよ", missingIds)
        try {
            const res = await $fetch(`${config.public.apiBase}/api/user/users`, {
                method: 'POST',
                body: { userIds: missingIds },
            })

            res.forEach((u) => {
                usersById.value[u.id] = u // usersByIdにセット
                fetchedAt.value[u.id] = Date.now() // fetchedAtにセット
            }) 
        }
        catch (e) {
            console.error('複数ユーザー取得エラー:', e)
        }
    }

    /**
     * プロフィール情報をアップデート
     * @param {object} updateInfo 
     * @param {string} token 
     */
    const updateProfile = async (updateInfo, token) => {
        try {
            const res = await $fetch(`${config.public.apiBase}/api/user/updateProfile`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: updateInfo
            })

            usersById.value[res.id] = res // usersByIdを更新
            fetchedAt.value[res.id] = Date.now() // fetchedAtを更新
            console.log(usersById.value[res.id])
        }
        catch (e) {
            console.error("ユーザー情報の更新に失敗しました", e)
        }
    }

    return {
        usersById,
        fetchUserIfNeeded,
        fetchUsersIfNeeded,
        updateProfile
    }
}, {
    persist: true
})