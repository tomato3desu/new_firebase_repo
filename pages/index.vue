<script setup>
import { usePinStore } from '~/composables/stores/pin'

definePageMeta({
    layout: 'map'
})

const pinStore = usePinStore()

onMounted(() => {
    pinStore.clearDisplayPinsId()
})
</script>

<template>
    <div />
</template>