import { defineStore } from "pinia"

export const usePinStore = defineStore('pinStore', () => {
    const config = useRuntimeConfig()
    const pins = ref([])

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

    return { pins, getAllPins, addPin }
})