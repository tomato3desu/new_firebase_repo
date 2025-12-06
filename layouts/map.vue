<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '~/composables/stores/user'
import { usePinStore } from '~/composables/stores/pin'
import { useReviewStore } from '~/composables/stores/review'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const pinStore = usePinStore()
const reviewStore = useReviewStore()

const isOpenDrawer = computed(() => Boolean(route.query.pinId))
const selectedPinId = computed(() => Number(route.query.pinId))

const onPinClicked = async (pinId) => {
    await reviewStore.getReviewsByPin(pinId)
    await userStore.fetchUserIfNeeded(pinStore.pinsById[pinId].createdUserId)
    router.push({ query: { pinId } })
}

const closeDrawer = () => router.push({ query: {} })

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
    <div class="flex flex-col min-h-screen">
        <HeaderBar />

        <div class="h-full relative">
            <!-- 共通 Map -->
            <MapDefaultMap @pin-clicked="onPinClicked" />

            <!-- Drawer（共通） -->
            <MapPinInfoDrawer
                v-if="isOpenDrawer && selectedPinId && pinStore.pinsById[selectedPinId]"
                :pin-id="selectedPinId"
                @close="closeDrawer"
            />

            <ProfileDrawer />
            <slot />
        </div>
    </div>
</template>