import { defineStore } from "pinia"

export const usePinStore = defineStore('pinStore', () => {
    const config = useRuntimeConfig()
    const pinsById = ref({}) // key: pinId value: { pinDto }
    const fetchedAt = ref({}) // key: pinId value: datetime

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
            
            for (const pin of res) {
                pinsById.value[pin.id] = pin
                fetchedAt.value[pin.id] = Date.now()
            }
        }
        catch (error) {
            const msg = error?.data?.message || '不明なエラー'
            alert(msg)
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
            const msg = error?.data?.message || '不明なエラー'
            alert(msg)
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

            return res
        }
        catch (error) {
            const msg = error?.data?.message || '不明なエラー'
            alert(msg)
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
            const msg = error?.data?.message || '不明なエラー'
            alert(msg)
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
            return deletedPin
        }
        catch (error) {
            const msg = error?.data?.message || '不明なエラー'
            alert(msg)
        }
    }

    return { pinsById, getAllPins, fetchPinById, refreshPin, addPin, deletePin, updatePin }
}, {
    persist: true
})