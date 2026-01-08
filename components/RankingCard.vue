<script setup>
import { usePinStore } from '~/composables/stores/pin'
import { usePrefStore } from '~/composables/stores/prefecture'
import { useRouter } from 'vue-router'

const { pinId, rank } = defineProps({
    pinId: {
        type: Number,
        required: true
    },
    rank: {
        type: Number,
        required: true
    }
})

const pinStore = usePinStore()
const prefStore = usePrefStore()
const router = useRouter()
const config = useRuntimeConfig()

const pin = computed(() => pinStore.pinsById[pinId])
const pref = computed(() => prefStore.prefsById[pin.value.prefectureId])

const onCardClicked = () => {
    router.push(`/?pinId=${pinId}`)
}
</script>

<template>
    <div
        v-if="pin && pref"
        class="flex items-center gap-4 w-full bg-slate-50 hover:bg-slate-200 rounded-xl shadow-sm hover:shadow-md transition p-4 border border-slate-300 cursor-pointer"
        @click="onCardClicked"
    >
        <!-- Rank -->
        <div class="relative w-12 h-12 flex items-center justify-center shrink-0">
            <!-- Crown Icon -->
            <font-awesome-icon 
                icon="fa-solid fa-crown" 
                class="text-yellow-400 w-10 h-10"
            />

            <!-- Rank Number (重ねて表示) -->
            <span 
                class="absolute text-white font-bold text-md drop-shadow-lg"
            >
                {{ rank }}
            </span>
        </div>

        <!-- Thumbnail -->
        <NuxtImg
            :src="pin.thumbnailImagePath ? `${config.public.r2PublicUrl}/${pin.thumbnailImagePath}` : 'images/saturn.png'"
            alt="thumbnail"
            class="w-20 h-20 object-cover rounded-lg shadow-sm border border-gray-200 shrink-0"
        />

        <!-- Info -->
        <div class="flex flex-col">
            <h3 class="text-lg font-semibold text-gray-800 line-clamp-1">
                {{ pin.title }}
            </h3>
            <p class="text-sm text-gray-500">
                {{ pref.name }}
            </p>
        </div>
    </div>
    <div
        v-else
        class="flex items-center justify-center w-full h-24"
    >
        <p class="animate-pulse text-slate-50">
            now loading...
        </p>
    </div>
</template>