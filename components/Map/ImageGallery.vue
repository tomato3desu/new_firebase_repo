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
        class="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center"
    >
        <!-- 閉じるボタン -->
        <button
            class="absolute top-4 right-4 text-white text-2xl"
            @click="close"
        >
            ✕
        </button>

        <!-- 画像 -->
        <NuxtImg
            :src="reviewImages[currentIndex]?.imagePath"
            alt="gallery"
            class="max-h-[80vh] max-w-[80vw] object-contain transition-all duration-300"
        />
        <!-- 矢印 -->
        <div
            class="absolute left-8 text-2xl text-white cursor-pointer select-none"
            @click="prevImage"
        >
            ◀
        </div>
        <div
            class="absolute right-8 text-2xl text-white cursor-pointer select-none"
            @click="nextImage"
        >
            ▶
        </div>
    </div>
</template>