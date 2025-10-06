import { defineStore } from "pinia"

export const usePinStore = defineStore('pinStore', () => {
    const pins = [
        { pinId: 1, lat: 34.700428654912486, lng: 135.4928556060951 },
        { pinId: 2, lat: 34.69126734110811, lng: 135.49147150156566 },
        { pinId: 3, lat: 34.4353954499877, lng: 135.23689442993526 }
    ]

    return { pins }
})