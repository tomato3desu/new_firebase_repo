import { defineStore } from 'pinia'

export const useUserStore = defineStore('userStore', () => {
    const config = useRuntimeConfig()
    const usersById = ref({}) // key: userId, value: {userDto}

    /**
     * ユーザーがキャッシュされていなければusersByIdにセットする
     * @param {number} userId 
     * @returns 
     */
    const fetchUserIfNeeded = async (userId) => {
        if (usersById.value[userId]) return // キャッシュされていれば即レス

        try {
            const res = await $fetch(`${config.public.apiBase}/api/user/${userId}`)
            usersById.value[userId] = res
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
        const missingIds = userIds.filter((id) => id && !usersById.value[id]) // usersByIdにないIDのみをフィルター
        if (missingIds === null || missingIds.length === 0) return // ないなら即レス
        
        console.log("missingIdsだよ", missingIds)
        try {
            const res = await $fetch(`${config.public.apiBase}/api/user/users`, {
                method: 'POST',
                body: { userIds: missingIds },
            })
            res.forEach((u) => (usersById.value[u.id] = u)) // usersByIdにセット
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