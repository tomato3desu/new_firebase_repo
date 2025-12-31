<script setup>
const isOpen = defineModel('isOpen', { type: Boolean, default: false })

const props = defineProps({
    images: {
        type: Array,
        required: true
    },
    startIndex: {
        type: Number,
        default: 0
    }
})

const currentIndex = ref(props.startIndex)

const isSwipable = computed(() => props.images.length > 1)

watch(
    () => props.startIndex,
    (val) => {
        currentIndex.value = val
    }
)

const close = () => {
    isOpen.value = false
}

const next = () => {
    currentIndex.value
        = (currentIndex.value + 1) % props.images.length
}

const prev = () => {
    currentIndex.value
        = (currentIndex.value - 1 + props.images.length)
            % props.images.length
}

// キーボード操作
const handleKeydown = (e) => {
    if (!isOpen.value) return
    if (e.key === 'Escape') close()
    if (e.key === 'ArrowRight') next()
    if (e.key === 'ArrowLeft') prev()
}

onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
    <div
        v-if="isOpen"
        class="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
        @click.self="close"
    >
        <!-- 左 -->
        <font-awesome-icon 
            v-if="isSwipable"
            icon="fa-solid fa-angle-left" 
            class="absolute left-8 text-2xl text-slate-50 cursor-pointer select-none  h-6 w-6"
            @click="prev"
        />

        <!-- 画像 -->
        <NuxtImg
            :src="images[currentIndex]"
            class="w-[90vw] h-[70vh] object-contain rounded shadow-lg"
        />

        <!-- 右 -->
        <font-awesome-icon 
            v-if="isSwipable"
            icon="fa-solid fa-angle-right" 
            class="absolute right-8 text-2xl text-slate-50 cursor-pointer select-none  h-6 w-6"
            @click="next"
        />

        <!-- 閉じる -->
        <font-awesome-icon 
            icon="fa-solid fa-xmark" 
            class="absolute top-4 right-4 text-slate-50 text-2xl h-6 w-6"
            @click="close"
        />

        <!-- カウンタ -->
        <div class="absolute bottom-4 text-white text-sm">
            {{ currentIndex + 1 }} / {{ images.length }}
        </div>
    </div>
</template>
