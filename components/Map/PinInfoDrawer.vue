<script setup>
const isOpen = defineModel()
const props = defineProps({
    pin: {
        type: Object,
        required: false,
        default: null
    }
})

const close = () => {
    isOpen.value = false
}
</script>

<template>
    <div
        v-if="isOpen"
        class="fixed left-0 top-16 z-50"
    >
        <!-- Drawer本体 -->
        <div class="w-80 bg-white shadow-lg relative p-4 h-[calc(100vh-4rem)]">
            <!-- 閉じるボタン -->
            <button
                class="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                @click="close"
            >
                ✕
            </button>

            <!-- コンテンツ -->
            <div class="mt-6 space-y-3">
                <h2 class="text-lg font-bold text-gray-800">
                    {{ props.pin?.title || 'タイトルなし' }}
                </h2>
                <p class="text-gray-600 whitespace-pre-line">
                    {{ props.pin?.description || '説明なし' }}
                </p>

                <!-- ✅ 画像など将来追加する部分 -->
                <!-- <img v-if="pin?.imageUrl" :src="pin.imageUrl" class="w-full rounded" /> -->
            </div>
        </div>
    </div>
</template>