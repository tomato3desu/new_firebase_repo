<script setup>
import { importLibrary } from "@googlemaps/js-api-loader"
import { usePinStore } from "~/composables/stores/pin"
import { useAuthStore } from "~/composables/stores/auth"
import { usePrefStore } from "~/composables/stores/prefecture"
import { useBookmarkStore } from "~/composables/stores/bookmark"

// ストア
const authStore = useAuthStore()
const pinStore = usePinStore()
const prefStore = usePrefStore()
const bookmarkStore = useBookmarkStore()

const config = useRuntimeConfig()

const emit = defineEmits(['pin-clicked'])

const user = computed(() => authStore.loginUser)

// ピン作成関連
const isOpenPinAddDialog = ref(false)
let geocoder
const address = ref(null)
const prefecture = ref(null)
const clickedLatLng = ref(null)

// 検索関連
const isOpenSearchDrawer = ref(false)

// map関連
const mapElement = ref(null)
let map
let mapClickListener = null
const markers = ref([])

onMounted(async () => {
    const { Map } = await importLibrary("maps")

    await prefStore.setAllPrefs()

    let lat = 34.700428654912486
    let lng = 135.4928556060951

    if (authStore.isLoggedIn) {
        lat = prefStore.prefsById[user.value.prefectureId].latitude
        lng = prefStore.prefsById[user.value.prefectureId].longitude
    }

    // mapを作成
    map = new Map(mapElement.value, {
        center: { lat: lat, lng: lng },
        zoom: 12,
        mapId: config.public.googleMapId
    })

    // Geocoder インスタンス作成
    geocoder = new google.maps.Geocoder()

    // clicklisterを追加
    if (authStore.isLoggedIn) {
        mapClickListener = map.addListener('click', onMapClick)
    }
    
    // ピン描画
    await pinStore.getAllPins()
    for (const pinId in pinStore.pinsById) {
        renderMarker(pinStore.pinsById[pinId])
    }
})

/**
 * 緯度経度から住所を取得する関数
 * @param {google.maps.LatLng} latlng
 */
const getAddressFromLatLng = async (lat, lng) => {
    const results = await geocoder.geocode({ location: { lat, lng } })

    if (results && results.results?.length > 0) {
        address.value = results.results[0].formatted_address
        const components = results.results[0].address_components
        // 都道府県を抽出
        const prefectureComponent = components.find(c =>
            c.types.includes("administrative_area_level_1")
        )
        prefecture.value = prefectureComponent ? prefectureComponent.long_name : null
    }
    else {
        console.log('Geocoding error')
    }
}

/**
 * マップクリック時にピン追加するための処理を行う関数
 * @param e 
 */
const onMapClick = async (e) => {
    const lat = e.latLng.lat()
    const lng = e.latLng.lng()
    clickedLatLng.value = { lat, lng }
    await getAddressFromLatLng(lat, lng)
    console.log(address.value)
    console.log(prefecture.value)
    isOpenPinAddDialog.value = true
}

/**
 * 検索ボタンをクリックしたときにsearchDrawerを開く
 */
const onClickSearch = async () => {
    isOpenSearchDrawer.value = true
}

/**
 * 検索結果のmoveボタンがクリックされたときにそのピンの座標へマップを移動する
 * @param param0 
 */
const onResultClicked = ({ latitude, longitude }) => {
    map.panTo(new google.maps.LatLng(latitude, longitude))
}

/**
 * マーカーを描画する関数
 * @param pin 
 */
const renderMarker = async (pin) => {
    const { AdvancedMarkerElement, PinElement } = await importLibrary("marker")
    let pinElement

    const bookmarks = bookmarkStore.bookmarkedPinsByUserId[authStore.loginUser?.id] || []
    const isBookmarked = bookmarks.includes(pin.id)

    if (isBookmarked) {
        pinElement = new PinElement({
            background: "#00ff7f",
            borderColor: "#ffffff",
            scale: 1.5,
            glyphColor: "#ffffff",
            glyphText: String(pin.id),
        
        })
    }
    else {
        // マーカーの情報
        pinElement = new PinElement({
            background: "#00ffff",
            borderColor: "#ffffff",
            scale: 1.5,
            glyphColor: "#ffffff",
            glyphText: String(pin.id),
        })
    }
    
    const marker = new AdvancedMarkerElement({
        map,
        position: { lat: pin.latitude, lng: pin.longitude },
        content: pinElement.element,
    })

    marker.pinId = pin.id // pinIdを保持（削除時に利用）

    marker.addListener('click', async () => {
        emit('pin-clicked', pin.id)
    })

    markers.value.push(marker)
}

// pinStore.pinsByIdを監視し、変更があれば再描画
watch(
    () => pinStore.displayPinsId,
    async (newList, oldList) => {
        const newIds = newList || []
        const oldIds = oldList || []

        const addedIds = newIds.filter(id => !oldIds.includes(id))
        const deletedIds = oldIds.filter(id => !newIds.includes(id))

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
                    background: "#00ff7f",
                    borderColor: "#ffffff",
                    scale: 1.5,
                    glyphColor: "#ffffff",
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
                    background: "#00ffff",
                    borderColor: "#ffffff",
                    scale: 1.5,
                    glyphColor: "#ffffff",
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
    <div 
        class="absolute w-8 h-8 top-16 right-16 m-2 z-40 bg-white shadow-lg rounded-sm"
    >
        <font-awesome-icon
            icon="fa-solid fa-magnifying-glass"
            class="w-6 h-6 text-gray-600 m-1"
            @click="onClickSearch"
        />
    </div>
    <MapPinAddDialog
        v-model="isOpenPinAddDialog"
        :latlng="clickedLatLng"
        :address="address"
        :prefecture="prefecture"
    />
    <MapSearchDrawer
        v-model="isOpenSearchDrawer"
        @result-clicked="onResultClicked"
    />
</template>