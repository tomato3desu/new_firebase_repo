import { defineStore } from 'pinia'

export const usePrefStore = defineStore('prefStore', () => {
    const config = useRuntimeConfig()
    const prefsById = ref({}) // key: prefId value: [prefDto]

    const findByprefId = (prefId) => {
        const pref = prefsById.value[prefId]
        return pref
    }

    const setAllPrefs = async (force = false) => {
        if (!force && Object.keys(prefsById.value).length > 0) return
        try {
            const res = await $fetch(`${config.public.apiBase}/api/prefecture/getAll`, {
                method: 'GET'
            })

            // TODO 受け取ったprefsをprefByIdにループして挿入
            for(const pref of res){
                prefsById.value[pref.id] = pref
            }
        }
        catch (error) {
            const msg = error?.data?.message || '不明なエラー'
            alert(msg)
        }
    }

    return {
        prefsById,
        findByprefId,
        setAllPrefs
    }
}, {
    persist: true
})