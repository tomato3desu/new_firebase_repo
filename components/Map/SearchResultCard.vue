<script setup>
import { usePinStore } from '~/composables/stores/pin'
import { useMapStore } from '~/composables/stores/map'

const props = defineProps({
    pinId: {
        type: Number,
        required: true
    }
})

const pinStore = usePinStore()
const mapStore = useMapStore()

const pin = computed(() => pinStore.pinsById[props.pinId])
const title = computed(() => pin.value?.title)
const latitude = computed(() => pin.value?.latitude)
const longitude = computed(() => pin.value?.longitude)
const thumbnailImagePath = computed(() => pin.value?.thumbnailImagePath)

/**
 * 検索結果のクリックされた座標をsearchResultDrawerにemit
 */
const onclickSearchResult = () => {
    mapStore.move(latitude.value, longitude.value)
}
</script>

<template>
    <div 
        v-if="pin"
        class="h-20 border text-slate-50 border-slate-500 rounded-md bg-cover bg-center"
        :style="{ backgroundImage: `url(${thumbnailImagePath})` }"
    >
        <p class="ml-2">
            {{ title }}
        </p>
        <font-awesome-icon 
            icon="fa-solid fa-paper-plane" 
            class="w-4 h-4 text-teal-400 hover:text-teal-500 ml-2 mt-2"
            @click="onclickSearchResult"
        />
    </div>
</template>