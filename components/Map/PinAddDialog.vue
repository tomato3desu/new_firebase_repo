<script setup>
import { usePinStore } from '~/composables/stores/pin'
import { useAuthStore } from '~/composables/stores/auth'

const pinStore = usePinStore()
const authStore = useAuthStore()

const isOpen = defineModel()

const props = defineProps({
    latlng: {
        type: Object,
        required: false,
        default: null
    }
})

const title = ref(null)
const description = ref(null)

const addPin = async () => {
    if (!props.latlng) return

    const addPinInfo = {
        latitude: props.latlng.lat,
        longitude: props.latlng.lng,
        title: title.value,
        description: description.value
    }

    const token = await authStore.getIdToken()
    const addedPin = await pinStore.addPin(addPinInfo, token)
    renderMarker(addedPin)
    close()
}

const close = () => {
    title.value = null
    description.value = null
    isOpen.value = false
}
</script>

<template>
    <div
        v-if="isOpen"
        class="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
    >
        <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 class="text-xl font-semibold mb-4">
                ピンを追加
            </h2>

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
</template>
