<script setup>
const isOpen = defineModel()
const props = defineProps({
    type: Number,
    default: null
})
</script>

<template>
    <div>
        <div
            v-if="isOpen"
            class="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
        >
            <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6 max-h-[80vh] overflow-y-auto">
                <h2 class="text-xl font-semibold mb-4">
                    レビュー作成
                </h2>

                <div class="mb-4">
                    
                </div>

                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-medium mb-1">タイトル</label>
                    <input
                        v-model="title"
                        type="text"
                        class="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                        placeholder="タイトルを入力"
                    >
                </div>

                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-medium mb-1">詳細</label>
                    <input
                        v-model="description"
                        type="text"
                        class="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                        placeholder="説明を入力"
                    >
                </div>

                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-medium mb-1">画像</label>
                    <input
                        type="file"
                        accept="image/*"
                        class="mb-4 w-full border p-2 rounded"
                        @change="handleFileChange"
                    >
                    <NuxtImg
                        v-if="previewUrl"
                        :key="previewUrl"
                        :src="previewUrl"
                        class="mb-4"
                    />
                </div>

                <div class="flex justify-end space-x-3">
                    <button
                        class="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 transition"
                        @click="close"
                    >
                        キャンセル
                    </button>
                    <button
                        class="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition"
                        @click="addPin"
                    >
                        追加
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>