<script setup>
import { importLibrary } from "@googlemaps/js-api-loader"
import { usePinStore } from "~/composables/stores/pin"
import { useAuthStore } from "~/composables/stores/auth"

// ストア
const authStore = useAuthStore()
const pinStore = usePinStore()

const config = useRuntimeConfig()

const mapElement = ref(null)
const isOpenPinAddDialog = ref(false)
const isOpenPinInfoDrawer = ref(false)
const selectedPin = ref(null)
const clickedLatLng = ref(null)
const markers = ref([])
let map
let mapClickListener = null

onMounted(async () => {
    const { Map } = await importLibrary("maps")

    // mapを作成
    map = new Map(mapElement.value, {
        center: { lat: authStore?.loginUser?.prefecture?.latitude || 34.700428654912486, lng: authStore?.loginUser?.prefecture?.longitude || 135.4928556060951 },
        zoom: 12,
        mapId: config.public.googleMapId
    })

    // clicklisterを追加
    if (authStore.isLoggedIn) {
        mapClickListener = map.addListener('click', onMapClick)
    }
    
    // ピン描画
    await pinStore.getAllPins()
    for (const pin of pinStore.pins) {
        renderMarker(pin)
    }

    console.log(markers.value)
})

// マップクリック時に実行する関数
const onMapClick = (e) => {
    const lat = e.latLng.lat()
    const lng = e.latLng.lng()
    clickedLatLng.value = { lat, lng }
    isOpenPinAddDialog.value = true
}

// マーカーを描画する関数
const renderMarker = async (pin) => {
    const { AdvancedMarkerElement, PinElement } = await importLibrary("marker")

    const pinElement = new PinElement({
        background: "#7fffbf",
        borderColor: "#ff84ff",
        scale: 1.5,
        glyphColor: "#ff84ff",
        glyphText: String(pin.id),
        
    })

    const marker = new AdvancedMarkerElement({
        map,
        position: { lat: pin.latitude, lng: pin.longitude },
        content: pinElement.element,
    })

    marker.pinId = pin.id // pinIdを保持（削除時に利用）

    marker.addListener('click', () => {
        openDrawer(pin)
    })

    markers.value.push(marker)
}

const openDrawer = (pin) => {
    // store 内の同じ参照を取得
    const storePin = pinStore.pins.find(p => p.id === pin.id)
    selectedPin.value = storePin // ← store の参照を渡す！
    isOpenPinInfoDrawer.value = true
}

// ピン削除時に行う処理
const onPinDeleted = (deletedPinId) => {
    // drawerを閉じる
    isOpenPinInfoDrawer.value = false
    selectedPin.value = null

    // marker削除
    const markerIndex = markers.value.findIndex( // pinIdを使ってマーカーを探す
        (m) => m.pinId === deletedPinId
    )
    if (markerIndex !== -1) {
        markers.value[markerIndex].map = null // 地図から削除
        markers.value.splice(markerIndex, 1)
    }
}

// ログイン/非ログインで切り替え
watch(
    () => authStore.isLoggedIn,
    (isLoggedIn) => {
        if (isLoggedIn) {
            // クリックイベントを追加（重複防止）
            if (!mapClickListener) {
                mapClickListener = map.addListener("click", onMapClick)
            }
        }
        else {
            // ログアウト時はリスナーを削除
            if (mapClickListener) {
                google.maps.event.removeListener(mapClickListener)
                mapClickListener = null
            }
        }
    }
)
</script>

<template>
    <div
        ref="mapElement"
        class="h-full w-full min-h-[calc(100vh-4rem)]"
    />
    <MapPinAddDialog
        v-model="isOpenPinAddDialog"
        :latlng="clickedLatLng"
        @pin-added="renderMarker"
    />
    <MapPinInfoDrawer
        v-model="isOpenPinInfoDrawer"
        :pin="selectedPin"
        @pin-deleted="onPinDeleted"
    />
</template>