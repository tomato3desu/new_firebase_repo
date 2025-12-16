<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '~/composables/stores/user'
import { usePinStore } from '~/composables/stores/pin'
import { useReviewStore } from '~/composables/stores/review'
import { useMapStore } from '~/composables/stores/map'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const pinStore = usePinStore()
const reviewStore = useReviewStore()
const mapStore = useMapStore()

const isOpenDrawer = computed(() => Boolean(route.query.pinId))
const selectedPinId = computed(() => Number(route.query.pinId))

const mapRef = ref(null)

const onPinClicked = async (pinId) => {
    await reviewStore.getReviewsByPin(pinId)
    await userStore.fetchUserIfNeeded(pinStore.pinsById[pinId].createdUserId)
    router.push({ query: { pinId } })
}

// const onMoveClicked = (latLng) => {
//     if (mapRef.value && latLng) {
//         mapRef.value.onResultClicked(latLng)
//     }
// }

const moveToQueryPin = () => {
    if (!selectedPinId.value) return
    const pin = pinStore.pinsById[selectedPinId.value]
    if (!pin) return

    mapStore.move(pin.latitude, pin.longitude)
}

const closeDrawer = () => router.push({ query: {} })

watch(
    () => selectedPinId.value,
    async (newId) => {
        if (!newId) return

        if (!pinStore.pinsById[newId]) {
            await pinStore.fetchPinById(newId)
        }

        if (mapRef.value) { // mapRefがある場合(ない場合はemit(map-ready)で起動)
            moveToQueryPin()
        }
    }
)
</script>

<template>
    <div class="flex flex-col min-h-screen">
        <HeaderBar />

        <div class="h-full relative">
            <!-- 共通 Map -->
            <MapDefaultMap 
                ref="mapRef"
                @pin-clicked="onPinClicked" 
                @map-ready="moveToQueryPin"
            />

            <!-- Drawer（共通） -->
            <MapPinInfoDrawer
                v-if="isOpenDrawer && selectedPinId && pinStore.pinsById[selectedPinId]"
                :pin-id="selectedPinId"
                @close="closeDrawer"
            />
            <NuxtPage />
        </div>
    </div>
</template>