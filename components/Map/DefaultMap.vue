<script setup>
import { importLibrary } from "@googlemaps/js-api-loader"
import { usePinStore } from "~/composables/stores/pin"
import { useAuthStore } from "~/composables/stores/auth"
import { useUserStore } from "~/composables/stores/user"
import { usePrefStore } from "~/composables/stores/prefecture"
import { useBookmarkStore } from "~/composables/stores/bookmark"

// ストア
const authStore = useAuthStore()
const pinStore = usePinStore()
const userStore = useUserStore()
const prefStore = usePrefStore()
const bookmarkStore = useBookmarkStore()

const config = useRuntimeConfig()

const emit = defineEmits(['pin-clicked'])

let user = userStore.usersById[authStore.loginUserId]

const mapElement = ref(null)
const isOpenPinAddDialog = ref(false)
// const isOpenPinInfoDrawer = ref(false)
// const selectedPinId = ref(null)
const clickedLatLng = ref(null)
const markers = ref([])
let map
let mapClickListener = null

onMounted(async () => {
    const { Map } = await importLibrary("maps")

    await prefStore.setAllPrefs()

    let lat = 34.700428654912486
    let lng = 135.4928556060951

    if (authStore.isLoggedIn) {
        lat = prefStore.prefsById[user.prefectureId].latitude
        lng = prefStore.prefsById[user.prefectureId].longitude
    }

    // mapを作成
    map = new Map(mapElement.value, {
        center: { lat: lat, lng: lng },
        zoom: 12,
        mapId: config.public.googleMapId
    })

    // clicklisterを追加
    if (authStore.isLoggedIn) {
        mapClickListener = map.addListener('click', onMapClick)
    }
    
    // ピン描画
    await pinStore.getAllPins()
    for (const pinId in pinStore.pinsById) {
        renderMarker(pinStore.pinsById[pinId])
    }

    console.log(markers.value)
})

/**
 * マップクリック時にピン追加するための処理を行う関数
 * @param e 
 */
const onMapClick = (e) => {
    const lat = e.latLng.lat()
    const lng = e.latLng.lng()
    clickedLatLng.value = { lat, lng }
    isOpenPinAddDialog.value = true
}

/**
 * マーカーを描画する関数
 * @param pin 
 */
const renderMarker = async (pin) => {
    const { AdvancedMarkerElement, PinElement } = await importLibrary("marker")
    let pinElement

    const bookmarks = bookmarkStore.bookmarkedPinsByUserId[authStore.loginUserId] || []
    const isBookmarked = bookmarks.includes(pin.id)

    if (isBookmarked) {
        pinElement = new PinElement({
            background: "#ff00ff",
            borderColor: "#f0f8ff",
            scale: 1.5,
            glyphColor: "#f0f8ff",
            glyphText: String(pin.id),
        
        })
    }
    else {
        // マーカーの情報
        pinElement = new PinElement({
            background: "#0000cd",
            borderColor: "#f0f8ff",
            scale: 1.5,
            glyphColor: "#f0f8ff",
            glyphText: String(pin.id),
        })
    }
    
    const marker = new AdvancedMarkerElement({
        map,
        position: { lat: pin.latitude, lng: pin.longitude },
        content: pinElement.element,
    })

    marker.pinId = pin.id // pinIdを保持（削除時に利用）

    marker.addListener('click', () => {
        emit('pin-clicked', pin.id)
    })

    markers.value.push(marker)
}

// pinStore.pinsByIdを監視し、変更があれば再描画
watch(
    () => Object.keys(pinStore.pinsById),
    async (newKeys, oldKeys) => {
        const addedIds = newKeys.filter(id => !oldKeys.includes(id))
        const deletedIds = oldKeys.filter(id => !newKeys.includes(id))

        // 追加されたピン → マーカーを描画
        for (const addedId of addedIds) {
            const pin = pinStore.pinsById[addedId]
            if (pin) {
                await renderMarker(pin)
            }
        }

        // 削除されたピン → マーカーを削除
        for (const deletedId of deletedIds) {
            const markerIndex = markers.value.findIndex(
                (m) => m.pinId === Number(deletedId)
            )
            if (markerIndex !== -1) {
                markers.value[markerIndex].map = null
                markers.value.splice(markerIndex, 1)
            }
        }
    }, {
        deep: true
    }
)

// mybookmarkedPinIdsを監視し、変更があれば再描画
watch(
    () => bookmarkStore.mybookmarkedPinIds,
    async (newList, oldList) => {
        if (!map) return
        const newIds = newList || []
        const oldIds = oldList || []

        console.log(bookmarkStore.mybookmarkedPinIds)

        // 追加・削除されたピンを特定
        const added = newIds.filter(id => !oldIds.includes(id))
        const removed = oldIds.filter(id => !newIds.includes(id))

        console.log(added)
        console.log(removed)

        // 🔹 追加されたブックマーク → マーカー色変更
        for (const pinId of added) {
            const marker = markers.value.find(m => m.pinId === pinId)
            if (marker) {
                const { PinElement } = await importLibrary("marker")
                const pinElement = new PinElement({
                    background: "#ff00ff",
                    borderColor: "#f0f8ff",
                    scale: 1.5,
                    glyphColor: "#f0f8ff",
                    glyphText: String(pinId),
                })
                marker.content = pinElement.element
            }
        }

        // 🔹 削除されたブックマーク → 元の色に戻す
        for (const pinId of removed) {
            const marker = markers.value.find(m => m.pinId === pinId)
            if (marker) {
                const { PinElement } = await importLibrary("marker")
                const pinElement = new PinElement({
                    background: "#0000cd",
                    borderColor: "#f0f8ff",
                    scale: 1.5,
                    glyphColor: "#f0f8ff",
                    glyphText: String(pinId),
                })
                marker.content = pinElement.element
            }
        }
    },
    { deep: true }
)

// ログイン/非ログインで切り替え
watch(
    () => authStore.isLoggedIn,
    (isLoggedIn) => {
        if (isLoggedIn) {
            // クリックイベントを追加（重複防止）
            if (!mapClickListener) {
                mapClickListener = map.addListener("click", onMapClick)
            }
            user = userStore.usersById[authStore.loginUserId]
        }
        else {
            // ログアウト時はリスナーを削除
            if (mapClickListener) {
                google.maps.event.removeListener(mapClickListener)
                mapClickListener = null
            }
            user = null
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
    />
</template>