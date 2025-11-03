<script setup>
import { useRoute, useRouter } from 'vue-router'
import { usePinStore } from '~/composables/stores/pin'

const route = useRoute()
const router = useRouter()

const pinStore = usePinStore()

const isOpenDrawer = computed(() => Boolean(route.query.pinId))
const selectedPinId = computed(() => Number(route.query.pinId))

const onPinClicked = (pinId) => {
    router.push({ path: '/', query: { pinId } })
}
const closeDrawer = () => router.push('/')

// リロード時に該当ピンをfetch
watch(
    () => selectedPinId.value,
    async (newId) => {
        if (newId && !pinStore.pinsById[newId]) {
            await pinStore.fetchPinById(newId)
        }
    },
    { immediate: true }
)
</script>

<template>
    <div>
        <MapDefaultMap
            @pin-clicked="onPinClicked"
        />
        <MapPinInfoDrawer
            v-if="isOpenDrawer && selectedPinId && pinStore.pinsById[selectedPinId]"
            :pin-id="selectedPinId"
            @close="closeDrawer"
        />
    </div>
</template>