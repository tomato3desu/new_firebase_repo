import { defineStore } from "pinia"

export const useMapStore = defineStore('mapStore', () => {
    const moveTo = ref(null)

    const move = (lat, lng) => {
        moveTo.value = { lat, lng }
    }

    return {
        moveTo,
        move
    }
})