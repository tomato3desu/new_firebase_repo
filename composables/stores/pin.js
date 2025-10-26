import { defineStore } from "pinia"

export const usePinStore = defineStore('pinStore', () => {
    const config = useRuntimeConfig()
    const pins = ref([])

    const deletePinByThisPins = (deletePinInfo) => {
        pins.value = pins.value.filter(pin => pin.id !== deletePinInfo.id)
    }

    const updatePinByThisPins = (updatePinInfo) => {
        const index = pins.value.findIndex(pin => pin.id === updatePinInfo.id)
        if (index !== -1) {
            pins.value[index] = updatePinInfo
        }
    }

    const getAllPins = async () => {
        try {
            const res = await $fetch(`${config.public.apiBase}/api/pin/getAllPins`, {
                method: 'GET'
            })
            pins.value = res
        }
        catch (error) {
            const msg = error?.data?.message || '不明なエラー'
            alert(msg)
        }
    }

    const addPin = async (addPinInfo, token) => {
        try {
            const res = await $fetch(`${config.public.apiBase}/api/pin/addPin`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: addPinInfo
            })

            pins.value.push(res)

            return res
        }
        catch (error) {
            const msg = error?.data?.message || '不明なエラー'
            alert(msg)
        }
    }

    const updatePin = async (updatePinInfo, token) => {
        try {
            const res = await $fetch(`${config.public.apiBase}/api/pin/updatePin`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: updatePinInfo
            })

            updatePinByThisPins(res)
            return res
        }
        catch (error) {
            const msg = error?.data?.message || '不明なエラー'
            alert(msg)
        }
    }

    const deletePin = async (pinId, token) => {
        try {
            const res = await $fetch(`${config.public.apiBase}/api/pin/deletePin/${pinId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            deletePinByThisPins(res)
            return res
        }
        catch (error) {
            const msg = error?.data?.message || '不明なエラー'
            alert(msg)
        }
    }

    return { pins, getAllPins, addPin, deletePin, updatePin }
})