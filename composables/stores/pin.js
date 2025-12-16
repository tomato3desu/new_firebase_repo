import { defineStore } from "pinia"

export const usePinStore = defineStore('pinStore', () => {
    const config = useRuntimeConfig()
    const pinsById = ref({}) // key: pinId value: { pinDto }
    const fetchedAt = ref({}) // key: pinId value: datetime
    const displayPinsId = ref([]) // 表示するpinのid

    const bookmarkRanking = ref([])
    const darknessRanking = ref([])
    const accessRanking = ref([])

    /**
     * キャッシュの期限を判定するメソッド
     * @param {number} pinId
     * @returns boolean 期限切れ：true 期限内：false
     */
    const judgeExpired = (pinId) => {
        const lastFetched = fetchedAt.value[pinId]
        const isExpired = !lastFetched || (Date.now() - lastFetched > 5 * 60 * 1000) // 5分経過
        return isExpired
    }

    /**
     * 全ピンを取得しpinsByIdに格納する
     */
    const getAllPins = async () => {
        try {
            const res = await $fetch(`${config.public.apiBase}/api/pin/getAllPins`, {
                method: 'GET'
            })

            pinsById.value = {}
            fetchedAt.value = {}
            // displayPinsId.value = [] // 削除: displayPinsIdの初期化を行わない
            for (const pin of res) {
                pinsById.value[pin.id] = pin
                fetchedAt.value[pin.id] = Date.now()
                // displayPinsId.value.push(pin.id) // 削除
            }

            console.log("getAllPins success")
        }
        catch (error) {
            const msg = error || '不明なエラー'
            console.error("getAllPins falied", msg)
        }
    }

    /**
     * ピンIDからピンをフェッチ（前回取得してから５分間はキャッシュを使う）
     * @param {number} pinId 
     * @returns 
     */
    const fetchPinById = async (pinId) => {
        const isExpired = judgeExpired(pinId)
        if (pinsById.value[pinId] && !isExpired) return

        try {
            const res = await $fetch(`${config.public.apiBase}/api/pin/get/${pinId}`, {
                method: 'GET',
            })

            pinsById.value[pinId] = res
            fetchedAt.value[pinId] = Date.now()
        }
        catch (error) {
            const msg = error || '不明なエラー'
            console.error("fetchPinById falied", msg)
        }
    }

    /**
     * キャッシュにかかわらずpinを再フェッチ
     * @param {number} pinId 
     */
    const refreshPin = async (pinId) => {
        try {
            const res = await $fetch(`${config.public.apiBase}/api/pin/get/${pinId}`, {
                method: 'GET'
            })
            pinsById.value[pinId] = res
            fetchedAt.value[pinId] = Date.now()
        }
        catch (error) {
            console.error('ピンの再取得に失敗:', error)
        }
    }

    /**
     * ピンを追加
     * @param {object} addPinInfo 
     * @param {string} token 
     * @returns 追加したピン
     */
    const addPin = async (addPinInfo, token) => {
        try {
            const res = await $fetch(`${config.public.apiBase}/api/pin/addPin`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: addPinInfo
            })

            pinsById.value[res.id] = res // pinsByIdに格納
            if (!displayPinsId.value.includes(res.id)) {
                displayPinsId.value = [...displayPinsId.value, res.id] // displayPinsIdに格納
            }

            return res
        }
        catch (error) {
            const msg = error || '不明なエラー'
            console.error("addPin failed", msg)
        }
    }

    /**
     * ピンを更新
     * @param {object} updatePinInfo 
     * @param {string} token 
     * @returns 更新後ピン
     */
    const updatePin = async (updatePinInfo, token) => {
        try {
            const res = await $fetch(`${config.public.apiBase}/api/pin/updatePin`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: updatePinInfo
            })

            pinsById.value[res.id] = res // pinsByIdに格納
            return res
        }
        catch (error) {
            const msg = error || '不明なエラー'
            console.error("updatePin failed", msg)
        }
    }

    /**
     * ピンを削除
     * @param {number} pinId 
     * @param {string} token 
     * @returns 削除したピン
     */
    const deletePin = async (pinId, token) => {
        try {
            const res = await $fetch(`${config.public.apiBase}/api/pin/deletePin/${pinId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if (res !== undefined) { // 204 No Content は自動的に res が undefined になる
                throw new Error('削除失敗')
            }

            const deletedPin = pinsById.value[pinId]
            delete pinsById.value[pinId]
            displayPinsId.value = displayPinsId.value.filter(id => id !== pinId) // displayPinsIdから削除
            return deletedPin
        }
        catch (error) {
            const msg = error || '不明なエラー'
            console.error("deletePin failed", msg)
        }
    }

    /**
     * pin検索
     * @param {string} title 
     * @param {number} minAvgDarkness 
     * @param {number} minAvgAccess 
     * @param {number} prefId 
     */
    const searchPins = async (title, minAvgDarkness, minAvgAccess, prefId) => {
        try {
            const res = await $fetch(`${config.public.apiBase}/api/pin/search`, {
                method: 'POST',
                body: {
                    title: title,
                    minAvgDarkness: minAvgDarkness,
                    minAvgAccess: minAvgAccess,
                    prefId: prefId
                }
            })

            displayPinsId.value = res.map(pin => pin.id)

            for (const pin of res) {
                pinsById.value[pin.id] = pin
                fetchedAt.value[pin.id] = Date.now()
            }

            console.log('検索成功!!')

            return displayPinsId.value
        }
        catch (error) {
            console.error("failed to search pins", error)
        }
    }

    const clearDisplayPinsId = () => {
        displayPinsId.value = [...Object.keys(pinsById.value).map(id => Number(id))]
    }

    const fetchRankingAll = async () => {
        try {
            const res = await $fetch(`${config.public.apiBase}/api/pin/ranking/all`, {
                method: 'GET'
            })

            bookmarkRanking.value = []
            darknessRanking.value = []
            accessRanking.value = []

            for (const pin of res.bookmarkRanking) {
                pinsById.value[pin.id] = pin
                bookmarkRanking.value.push(pin.id)
            }

            for (const pin of res.darknessRanking) {
                pinsById.value[pin.id] = pin
                darknessRanking.value.push(pin.id)
            }

            for (const pin of res.accessRanking) {
                pinsById.value[pin.id] = pin
                accessRanking.value.push(pin.id)
            }
        }
        catch (error) {
            console.error("fetchRanking error", error)
        }
    }

    const fetchRankingByPrefId = async (prefId) => {
        try {
            const res = await $fetch(`${config.public.apiBase}/api/pin/ranking/${prefId}`, {
                method: 'GET'
            })

            bookmarkRanking.value = []
            darknessRanking.value = []
            accessRanking.value = []

            for (const pin of res.bookmarkRanking) {
                pinsById.value[pin.id] = pin
                bookmarkRanking.value.push(pin.id)
            }

            for (const pin of res.darknessRanking) {
                pinsById.value[pin.id] = pin
                darknessRanking.value.push(pin.id)
            }

            for (const pin of res.accessRanking) {
                pinsById.value[pin.id] = pin
                accessRanking.value.push(pin.id)
            }
        }
        catch (error) {
            console.error("fetchRanking error", error)
        }
    }

    return {
        pinsById,
        displayPinsId,
        bookmarkRanking,
        darknessRanking,
        accessRanking,
        getAllPins,
        fetchPinById,
        refreshPin,
        addPin,
        deletePin,
        updatePin,
        searchPins,
        clearDisplayPinsId,
        fetchRankingAll,
        fetchRankingByPrefId
    }
}, {
    persist: false
})