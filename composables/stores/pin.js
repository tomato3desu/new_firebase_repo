import { defineStore } from "pinia"

export const usePinStore = defineStore('pinStore', () => {
    const pins = ref([])

    const getAllPins = async () => {
        try {
            const res = await $fetch('http://localhost:8080/api/pin/getAllPins', {
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
            const res = await $fetch('http://localhost:8080/api/pin/addPin', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: addPinInfo
            })

            // const newPin = {
            //     id: res.id,
            //     createdUser: {
            //         id: res.createdUser.id,
            //         nickname: res.createdUser.nickname,
            //         comment: res.createdUser.comment,
            //         iconImagePath: res.createdUser.iconImagePath
            //     },
            //     latitude: res.latitude,
            //     longitude: res.longitude,
            //     title: res.title,
            //     description: res.description
            // }

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