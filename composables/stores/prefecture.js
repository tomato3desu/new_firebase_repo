import { defineStore } from 'pinia'

export const usePrefStore = defineStore('prefStore', () => {
    const config = useRuntimeConfig()
    const prefsById = ref({}) // key: prefId value: [prefDto]

    /**
     * キャッシュ済みの都道府県情報を返す
     * @param {number} prefId 
     * @returns 都道府県情報
     */
    const findByprefId = (prefId) => {
        const pref = prefsById.value[prefId]
        return pref
    }

    /**
     * prefNameから逆引き
     * @param {string} name 
     * @returns prefId
     */
    const findPrefIdByName = (name) => {
        const entry = Object.entries(prefsById.value).find(([id, pref]) => pref.name === name)
        return entry ? Number(entry[0]) : null
    }

    /**
     * 都道府県情報をセットする
     * @param {boolean} force 
     * @returns 
     */
    const setAllPrefs = async (force = false) => {
        if (!force && Object.keys(prefsById.value).length > 0) return // 明示的にforce = trueされておらず、キャッシュされていれば即レス
        try {
            const res = await $fetch(`${config.public.apiBase}/api/prefecture/getAll`, {
                method: 'GET'
            })

            // TODO 受け取ったprefsをprefByIdにループして挿入
            for (const pref of res) {
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
        setAllPrefs,
        findPrefIdByName
    }
}, {
    persist: true
})