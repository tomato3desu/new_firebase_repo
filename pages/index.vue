<script setup>
import { usePinStore } from '~/composables/stores/pin'

definePageMeta({
    layout: 'map'
})

const pinStore = usePinStore()

pinStore.clearDisplayPinsId()
</script>

<template>
    <div />
</template>