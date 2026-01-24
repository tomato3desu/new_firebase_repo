<script setup>
const { displayName, formattedAddress, photoUrl, latlng } = defineProps({
    displayName: {
        type: String,
        required: true
    },
    formattedAddress: {
        type: String,
        required: true
    },
    photoUrl: {
        type: String,
        required: false
    },
    latlng: {
        type: Object,
        required: false,
        default: null
    }
})

const isOpen = defineModel()
const config = useRuntimeConfig()
const emit = defineEmits(['open-pin-add'])

const openPinAdd = () => {
    emit('open-pin-add')
}

const close = () => {
    isOpen.value = false
}
</script>

<template>
    <div
        v-if="isOpen"
        class="fixed left-2 bottom-16 z-40 flex w-64 items-end"
    >   
        <div class="relative flex flex-col gap-2 text-slate-50 bg-gradient-to-br from-slate-900 from- via-slate-700 via- to-slate-400 to- rounded-lg shadow-lg w-full max-w-md p-6 max-h-[80vh] overflow-y-auto">
            <button
                type="button"
                class="absolute top-2 right-2 bg-black/60 text-white rounded-full w-6 h-6 text-xs items-center justify-center"
                @click="close"
            >
                ✕
            </button>
            <img :src="photoUrl || `${config.public.r2PublicUrl}/place/no_image.jpg`" alt="place_image" referrerpolicy="origin">
            <p>{{ displayName }}</p>
            <p>{{ formattedAddress }}</p>
            <button 
                @click="openPinAdd"
                class="text-sm text-sky-400 hover:underline"
            >
                ここにピンを作成
            </button>
        </div>
    </div>
</template>