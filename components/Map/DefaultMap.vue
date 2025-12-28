<script setup>
import { usePinStore } from "~/composables/stores/pin"
import { useAuthStore } from "~/composables/stores/auth"
import { usePrefStore } from "~/composables/stores/prefecture"
import { useBookmarkStore } from "~/composables/stores/bookmark"
import { useMapStore } from "~/composables/stores/map"

const { $googleMaps } = useNuxtApp()

// ストア
const authStore = useAuthStore()
const pinStore = usePinStore()
const prefStore = usePrefStore()
const bookmarkStore = useBookmarkStore()
const mapStore = useMapStore()

const config = useRuntimeConfig()
const toast = useToast()

const emit = defineEmits(['pin-clicked', 'map-ready'])

const user = computed(() => authStore.loginUser)

// ピン作成関連
const isOpenPinAddDialog = ref(false)
let geocoder
const address = ref(null)
const prefecture = ref(null)
const clickedLatLng = ref(null)
const selectedPin = ref(null)

// pinのscale
const DEFAULT_PIN_SCALE = 1.3
const OVER_TEN_PIN_SCALE = 1.5
const OVER_HUNDRED_PIN_SCALE = 1.7
const OVER_TWO_HUNDRED_PIN_SCALE = 1.9

// pinの数字
const MAX_PIN_NUMBER = 99
// 検索関連
const isOpenSearchDrawer = ref(false)

// map関連
const mapElement = ref(null)
let map
let mapClickListener = null
let markers = []
// const isInitialized = ref(false)
let ColorScheme

onMounted(async () => {
    try {
        await prefStore.setAllPrefs()
    }
    catch (error) {
        toast.error({ 
            title: '都道府県情報の取得に失敗しました。時間をおいて再度お試しください', 
            message: error?.response?._data?.message
        })
    }
    
    let lat = 34.700428654912486
    let lng = 135.4928556060951

    if (authStore.isLoggedIn) {
        lat = prefStore.prefsById[user.value.prefectureId].latitude
        lng = prefStore.prefsById[user.value.prefectureId].longitude
    }

    // mapのcolorschemeをimport
    ColorScheme = await $googleMaps.loadCoreLib()

    // mapを作成
    map = await $googleMaps.loadMap(mapElement.value, {
        center: { lat: lat, lng: lng },
        zoom: 12,
        mapId: config.public.googleMapId,
        colorScheme: ColorScheme.DARK,
    })

    // Geocoder インスタンス作成
    geocoder = new google.maps.Geocoder()

    // clicklisterを追加
    if (authStore.isLoggedIn) {
        mapClickListener = map.addListener('click', onMapClick)
    }
    
    // ピン描画
    markers = []
    try {
        await pinStore.getAllPins()
    }
    catch (error) {
        toast.error({ 
            title: 'ピン情報の取得に失敗しました。時間をおいて再度お試しください', 
            message: error?.response?._data?.message
        })
    }

    if (pinStore.displayPinsId.length === 0) {
        // displayPinsIdが空の場合は全ピンを表示
        pinStore.displayPinsId = [...Object.keys(pinStore.pinsById).map(id => Number(id))]
    }
    else {
        // displayPinsIdが既に設定されている場合(Profileページなどで先行して設定された場合)
        // ピンデータ取得後にマーカーを描画する
        for (const pinId of pinStore.displayPinsId) {
            const exists = markers.some(m => m.pinId === pinId)
            if (exists) continue

            const pin = pinStore.pinsById[pinId]
            if (pin) {
                await renderMarker(pin)
            }
        }
    }

    emit('map-ready')
})

/**
 * 緯度経度から住所を取得する関数
 * @param {google.maps.LatLng} latlng
 */
const getAddressFromLatLng = async (lat, lng) => {
    try {
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
    }
    catch (error) {
        console.warn('住所取得に失敗しました', error)
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
    isOpenPinAddDialog.value = true
}

/**
 * 検索ボタンをクリックしたときにsearchDrawerを開く
 */
const onClickSearch = () => {
    isOpenSearchDrawer.value = true
}

/**
 * マーカーを描画する関数
 * @param pin 
 */
const renderMarker = async (pin) => {
    try {
        const { AdvancedMarkerElement, PinElement } = await $googleMaps.loadMarkerLib()
        let pinElement

        const bookmarks = bookmarkStore.bookmarkedPinsByUserId[authStore.loginUser?.id] || []
        const isBookmarked = bookmarks.includes(pin.id)

        if (isBookmarked) {
            pinElement = new PinElement({
                background: "#fde047",
                borderColor: "#ffffff",
                scale: calcPinScale(pin.id),
                glyphColor: "#ffffff",
                glyphText: calcPinNumber(pin.id),
        
            })
        }
        else {
        // マーカーの情報
            pinElement = new PinElement({
                background: "#00ffff",
                borderColor: "#ffffff",
                scale: calcPinScale(pin.id),
                glyphColor: "#ffffff",
                glyphText: calcPinNumber(pin.id),
            })
        }
    
        const marker = new AdvancedMarkerElement({
            map,
            position: { lat: pin.latitude, lng: pin.longitude },
            content: pinElement.element,
        })

        marker.pinId = pin.id // pinIdを保持（削除時に利用）

        marker.addListener('click', async () => {
            selectedPin.value = pin.id
            emit('pin-clicked', pin.id)
        })

        markers.push({
            pinId: pin.id,
            marker: marker
        })
    }
    catch (error) {
        console.warn(`ピンID: ${pin.id} のマーカーの描画に失敗しました`, error)
    }
}

/**
 * ピンのscaleを計算する関数
 * @param pinId 
 */
const calcPinScale = (pinId) => {
    const pin = pinStore.pinsById[pinId]
    if (!pin) return DEFAULT_PIN_SCALE
    if (pin.reviewCount >= 200) return OVER_TWO_HUNDRED_PIN_SCALE
    if (pin.reviewCount >= 100) return OVER_HUNDRED_PIN_SCALE
    if (pin.reviewCount >= 10) return OVER_TEN_PIN_SCALE
    return DEFAULT_PIN_SCALE
}

/**
 * ピンのglyphの数字を計算する関数
 * @param pinId 
 */
const calcPinNumber = (pinId) => {
    const pin = pinStore.pinsById[pinId]
    if (!pin) return '0'
    if (pin.reviewCount <= MAX_PIN_NUMBER) return String(pin.reviewCount)
    return `${MAX_PIN_NUMBER}+`
}

// 選択されたピンの色を変更
watch(
    () => selectedPin.value,
    async (newPinId, oldPinId) => {
        if (!newPinId) return

        const newMarker = markers.find(m => m.pinId === newPinId)
        if (!newMarker) return

        const { PinElement } = await $googleMaps.loadMarkerLib()

        const newPinElement = new PinElement({
            background: "#ff0000",
            borderColor: "#ffffff",
            scale: calcPinScale(newPinId),
            glyphColor: "#ffffff",
            glyphText: calcPinNumber(newPinId),
        })
        newMarker.marker.content = newPinElement.element

        if (oldPinId) {
            const oldMarker = markers.find(m => m.pinId === oldPinId)
            if (!oldMarker) return

            if (bookmarkStore.mybookmarkedPinIds.includes(oldPinId)) {
                const oldPinElement = new PinElement({
                    background: "#fde047",
                    borderColor: "#ffffff",
                    scale: calcPinScale(oldPinId),
                    glyphColor: "#ffffff",
                    glyphText: calcPinNumber(oldPinId),
                })
                oldMarker.marker.content = oldPinElement.element
            }
            else {
                const oldPinElement = new PinElement({
                    background: "#00ffff",
                    borderColor: "#ffffff",
                    scale: calcPinScale(oldPinId),
                    glyphColor: "#ffffff",
                    glyphText: calcPinNumber(oldPinId),
                })
                oldMarker.marker.content = oldPinElement.element
            }
        }
    }
)

// pinStore.displayPinsByIdを監視し、変更があれば再描画
watch(
    () => pinStore.displayPinsId,
    async (newList, oldList) => {
        // 初回は無視（onMountedで描画するため）
        // if (!isInitialized.value) return
        if (!map) return

        const newIds = newList || []
        const oldIds = oldList || []

        const isSame
            = newIds.length === oldIds.length
                && newIds.every(id => oldIds.includes(id))

        if (isSame) return

        const addedIds = newIds.filter(id => !oldIds.includes(id))
        const deletedIds = oldIds.filter(id => !newIds.includes(id))

        if (!addedIds.length && !deletedIds.length) return

        // 追加されたピン → マーカーを描画
        for (const addedId of addedIds) {
            const pin = pinStore.pinsById[addedId]
            if (pin) {
                await renderMarker(pin)
            }
        }

        // 削除されたピン → マーカーを削除
        for (const deletedId of deletedIds) {
            const markerIndex = markers.findIndex(
                (m) => m.pinId === deletedId
            )
            if (markerIndex !== -1) {
                markers[markerIndex].marker.setMap(null)
                markers[markerIndex].marker.remove()
                markers.splice(markerIndex, 1)
            }
        }
    }
)

// mybookmarkedPinIdsを監視し、変更があれば再描画
watch(
    () => bookmarkStore.mybookmarkedPinIds,
    async (newList, oldList) => {
        if (!map) return
        const newIds = newList || []
        const oldIds = oldList || []

        // 追加・削除されたピンを特定
        const added = newIds.filter(id => !oldIds.includes(id))
        const removed = oldIds.filter(id => !newIds.includes(id))

        // 🔹 追加されたブックマーク → マーカー色変更
        for (const pinId of added) {
            const marker = markers.find(m => m.pinId === pinId)
            if (marker) {
                const { PinElement } = await $googleMaps.loadMarkerLib()
                const pinElement = new PinElement({
                    background: "#fde047",
                    borderColor: "#ffffff",
                    scale: calcPinScale(pinId),
                    glyphColor: "#ffffff",
                    glyphText: calcPinNumber(pinId),
                })

                marker.marker.content = pinElement.element
            }
        }

        // 🔹 削除されたブックマーク → 元の色に戻す
        for (const pinId of removed) {
            const marker = markers.find(m => m.pinId === pinId)
            if (marker) {
                try {
                    const { PinElement } = await $googleMaps.loadMarkerLib()
                    const pinElement = new PinElement({
                        background: "#00ffff",
                        borderColor: "#ffffff",
                        scale: calcPinScale(pinId),
                        glyphColor: "#ffffff",
                        glyphText: calcPinNumber(pinId),
                    })

                    marker.marker.content = pinElement.element
                }
                catch (error) {
                    console.warn(`ピンID: ${pinId} のマーカーの色変更に失敗しました`, error)
                }
            }
        }
    },
    { deep: true }
)

// mapStoreを監視し、moveToに変更があればその座標へ移動
watch(
    () => mapStore.moveTo,
    (pos) => {
        if (!pos) return
        map.panTo(pos)
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
        class="absolute w-8 h-8 top-0 right-16 m-2 z-30 bg-neutral-700 shadow-lg rounded-sm"
    >
        <font-awesome-icon
            icon="fa-solid fa-magnifying-glass"
            class="w-6 h-6 text-white m-1"
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
    />
</template>