<script setup>
import { usePinStore } from '~/composables/stores/pin'

const pinStore = usePinStore()

pinStore.clearDisplayPinsId()
</script>

<template>
    <div />
</template>