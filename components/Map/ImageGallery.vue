<script setup>
const isOpen = defineModel()
const props = defineProps({
    reviewImages: {
        type: Array,
        required: true
    }, 
    startIndex: {
        type: Number,
        default: 0,
    }
})

const config = useRuntimeConfig()

const currentIndex = ref(props.startIndex)

const close = () => isOpen.value = false

const nextImage = () => {
    if (!props.reviewImages.length) return
    currentIndex.value = (currentIndex.value + 1) % props.reviewImages.length
}

const prevImage = () => {
    if (!props.reviewImages.length) return
    currentIndex.value = (currentIndex.value - 1 + props.reviewImages.length) % props.reviewImages.length
}

watch(
    () => props.startIndex,
    (newVal) => (currentIndex.value = newVal)
)

onMounted(() => {
    const handleKey = (e) => {
        if (!isOpen.value) return
        if (e.key === 'ArrowRight') nextImage()
        if (e.key === 'ArrowLeft') prevImage()
        if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', handleKey)
    onUnmounted(() => window.removeEventListener('keydown', handleKey))
})
</script>

<template>
    <div
        v-if="isOpen"
        class="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
    >
        <!-- 閉じるボタン -->
        <font-awesome-icon 
            icon="fa-solid fa-xmark" 
            class="absolute top-4 right-4 text-slate-50 text-2xl h-6 w-6"
            @click="close"
        />

        <!-- 画像 -->
        <NuxtImg
            :src="`${config.public.r2PublicUrl}/${reviewImages[currentIndex]?.imagePath}`"
            class="w-[90vw] h-[70vh] object-contain rounded shadow-lg"
        />
        <!-- 矢印 -->
        <font-awesome-icon 
            icon="fa-solid fa-angle-left" 
            class="absolute left-8 text-2xl text-slate-50 cursor-pointer select-none  h-6 w-6"
            @click="prevImage"
        />
        <font-awesome-icon 
            icon="fa-solid fa-angle-right" 
            class="absolute right-8 text-2xl text-slate-50 cursor-pointer select-none  h-6 w-6"
            @click="nextImage"
        />
        <!-- カウンタ -->
        <div class="absolute bottom-4 text-white text-sm">
            {{ currentIndex + 1 }} / {{ reviewImages.length }}
        </div>
    </div>
</template>