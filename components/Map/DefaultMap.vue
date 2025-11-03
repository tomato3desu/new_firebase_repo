<script setup>
import { importLibrary } from "@googlemaps/js-api-loader"
import { usePinStore } from "~/composables/stores/pin"
import { useAuthStore } from "~/composables/stores/auth"
import { useUserStore } from "~/composables/stores/user"
import { usePrefStore } from "~/composables/stores/prefecture"

// ストア
const authStore = useAuthStore()
const pinStore = usePinStore()
const userStore = useUserStore()
const prefStore = usePrefStore()

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

    // マーカーの情報
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
        emit('pin-clicked', pin.id)
    })

    markers.value.push(marker)
}

/**
 * pinInfoDrowerを開く関数
 * @param pin
 */
// const openDrawer = (pin) => {
//     // store 内の同じ参照を取得
//     selectedPinId.value = pin.id // pinIdを渡す
//     isOpenPinInfoDrawer.value = true
// }

/**
 * ピンを削除する関数
 * @param deletedPinId 
 */
// const onPinDeleted = (deletedPinId) => {
//     // drawerを閉じる
//     // isOpenPinInfoDrawer.value = false
//     // selectedPin.value = null

//     // marker削除
//     const markerIndex = markers.value.findIndex( // pinIdを使ってマーカーを探す
//         (m) => m.pinId === deletedPinId
//     )
//     if (markerIndex !== -1) {
//         markers.value[markerIndex].map = null // 地図から削除
//         markers.value.splice(markerIndex, 1)
//     }
// }

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
    <!-- <MapPinInfoDrawer
        v-model="isOpenPinInfoDrawer"
        :pin="selectedPinId"
        @pin-deleted="onPinDeleted"
    /> -->
</template>