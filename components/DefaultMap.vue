<script setup>
import { setOptions, importLibrary } from "@googlemaps/js-api-loader"
import { usePinStore } from "~/composables/stores/pin"

const config = useRuntimeConfig()
const mapElement = ref(null)

onMounted(async () => {
    setOptions({
        key: config.public.googleMapApiKey,
        v: "weekly"
    })

    const { Map } = await importLibrary("maps")
    const { AdvancedMarkerElement, PinElement } = await importLibrary("marker")
    
    const map = new Map(mapElement.value, {
        center: { lat: 34.700428654912486, lng: 135.4928556060951 },
        zoom: 12,
        mapId: config.public.googleMapId
    })

    const pinStore = usePinStore()

    pinStore.pins.forEach(pin => {
        const pinElement = new PinElement({
            background: "#7fffbf",
            borderColor: "#ff84ff",
            scale: 1.5,
            glyphColor: "#ff84ff",
            glyph: String(pin.pinId),
            
        })

        new AdvancedMarkerElement({
            map,
            position: { lat: pin.lat, lng: pin.lng },
            content: pinElement.element,
        })
    })
})
</script>

<template>
    <div
        ref="mapElement"
        class="h-full w-full"
    />
</template>