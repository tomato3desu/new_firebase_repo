import { defineStore } from 'pinia'

export const useUserStore = defineStore('userStore', () => {
    const config = useRuntimeConfig()
    const usersById = ref({}) // key: userId, value: {userDto}

    // 単一ユーザー用
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

    // 複数ユーザー用
    const fetchUsersIfNeeded = async (userIds) => {
        const missingIds = userIds.filter((id) => id && !usersById.value[id])
        if (missingIds.length === 0) return
        
        try {
            const res = await $fetch(`${config.public.apiBase}/api/users`, {
                method: 'GET',
                body: { ids: missingIds },
            })
            res.forEach((u) => (usersById.value[u.id] = u))
        }
        catch (e) {
            console.error('複数ユーザー取得エラー:', e)
        }
    }

    const updateProfile = async (updateInfo, token) => {
        try {
            const res = await $fetch(`${config.public.apiBase}/api/user/updateProfile`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: updateInfo
            })

            usersById.value[res.id] = res
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