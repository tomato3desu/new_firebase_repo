<script setup>
import { usePinStore } from '~/composables/stores/pin'

const props = defineProps({
    pinId: {
        type: Number,
        required: true
    }
})

const emits = defineEmits(['result-clicked'])

const pinStore = usePinStore()

const pin = computed(() => pinStore.pinsById[props.pinId])
const title = computed(() => pin.value?.title)
const latitude = computed(() => pin.value?.latitude)
const longitude = computed(() => pin.value?.longitude)
const thumbnailImagePath = computed(() => pin.value?.thumbnailImagePath)

/**
 * 検索結果のクリックされた座標をsearchResultDrawerにemit
 */
const onclickSearchResult = () => {
    emits('result-clicked', {
        latitude: latitude.value,
        longitude: longitude.value
    })
}
</script>

<template>
    <div 
        v-if="pin"
        class="h-20 border border-gray-400 rounded-md bg-cover bg-center"
        :style="{ backgroundImage: `url(${thumbnailImagePath})` }"
    >
        <p class="text-white">
            {{ title }}
        </p>
        <button
            class="rounded-md bg-teal-500"
            @click="onclickSearchResult"
        >
            move
        </button>
    </div>
</template>