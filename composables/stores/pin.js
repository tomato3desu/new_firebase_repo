import { defineStore } from "pinia"

export const usePinStore = defineStore('pinStore', () => {
    const config = useRuntimeConfig()
    const pinsById = ref({}) // key: pinId value: { pinDto }

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
            }
        }
        catch (error) {
            const msg = error?.data?.message || '不明なエラー'
            alert(msg)
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

    return { pinsById, getAllPins, addPin, deletePin, updatePin }
}, {
    persist: true
})