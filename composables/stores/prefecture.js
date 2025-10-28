import { defineStore } from 'pinia'

export const usePrefStore = defineStore('prefStore', () => {
    const config = useRuntimeConfig()
    const prefs = ref([])

    const setAllPrefs = async (force = false) => {
        if (!force && prefs.value.length > 0) return
        try {
            const res = await $fetch(`${config.public.apiBase}/api/prefecture/getAll`, {
                method: 'GET'
            })

            prefs.value = res
        }
        catch (error) {
            const msg = error?.data?.message || '不明なエラー'
            alert(msg)
        }
    }

    return {
        prefs,
        setAllPrefs
    }
}, {
    persist: true
})