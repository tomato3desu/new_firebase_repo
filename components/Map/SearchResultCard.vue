<script setup>
import { usePinStore } from '~/composables/stores/pin'
import { useMapStore } from '~/composables/stores/map'

const props = defineProps({
    pinId: {
        type: Number,
        required: true
    }
})

const config = useRuntimeConfig()

const pinStore = usePinStore()
const mapStore = useMapStore()

const pin = computed(() => pinStore.pinsById[props.pinId])
const title = computed(() => pin.value?.title)
const latitude = computed(() => pin.value?.latitude)
const longitude = computed(() => pin.value?.longitude)
const thumbnailImagePath = computed(() => pin.value?.thumbnailImagePath)

/**
 * 検索結果のクリックされた座標をmapStoreにemitしてマップを移動
 */
const onclickSearchResult = () => {
    mapStore.move(latitude.value, longitude.value)
}
</script>

<template>
    <div 
        v-if="pin"
        class="h-20 border text-slate-50 border-slate-500 rounded-md bg-cover bg-center cursor-pointer"
        :style="{ backgroundImage: `url(${config.public.r2PublicUrl}/${thumbnailImagePath})` }"
        @click="onclickSearchResult"
    >
        <p class="ml-2">
            {{ title }}
        </p>
    </div>
</template>