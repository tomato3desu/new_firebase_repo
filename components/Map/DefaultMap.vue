<script setup>
import { importLibrary } from "@googlemaps/js-api-loader"
import { usePinStore } from "~/composables/stores/pin"
import { useAuthStore } from "~/composables/stores/auth"

const authStore = useAuthStore()

const config = useRuntimeConfig()
const mapElement = ref(null)
const isOpenPinAddDialog = ref(false)
const clickedLatLng = ref(null)

onMounted(async () => {
    const { Map } = await importLibrary("maps")
    const { AdvancedMarkerElement, PinElement } = await importLibrary("marker")
    
    // map
    const map = new Map(mapElement.value, {
        center: { lat: 34.700428654912486, lng: 135.4928556060951 },
        zoom: 12,
        mapId: config.public.googleMapId
    })

    if (authStore.isLoggedIn) {
        map.addListener("click", (e) => {
            const lat = e.latLng.lat()
            const lng = e.latLng.lng()
            console.log("MAP CLICK:", lat, lng)
            clickedLatLng.value = { lat, lng }
            isOpenPinAddDialog.value = true
        })
    }
    
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
        class="h-full w-full min-h-[calc(100vh-4rem)]"
    />
    <MapPinAddDialog
        v-model="isOpenPinAddDialog"
        :latlng="clickedLatLng"
    />
</template>